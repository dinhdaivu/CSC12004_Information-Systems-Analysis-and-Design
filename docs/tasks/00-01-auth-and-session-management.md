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
| Login | `/login` | SUC1 |
| Register | `/register` | Derived SUC18; see task 00-04 |
| Confirm email | `/confirm-email` | SUC18 signup verification |
| Reset password | `/reset-password` | SUC1 alternative flow |

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

1. User opens /login.
2. User enters credentials.
3. Backend verifies credentials and returns JWT/session.
4. Frontend stores token through AuthService.
5. Frontend redirects user based on role.
6. User can logout and clear the session.
7. Forgot-password flow accepts email and triggers reset.
8. Signup flow continues through /confirm-email after `/api/auth/register` returns the pending email.
9. Password recovery continues through /reset-password.
```

---

## Scope

### Frontend (Angular)

- [ ] Use existing `ngx-translate` i18n pattern for all user-facing copy; add/update matching keys in `frontend/src/assets/i18n/en.json` and `frontend/src/assets/i18n/vi.json`.

- [ ] Replace login, confirm-email, and reset-password placeholders with real forms.
- [ ] Add validation and error messages.
- [ ] Wire `AuthService` to login/logout/current-user/reset/verification APIs.
- [ ] Add role-based redirect after login.
- [ ] Add auth guard for protected routes.

### Backend (Express/Supabase)

- [ ] Implement `POST /api/auth/login`.
- [ ] Implement `POST /api/auth/logout`.
- [ ] Implement `GET /api/auth/me`.
- [ ] Implement `PATCH /api/auth/me`.
- [ ] Implement signup verification, resend-verification, and reset-password entry points if Supabase Auth is used.

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
- Replace login, confirm-email, and reset-password placeholder components.
- Add typed login/reset/current-user/verification payloads.
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

- [x] Auth pages no longer show placeholder text.
- [x] Login stores token/session.
- [x] Logout clears token/session.
- [x] `/auth/me` or equivalent current-user flow exists.
- [x] Protected routes require authentication.
- [x] Tests pass for changed code.
