# [Task] Contract Management and Eligibility

> **Implementation Rules**
> 1. **Before implementation**: Check [api-endpoints.md](../architecture/api-endpoints.md), [state-machine.md](../architecture/state-machine.md), and `report/content/2_System Analyze.tex` SUC7 and SUC16.
> 2. **Stubs**: If a dependency is not implemented, create a typed stub and add `// TODO: Implemented in task 04-01`.
> 3. **After implementation**: Update docs if contract fields, statuses, or eligibility rules change.

## GitHub Issue

- Link: TBD

---

## Overview

Implement staff/manager contract management after deposit confirmation. The feature checks lodging eligibility, calculates initial fees, creates a contract, and prepares the handover workflow.

### Related Routes

| Screen/Area | Angular Route | Backend Task |
|-------------|---------------|--------------|
| Contract management | `/admin/contracts` | SUC7 |
| Eligibility check | `/admin/contracts/:id/eligibility` | SUC16 |

---

## Reference Documents

| Document | Section |
|----------|---------|
| `report/content/2_System Analyze.tex` | SUC7, SUC16 |
| [UC3](../UC/UC3.md) | Check-in, contract, handover |
| [State Machine](../architecture/state-machine.md) | ContractStatus, RoomStatus |
| [API Endpoints](../architecture/api-endpoints.md) | Contracts |

---

## Flow Summary

```text
Contract flow:

1. Staff opens a paid deposit/customer record.
2. Manager verifies lodging eligibility and required documents.
3. Accountant calculates initial contract fees if needed.
4. Staff creates the rental contract.
5. Customer signs contract.
6. System marks contract ACTIVE and prepares handover.
```

---

## Scope

### Frontend (Angular)

- [ ] Use existing `ngx-translate` i18n pattern for all user-facing copy; add/update matching keys in `frontend/src/assets/i18n/en.json` and `frontend/src/assets/i18n/vi.json`.

- [ ] Add `/admin/contracts` route and contract list/detail UI.
- [ ] Add eligibility review form.
- [ ] Add contract create/edit form.
- [ ] Display deposit, customer, room/bed, and fee information.
- [ ] Add signed/active status display.

### Backend (Express/Supabase)

- [ ] Implement `POST /api/contracts`.
- [ ] Implement `GET /api/contracts`.
- [ ] Implement `GET /api/contracts/:id`.
- [ ] Implement `PATCH /api/contracts/:id/sign`.
- [ ] Persist eligibility check result.
- [ ] Block contract activation when eligibility fails.

### Tests

| Layer | Test File | Mock Target |
|-------|-----------|-------------|
| Frontend | `frontend/src/app/features/admin/components/contracts/contracts.component.spec.ts` | Contract service |
| Backend | `backend/src/__tests__/contracts.spec.ts` | Supabase client |

---

## AI Implementation Prompt

--------------------------------------------------

Implement `docs/tasks/04-01-contract-management-and-eligibility.md`.

## References
- Report: `report/content/2_System Analyze.tex` SUC7 and SUC16
- UC: `docs/UC/UC3.md`
- API: `docs/architecture/api-endpoints.md`
- State machine: `docs/architecture/state-machine.md`

## Implementation
- Add admin contract route/component.
- Add eligibility check UI and API/service.
- Add contract create/sign flow.
- If backend is missing, create typed stubs with `// TODO: Implemented in task 04-01`.

## Test Requirements
- Eligibility pass/fail tests.
- Contract creation and signing tests.
- Frontend form validation tests.

--------------------------------------------------

---

## Completion Conditions

- [ ] Staff can create contract after paid deposit.
- [ ] Eligibility result is required before activation.
- [ ] Contract status follows `state-machine.md`.
- [ ] Contract API or typed stubs exist.
- [ ] Tests pass for changed code.

