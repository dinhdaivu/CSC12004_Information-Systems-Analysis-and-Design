-- Spring Boot connects via JDBC as the 'postgres' role.
-- Supabase subjects postgres to RLS but won't grant BYPASSRLS to non-superusers.
--
-- Fix: add a permissive policy "postgres_fullaccess" on every table in the public
-- schema so the JDBC service account can SELECT/INSERT/UPDATE/DELETE freely.
-- Existing policies for anon/authenticated roles are untouched — their RLS stays.
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
    LOOP
        -- Skip if policy already exists (idempotent re-run).
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies
            WHERE schemaname = 'public'
              AND tablename  = tbl
              AND policyname = 'postgres_fullaccess'
        ) THEN
            EXECUTE format(
                'CREATE POLICY postgres_fullaccess ON public.%I FOR ALL TO postgres USING (true) WITH CHECK (true)',
                tbl
            );
        END IF;
    END LOOP;
END $$;
