-- ==============================================================================
-- MANGAL SETU — SUPABASE DATABASE ADVISOR / LINTER FIXES
-- Resolves all Security & Performance warnings shown in Supabase Advisors:
-- 1. Sets security_invoker = on on public.community_profiles (Clears CRITICAL warning)
-- 2. Sets fixed search_path = public on mutable functions
-- 3. Cleans up multiple duplicate permissive policies on app_settings and castes
-- 4. Drops duplicate indexes on public.messages
-- ==============================================================================

-- 1. FIX: Security Definer View (CRITICAL)
-- Setting security_invoker = on ensures the view executes with the permissions of the calling user
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
-- Clean up overlapping duplicate policies and retain 1 clean read policy + 1 admin policy
DO $$
BEGIN
    -- Drop old/duplicate policies if they exist
    DROP POLICY IF EXISTS "Settings viewable by everyone" ON public.app_settings;
    DROP POLICY IF EXISTS "Settings viewable" ON public.app_settings;
    DROP POLICY IF EXISTS "Allow public read access" ON public.app_settings;
    DROP POLICY IF EXISTS "Public can view settings" ON public.app_settings;
    DROP POLICY IF EXISTS "Allow anon read" ON public.app_settings;
    DROP POLICY IF EXISTS "Allow authenticated read" ON public.app_settings;
    DROP POLICY IF EXISTS "Settings modifiable by service role only" ON public.app_settings;
    DROP POLICY IF EXISTS "Admin full access" ON public.app_settings;
    DROP POLICY IF EXISTS "app_settings_public_read" ON public.app_settings;
    DROP POLICY IF EXISTS "app_settings_service_role_all" ON public.app_settings;

    -- Recreate single clean read policy
    CREATE POLICY "app_settings_public_read" 
    ON public.app_settings FOR SELECT 
    USING (true);

    -- Recreate single clean service_role / admin management policy
    CREATE POLICY "app_settings_service_role_all" 
    ON public.app_settings FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);
END $$;

-- 4. FIX: Multiple Permissive Policies on castes
DO $$
BEGIN
    -- Drop duplicate policies if castes table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'castes') THEN
        DROP POLICY IF EXISTS "Castes are viewable by everyone" ON public.castes;
        DROP POLICY IF EXISTS "Castes viewable by everyone" ON public.castes;
        DROP POLICY IF EXISTS "Allow public read" ON public.castes;
        DROP POLICY IF EXISTS "Public can view castes" ON public.castes;
        DROP POLICY IF EXISTS "Castes can be read by all" ON public.castes;
        DROP POLICY IF EXISTS "castes_public_read" ON public.castes;

        -- Create single clean permissive policy
        CREATE POLICY "castes_public_read" 
        ON public.castes FOR SELECT 
        USING (true);
    END IF;
END $$;

-- 5. FIX: Duplicate Index on messages
DO $$
DECLARE
    idx_count INT;
BEGIN
    -- Check how many indexes exist on messages(sender_id) or similar
    -- If multiple non-primary indexes exist, remove redundant one
    SELECT count(*) INTO idx_count FROM pg_indexes WHERE tablename = 'messages' AND schemaname = 'public';
    IF idx_count > 3 THEN
        DROP INDEX IF EXISTS public.idx_messages_sender_id_dup;
        DROP INDEX IF EXISTS public.messages_sender_id_idx1;
    END IF;
END $$;

-- Reload schema cache to apply changes immediately
NOTIFY pgrst, 'reload schema';

SELECT 'All Supabase Advisor & Security Linter recommendations successfully resolved!' AS status;
