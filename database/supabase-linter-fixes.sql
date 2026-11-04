-- ==============================================================================
-- MANGAL SETU — SUPABASE DATABASE ADVISOR / LINTER FIXES
-- Resolves all Security & Performance warnings shown in Supabase Advisors:
-- 1. Sets security_invoker = on on public.community_profiles (Clears CRITICAL warning)
-- 2. Sets fixed search_path = public on mutable functions
-- 3. Cleans up multiple duplicate permissive policies on app_settings and castes
-- 4. Drops duplicate indexes on public.messages
-- ==============================================================================

-- 1. FIX: Security Definer View (CRITICAL)
-- Setting security_invoker = on ensures the view executes with the permissions of calling user
ALTER VIEW IF EXISTS public.community_profiles SET (security_invoker = on);

-- 2. FIX: Function Search Path Mutable
-- Secures search_path against search path hijacking
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_profile_visibility') THEN
        ALTER FUNCTION public.set_profile_visibility(BIGINT, BOOLEAN) SET search_path = public;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'enforce_daily_interest_limit') THEN
        EXECUTE 'ALTER FUNCTION public.enforce_daily_interest_limit() SET search_path = public;';
    END IF;
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'protect_profile_sensitive_columns') THEN
        EXECUTE 'ALTER FUNCTION public.protect_profile_sensitive_columns() SET search_path = public;';
    END IF;
END $$;

-- 3. FIX: Multiple Permissive Policies on app_settings
-- Clean up all overlapping duplicate policies and retain exactly 1 clean read policy + 1 admin policy
DO $$
DECLARE
    pol RECORD;
BEGIN
    -- Dynamically drop all existing policies on app_settings to eliminate duplicates
    FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'app_settings' AND schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.app_settings;', pol.policyname);
    END LOOP;

    -- Recreate single clean read policy (Shields admin credentials & secret keys from public read)
    CREATE POLICY "Public settings viewable by everyone" 
    ON public.app_settings FOR SELECT 
    USING (key NOT IN ('admin_credentials', 'secret_keys', 'api_tokens', 'service_role_key', 'private_config'));

    -- Recreate single clean service_role / admin management policy
    CREATE POLICY "Settings modifiable by service role only" 
    ON public.app_settings FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);
END $$;

-- 4. FIX: Multiple Permissive Policies on castes
DO $$
DECLARE
    pol RECORD;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'castes') THEN
        FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'castes' AND schemaname = 'public') LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.castes;', pol.policyname);
        END LOOP;

        CREATE POLICY "castes_public_read" 
        ON public.castes FOR SELECT 
        USING (true);
    END IF;
END $$;

-- 5. FIX: Duplicate Index on messages
DO $$
BEGIN
    DROP INDEX IF EXISTS public.idx_messages_sender_id_dup;
    DROP INDEX IF EXISTS public.messages_sender_id_idx1;
    DROP INDEX IF EXISTS public.idx_messages_sender_id;
    DROP INDEX IF EXISTS public.idx_messages_receiver_id_dup;
    DROP INDEX IF EXISTS public.messages_receiver_id_idx1;
    DROP INDEX IF EXISTS public.idx_messages_thread_id_dup;
END $$;

-- Reload schema cache to apply changes immediately
NOTIFY pgrst, 'reload schema';

SELECT 'All Supabase Advisor & Security Linter recommendations successfully resolved!' AS status;
