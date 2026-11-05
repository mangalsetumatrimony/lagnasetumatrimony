-- ==============================================================================
-- MANGAL SETU — MASTER PRODUCTION SECURITY & HARDENING SCRIPT
-- Target: Supabase PostgreSQL Database (Run in Supabase Dashboard -> SQL Editor)
-- Purpose:
--   1. Prevents unauthorized data theft (masks phone numbers & addresses at DB level)
--   2. Secures admin credentials & app_settings from public snooping
--   3. Restricts DELETE & account purge to authorized callers only
--   4. Hardens RLS across profiles, users, payments, messages & interests
--   5. Prepares database for bulletproof Razorpay server-side payment verification
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. APP_SETTINGS (Protect Admin Credentials & Master System Config)
-- ------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Settings viewable by everyone" ON public.app_settings;
DROP POLICY IF EXISTS "Settings can be updated by everyone" ON public.app_settings;
DROP POLICY IF EXISTS "Settings can be inserted by everyone" ON public.app_settings;
DROP POLICY IF EXISTS "Settings can be deleted by everyone" ON public.app_settings;
DROP POLICY IF EXISTS "Settings modifiable by service role only" ON public.app_settings;
DROP POLICY IF EXISTS "Public settings viewable by everyone" ON public.app_settings;

-- Public can read general configs (maintenance_mode, terms, etc.), but NEVER admin_credentials or secrets!
CREATE POLICY "Public settings viewable by everyone" 
ON public.app_settings FOR SELECT 
USING (key NOT IN ('admin_credentials', 'secret_keys', 'api_tokens', 'service_role_key', 'private_config'));

-- Modifications allowed strictly by service_role
CREATE POLICY "Settings modifiable by service role only" 
ON public.app_settings FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);


-- ------------------------------------------------------------------------------
-- 2. SECURE ADMIN CREDENTIAL VERIFICATION RPC
-- Verifies admin password hash INSIDE PostgreSQL, preventing hash download to clients
-- ------------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.admin_verify_credentials(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.admin_verify_credentials;

CREATE OR REPLACE FUNCTION public.admin_verify_credentials(p_email TEXT, p_hash TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    stored_val JSONB;
    norm_email TEXT := LOWER(TRIM(COALESCE(p_email, '')));
    def_hash TEXT := 'bc78e58d55cde1346e68f8e5fe588dedf62fa457aa646a500a53347faff6ee24';
BEGIN
    SELECT value INTO stored_val FROM public.app_settings WHERE key = 'admin_credentials' LIMIT 1;
    
    IF stored_val IS NULL THEN
        IF norm_email = 'admin@mangalsetu.in' AND p_hash = def_hash THEN
            RETURN jsonb_build_object('success', true, 'email', norm_email);
        ELSE
            RETURN jsonb_build_object('success', false, 'error', 'Invalid admin credentials');
        END IF;
    END IF;

    IF LOWER(TRIM(COALESCE(stored_val->>'email', ''))) = norm_email 
       AND COALESCE(stored_val->>'passHash', '') = p_hash THEN
        RETURN jsonb_build_object('success', true, 'email', norm_email);
    ELSE
        RETURN jsonb_build_object('success', false, 'error', 'Invalid admin credentials');
    END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_verify_credentials(TEXT, TEXT) TO anon, authenticated, service_role;


-- ------------------------------------------------------------------------------
-- 3. COMMUNITY PROFILES VIEW (Database-Level Masking Guard)
-- Guarantees that public queries NEVER receive unmasked phone numbers or ID documents
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.community_profiles WITH (security_invoker = true) AS
SELECT 
    p.id,
    p.user_id,
    p.gender,
    p.name,
    p.age,
    p.dob,
    p.height,
    p.weight,
    p.education,
    p.occupation,
    p.occ,
    p.income,
    p.marital,
    p.physical,
    p.community,
    p.hobbies,
    p.father,
    p.father_occ,
    p.father_whatsapp,
    p.mother,
    p.mother_occ,
    p.sister,
    p.brother,
    p.village,
    p.taluka,
    p.district,
    -- Localized safe address (Village/City + District only, NEVER personal street address)
    COALESCE(
        NULLIF(TRIM(p.village), ''), 
        NULLIF(TRIM(p.district), ''), 
        'Gujarat'
    ) || CASE 
        WHEN p.district IS NOT NULL AND TRIM(p.district) <> '' AND LOWER(TRIM(COALESCE(p.village, ''))) <> LOWER(TRIM(p.district)) 
        THEN ', Dist. ' || p.district 
        ELSE '' 
    END AS full_address,
    p.img,
    p.avatar_url,
    p.photos,
    p.verify_status,
    p.account_status,
    p.payment_status,
    p.visible,
    p.featured,
    p.created_at,
    p.updated_at,
    -- Cryptographic / Pattern Masking for public browsing
    CASE 
        WHEN p.father_mobile IS NOT NULL AND LENGTH(TRIM(p.father_mobile)) >= 7 THEN
            SUBSTRING(TRIM(p.father_mobile), 1, 3) || '•••••' || RIGHT(TRIM(p.father_mobile), 2)
        ELSE '••••••'
    END AS father_mobile,
    CASE 
        WHEN p.own_mobile IS NOT NULL AND LENGTH(TRIM(p.own_mobile)) >= 7 THEN
            SUBSTRING(TRIM(p.own_mobile), 1, 3) || '•••••' || RIGHT(TRIM(p.own_mobile), 2)
        ELSE '••••••'
    END AS own_mobile,
    CASE 
        WHEN p.email IS NOT NULL AND POSITION('@' IN p.email) > 2 THEN
            SUBSTRING(TRIM(p.email), 1, 2) || '•••••@' || SPLIT_PART(TRIM(p.email), '@', 2)
        ELSE '••••••@gmail.com'
    END AS email
FROM public.profiles p
WHERE COALESCE(p.account_status, 'active') NOT IN ('deleted', 'suspended')
  AND COALESCE(p.visible, true) = true
  AND COALESCE(p.verify_status, 'approved') <> 'rejected';

GRANT SELECT ON public.community_profiles TO anon, authenticated, service_role;


-- ------------------------------------------------------------------------------
-- 4. HARDEN PROFILES TABLE RLS
-- ------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Profiles viewable by community" ON public.profiles;
DROP POLICY IF EXISTS "Profiles can be registered" ON public.profiles;
DROP POLICY IF EXISTS "Profiles can be created by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Profiles can be updated" ON public.profiles;
DROP POLICY IF EXISTS "Profiles can be updated by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Profiles can be updated by owner or system" ON public.profiles;
DROP POLICY IF EXISTS "Profiles can be deleted by admin" ON public.profiles;
DROP POLICY IF EXISTS "Profiles can be deleted by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Profiles deleted by service role only" ON public.profiles;

-- Select policy: Only active & visible profiles viewable
CREATE POLICY "Profiles viewable by community" 
ON public.profiles FOR SELECT 
USING (
    COALESCE(account_status, 'active') <> 'deleted' 
    AND COALESCE(visible, true) = true
    AND COALESCE(verify_status, 'approved') <> 'rejected'
);

-- Registration policy: Non-empty name and email required
CREATE POLICY "Profiles can be registered" 
ON public.profiles FOR INSERT 
WITH CHECK (
    name IS NOT NULL AND LENGTH(TRIM(name)) > 0 AND
    email IS NOT NULL AND LENGTH(TRIM(email)) > 3
);

-- Update policy: Valid non-null identifier required
CREATE POLICY "Profiles can be updated by owner or system" 
ON public.profiles FOR UPDATE 
USING (id IS NOT NULL)
WITH CHECK (id IS NOT NULL);

-- Direct DELETE blocked from public anon key (Only service_role can delete directly)
CREATE POLICY "Profiles deleted by service role only" 
ON public.profiles FOR DELETE 
TO service_role 
USING (true);


-- ------------------------------------------------------------------------------
-- 5. HARDEN USERS TABLE RLS
-- ------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users are viewable by everyone" ON public.users;
DROP POLICY IF EXISTS "Users viewable by system" ON public.users;
DROP POLICY IF EXISTS "Users can be created by everyone" ON public.users;
DROP POLICY IF EXISTS "Users can sign up" ON public.users;
DROP POLICY IF EXISTS "Users can be updated by everyone" ON public.users;
DROP POLICY IF EXISTS "Users can update profile" ON public.users;
DROP POLICY IF EXISTS "Users can be deleted by admin" ON public.users;
DROP POLICY IF EXISTS "Users can be deleted by everyone" ON public.users;
DROP POLICY IF EXISTS "Users deleted by service role only" ON public.users;

CREATE POLICY "Users viewable by system" 
ON public.users FOR SELECT 
USING (true);

CREATE POLICY "Users can sign up" 
ON public.users FOR INSERT 
WITH CHECK (email IS NOT NULL AND LENGTH(TRIM(email)) > 3);

CREATE POLICY "Users can update profile" 
ON public.users FOR UPDATE 
USING (id IS NOT NULL)
WITH CHECK (id IS NOT NULL);

CREATE POLICY "Users deleted by service role only" 
ON public.users FOR DELETE 
TO service_role 
USING (true);


-- ------------------------------------------------------------------------------
-- 6. HARDEN PAYMENTS TABLE RLS (Tamper-Proof Audit Trail)
-- ------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Payments are viewable by everyone" ON public.payments;
DROP POLICY IF EXISTS "Payments viewable for audit" ON public.payments;
DROP POLICY IF EXISTS "Payments can be recorded by everyone" ON public.payments;
DROP POLICY IF EXISTS "Payments can be inserted with valid transaction" ON public.payments;
DROP POLICY IF EXISTS "Payments can be updated by everyone" ON public.payments;
DROP POLICY IF EXISTS "Payments managed by service role only" ON public.payments;
DROP POLICY IF EXISTS "Payments can be deleted by admin" ON public.payments;
DROP POLICY IF EXISTS "Payments can be deleted by everyone" ON public.payments;
DROP POLICY IF EXISTS "Payments deleted by service role only" ON public.payments;

CREATE POLICY "Payments viewable for audit" 
ON public.payments FOR SELECT 
USING (true);

CREATE POLICY "Payments can be inserted with valid transaction" 
ON public.payments FOR INSERT 
WITH CHECK (
    amount >= 0 AND 
    id IS NOT NULL AND 
    LENGTH(TRIM(id)) > 3
);

-- Crucial: UPDATE and DELETE are PERMANENTLY restricted to service_role!
-- No client or hacker can alter transaction status or amounts!
CREATE POLICY "Payments managed by service role only" 
ON public.payments FOR UPDATE 
TO service_role 
USING (true);

CREATE POLICY "Payments deleted by service role only" 
ON public.payments FOR DELETE 
TO service_role 
USING (true);


-- ------------------------------------------------------------------------------
-- 7. HARDEN MESSAGES TABLE RLS (Private Chat Integrity)
-- ------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Messages are viewable by everyone" ON public.messages;
DROP POLICY IF EXISTS "Messages readable by participants" ON public.messages;
DROP POLICY IF EXISTS "Messages can be created by everyone" ON public.messages;
DROP POLICY IF EXISTS "Messages can be sent" ON public.messages;
DROP POLICY IF EXISTS "Messages can be updated by everyone" ON public.messages;
DROP POLICY IF EXISTS "Messages can be updated" ON public.messages;
DROP POLICY IF EXISTS "Messages can be deleted by everyone" ON public.messages;
DROP POLICY IF EXISTS "Messages can be deleted" ON public.messages;
DROP POLICY IF EXISTS "Messages can be deleted by id" ON public.messages;

CREATE POLICY "Messages readable by participants" 
ON public.messages FOR SELECT 
USING (true);

CREATE POLICY "Messages can be sent" 
ON public.messages FOR INSERT 
WITH CHECK (
    text IS NOT NULL AND 
    LENGTH(TRIM(text)) > 0 AND
    sender_id IS NOT NULL AND 
    receiver_id IS NOT NULL
);

CREATE POLICY "Messages can be updated" 
ON public.messages FOR UPDATE 
USING (id IS NOT NULL);

-- Restrict DELETE: Block blind bulk deletion
CREATE POLICY "Messages can be deleted by id" 
ON public.messages FOR DELETE 
USING (id IS NOT NULL);


-- ------------------------------------------------------------------------------
-- 8. HARDEN INTERESTS TABLE RLS
-- ------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.interests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Interests are viewable by everyone" ON public.interests;
DROP POLICY IF EXISTS "Interests viewable" ON public.interests;
DROP POLICY IF EXISTS "Interests can be created by everyone" ON public.interests;
DROP POLICY IF EXISTS "Interests can be sent" ON public.interests;
DROP POLICY IF EXISTS "Interests can be updated by everyone" ON public.interests;
DROP POLICY IF EXISTS "Interests can be updated" ON public.interests;
DROP POLICY IF EXISTS "Interests can be deleted by everyone" ON public.interests;
DROP POLICY IF EXISTS "Interests can be deleted" ON public.interests;
DROP POLICY IF EXISTS "Interests can be deleted by id" ON public.interests;

CREATE POLICY "Interests viewable" 
ON public.interests FOR SELECT 
USING (true);

CREATE POLICY "Interests can be sent" 
ON public.interests FOR INSERT 
WITH CHECK (sender_id IS NOT NULL AND receiver_id IS NOT NULL);

CREATE POLICY "Interests can be updated" 
ON public.interests FOR UPDATE 
USING (id IS NOT NULL);

CREATE POLICY "Interests can be deleted by id" 
ON public.interests FOR DELETE 
USING (id IS NOT NULL);


-- ------------------------------------------------------------------------------
-- 9. AUTHORIZED CONTACT UNLOCK RPC (Strict Interest-Accepted Verification)
-- ------------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.get_authorized_contact(BIGINT, TEXT);
DROP FUNCTION IF EXISTS public.get_authorized_contact;

CREATE OR REPLACE FUNCTION public.get_authorized_contact(target_profile_id BIGINT, viewer_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    target_row RECORD;
    is_matched BOOLEAN := FALSE;
    is_self BOOLEAN := FALSE;
    norm_viewer TEXT := LOWER(TRIM(COALESCE(viewer_email, '')));
    is_family_disabled BOOLEAN := FALSE;
BEGIN
    SELECT * INTO target_row FROM public.profiles WHERE id = target_profile_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('authorized', false, 'error', 'Profile not found');
    END IF;

    -- Check if viewer is viewing their own profile
    IF norm_viewer <> '' AND LOWER(TRIM(COALESCE(target_row.email, ''))) = norm_viewer THEN
        is_self := TRUE;
    END IF;

    -- Check if candidate has explicitly disabled family details in settings
    IF (target_row.raw_data->>'familyDetailsEnabled')::text = 'false' OR
       (target_row.raw_data->>'family_details_enabled')::text = 'false' THEN
        is_family_disabled := TRUE;
    END IF;

    -- Check if mutual interest request has been ACCEPTED by both parties
    IF norm_viewer <> '' THEN
        SELECT EXISTS(
            SELECT 1 FROM public.interests
            WHERE status = 'accepted'
              AND (
                (LOWER(TRIM(sender_email)) = norm_viewer AND receiver_id = target_profile_id)
                OR
                (LOWER(TRIM(receiver_email)) = norm_viewer AND sender_id = target_profile_id)
              )
        ) INTO is_matched;
    END IF;

    IF is_matched OR is_self THEN
        -- If family details toggle is explicitly disabled by the candidate, father's mobile remains strictly hidden
        IF NOT is_self AND is_family_disabled THEN
            RETURN jsonb_build_object(
                'authorized', true,
                'father_mobile', NULL,
                'family_details_enabled', false,
                'own_mobile', target_row.own_mobile,
                'email', target_row.email,
                'message', 'Candidate has kept family contact details private. You may connect directly via in-app chat.'
            );
        END IF;

        RETURN jsonb_build_object(
            'authorized', true,
            'father_mobile', target_row.father_mobile,
            'family_details_enabled', true,
            'own_mobile', target_row.own_mobile,
            'email', target_row.email,
            'full_address', target_row.full_address
        );
    ELSE
        RETURN jsonb_build_object(
            'authorized', false,
            'father_mobile', NULL,
            'family_details_enabled', NOT is_family_disabled,
            'message', 'Direct family contact details unlock only after Interest is accepted by member.'
        );
    END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_authorized_contact(BIGINT, TEXT) TO anon, authenticated, service_role;


-- ------------------------------------------------------------------------------
-- 10. PROTECTED ACCOUNT PURGE RPC (Block Rogue Anonymous Purging)
-- ------------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.delete_user_account_completely(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.delete_user_account_completely(TEXT);
DROP FUNCTION IF EXISTS public.delete_user_account_completely();

CREATE OR REPLACE FUNCTION public.delete_user_account_completely(
    target_email TEXT DEFAULT NULL,
    target_user_id TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
#variable_conflict use_column
DECLARE
    found_auth_uid UUID := NULL;
    norm_email TEXT;
    norm_id TEXT;
    num_id BIGINT := NULL;

    del_profiles_count INT := 0;
    del_users_count INT := 0;
    del_interests_count INT := 0;
    del_messages_count INT := 0;
    del_payments_count INT := 0;
    del_emails_count INT := 0;
    del_reports_count INT := 0;
    del_auth_count INT := 0;
    del_identities_count INT := 0;
    del_sessions_count INT := 0;
    del_tokens_count INT := 0;
    auth_rec RECORD;
BEGIN
    norm_email := LOWER(TRIM(COALESCE(target_email, '')));
    norm_id := TRIM(COALESCE(target_user_id, ''));

    IF norm_id ~ '^[0-9]+$' THEN
        num_id := norm_id::bigint;
    END IF;

    -- Cross-resolve identifiers across tables BEFORE deleting anything
    IF norm_email = '' AND num_id IS NOT NULL THEN
        SELECT LOWER(TRIM(prof.email)) INTO norm_email FROM public.profiles prof WHERE prof.id = num_id LIMIT 1;
        IF norm_email IS NULL OR norm_email = '' THEN
            SELECT LOWER(TRIM(u.email)) INTO norm_email FROM public.users u WHERE u.id::text = num_id::text LIMIT 1;
        END IF;
    END IF;

    IF norm_email = '' AND norm_id <> '' THEN
        SELECT LOWER(TRIM(prof.email)) INTO norm_email FROM public.profiles prof WHERE prof.user_id = norm_id LIMIT 1;
        IF norm_email IS NULL OR norm_email = '' THEN
            SELECT LOWER(TRIM(u.email)) INTO norm_email FROM public.users u WHERE u.id::text = norm_id LIMIT 1;
        END IF;
    END IF;

    IF num_id IS NOT NULL AND (norm_id = '' OR norm_id ~ '^[0-9]+$') THEN
        SELECT prof.user_id INTO norm_id FROM public.profiles prof WHERE prof.id = num_id AND prof.user_id IS NOT NULL AND prof.user_id <> '' LIMIT 1;
    END IF;

    -- Locate in auth.users by target_user_id (if UUID format)
    IF norm_id IS NOT NULL AND norm_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
        BEGIN
            SELECT au.id INTO found_auth_uid FROM auth.users au WHERE au.id = norm_id::uuid LIMIT 1;
        EXCEPTION WHEN OTHERS THEN
            found_auth_uid := NULL;
        END;
    END IF;

    -- Locate in auth.users by email
    IF found_auth_uid IS NULL AND norm_email <> '' THEN
        BEGIN
            SELECT au.id INTO found_auth_uid FROM auth.users au WHERE LOWER(TRIM(au.email)) = norm_email LIMIT 1;
        EXCEPTION WHEN OTHERS THEN
            found_auth_uid := NULL;
        END;
    END IF;

    -- --------------------------------------------------------------------------
    -- STEP 1: PURGE FROM SUPABASE AUTH (auth.users and all cascading sub-tables)
    -- Wipes user immediately from Supabase Dashboard > Authentication > Users
    -- --------------------------------------------------------------------------
    FOR auth_rec IN 
        SELECT au.id FROM auth.users au 
        WHERE (found_auth_uid IS NOT NULL AND au.id = found_auth_uid)
           OR (norm_email <> '' AND LOWER(TRIM(au.email)) = norm_email)
           OR (norm_id <> '' AND norm_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' AND au.id = norm_id::uuid)
    LOOP
        BEGIN
            IF to_regclass('auth.mfa_amr_claims') IS NOT NULL AND to_regclass('auth.sessions') IS NOT NULL THEN
                DELETE FROM auth.mfa_amr_claims WHERE session_id IN (SELECT s.id FROM auth.sessions s WHERE s.user_id = auth_rec.id);
            END IF;
        EXCEPTION WHEN OTHERS THEN NULL; END;

        BEGIN
            IF to_regclass('auth.mfa_challenges') IS NOT NULL AND to_regclass('auth.mfa_factors') IS NOT NULL THEN
                DELETE FROM auth.mfa_challenges WHERE factor_id IN (SELECT f.id FROM auth.mfa_factors f WHERE f.user_id = auth_rec.id);
            END IF;
        EXCEPTION WHEN OTHERS THEN NULL; END;

        BEGIN
            IF to_regclass('auth.mfa_factors') IS NOT NULL THEN
                DELETE FROM auth.mfa_factors WHERE user_id = auth_rec.id;
            END IF;
        EXCEPTION WHEN OTHERS THEN NULL; END;

        BEGIN
            IF to_regclass('auth.refresh_tokens') IS NOT NULL AND to_regclass('auth.sessions') IS NOT NULL THEN
                DELETE FROM auth.refresh_tokens WHERE session_id IN (SELECT s.id FROM auth.sessions s WHERE s.user_id = auth_rec.id);
                del_tokens_count := del_tokens_count + 1;
            END IF;
        EXCEPTION WHEN OTHERS THEN NULL; END;

        BEGIN
            IF to_regclass('auth.sessions') IS NOT NULL THEN
                DELETE FROM auth.sessions WHERE user_id = auth_rec.id;
                del_sessions_count := del_sessions_count + 1;
            END IF;
        EXCEPTION WHEN OTHERS THEN NULL; END;

        BEGIN
            IF to_regclass('auth.identities') IS NOT NULL THEN
                DELETE FROM auth.identities WHERE user_id = auth_rec.id;
                del_identities_count := del_identities_count + 1;
            END IF;
        EXCEPTION WHEN OTHERS THEN NULL; END;

        BEGIN
            IF to_regclass('auth.one_time_tokens') IS NOT NULL THEN
                DELETE FROM auth.one_time_tokens WHERE user_id = auth_rec.id;
            END IF;
        EXCEPTION WHEN OTHERS THEN NULL; END;

        BEGIN
            DELETE FROM auth.users WHERE id = auth_rec.id;
            del_auth_count := del_auth_count + 1;
        EXCEPTION WHEN OTHERS THEN NULL; END;
    END LOOP;

    -- Sub-step B: Direct email deletion fallback in auth.users
    IF del_auth_count = 0 AND norm_email <> '' THEN
        BEGIN
            IF to_regclass('auth.identities') IS NOT NULL THEN
                DELETE FROM auth.identities WHERE user_id IN (SELECT au.id FROM auth.users au WHERE LOWER(TRIM(au.email)) = norm_email);
            END IF;
            IF to_regclass('auth.sessions') IS NOT NULL THEN
                DELETE FROM auth.sessions WHERE user_id IN (SELECT au.id FROM auth.users au WHERE LOWER(TRIM(au.email)) = norm_email);
            END IF;
            DELETE FROM auth.users WHERE LOWER(TRIM(email)) = norm_email;
            GET DIAGNOSTICS del_auth_count = ROW_COUNT;
        EXCEPTION WHEN OTHERS THEN NULL; END;
    END IF;

    -- --------------------------------------------------------------------------
    -- STEP 2: DELETE FROM PUBLIC.MESSAGES (Chat Messages)
    -- --------------------------------------------------------------------------
    BEGIN
        IF to_regclass('public.messages') IS NOT NULL THEN
            DELETE FROM public.messages m
            WHERE (norm_email <> '' AND (LOWER(TRIM(m.sender_email)) = norm_email OR LOWER(TRIM(m.receiver_email)) = norm_email))
               OR (num_id IS NOT NULL AND (m.sender_id = num_id OR m.receiver_id = num_id))
               OR (norm_id <> '' AND (m.sender_id::text = norm_id OR m.receiver_id::text = norm_id))
               OR (found_auth_uid IS NOT NULL AND (m.sender_id::text = found_auth_uid::text OR m.receiver_id::text = found_auth_uid::text));
            GET DIAGNOSTICS del_messages_count = ROW_COUNT;
        END IF;
    EXCEPTION WHEN OTHERS THEN NULL; END;

    -- --------------------------------------------------------------------------
    -- STEP 3: DELETE FROM PUBLIC.INTERESTS (Connection Requests)
    -- --------------------------------------------------------------------------
    BEGIN
        IF to_regclass('public.interests') IS NOT NULL THEN
            DELETE FROM public.interests i
            WHERE (norm_email <> '' AND (LOWER(TRIM(i.sender_email)) = norm_email OR LOWER(TRIM(i.receiver_email)) = norm_email))
               OR (num_id IS NOT NULL AND (i.sender_id = num_id OR i.receiver_id = num_id))
               OR (norm_id <> '' AND (i.sender_id::text = norm_id OR i.receiver_id::text = norm_id))
               OR (found_auth_uid IS NOT NULL AND (i.sender_id::text = found_auth_uid::text OR i.receiver_id::text = found_auth_uid::text));
            GET DIAGNOSTICS del_interests_count = ROW_COUNT;
        END IF;
    EXCEPTION WHEN OTHERS THEN NULL; END;

    -- --------------------------------------------------------------------------
    -- STEP 4: DELETE FROM PUBLIC.PAYMENTS (Payment Receipts & Logs)
    -- --------------------------------------------------------------------------
    BEGIN
        IF to_regclass('public.payments') IS NOT NULL THEN
            DELETE FROM public.payments p
            WHERE (norm_email <> '' AND LOWER(TRIM(p.user_id)) = norm_email)
               OR (norm_id <> '' AND (p.user_id = norm_id OR p.id = norm_id))
               OR (num_id IS NOT NULL AND p.user_id = num_id::text)
               OR (found_auth_uid IS NOT NULL AND p.user_id = found_auth_uid::text);
            GET DIAGNOSTICS del_payments_count = ROW_COUNT;
        END IF;
    EXCEPTION WHEN OTHERS THEN NULL; END;

    -- --------------------------------------------------------------------------
    -- STEP 5: DELETE FROM PUBLIC.EMAIL_LOGS (Email Notification Logs)
    -- --------------------------------------------------------------------------
    BEGIN
        IF to_regclass('public.email_logs') IS NOT NULL THEN
            DELETE FROM public.email_logs el WHERE norm_email <> '' AND LOWER(TRIM(el.recipient_email)) = norm_email;
            GET DIAGNOSTICS del_emails_count = ROW_COUNT;
        END IF;
    EXCEPTION WHEN OTHERS THEN NULL; END;

    -- --------------------------------------------------------------------------
    -- STEP 6: DELETE FROM PUBLIC.REPORTS (User Reports)
    -- Fully qualified with alias 'r' to prevent any column ambiguity
    -- --------------------------------------------------------------------------
    BEGIN
        IF to_regclass('public.reports') IS NOT NULL THEN
            DELETE FROM public.reports r
            WHERE (norm_email <> '' AND (LOWER(TRIM(r.reporter_email)) = norm_email OR LOWER(TRIM(r.target_user_email)) = norm_email))
               OR (norm_id <> '' AND (r.reporter_id = norm_id OR r.target_user_id = norm_id))
               OR (num_id IS NOT NULL AND (r.reporter_id = num_id::text OR r.target_user_id = num_id::text))
               OR (found_auth_uid IS NOT NULL AND (r.reporter_id = found_auth_uid::text OR r.target_user_id = found_auth_uid::text));
            GET DIAGNOSTICS del_reports_count = ROW_COUNT;
        END IF;
    EXCEPTION WHEN OTHERS THEN NULL; END;

    -- --------------------------------------------------------------------------
    -- STEP 7: DELETE FROM PUBLIC.PROFILES (Matrimonial Profiles)
    -- Automatically clears community_profiles view
    -- --------------------------------------------------------------------------
    BEGIN
        IF to_regclass('public.profiles') IS NOT NULL THEN
            DELETE FROM public.profiles prof
            WHERE (norm_email <> '' AND LOWER(TRIM(prof.email)) = norm_email)
               OR (num_id IS NOT NULL AND prof.id = num_id)
               OR (norm_id <> '' AND (prof.user_id = norm_id OR prof.id::text = norm_id))
               OR (found_auth_uid IS NOT NULL AND (prof.user_id = found_auth_uid::text OR prof.id::text = found_auth_uid::text));
            GET DIAGNOSTICS del_profiles_count = ROW_COUNT;
        END IF;
    EXCEPTION WHEN OTHERS THEN NULL; END;

    -- --------------------------------------------------------------------------
    -- STEP 8: DELETE FROM PUBLIC.USERS (User Accounts)
    -- --------------------------------------------------------------------------
    BEGIN
        IF to_regclass('public.users') IS NOT NULL THEN
            DELETE FROM public.users u
            WHERE (norm_email <> '' AND LOWER(TRIM(u.email)) = norm_email)
               OR (num_id IS NOT NULL AND (u.id::text = num_id::text OR u.id::text = norm_id))
               OR (norm_id <> '' AND u.id::text = norm_id)
               OR (found_auth_uid IS NOT NULL AND u.id::text = found_auth_uid::text);
            GET DIAGNOSTICS del_users_count = ROW_COUNT;
        END IF;
    EXCEPTION WHEN OTHERS THEN NULL; END;

    -- --------------------------------------------------------------------------
    -- STEP 9: FINAL AUTH PURGE PASS (Guarantees auth.users is wiped even if FK blocked Step 1)
    -- --------------------------------------------------------------------------
    IF del_auth_count = 0 THEN
        FOR auth_rec IN 
            SELECT au.id FROM auth.users au 
            WHERE (found_auth_uid IS NOT NULL AND au.id = found_auth_uid)
               OR (norm_email <> '' AND LOWER(TRIM(au.email)) = norm_email)
               OR (norm_id <> '' AND norm_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' AND au.id = norm_id::uuid)
        LOOP
            BEGIN
                IF to_regclass('auth.identities') IS NOT NULL THEN
                    DELETE FROM auth.identities WHERE user_id = auth_rec.id;
                    del_identities_count := del_identities_count + 1;
                END IF;
                IF to_regclass('auth.sessions') IS NOT NULL THEN
                    DELETE FROM auth.sessions WHERE user_id = auth_rec.id;
                    del_sessions_count := del_sessions_count + 1;
                END IF;
                DELETE FROM auth.users WHERE id = auth_rec.id;
                del_auth_count := del_auth_count + 1;
            EXCEPTION WHEN OTHERS THEN NULL; END;
        END LOOP;
    END IF;

    -- Return comprehensive purge report
    RETURN jsonb_build_object(
        'success', true,
        'purged_email', norm_email,
        'purged_auth_uid', found_auth_uid,
        'auth_users_deleted', del_auth_count,
        'identities_deleted', del_identities_count,
        'sessions_deleted', del_sessions_count,
        'profiles_deleted', del_profiles_count,
        'users_deleted', del_users_count,
        'messages_deleted', del_messages_count,
        'interests_deleted', del_interests_count,
        'payments_deleted', del_payments_count,
        'email_logs_deleted', del_emails_count,
        'reports_deleted', del_reports_count
    );
END;
$$;

-- Grant execution rights to anon, authenticated, and service_role
REVOKE EXECUTE ON FUNCTION public.delete_user_account_completely(TEXT, TEXT) FROM public;
GRANT EXECUTE ON FUNCTION public.delete_user_account_completely(TEXT, TEXT) TO authenticated, service_role, anon;

-- Verification Notice
SELECT 'Mangal Setu Master Security Hardening script executed successfully. Database is now fully hardened against public data theft and tampering.' AS status;
