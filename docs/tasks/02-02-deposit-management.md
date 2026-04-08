# [Task] Deposit Management

> **Implementation Rules**
> 1. **Before implementation**: Check [api-endpoints.md](../architecture/api-endpoints.md), [state-machine.md](../architecture/state-machine.md), and `report/content/2_System Analyze.tex` SUC4.
> 2. **Stubs**: If a dependency is not implemented, create a typed stub and add `// TODO: Implemented in task 02-02`.
> 3. **After implementation**: Update docs if deposit amount rules, statuses, or endpoints change.

## GitHub Issue

- Link: TBD

---

## Overview

Implement deposit request creation and management after a customer agrees to rent. Staff creates the deposit request, accountant verifies the amount, and the system tracks payment within the 24-hour hold window.

### Related Routes

| Screen/Area | Angular Route | Backend Task |
|-------------|---------------|--------------|
| Checkout payment | `/bookings/:id` | SUC4 / SUC5 |
| Deposit tracking | `/admin/transactions` | SUC4 / SUC6 |

---

## Reference Documents

| Document | Section |
|----------|---------|
| `report/content/2_System Analyze.tex` | SUC4: Quan ly dat coc |
| [UC2](../UC/UC2.md) | Deposit and rental confirmation |
| [State Machine](../architecture/state-machine.md) | DepositStatus, RoomStatus |
| [API Endpoints](../architecture/api-endpoints.md) | Deposits |

---

## Flow Summary

```text
Deposit management flow:

1. Staff accepts rental request after viewing.
2. System creates deposit request and puts room/bed on hold.
3. Accountant verifies deposit amount.
4. Customer pays within 24 hours.
5. Payment success marks deposit PAID and room DEPOSITED.
6. Expired/cancelled deposit releases room/bed back to AVAILABLE.
```

---

## Scope

### Frontend (Angular)

- [ ] Use existing `ngx-translate` i18n pattern for all user-facing copy; add/update matching keys in `frontend/src/assets/i18n/en.json` and `frontend/src/assets/i18n/vi.json`.

- [ ] Add deposit request state into booking/registration UI.
- [ ] Add deposit amount display and payment deadline.
- [ ] Add staff/accountant actions for confirm/cancel.
- [ ] Reflect status changes in deposit tracking dashboard.

### Backend (Express/Supabase)

- [ ] Implement `POST /api/deposits`.
- [ ] Implement `GET /api/deposits`.
- [ ] Implement `GET /api/deposits/:id`.
- [ ] Implement `PATCH /api/deposits/:id/confirm`.
- [ ] Implement `PATCH /api/deposits/:id/cancel`.
- [ ] Implement expiration job for pending deposits older than 24 hours.

### Tests

| Layer | Test File | Mock Target |
|-------|-----------|-------------|
| Backend | `backend/src/__tests__/deposits.spec.ts` | Supabase client |
| Backend | `backend/src/__tests__/deposit-expiration.spec.ts` | Scheduler/service layer |
| Frontend | `frontend/src/app/features/admin/components/transactions/transactions.component.spec.ts` | Deposit service |

---

## AI Implementation Prompt

--------------------------------------------------

Implement `docs/tasks/02-02-deposit-management.md`.

## References
- Report: `report/content/2_System Analyze.tex` SUC4
- State machine: `docs/architecture/state-machine.md`
- API: `docs/architecture/api-endpoints.md`

## Important Rules
- Deposit amount = two months rent times number of rented beds.
- Pending deposits expire after 24 hours.
- Creating a deposit should move room/bed to a hold state.
- Confirming payment should mark deposit `PAID` and room `DEPOSITED`.
- Cancelling/expiring should release the room/bed unless another valid hold exists.

## Test Requirements
- Unit tests for amount calculation.
- Endpoint tests for create/confirm/cancel.
- Scheduler test for 24-hour expiration.

--------------------------------------------------

---

## Completion Conditions

- [ ] Deposit request creation works.
- [ ] Deposit amount follows the report rule.
- [ ] Deposit status transitions follow `state-machine.md`.
- [ ] 24-hour expiration exists.
- [ ] Confirm/cancel API exists.
- [ ] Tests pass for changed code.

