# [Task] Staff Rental Registration Management

> **Implementation Rules**
> 1. **Before implementation**: Check [api-endpoints.md](../architecture/api-endpoints.md), [layers.md](../architecture/layers.md), and `report/content/2_System Analyze.tex` SUC3, SUC14, and SUC15.
> 2. **Stubs**: If a dependency is not implemented, create a typed stub and add `// TODO: Implemented in task 01-04`.
> 3. **After implementation**: Update docs if request statuses or schedule endpoints change.

## GitHub Issue

- Link: TBD

---

## Overview

Implement the staff workflow for processing rental registrations: review customer requests, match rooms/beds, schedule viewing appointments, and record viewing results.

### Related Routes

| Screen/Area | Angular Route | Backend Task |
|-------------|---------------|--------------|
| Staff rental requests | `/admin` or `/admin/rental-requests` | SUC3 |
| Viewing schedule | `/admin/schedules` | SUC14 / SUC15 |

---

## Reference Documents

| Document | Section |
|----------|---------|
| `report/content/2_System Analyze.tex` | SUC3, SUC14, SUC15 |
| [UC1](../UC/UC1.md) | Rental inquiry and viewing |
| [API Endpoints](../architecture/api-endpoints.md) | Add rental request/schedule endpoints if missing |

---

## Flow Summary

```text
Staff rental registration flow:

1. Staff opens rental request list.
2. Staff selects a customer request.
3. Staff checks matching rooms/beds.
4. Staff schedules a viewing appointment.
5. At appointment time, staff records the viewing result.
6. If customer agrees to rent, the request becomes ready for deposit processing.
```

---

## Scope

### Frontend (Angular)

- [ ] Add `/admin/rental-requests` route or extend admin dashboard.
- [ ] Add request list and request detail views.
- [ ] Add room/bed matching action.
- [ ] Link to schedule creation in task 03-01.
- [ ] Add viewing result states: agreed, needs follow-up, not interested, no-show.

### Backend (Express/Supabase)

- [ ] Implement rental request list/detail endpoints.
- [ ] Implement request status update endpoint.
- [ ] Implement viewing result persistence.
- [ ] Link accepted requests to deposit creation flow.

### Tests

| Layer | Test File | Mock Target |
|-------|-----------|-------------|
| Frontend | `frontend/src/app/features/admin/components/rental-requests/rental-requests.component.spec.ts` | Rental request service |
| Backend | `backend/src/__tests__/rental-requests.spec.ts` | Supabase client |

---

## AI Implementation Prompt

--------------------------------------------------

Implement `docs/tasks/01-04-staff-rental-registration-management.md`.

## References
- Report: `report/content/2_System Analyze.tex` SUC3, SUC14, SUC15
- API: `docs/architecture/api-endpoints.md`
- Related task: `docs/tasks/03-01-viewing-schedule-management.md`

## Implementation
- Add staff rental request management route/component.
- Add typed request statuses and viewing result statuses.
- Implement list/detail/update service calls.
- If backend is missing, create typed stubs with `// TODO: Implemented in task 01-04`.

## Test Requirements
- Frontend tests for list/detail/status update.
- Backend tests for request status transitions if implemented.

--------------------------------------------------

---

## Completion Conditions

- [ ] Staff can view rental requests.
- [ ] Staff can record matching and viewing results.
- [ ] Accepted request can proceed to deposit flow.
- [ ] API or typed stub exists.
- [ ] Tests pass for changed code.

