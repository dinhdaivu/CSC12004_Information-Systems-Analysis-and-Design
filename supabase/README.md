# Supabase Cloud Setup

Database configuration and migration files for HomeStay Dorm.

This project currently uses **Supabase Cloud**. A local Supabase/Postgres server is optional and is not required for the team workflow.

## Team Workflow

Use the Supabase Dashboard SQL Editor unless the repo has been explicitly linked to a Supabase Cloud project.

1. Open the team's Supabase project in the browser.
2. Go to **SQL Editor**.
3. Create a new query.
4. Paste the full contents of `supabase/migrations/001_initial_schema.sql`.
5. Run the query.
6. Check **Table Editor** and confirm the core tables exist:
   - `users`
   - `branches`
   - `rooms`
   - `beds`
   - `rental_requests`
   - `viewing_appointments`
   - `deposit_requests`
   - `payments`
   - `contracts`
   - `handovers`
   - `checkout_requests`
   - `settlements`
7. Check that seed data exists in `branches`:
   - `Tô Hiến Thành`
   - `Trần Não`
   - `Nguyễn Cửu Vân`
8. Check **Authentication > Policies** or **Database > Tables** and confirm RLS is enabled.

## Important Warning

If anyone already ran an older version of `scripts/CSDL_Script.sql` in the same Supabase project, do **not** run the new migration on top without checking first. The old script used conflicting enum definitions such as `room_status` and `deposit_status`.

For a clean task-00-02 setup, use one of these options:

- Preferred for school/demo work: create a fresh Supabase project and run `001_initial_schema.sql`.
- If the project has no important data: reset the database from **Project Settings > Database** or Supabase's danger/reset area, then run `001_initial_schema.sql`.
- If the project has important data: ask the team before changing anything, then create a follow-up migration that alters existing enum/table definitions safely.

## Optional CLI Workflow

Only use this if the team wants Supabase CLI validation/deploys.

```powershell
supabase link --project-ref <project-ref>
supabase db lint --linked
```

You can find `<project-ref>` in the Supabase project URL or dashboard settings. Do not commit Supabase access tokens or service keys.

## Environment Variables

Backend `.env` can use:

```text
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Frontend environment files must use only public values:

```text
supabaseUrl=
supabaseAnonKey=
```

Never put `SUPABASE_SERVICE_ROLE_KEY` in frontend code.

## Folder Structure

```text
supabase/
|-- README.md
|-- migrations/
|   `-- 001_initial_schema.sql
`-- policies/
    `-- README.md
```

## Schema Source Of Truth

The current source of truth is `supabase/migrations/001_initial_schema.sql`.

The standalone classroom script `scripts/CSDL_Script.sql` is kept in sync with the Supabase migration so teammates can open either file, but the migration file is the canonical version.

For the table summary and status enum mapping, see `docs/architecture/database.md`.
