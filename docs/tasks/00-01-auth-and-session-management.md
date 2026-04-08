# [Task] Auth and Session Management

> **Implementation Rules**
> 1. **Before implementation**: Check [api-endpoints.md](../architecture/api-endpoints.md), [layers.md](../architecture/layers.md), and `report/content/2_System Analyze.tex` SUC1.
> 2. **Stubs**: If a dependency is not implemented, create a typed stub and add `// TODO: Implemented in task 00-01`.
> 3. **After implementation**: Update API docs and frontend status if auth routes or screens change.

## GitHub Issue

- Link: TBD

---

## Overview

Implement login, logout, current-user profile loading, and password reset entry points for customer, sales, accountant, and manager/admin roles.

Customer registration is split into [00-04 Customer Registration](./00-04-customer-registration.md) because it is tracked as the extended report use case SUC18.

### Current Routes

| Screen | Angular Route | Backend Task |
|--------|---------------|--------------|
| Login | `/auth/login` | SUC1 |
| Register | `/auth/register` | Derived SUC18; see task 00-04 |
| Forgot password | `/auth/forgot-password` | SUC1 alternative flow |

---

## Reference Documents

| Document | Section |
|----------|---------|
| `report/content/2_System Analyze.tex` | SUC1: Dang nhap |
| [API Endpoints](../architecture/api-endpoints.md) | Auth |
| [Software Layers](../architecture/layers.md) | Presentation and control layer rules |

---

## Flow Summary

```text
Auth flow:

1. User opens /auth/login.
2. User enters credentials.
3. Backend verifies credentials and returns JWT/session.
4. Frontend stores token through AuthService.
5. Frontend redirects user based on role.
6. User can logout and clear the session.
7. Forgot-password flow accepts email and triggers reset.
```

---

## Scope

### Frontend (Angular)

- [ ] Replace login and forgot-password placeholders with real forms.
- [ ] Add validation and error messages.
- [ ] Wire `AuthService` to login/logout/current-user/reset APIs.
- [ ] Add role-based redirect after login.
- [ ] Add auth guard for protected routes.

### Backend (Express/Supabase)

- [ ] Implement `POST /api/v1/auth/login`.
- [ ] Implement `POST /api/v1/auth/logout`.
- [ ] Implement `GET /api/v1/auth/me`.
- [ ] Implement `PATCH /api/v1/auth/me`.
- [ ] Implement reset-password entry point if Supabase Auth is used.

### Tests

| Layer | Test File | Mock Target |
|-------|-----------|-------------|
| Frontend | `frontend/src/app/features/auth/components/login/login.component.spec.ts` | AuthService |
| Backend | `backend/src/__tests__/auth.spec.ts` | Supabase/JWT utilities |

---

## AI Implementation Prompt

--------------------------------------------------

Implement `docs/tasks/00-01-auth-and-session-management.md`.

## References
- Report: `report/content/2_System Analyze.tex` SUC1
- API: `docs/architecture/api-endpoints.md`

## Implementation
- Replace login and forgot-password placeholder components.
- Add typed login/reset/current-user payloads.
- Wire AuthService to backend auth endpoints.
- Add role-based redirect and protected-route guard.
- If backend auth is missing, create typed frontend stubs with `// TODO: Implemented in task 00-01`.

## Test Requirements
- Form validation tests.
- Successful login and failed login tests.
- Backend auth route tests if backend is implemented.

--------------------------------------------------

---

## Completion Conditions

- [ ] Auth pages no longer show placeholder text.
- [ ] Login stores token/session.
- [ ] Logout clears token/session.
- [ ] `/auth/me` or equivalent current-user flow exists.
- [ ] Protected routes require authentication.
- [ ] Tests pass for changed code.
