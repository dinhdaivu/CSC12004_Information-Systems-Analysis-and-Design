# [Task] Customer Registration

> **Implementation Rules**
> 1. **Before implementation**: Check [api-endpoints.md](../architecture/api-endpoints.md), [layers.md](../architecture/layers.md), and the current Angular auth routes.
> 2. **Stubs**: If a dependency is not implemented, create a typed stub and add `// TODO: Implemented in task 00-04`.
> 3. **After implementation**: Update [api-endpoints.md](../architecture/api-endpoints.md), [database.md](../architecture/database.md), and [frontend-status.md](../frontend-status.md) if registration behavior changes.

## GitHub Issue

- Link: TBD

---

## Overview

Implement customer account registration. This use case is tracked in the report as SUC18 because the frontend already has `/register` and customers need accounts before submitting rental requests, deposits, contracts, and checkout requests.

### System Use Case

| ID | Name | Actor | Notes |
|----|------|-------|-------|
| SUC18 | Customer Registration | Customer | Derived implementation use case; complements SUC1 Login |

---

## Reference Documents

| Document | Section |
|----------|---------|
| `report/content/2_System Analyze.tex` | SUC1 Login, as related auth use case |
| [API Endpoints](../architecture/api-endpoints.md) | Auth |
| [Software Layers](../architecture/layers.md) | Presentation/control/entity separation |

---

## Flow Summary

```text
Customer registration flow:

1. Customer opens /register.
2. Customer enters email, password, and password confirmation.
3. Frontend validates required fields and password confirmation.
4. Backend creates the Supabase auth user and returns the pending email.
5. Frontend stores the pending email and redirects to /confirm-email immediately after signup succeeds.
6. Backend creates or loads the application profile when the signup code is verified or on the first successful login.
7. Customer can continue to room search and rental request flow after verification.
```

---

## Scope

### Frontend (Angular)

- [x] Use existing `ngx-translate` i18n pattern for all user-facing copy; add/update matching keys in `frontend/src/assets/i18n/en.json` and `frontend/src/assets/i18n/vi.json`.

- [x] Replace `RegisterComponent` placeholder with real registration form.
- [x] Add validation for email, password, and confirmation.
- [x] Wire submit to `AuthService.register()`.
- [x] Show loading, success, and error states.
- [x] Redirect after registration to `/confirm-email`.

### Backend (Express/Supabase)

- [x] Implement `POST /api/auth/register`.
- [x] Create auth user through Supabase Auth or the chosen auth provider.
- [x] Return typed response with the pending email for the verification step.
- [x] Defer application profile creation until verification/login to keep registration responsive.
- [x] Reject duplicate email when required.

### Tests

| Layer | Test File | Mock Target |
|-------|-----------|-------------|
| Frontend | `frontend/src/app/features/auth/components/register/register.component.spec.ts` | AuthService |
| Backend | `backend/src/__tests__/auth.spec.ts` | Supabase Auth / profile repository |

| # | Test Case | Layer | Expected |
|---|-----------|-------|----------|
| 1 | Valid registration | Frontend/Backend | Pending email is returned and the confirm-email step can continue |
| 2 | Invalid email | Frontend | Validation error is shown |
| 3 | Password mismatch | Frontend | Validation error is shown |
| 4 | Duplicate email | Backend | Conflict/error response is returned |
| 5 | Signup verification | Backend | Profile/session is created after code verification |

---

## AI Implementation Prompt

--------------------------------------------------

Implement `docs/tasks/00-04-customer-registration.md`.

## References
- Related report use case: `report/content/2_System Analyze.tex` SUC1 Login
- API: `docs/architecture/api-endpoints.md`
- Current route: `/register`

## Implementation
- Replace `RegisterComponent` placeholder.
- Add typed register payload and response models.
- Implement or wire `POST /api/auth/register`.
- Return the pending email immediately after auth signup succeeds.
- Create or load the customer profile during signup verification/login.
- If backend is not ready, create a typed frontend stub with `// TODO: Implemented in task 00-04`.

## Test Requirements
- Frontend validation tests.
- Successful and failed registration tests.
- Backend duplicate-email test if backend is implemented.

--------------------------------------------------

---

## Completion Conditions

- [x] `/register` no longer shows placeholder text.
- [x] Customer can submit registration form.
- [x] Registration redirects to `/confirm-email` with the pending email.
- [x] Duplicate/invalid registration is handled.
- [x] Tests pass for changed code.

---

## Related Tasks

- Related: [00-01 Auth and Session Management](./00-01-auth-and-session-management.md)
- Next: [01-03 Customer Rental Request](./01-03-customer-rental-request.md)

---

## Notes

- This is tracked as a derived extension to the original report use-case set and is now documented as `SUC18`.
