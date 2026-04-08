# [Task] Checkout Settlement and Refund

> **Implementation Rules**
> 1. **Before implementation**: Check [api-endpoints.md](../architecture/api-endpoints.md), [state-machine.md](../architecture/state-machine.md), and `report/content/2_System Analyze.tex` SUC8, SUC9, and SUC11.
> 2. **Stubs**: If a dependency is not implemented, create a typed stub and add `// TODO: Implemented in task 05-02`.
> 3. **After implementation**: Update docs if refund rules, settlement fields, or statuses change.

## GitHub Issue

- Link: TBD

---

## Overview

Implement manager/accountant checkout processing: inspect returned room, reconcile costs, calculate refund or additional payment, settle money, terminate the contract, and release the room/bed.

### Related Routes

| Screen/Area | Angular Route | Backend Task |
|-------------|---------------|--------------|
| Checkout management | `/admin/checkouts` | SUC11 |
| Settlement calculation | `/admin/checkouts/:id/settlement` | SUC8 / SUC9 |

---

## Reference Documents

| Document | Section |
|----------|---------|
| `report/content/2_System Analyze.tex` | SUC8, SUC9, SUC11 |
| [UC4](../UC/UC4.md) | Checkout and refund |
| [State Machine](../architecture/state-machine.md) | CheckoutStatus, ContractStatus, RoomStatus |
| [API Endpoints](../architecture/api-endpoints.md) | Transactions, Contracts, Handovers |

---

## Flow Summary

```text
Checkout settlement flow:

1. Manager opens checkout request.
2. Manager records room/bed condition and returned assets.
3. Accountant calculates refund rules and deductions.
4. System displays net amount: refund to customer or extra payment due.
5. Payment/refund is recorded.
6. Manager completes contract termination and room handover.
7. Contract becomes TERMINATED or COMPLETED.
8. Room/bed becomes AVAILABLE.
```

---

## Scope

### Frontend (Angular)

- [ ] Use existing `ngx-translate` i18n pattern for all user-facing copy; add/update matching keys in `frontend/src/assets/i18n/en.json` and `frontend/src/assets/i18n/vi.json`.

- [ ] Add `/admin/checkouts` route/component.
- [ ] Render checkout request list and detail.
- [ ] Add room condition and asset return form.
- [ ] Add settlement calculator UI.
- [ ] Add confirm settlement and complete checkout actions.
- [ ] Show refund percentage and deductions.

### Backend (Express/Supabase)

- [ ] Implement checkout request list/detail endpoints.
- [ ] Implement settlement calculation service.
- [ ] Implement refund rules from `state-machine.md`.
- [ ] Implement payment/refund transaction recording.
- [ ] Implement checkout completion endpoint.
- [ ] Update contract and room/bed statuses.

### Refund Rules

| Condition | Refund |
|-----------|--------|
| Deposit paid, no contract or cancelled before signing | 80% |
| Active contract, stayed under 6 months | 50% |
| Active contract, stayed at least 6 months | 70% |
| Contract completed naturally | 100% |
| Deductions | Unpaid rent, utilities, damage, penalties |

### Tests

| Layer | Test File | Mock Target |
|-------|-----------|-------------|
| Frontend | `frontend/src/app/features/admin/components/checkouts/checkouts.component.spec.ts` | Checkout service |
| Backend | `backend/src/__tests__/checkout-settlement.spec.ts` | Supabase client |
| Backend | `backend/src/__tests__/refund-calculator.spec.ts` | Pure calculator/service |

---

## AI Implementation Prompt

--------------------------------------------------

Implement `docs/tasks/05-02-checkout-settlement-and-refund.md`.

## References
- Report: `report/content/2_System Analyze.tex` SUC8, SUC9, SUC11
- UC: `docs/UC/UC4.md`
- State machine: `docs/architecture/state-machine.md`

## Implementation
- Add manager checkout processing route/component.
- Add settlement calculator service with refund rules.
- Implement checkout completion flow.
- Record payment/refund transactions.
- Update contract and room statuses according to `state-machine.md`.
- If backend is missing, create typed stubs with `// TODO: Implemented in task 05-02`.

## Test Requirements
- Unit tests for refund percentages and deductions.
- Backend tests for checkout completion state transitions.
- Frontend tests for settlement display and submit flow.

--------------------------------------------------

---

## Completion Conditions

- [ ] Manager can process checkout requests.
- [ ] Refund calculator implements 80/50/70/100 rules.
- [ ] Deductions can be captured.
- [ ] Payment/refund transaction is recorded.
- [ ] Contract and room status transitions are correct.
- [ ] Tests pass for changed code.

