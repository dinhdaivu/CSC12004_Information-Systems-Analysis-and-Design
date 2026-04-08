# [Task] Database Schema and RLS Foundation

> **Implementation Rules**
> 1. **Before implementation**: Check [database.md](../architecture/database.md), [state-machine.md](../architecture/state-machine.md), `supabase/README.md`, and the report ERD references.
> 2. **Stubs**: If a table is deferred, document the missing table with `-- TODO: Implemented in task 00-02`.
> 3. **After implementation**: Update [database.md](../architecture/database.md), [api-endpoints.md](../architecture/api-endpoints.md), and any models affected by migrations.

## GitHub Issue

- Link: https://github.com/dinhdaivu/CSC12004_Information-Systems-Analysis-and-Design/issues/8

---

## Overview

Create the database foundation for the HomeStay Dorm implementation. The report and architecture docs identify customers, employees, rooms, beds, deposit requests, payments, contracts, checkout requests, settlements, and handovers as core entities.

---

## Reference Documents

| Document | Section |
|----------|---------|
| `docs/Requirements.pdf` | Project database/storage design requirement |
| `report/content/1_Business Analyze.tex` | ERD figure |
| `report/content/2_System Analyze.tex` | SUC1-SUC21 data needs |
| [Database Design](../architecture/database.md) | Implemented schema summary |
| [State Machine](../architecture/state-machine.md) | Status enums |

---

## Scope

### Supabase / PostgreSQL

- [x] Define `users` or profile table aligned with auth.
- [x] Define `branches`.
- [x] Define `rooms`.
- [x] Define `beds`.
- [x] Define rental request / booking table.
- [x] Define `viewing_appointments`.
- [x] Define `deposit_requests`.
- [x] Define `payments`.
- [x] Define `contracts`.
- [x] Define `handovers`.
- [x] Define `checkout_requests`.
- [x] Define `settlements`.
- [x] Add indexes for common filters: branch, status, customer, room, date.
- [x] Add RLS policies for customer, sales, accountant, manager/admin roles.
- [x] Add seed data for three Figma branches.

### Documentation

- [x] Populate `docs/architecture/database.md`.
- [x] Confirm status enum names match `docs/architecture/state-machine.md`.
- [x] Document any table/field intentionally deferred.

### Tests

| Layer | Test File | Mock Target |
|-------|-----------|-------------|
| Supabase | `supabase/policies/*` or migration tests | RLS policies |
| Backend | affected route specs | Supabase schema |

---

## AI Implementation Prompt

--------------------------------------------------

Implement `docs/tasks/00-02-database-schema-and-rls.md`.

## References
- Report: `report/content/1_Business Analyze.tex`, `report/content/2_System Analyze.tex`
- State machine: `docs/architecture/state-machine.md`
- Database doc: `docs/architecture/database.md`

## Implementation
- Add Supabase migrations for the core entities.
- Add RLS policies for customer, sales, accountant, and manager/admin roles.
- Add seed data for the known branches from Figma.
- Update `docs/architecture/database.md` with table definitions.

## Test Requirements
- Validate migrations apply cleanly.
- Validate RLS policy behavior where test tooling exists.

--------------------------------------------------

---

## Completion Conditions

- [x] Core tables exist.
- [x] Status fields match the state-machine docs.
- [x] RLS policies exist for protected data.
- [x] Seed branch data exists.
- [x] `docs/architecture/database.md` is no longer TODO-only.

## Verification Notes

- Static SQL checks passed: no duplicate `CREATE TABLE` names, no unresolved forward references between `public.*` tables, and the standalone `scripts/CSDL_Script.sql` matches the Supabase migration hash.
- Supabase Cloud validation should follow `supabase/README.md`: run `supabase/migrations/001_initial_schema.sql` in the Dashboard SQL Editor, or link the repo with `supabase link --project-ref <project-ref>` before running `supabase db lint --linked`.
