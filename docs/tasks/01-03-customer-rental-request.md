# [Task] Customer Rental Request

> **Implementation Rules**
> 1. **Before implementation**: Check [api-endpoints.md](../architecture/api-endpoints.md), [state-machine.md](../architecture/state-machine.md), and `report/content/2_System Analyze.tex` SUC2.
> 2. **Stubs**: If a dependency is not implemented, create a typed stub and add `// TODO: Implemented in task 01-03`.
> 3. **After implementation**: Update API docs and frontend status if rental request behavior changes.

## GitHub Issue

- Link: TBD

---

## Overview

Implement the customer-facing rental request flow. A customer searches rooms/beds, selects a room or bed, enters rental requirements, and submits a request for staff follow-up.

### Related Screens and Routes

| Screen/Area | Angular Route | Backend Task |
|-------------|---------------|--------------|
| Branch discovery | `/dashboard` | SUC13 |
| Room detail | `/rooms/:id` | SUC13 |
| New rental request / booking | `/bookings/new` | SUC2 |

---

## Reference Documents

| Document | Section |
|----------|---------|
| `report/content/2_System Analyze.tex` | SUC2: Dang ky thue phong |
| [UC1](../UC/UC1.md) | Inquiry and room viewing |
| [API Endpoints](../architecture/api-endpoints.md) | Rooms, Deposits, possible booking/request endpoint |

---

## Flow Summary

```text
Customer rental request flow:

1. Customer browses rooms/beds.
2. Customer selects a room/bed.
3. Customer enters personal details and rental requirements.
4. Frontend validates required information.
5. Backend creates rental request.
6. Staff can later process it in rental registration management.
```

---

## Scope

### Frontend (Angular)

- [ ] Use existing `ngx-translate` i18n pattern for all user-facing copy; add/update matching keys in `frontend/src/assets/i18n/en.json` and `frontend/src/assets/i18n/vi.json`.

- [ ] Replace `NewBookingComponent` placeholder with rental request form.
- [ ] Pre-fill selected room/branch when arriving from detail page.
- [ ] Capture expected move-in date, rental duration, number of tenants, gender/room preferences, budget, and notes.
- [ ] Add form validation and submit states.
- [ ] Add success/error feedback.

### Backend (Express/Supabase)

- [ ] Add rental request model/table or map to deposit/booking model.
- [ ] Implement `POST /api/v1/bookings` or `POST /api/v1/rental-requests`.
- [ ] Implement `GET /api/v1/bookings` or request list endpoint for staff follow-up.
- [ ] Validate room/bed availability before accepting a request.

### Tests

| Layer | Test File | Mock Target |
|-------|-----------|-------------|
| Frontend | `frontend/src/app/features/bookings/components/new-booking/new-booking.component.spec.ts` | Rental request service |
| Backend | `backend/src/__tests__/rental-requests.spec.ts` | Supabase client |

---

## AI Implementation Prompt

--------------------------------------------------

Implement `docs/tasks/01-03-customer-rental-request.md`.

## References
- Report: `report/content/2_System Analyze.tex` SUC2
- API: `docs/architecture/api-endpoints.md`

## Implementation
- Replace `NewBookingComponent` placeholder with a typed rental request form.
- Add Angular service methods for creating rental requests.
- Add backend route or typed stub for `POST /api/v1/rental-requests`.
- Validate room/bed availability and required customer fields.

## Test Requirements
- Frontend validation and submit tests.
- Backend request creation and availability validation tests if route is implemented.

--------------------------------------------------

---

## Completion Conditions

- [ ] `/bookings/new` no longer shows placeholder text.
- [ ] Customer can submit a rental request.
- [ ] Request data includes selected branch/room/bed and rental preferences.
- [ ] Staff-facing request list can consume the created data.
- [ ] Tests pass for changed code.

