-- Migration 017 failed (ALTER ROLE BYPASSRLS requires superuser) but was recorded
-- in migration history, so the fixed version never applied.
-- This migration adds a permissive policy for the 'postgres' JDBC role on every
-- public table. Existing anon/authenticated policies are untouched.
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
    LOOP
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
