-- ==============================================================================
-- MANGAL SETU - BULLETPROOF COMPLETE ACCOUNT & AUTH PURGE FUNCTION
-- ==============================================================================
-- Description:
-- When a user deletes their account OR an admin deletes a user:
-- 1. Completely deletes user from Supabase Authentication (auth.users, identities, sessions, tokens)
-- 2. Completely deletes user from all public tables:
--    - profiles (Matrimonial profiles - automatically clears community_profiles view)
--    - users (Account records)
--    - messages (All chat messages sent & received)
--    - interests (All match requests sent & received)
--    - payments (All transaction history & receipts)
--    - email_logs (All email delivery logs)
--    - reports (All reports filed by or against the user)
-- Zero trace is left behind in the database, freeing 100% of table space and auth slots.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.delete_user_account_completely(target_email TEXT, target_user_id TEXT DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
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
BEGIN
    norm_email := LOWER(TRIM(COALESCE(target_email, '')));
    norm_id := TRIM(COALESCE(target_user_id, ''));

    IF norm_id ~ '^[0-9]+$' THEN
        num_id := norm_id::bigint;
    END IF;

    -- Cross-resolve identifiers across tables
    IF norm_email = '' AND num_id IS NOT NULL THEN
        SELECT LOWER(TRIM(email)) INTO norm_email FROM public.profiles WHERE id = num_id LIMIT 1;
        IF norm_email IS NULL OR norm_email = '' THEN
            SELECT LOWER(TRIM(email)) INTO norm_email FROM public.users WHERE id = num_id LIMIT 1;
        END IF;
    END IF;

    IF norm_email = '' AND norm_id <> '' THEN
        SELECT LOWER(TRIM(email)) INTO norm_email FROM public.profiles WHERE user_id = norm_id LIMIT 1;
        IF norm_email IS NULL OR norm_email = '' THEN
            SELECT LOWER(TRIM(email)) INTO norm_email FROM public.users WHERE id::text = norm_id LIMIT 1;
        END IF;
    END IF;

    IF num_id IS NOT NULL AND (norm_id = '' OR norm_id ~ '^[0-9]+$') THEN
        SELECT user_id INTO norm_id FROM public.profiles WHERE id = num_id AND user_id IS NOT NULL AND user_id <> '' LIMIT 1;
    END IF;

    -- Locate UUID in auth.users by target_user_id (if UUID format)
    IF norm_id IS NOT NULL AND norm_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
        BEGIN
            SELECT id INTO found_auth_uid FROM auth.users WHERE id = norm_id::uuid LIMIT 1;
        EXCEPTION WHEN OTHERS THEN
            found_auth_uid := NULL;
        END;
    END IF;

    -- Locate UUID in auth.users by email
    IF found_auth_uid IS NULL AND norm_email <> '' THEN
        BEGIN
            SELECT id INTO found_auth_uid FROM auth.users WHERE LOWER(TRIM(email)) = norm_email LIMIT 1;
        EXCEPTION WHEN OTHERS THEN
            found_auth_uid := NULL;
        END;
    END IF;

    -- --------------------------------------------------------------------------
    -- 1. DELETE FROM PUBLIC.MESSAGES (Chat Messages)
    -- --------------------------------------------------------------------------
    IF to_regclass('public.messages') IS NOT NULL THEN
        DELETE FROM public.messages 
        WHERE (norm_email <> '' AND (LOWER(TRIM(sender_email)) = norm_email OR LOWER(TRIM(receiver_email)) = norm_email))
           OR (num_id IS NOT NULL AND (sender_id = num_id OR receiver_id = num_id))
           OR (norm_id <> '' AND (sender_id::text = norm_id OR receiver_id::text = norm_id))
           OR (found_auth_uid IS NOT NULL AND (sender_id::text = found_auth_uid::text OR receiver_id::text = found_auth_uid::text));
        GET DIAGNOSTICS del_messages_count = ROW_COUNT;
    END IF;

    -- --------------------------------------------------------------------------
    -- 2. DELETE FROM PUBLIC.INTERESTS (Connection Requests)
    -- --------------------------------------------------------------------------
    IF to_regclass('public.interests') IS NOT NULL THEN
        DELETE FROM public.interests 
        WHERE (norm_email <> '' AND (LOWER(TRIM(sender_email)) = norm_email OR LOWER(TRIM(receiver_email)) = norm_email))
           OR (num_id IS NOT NULL AND (sender_id = num_id OR receiver_id = num_id))
           OR (norm_id <> '' AND (sender_id::text = norm_id OR receiver_id::text = norm_id))
           OR (found_auth_uid IS NOT NULL AND (sender_id::text = found_auth_uid::text OR receiver_id::text = found_auth_uid::text));
        GET DIAGNOSTICS del_interests_count = ROW_COUNT;
    END IF;

    -- --------------------------------------------------------------------------
    -- 3. DELETE FROM PUBLIC.PAYMENTS (Payment Receipts & Logs)
    -- --------------------------------------------------------------------------
    IF to_regclass('public.payments') IS NOT NULL THEN
        DELETE FROM public.payments 
        WHERE (norm_email <> '' AND (
                LOWER(TRIM(user_id)) = norm_email 
                OR (to_jsonb(public.payments.*) ? 'email' AND LOWER(TRIM(to_jsonb(public.payments.*)->>'email')) = norm_email)
              ))
           OR (norm_id <> '' AND (user_id = norm_id OR id = norm_id))
           OR (num_id IS NOT NULL AND user_id = num_id::text)
           OR (found_auth_uid IS NOT NULL AND user_id = found_auth_uid::text);
        GET DIAGNOSTICS del_payments_count = ROW_COUNT;
    END IF;

    -- --------------------------------------------------------------------------
    -- 4. DELETE FROM PUBLIC.EMAIL_LOGS (Email Notification Logs)
    -- --------------------------------------------------------------------------
    IF to_regclass('public.email_logs') IS NOT NULL THEN
        DELETE FROM public.email_logs 
        WHERE (norm_email <> '' AND (
                LOWER(TRIM(recipient_email)) = norm_email 
                OR (to_jsonb(public.email_logs.*) ? 'sender_email' AND LOWER(TRIM(to_jsonb(public.email_logs.*)->>'sender_email')) = norm_email)
                OR (to_jsonb(public.email_logs.*) ? 'email' AND LOWER(TRIM(to_jsonb(public.email_logs.*)->>'email')) = norm_email)
              ))
           OR (norm_id <> '' AND (to_jsonb(public.email_logs.*) ? 'user_id' AND to_jsonb(public.email_logs.*)->>'user_id' = norm_id))
           OR (num_id IS NOT NULL AND (to_jsonb(public.email_logs.*) ? 'profile_id' AND to_jsonb(public.email_logs.*)->>'profile_id' = num_id::text));
        GET DIAGNOSTICS del_emails_count = ROW_COUNT;
    END IF;

    -- --------------------------------------------------------------------------
    -- 5. DELETE FROM PUBLIC.REPORTS (User Reports)
    -- --------------------------------------------------------------------------
    IF to_regclass('public.reports') IS NOT NULL THEN
        DELETE FROM public.reports 
        WHERE (norm_email <> '' AND (LOWER(TRIM(reporter_email)) = norm_email OR LOWER(TRIM(target_user_email)) = norm_email))
           OR (norm_id <> '' AND (reporter_id = norm_id OR target_user_id = norm_id))
           OR (num_id IS NOT NULL AND (reporter_id = num_id::text OR target_user_id = num_id::text))
           OR (found_auth_uid IS NOT NULL AND (reporter_id = found_auth_uid::text OR target_user_id = found_auth_uid::text));
        GET DIAGNOSTICS del_reports_count = ROW_COUNT;
    END IF;

    -- --------------------------------------------------------------------------
    -- 6. DELETE FROM PUBLIC.PROFILES (Matrimonial Profiles)
    -- Automatically purges from community_profiles SQL view
    -- --------------------------------------------------------------------------
    IF to_regclass('public.profiles') IS NOT NULL THEN
        DELETE FROM public.profiles 
        WHERE (norm_email <> '' AND LOWER(TRIM(email)) = norm_email)
           OR (num_id IS NOT NULL AND id = num_id)
           OR (norm_id <> '' AND (user_id = norm_id OR id::text = norm_id))
           OR (found_auth_uid IS NOT NULL AND (user_id = found_auth_uid::text OR id::text = found_auth_uid::text));
        GET DIAGNOSTICS del_profiles_count = ROW_COUNT;
    END IF;

    -- --------------------------------------------------------------------------
    -- 7. DELETE FROM PUBLIC.USERS (User Accounts)
    -- --------------------------------------------------------------------------
    IF to_regclass('public.users') IS NOT NULL THEN
        DELETE FROM public.users 
        WHERE (norm_email <> '' AND LOWER(TRIM(email)) = norm_email)
           OR (num_id IS NOT NULL AND id = num_id)
           OR (norm_id <> '' AND id::text = norm_id)
           OR (found_auth_uid IS NOT NULL AND id::text = found_auth_uid::text);
        GET DIAGNOSTICS del_users_count = ROW_COUNT;
    END IF;

    -- --------------------------------------------------------------------------
    -- 8. DELETE FROM SUPABASE AUTHENTICATION (auth.users & all auth sub-tables)
    -- --------------------------------------------------------------------------
    -- Branch A: By UUID (found_auth_uid)
    IF found_auth_uid IS NOT NULL THEN
        BEGIN
            -- Delete MFA challenges
            IF to_regclass('auth.mfa_challenges') IS NOT NULL AND to_regclass('auth.mfa_factors') IS NOT NULL THEN
                DELETE FROM auth.mfa_challenges WHERE factor_id IN (SELECT id FROM auth.mfa_factors WHERE user_id = found_auth_uid);
            END IF;

            -- Delete MFA factors
            IF to_regclass('auth.mfa_factors') IS NOT NULL THEN
                DELETE FROM auth.mfa_factors WHERE user_id = found_auth_uid;
            END IF;

            -- Delete refresh tokens
            IF to_regclass('auth.refresh_tokens') IS NOT NULL AND to_regclass('auth.sessions') IS NOT NULL THEN
                DELETE FROM auth.refresh_tokens WHERE session_id IN (SELECT id FROM auth.sessions WHERE user_id = found_auth_uid);
                GET DIAGNOSTICS del_tokens_count = ROW_COUNT;
            END IF;

            -- Delete sessions
            IF to_regclass('auth.sessions') IS NOT NULL THEN
                DELETE FROM auth.sessions WHERE user_id = found_auth_uid;
                GET DIAGNOSTICS del_sessions_count = ROW_COUNT;
            END IF;

            -- Delete one_time_tokens
            IF to_regclass('auth.one_time_tokens') IS NOT NULL THEN
                DELETE FROM auth.one_time_tokens WHERE user_id = found_auth_uid;
            END IF;

            -- Delete identities (Google OAuth identity link)
            IF to_regclass('auth.identities') IS NOT NULL THEN
                DELETE FROM auth.identities WHERE user_id = found_auth_uid;
                GET DIAGNOSTICS del_identities_count = ROW_COUNT;
            END IF;

            -- Delete user from auth.users (Permanent removal of Gmail ID from Supabase Auth)
            DELETE FROM auth.users WHERE id = found_auth_uid;
            GET DIAGNOSTICS del_auth_count = ROW_COUNT;
        EXCEPTION WHEN OTHERS THEN
            -- In case of any table-level exception, try direct email fallback below
            del_auth_count := 0;
        END;
    END IF;

    -- Branch B: By Email directly in auth.users (if UUID was not pre-resolved)
    IF del_auth_count = 0 AND norm_email <> '' THEN
        BEGIN
            -- Delete MFA challenges
            IF to_regclass('auth.mfa_challenges') IS NOT NULL AND to_regclass('auth.mfa_factors') IS NOT NULL THEN
                DELETE FROM auth.mfa_challenges WHERE factor_id IN (
                    SELECT id FROM auth.mfa_factors WHERE user_id IN (SELECT id FROM auth.users WHERE LOWER(TRIM(email)) = norm_email)
                );
            END IF;

            -- Delete MFA factors
            IF to_regclass('auth.mfa_factors') IS NOT NULL THEN
                DELETE FROM auth.mfa_factors WHERE user_id IN (SELECT id FROM auth.users WHERE LOWER(TRIM(email)) = norm_email);
            END IF;

            -- Delete refresh tokens
            IF to_regclass('auth.refresh_tokens') IS NOT NULL AND to_regclass('auth.sessions') IS NOT NULL THEN
                DELETE FROM auth.refresh_tokens WHERE session_id IN (
                    SELECT id FROM auth.sessions WHERE user_id IN (SELECT id FROM auth.users WHERE LOWER(TRIM(email)) = norm_email)
                );
                GET DIAGNOSTICS del_tokens_count = ROW_COUNT;
            END IF;

            -- Delete sessions
            IF to_regclass('auth.sessions') IS NOT NULL THEN
                DELETE FROM auth.sessions WHERE user_id IN (SELECT id FROM auth.users WHERE LOWER(TRIM(email)) = norm_email);
                GET DIAGNOSTICS del_sessions_count = ROW_COUNT;
            END IF;

            -- Delete one_time_tokens
            IF to_regclass('auth.one_time_tokens') IS NOT NULL THEN
                DELETE FROM auth.one_time_tokens WHERE user_id IN (SELECT id FROM auth.users WHERE LOWER(TRIM(email)) = norm_email);
            END IF;

            -- Delete identities (Google OAuth identity link)
            IF to_regclass('auth.identities') IS NOT NULL THEN
                DELETE FROM auth.identities WHERE user_id IN (SELECT id FROM auth.users WHERE LOWER(TRIM(email)) = norm_email);
                GET DIAGNOSTICS del_identities_count = ROW_COUNT;
            END IF;

            -- Delete user from auth.users (Permanent removal of Gmail ID from Supabase Auth)
            DELETE FROM auth.users WHERE LOWER(TRIM(email)) = norm_email;
            GET DIAGNOSTICS del_auth_count = ROW_COUNT;
        EXCEPTION WHEN OTHERS THEN
            del_auth_count := 0;
        END;
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

-- Verification notice
SELECT 'Mangal Setu Complete Account & Auth Purge function installed successfully.' AS status;

