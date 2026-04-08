# [Task] Admin Dashboard Overview

> **Implementation Rules**
> 1. **Before implementation**: Check [frontend-status.md](../frontend-status.md), [api-endpoints.md](../architecture/api-endpoints.md), and the current `/admin` Angular route.
> 2. **Stubs**: If a dependency is not implemented, create a typed stub and add `// TODO: Implemented in task 03-05`.
> 3. **After implementation**: Update docs if dashboard metrics, admin route behavior, or navigation changes.

## GitHub Issue

- Link: TBD

---

## Overview

Implement the admin landing dashboard. This is a derived implementation use case because the report defines role-specific management flows, while the Angular app already has `/admin` as a dashboard route and tests expect statistics, navigation, recent activity, and admin actions.

### System Use Case

| ID | Name | Actor | Notes |
|----|------|-------|-------|
| SUC21 | Admin dashboard overview | Manager/Admin | Derived implementation use case |

---

## Scope

### Frontend (Angular)

- [ ] Use existing `ngx-translate` i18n pattern for all user-facing copy; add/update matching keys in `frontend/src/assets/i18n/en.json` and `frontend/src/assets/i18n/vi.json`.

- [ ] Replace `AdminDashboardComponent` placeholder.
- [ ] Render summary cards for users, bookings/rental requests, rooms, and revenue/transactions.
- [ ] Render quick links to users, rooms, transactions, schedules, contracts, and checkout management.
- [ ] Render recent activity list if data is available.
- [ ] Add loading/empty/error states.

### Backend (Express/Supabase)

- [ ] Implement admin dashboard summary endpoint or compose existing endpoints.
- [ ] Enforce admin/manager access.
- [ ] Return counts and recent activity data.

### Tests

| Layer | Test File | Mock Target |
|-------|-----------|-------------|
| Frontend | `frontend/src/app/features/admin/components/admin-dashboard/admin-dashboard.component.spec.ts` | Admin dashboard service |
| Backend | `backend/src/__tests__/admin-dashboard.spec.ts` | Supabase client |

---

## Completion Conditions

- [ ] `/admin` no longer shows placeholder text.
- [ ] Dashboard summary cards render.
- [ ] Admin navigation links work.
- [ ] Admin-only access is enforced or stubbed.
- [ ] Tests pass for changed code.
