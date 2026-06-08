-- Phase 2: Spring Boot native auth (Option B).
-- Add password_hash so Spring manages credentials independently of Supabase Auth.
-- Drop the FK to auth.users so Spring-generated UUIDs are not constrained by that table.
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;
