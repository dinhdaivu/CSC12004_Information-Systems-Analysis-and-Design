# [Task] Admin User Management

> **Implementation Rules**
> 1. **Before implementation**: Check [api-endpoints.md](../architecture/api-endpoints.md), [database.md](../architecture/database.md), and the current `/admin/users` Angular route.
> 2. **Stubs**: If a dependency is not implemented, create a typed stub and add `// TODO: Implemented in task 03-04`.
> 3. **After implementation**: Update API and database docs if user fields, roles, or permissions change.

## GitHub Issue

- Link: TBD

---

## Overview

Implement admin user management. This is a derived implementation use case because the report lists roles and login, while the app and API docs already define admin user management through `/admin/users` and `/api/v1/users`.

### System Use Case

| ID | Name | Actor | Notes |
|----|------|-------|-------|
| SUC19 | Admin user management | Manager/Admin | Derived implementation use case |

---

## Reference Documents

| Document | Section |
|----------|---------|
| [API Endpoints](../architecture/api-endpoints.md) | Users (Admin) |
| [Database Design](../architecture/database.md) | User/profile tables |
| `frontend/src/app/features/admin/admin.routes.ts` | `/admin/users` route |

---

## Scope

### Frontend (Angular)

- [ ] Use existing `ngx-translate` i18n pattern for all user-facing copy; add/update matching keys in `frontend/src/assets/i18n/en.json` and `frontend/src/assets/i18n/vi.json`.

- [ ] Replace `UsersManagementComponent` placeholder.
- [ ] Render users table.
- [ ] Add filters by role/status/search.
- [ ] Add view/edit role/status actions.
- [ ] Add delete/deactivate action if allowed.

### Backend (Express/Supabase)

- [ ] Implement `GET /api/v1/users`.
- [ ] Implement `GET /api/v1/users/:id`.
- [ ] Implement `PATCH /api/v1/users/:id`.
- [ ] Implement `DELETE /api/v1/users/:id` or soft-delete/deactivate.
- [ ] Enforce admin-only access.

### Tests

| Layer | Test File | Mock Target |
|-------|-----------|-------------|
| Frontend | `frontend/src/app/features/admin/components/users-management/users-management.component.spec.ts` | Users service |
| Backend | `backend/src/__tests__/users.spec.ts` | Supabase client |

---

## Completion Conditions

- [ ] `/admin/users` no longer shows placeholder text.
- [ ] Admin can list and filter users.
- [ ] Admin can update user role/status.
- [ ] Admin-only API protection exists.
- [ ] Tests pass for changed code.
