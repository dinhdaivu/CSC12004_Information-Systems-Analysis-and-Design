# [Task] Customer Bookings and Rental Request List

> **Implementation Rules**
> 1. **Before implementation**: Check [api-endpoints.md](../architecture/api-endpoints.md), [state-machine.md](../architecture/state-machine.md), and `report/content/2_System Analyze.tex` SUC2, SUC4, and SUC10.
> 2. **Stubs**: If a dependency is not implemented, create a typed stub and add `// TODO: Implemented in task 01-06`.
> 3. **After implementation**: Update docs if customer booking/request status behavior changes.

## GitHub Issue

- Link: TBD

---

## Overview

Implement the `/bookings` customer list screen. This is a derived implementation use case because the report describes creating rental requests/deposits/checkouts, but the Angular app already has a customer bookings list route for viewing and acting on those records.

### System Use Case

| ID | Name | Actor | Notes |
|----|------|-------|-------|
| SUC20 | Customer booking/request status list | Customer | Derived implementation use case |

---

## Scope

### Frontend (Angular)

- [ ] Use existing `ngx-translate` i18n pattern for all user-facing copy; add/update matching keys in `frontend/src/assets/i18n/en.json` and `frontend/src/assets/i18n/vi.json`.

- [ ] Replace `BookingsListComponent` placeholder.
- [ ] Render customer rental requests, deposit requests, or bookings.
- [ ] Add status filters: pending, confirmed, cancelled, active, checkout pending where applicable.
- [ ] Add navigation to `/bookings/:id`.
- [ ] Add cancel/modify action only where status rules allow.

### Backend (Express/Supabase)

- [ ] Implement customer-scoped booking/request list endpoint.
- [ ] Enforce that customers only see their own records.
- [ ] Support status filtering.

### Tests

| Layer | Test File | Mock Target |
|-------|-----------|-------------|
| Frontend | `frontend/src/app/features/bookings/components/bookings-list/bookings-list.component.spec.ts` | Bookings service |
| Backend | `backend/src/__tests__/bookings.spec.ts` | Supabase client |

---

## Completion Conditions

- [ ] `/bookings` no longer shows placeholder text.
- [ ] Customer records render with status filters.
- [ ] Detail navigation works.
- [ ] Customer data access is scoped.
- [ ] Tests pass for changed code.
