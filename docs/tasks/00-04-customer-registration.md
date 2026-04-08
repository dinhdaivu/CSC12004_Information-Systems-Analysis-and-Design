# [Task] Customer Registration

> **Implementation Rules**
> 1. **Before implementation**: Check [api-endpoints.md](../architecture/api-endpoints.md), [layers.md](../architecture/layers.md), and the current Angular auth routes.
> 2. **Stubs**: If a dependency is not implemented, create a typed stub and add `// TODO: Implemented in task 00-04`.
> 3. **After implementation**: Update [api-endpoints.md](../architecture/api-endpoints.md), [database.md](../architecture/database.md), and [frontend-status.md](../frontend-status.md) if registration behavior changes.

## GitHub Issue

- Link: TBD

---

## Overview

Implement customer account registration. This use case is tracked in the report as SUC18 because the frontend already has `/auth/register` and customers need accounts before submitting rental requests, deposits, contracts, and checkout requests.

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

1. Customer opens /auth/register.
2. Customer enters name, email, phone, password, and required profile fields.
3. Frontend validates required fields and password confirmation.
4. Backend creates auth user and customer profile.
5. System returns session/token or asks customer to log in.
6. Customer can continue to room search and rental request flow.
```

---

## Scope

### Frontend (Angular)

- [ ] Use existing `ngx-translate` i18n pattern for all user-facing copy; add/update matching keys in `frontend/src/assets/i18n/en.json` and `frontend/src/assets/i18n/vi.json`.

- [ ] Replace `RegisterComponent` placeholder with real registration form.
- [ ] Add validation for name, email, phone, password, and confirmation.
- [ ] Wire submit to `AuthService.register()`.
- [ ] Show loading, success, and error states.
- [ ] Redirect after registration according to final auth behavior.

### Backend (Express/Supabase)

- [ ] Implement `POST /api/v1/auth/register`.
- [ ] Create auth user through Supabase Auth or the chosen auth provider.
- [ ] Create customer profile record.
- [ ] Reject duplicate email/phone when required.
- [ ] Return typed response with user/session or next-step message.

### Tests

| Layer | Test File | Mock Target |
|-------|-----------|-------------|
| Frontend | `frontend/src/app/features/auth/components/register/register.component.spec.ts` | AuthService |
| Backend | `backend/src/__tests__/auth-register.spec.ts` | Supabase Auth / profile repository |

| # | Test Case | Layer | Expected |
|---|-----------|-------|----------|
| 1 | Valid registration | Frontend/Backend | Customer account/profile is created |
| 2 | Invalid email | Frontend | Validation error is shown |
| 3 | Password mismatch | Frontend | Validation error is shown |
| 4 | Duplicate email | Backend | Conflict/error response is returned |
| 5 | Missing required profile field | Backend | Validation error is returned |

---

## AI Implementation Prompt

--------------------------------------------------

Implement `docs/tasks/00-04-customer-registration.md`.

## References
- Related report use case: `report/content/2_System Analyze.tex` SUC1 Login
- API: `docs/architecture/api-endpoints.md`
- Current route: `/auth/register`

## Implementation
- Replace `RegisterComponent` placeholder.
- Add typed register payload and response models.
- Implement or wire `POST /api/v1/auth/register`.
- Create customer profile after auth user creation.
- If backend is not ready, create a typed frontend stub with `// TODO: Implemented in task 00-04`.

## Test Requirements
- Frontend validation tests.
- Successful and failed registration tests.
- Backend duplicate-email test if backend is implemented.

--------------------------------------------------

---

## Completion Conditions

- [ ] `/auth/register` no longer shows placeholder text.
- [ ] Customer can submit registration form.
- [ ] Customer profile is created with auth account.
- [ ] Duplicate/invalid registration is handled.
- [ ] Tests pass for changed code.

---

## Related Tasks

- Related: [00-01 Auth and Session Management](./00-01-auth-and-session-management.md)
- Next: [01-03 Customer Rental Request](./01-03-customer-rental-request.md)

---

## Notes

- This is tracked as a derived extension to the original report use-case set and is now documented as `SUC18`.
