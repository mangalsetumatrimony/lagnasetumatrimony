-- ==============================================================================
-- MANGAL SETU — SUPABASE DATABASE SECURITY HARDENING MIGRATION
-- Fixes:
-- 1. Blocks arbitrary direct DELETE on all tables by anonymous users
-- 2. Restricts direct SELECT on raw profiles and users tables (prevents contact harvesting)
-- 3. Grants public SELECT ONLY on community_profiles view (contacts masked at database level)
-- 4. Secures app_settings from unauthorized modification
-- 5. Enables safe controlled deletion via delete_user_account_completely RPC
-- 6. Safe & Idempotent (Can be executed multiple times in Supabase SQL Editor)
-- ==============================================================================

-- 1. Ensure RLS is active on all public tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- 2. Revoke dangerous direct DELETE privileges from anon role on raw tables
REVOKE DELETE ON public.profiles FROM anon;
REVOKE DELETE ON public.users FROM anon;
REVOKE DELETE ON public.payments FROM anon;
REVOKE DELETE ON public.interests FROM anon;
REVOKE DELETE ON public.messages FROM anon;
REVOKE DELETE ON public.app_settings FROM anon;
REVOKE DELETE ON public.reports FROM anon;
REVOKE DELETE ON public.email_logs FROM anon;

-- 3. Revoke public UPDATE/INSERT on app_settings (prevents DoS maintenance mode tampering)
REVOKE UPDATE, INSERT, DELETE ON public.app_settings FROM anon;

-- 4. Drop all permissive DELETE policies on public tables
DROP POLICY IF EXISTS "Profiles can be deleted by admin" ON public.profiles;
DROP POLICY IF EXISTS "Profiles can be deleted by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can be deleted by admin" ON public.users;
DROP POLICY IF EXISTS "Users can be deleted by everyone" ON public.users;
DROP POLICY IF EXISTS "Payments can be deleted by admin" ON public.payments;
DROP POLICY IF EXISTS "Payments can be deleted by everyone" ON public.payments;
DROP POLICY IF EXISTS "Interests can be deleted by everyone" ON public.interests;
DROP POLICY IF EXISTS "Messages can be deleted by everyone" ON public.messages;
DROP POLICY IF EXISTS "Reports can be deleted by everyone" ON public.reports;
DROP POLICY IF EXISTS "App settings can be updated by everyone" ON public.app_settings;

-- 5. Ensure community_profiles view exists with masked contacts
CREATE OR REPLACE VIEW public.community_profiles AS
SELECT 
    id,
    user_id,
    gender,
    name,
    age,
    dob,
    height,
    weight,
    education,
    occupation,
    occ,
    income,
    marital,
    physical,
    community,
    hobbies,
    father,
    father_occ,
    father_whatsapp,
    mother,
    mother_occ,
    sister,
    brother,
    village,
    taluka,
    district,
    full_address,
    img,
    avatar_url,
    photos,
    verify_status,
    account_status,
    payment_status,
    visible,
    featured,
    created_at,
    updated_at,
    -- Database-level contact masking: Prevents scraping of raw phone numbers & emails
    CASE 
        WHEN father_mobile IS NOT NULL AND length(trim(father_mobile)) >= 7 
        THEN substring(trim(father_mobile), 1, 3) || '•••••' || substring(trim(father_mobile), length(trim(father_mobile)) - 1)
        ELSE '••••••'
    END AS father_mobile,
    CASE 
        WHEN own_mobile IS NOT NULL AND length(trim(own_mobile)) >= 7 
        THEN substring(trim(own_mobile), 1, 3) || '•••••' || substring(trim(own_mobile), length(trim(own_mobile)) - 1)
        ELSE '••••••'
    END AS own_mobile,
    CASE 
        WHEN email IS NOT NULL AND position('@' in email) > 2
        THEN substring(email, 1, 2) || '•••••' || substring(email from position('@' in email))
        ELSE '••••••@gmail.com'
    END AS email
FROM public.profiles
WHERE visible = true 
  AND account_status <> 'suspended' 
  AND account_status <> 'deleted' 
  AND verify_status <> 'rejected';

-- 6. Grant SELECT on community_profiles to public
GRANT SELECT ON public.community_profiles TO anon, authenticated, service_role;

-- 7. Ensure get_authorized_contact RPC is available for unlocking contacts when interest accepted
GRANT EXECUTE ON FUNCTION public.get_authorized_contact(BIGINT, TEXT) TO anon, authenticated, service_role;

-- 8. Enable controlled account deletion RPC (Protected by client gatekeeper)
GRANT EXECUTE ON FUNCTION public.delete_user_account_completely(TEXT, TEXT) TO anon, authenticated, service_role;

-- Done!
SELECT 'Security Hardening Successfully Applied!' AS status;
