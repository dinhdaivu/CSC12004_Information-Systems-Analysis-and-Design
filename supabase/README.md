# Supabase Cloud Setup

Database configuration and migration files for HomeStay Dorm.

This project currently uses **Supabase Cloud**. A local Supabase/Postgres server is optional and is not required for the team workflow.

## Team Workflow

Use the Supabase Dashboard SQL Editor unless the repo has been explicitly linked to a Supabase Cloud project.

1. Open the team's Supabase project in the browser.
2. Go to **SQL Editor**.
3. Create a new query.
4. Paste and run the full contents of `supabase/migrations/001_initial_schema.sql`.
5. Paste and run `supabase/seed.sql` for demo branch, room, bed, and service data.
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

If `001_initial_schema.sql` was already applied before customer deposit/payment insert policies were added, run `supabase/migrations/002_allow_customer_deposit_payment_inserts.sql` as a follow-up migration.

For a clean task-00-02 setup, use one of these options:

- Preferred for school/demo work: create a fresh Supabase project and run `001_initial_schema.sql`.
- If the project has no important data: reset the database from **Project Settings > Database** or Supabase's danger/reset area, then run `001_initial_schema.sql`.
- If the project has important data: ask the team before changing anything, then create a follow-up migration that alters existing enum/table definitions safely.

## Optional CLI Workflow

Only use this if the team wants Supabase CLI validation/deploys.

```powershell
supabase link --project-ref <project-ref>
supabase db lint --linked
supabase db push --dry-run
supabase db push
supabase seed buckets --linked
```

You can find `<project-ref>` in the Supabase project URL or dashboard settings. Do not commit Supabase access tokens or service keys.

For local development, the CLI reads `supabase/config.toml`. Running `supabase db reset` applies migrations and then runs `supabase/seed.sql`.

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
|-- config.toml
|-- README.md
|-- seed.sql
|-- migrations/
|   |-- 001_initial_schema.sql
|   `-- 002_allow_customer_deposit_payment_inserts.sql
`-- policies/
    `-- README.md
```

## Schema Source Of Truth

The current schema source of truth is the ordered SQL files in `supabase/migrations/`.

The standalone classroom script `scripts/CSDL_Script.sql` is kept in sync with the cumulative schema so teammates can open either file, but the migration files are canonical.

For the table summary and status enum mapping, see `docs/architecture/database.md`.
