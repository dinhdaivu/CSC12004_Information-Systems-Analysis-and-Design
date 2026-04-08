# [Task] Customer Checkout Request

> **Implementation Rules**
> 1. **Before implementation**: Check [api-endpoints.md](../architecture/api-endpoints.md), [state-machine.md](../architecture/state-machine.md), and `report/content/2_System Analyze.tex` SUC10.
> 2. **Stubs**: If a dependency is not implemented, create a typed stub and add `// TODO: Implemented in task 05-01`.
> 3. **After implementation**: Update docs if checkout request fields or statuses change.

## GitHub Issue

- Link: TBD

---

## Overview

Implement customer checkout request submission. A customer with an active contract can request to move out, provide requested checkout date/details, and create a checkout request for manager processing.

### Related Routes

| Screen/Area | Angular Route | Backend Task |
|-------------|---------------|--------------|
| Customer checkout request | `/bookings/:id/checkout` or `/checkout/new` | SUC10 |

---

## Reference Documents

| Document | Section |
|----------|---------|
| `report/content/2_System Analyze.tex` | SUC10 |
| [UC4](../UC/UC4.md) | Checkout request |
| [State Machine](../architecture/state-machine.md) | CheckoutStatus, RoomStatus |
| [API Endpoints](../architecture/api-endpoints.md) | Check-out Requests |

---

## Flow Summary

```text
Customer checkout request flow:

1. Customer opens checkout request page from active booking/contract.
2. Frontend loads current contract and room information.
3. Customer enters requested checkout date and notes.
4. Backend creates checkout request.
5. Contract/room moves into checkout pending workflow.
```

---

## Scope

### Frontend (Angular)

- [ ] Use existing `ngx-translate` i18n pattern for all user-facing copy; add/update matching keys in `frontend/src/assets/i18n/en.json` and `frontend/src/assets/i18n/vi.json`.

- [ ] Add checkout request route/component.
- [ ] Display active contract and room/bed information.
- [ ] Add checkout date and notes form.
- [ ] Validate active contract exists.
- [ ] Show success/error state after submit.

### Backend (Express/Supabase)

- [ ] Add checkout request model/table if needed.
- [ ] Implement `POST /api/checkout-requests`.
- [ ] Implement `GET /api/checkout-requests/:id`.
- [ ] Update room status to `CHECKOUT_PENDING` after request creation.
- [ ] Reject request when no active contract exists.

### Tests

| Layer | Test File | Mock Target |
|-------|-----------|-------------|
| Frontend | `frontend/src/app/features/checkout/components/checkout-request/checkout-request.component.spec.ts` | Checkout service |
| Backend | `backend/src/__tests__/checkout-requests.spec.ts` | Supabase client |

---

## AI Implementation Prompt

--------------------------------------------------

Implement `docs/tasks/05-01-customer-checkout-request.md`.

## References
- Report: `report/content/2_System Analyze.tex` SUC10
- UC: `docs/UC/UC4.md`
- State machine: `docs/architecture/state-machine.md`

## Implementation
- Add customer checkout request route/component.
- Add typed checkout request model/service.
- Implement or stub checkout request API.
- Validate that only active contracts can create checkout requests.
- Update room status to `CHECKOUT_PENDING`.

## Test Requirements
- Frontend validation and submit tests.
- Backend tests for active-contract requirement and status transition.

--------------------------------------------------

---

## Completion Conditions

- [ ] Customer can submit checkout request.
- [ ] Request is blocked when no active contract exists.
- [ ] Checkout request status starts as `REQUESTED`.
- [ ] Room status becomes `CHECKOUT_PENDING`.
- [ ] Tests pass for changed code.
