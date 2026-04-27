# [Task] Deposit Tracking Dashboard

> **Implementation Rules**
>
> 1. **Before implementation**: Check [frontend-status.md](../frontend-status.md), [api-endpoints.md](../architecture/api-endpoints.md), [database.md](../architecture/database.md), and [state-machine.md](../architecture/state-machine.md).
> 2. **Stubs**: If a dependency is not implemented, create a typed stub and add `// TODO: Implemented in task 03-03`.
> 3. **After implementation**: Update docs if deposit/payment endpoint behavior or status transitions change.

## GitHub Issue

- Link: TBD

---

## Overview

Implement an admin/staff dashboard for tracking deposit requests and payment status. The screen supports monitoring pending deposits, confirmed deposits, cancelled/expired requests, and payment reconciliation.

### Figma Screen

| Screen                     | Figma Link                                                                                  | Angular Route     |
| -------------------------- | ------------------------------------------------------------------------------------------- | ----------------- |
| Deposit Tracking Dashboard | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=512-1722) | `/admin/payments` |

---

## Reference Documents

| Document                                          | Section                                    |
| ------------------------------------------------- | ------------------------------------------ |
| [UC2](../UC/UC2.md)                               | Deposit and rental confirmation            |
| [API Endpoints](../architecture/api-endpoints.md) | Deposits, Payments                         |
| [State Machine](../architecture/state-machine.md) | DepositStatus, RoomStatus                  |
| [Software Layers](../architecture/layers.md)      | PaymentController, DepositRequest, Payment |

---

## Flow Summary

```text
Deposit tracking flow:

1. Staff/accountant opens /admin/payments.
2. Frontend loads deposit requests and payment records.
3. Staff filters by status, branch, customer, date, or room.
4. Staff reviews pending deposit details.
5. Staff confirms received deposit or cancels request.
6. Backend updates DepositRequest and related Room status.
7. Dashboard refreshes with new totals/status.
```

---

## Scope

### Frontend (Angular)

- [ ] Use existing `ngx-translate` i18n pattern for all user-facing copy; add/update matching keys in `frontend/src/assets/i18n/en.json` and `frontend/src/assets/i18n/vi.json`.

- [ ] Replace `PaymentsComponent` placeholder.
- [ ] Render deposit tracking dashboard title and summary.
- [ ] Add filters for status/date/branch/customer.
- [ ] Add deposit/payment list or cards.
- [ ] Add confirm/cancel actions.
- [ ] Add loading/empty/error states.

### Backend (Express/Supabase)

- [ ] Implement `GET /api/deposits` for staff/admin.
- [ ] Implement `GET /api/deposits/:id`.
- [ ] Implement `PATCH /api/deposits/:id/confirm`.
- [ ] Implement `PATCH /api/deposits/:id/cancel`.
- [ ] Implement `GET /api/payments`.
- [ ] Ensure confirm flow updates DepositStatus and RoomStatus consistently.

### Tests

| Layer    | Test File                                                                        | Mock Target               |
| -------- | -------------------------------------------------------------------------------- | ------------------------- |
| Frontend | `frontend/src/app/features/admin/components/payments/payments.component.spec.ts` | Deposits/payments service |
| Backend  | `backend/src/__tests__/deposits.spec.ts`                                         | Supabase client           |
| Backend  | `backend/src/__tests__/payments.spec.ts`                                         | Supabase client           |

| #   | Test Case                | Layer    | Expected                                     |
| --- | ------------------------ | -------- | -------------------------------------------- |
| 1   | Dashboard loads deposits | Frontend | Deposit rows/cards are rendered              |
| 2   | Status filter            | Frontend | Service called with selected status          |
| 3   | Confirm deposit          | Backend  | Deposit becomes PAID, room becomes DEPOSITED |
| 4   | Cancel deposit           | Backend  | Deposit becomes CANCELLED                    |
| 5   | Unauthorized confirm     | Backend  | Customer role is rejected                    |

---

## AI Implementation Prompt

---

Implement `docs/tasks/03-03-deposit-tracking-dashboard.md`.

## References

- UC: `docs/UC/UC2.md`
- API: `docs/architecture/api-endpoints.md`
- State machine: `docs/architecture/state-machine.md`
- Figma: Deposit Tracking Dashboard

## Implementation

- Replace `PaymentsComponent` placeholder.
- Add typed deposit and payment service.
- Implement filters and list/dashboard UI.
- Wire `GET /api/deposits` and `GET /api/payments`.
- Implement confirm/cancel actions if backend scope is included.
- If backend is missing, create typed stubs with `// TODO: Implemented in task 03-03`.

## Important Status Rules

- Confirm deposit: `DepositStatus.PAID`; associated room should become `DEPOSITED`.
- Cancel deposit: `DepositStatus.CANCELLED`; room should return to `AVAILABLE` unless another hold exists.

## Test Requirements

- Frontend tests for loading, filtering, and action click.
- Backend tests for confirm/cancel state transitions if routes are implemented.

---

---

## Completion Conditions

- [ ] `/admin/payments` no longer shows placeholder text.
- [ ] Deposit dashboard summary and list render.
- [ ] Filters work.
- [ ] Confirm/cancel actions are implemented or clearly stubbed.
- [ ] Deposit and payment API or typed stub exists.
- [ ] Tests pass for changed code.

---

## Related Tasks

- Related: [02-01 Checkout Payment Flow](./02-01-checkout-payment-flow.md)
- Related: [03-02 Admin Room Management](./03-02-admin-room-management.md)

---

## Notes

- Current implementation status: route exists, UI is placeholder, API is not wired.
- Keep this dashboard aligned with the checkout payment flow so customer payment and staff confirmation do not create conflicting statuses.
