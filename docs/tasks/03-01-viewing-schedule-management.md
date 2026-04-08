# [Task] Viewing Schedule Management

> **Implementation Rules**
> 1. **Before implementation**: Check [frontend-status.md](../frontend-status.md), [api-endpoints.md](../architecture/api-endpoints.md), and [layers.md](../architecture/layers.md).
> 2. **Stubs**: If a dependency is not implemented, create a typed stub and add `// TODO: Implemented in task 03-01`.
> 3. **After implementation**: Update related documentation if routes, entities, or statuses change.

## GitHub Issue

- Link: TBD

---

## Overview

Implement staff/admin viewing schedule management. The feature supports calendar/list views for upcoming property tours and an approval workflow for pending viewing appointments.

### Figma Screens

| Screen | Figma Link | Angular Route |
|--------|------------|---------------|
| Viewing Schedule - Approve | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=504-994) | `/admin` or `/admin/schedules` |
| Viewing Schedule - List View | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=506-936) | `/admin` or `/admin/schedules` |

---

## Reference Documents

| Document | Section |
|----------|---------|
| [UC1](../UC/UC1.md) | Record registration and schedule room viewing |
| [API Endpoints](../architecture/api-endpoints.md) | Viewing Appointments |
| [Software Layers](../architecture/layers.md) | SchedulerController |

---

## Flow Summary

```text
Viewing schedule flow:

1. Staff opens schedule management.
2. Frontend loads viewing appointments for the selected month.
3. Staff toggles calendar/list view.
4. Staff filters by branch/status.
5. Staff selects a pending appointment.
6. Staff approves, rejects, or cancels the appointment.
7. Appointment status updates and list refreshes.
```

---

## Scope

### Frontend (Angular)

- [ ] Use existing `ngx-translate` i18n pattern for all user-facing copy; add/update matching keys in `frontend/src/assets/i18n/en.json` and `frontend/src/assets/i18n/vi.json`.

- [ ] Add a schedule feature route, preferably `/admin/schedules`.
- [ ] Add `ViewingScheduleComponent`.
- [ ] Render list view and calendar view controls.
- [ ] Render appointment status legend.
- [ ] Add approve/cancel/reject actions.
- [ ] Add branch/status/month filter state.

### Backend (Express/Supabase)

- [ ] Add schedule/appointment model if not present.
- [ ] Implement `GET /api/viewing-appointments/:id` for appointment detail where needed.
- [ ] Implement status updates with `PATCH /api/viewing-appointments/:id/outcome` and `PATCH /api/viewing-appointments/:id/cancel`.
- [ ] Add role protection for staff/admin.

### Tests

| Layer | Test File | Mock Target |
|-------|-----------|-------------|
| Frontend | `frontend/src/app/features/admin/components/viewing-schedule/viewing-schedule.component.spec.ts` | Schedule service |
| Backend | `backend/src/__tests__/viewing-appointments.spec.ts` | Supabase client |

| # | Test Case | Layer | Expected |
|---|-----------|-------|----------|
| 1 | Schedule list loads | Frontend | Appointments are rendered |
| 2 | Month filter | Frontend | Service called with selected month |
| 3 | Toggle list/calendar | Frontend | View mode changes |
| 4 | Approve appointment | Frontend/Backend | Status changes to scheduled |
| 5 | Unauthorized approval | Backend | Non-staff role is rejected |

---

## AI Implementation Prompt

--------------------------------------------------

Implement `docs/tasks/03-01-viewing-schedule-management.md`.

## References
- UC: `docs/UC/UC1.md`
- API: `docs/architecture/api-endpoints.md`
- Figma: Viewing Schedule - Approve, Viewing Schedule - List View

## Implementation
- Add an Angular admin schedule route and component.
- Add typed appointment status model: `pending`, `scheduled`, `cancelled`.
- Implement list/calendar toggle and approval actions.
- If backend is not ready, create a typed stub service with `// TODO: Implemented in task 03-01`.
- If backend is implemented, add Express routes, controller/service, and tests.

## Test Requirements
- Frontend unit tests for list rendering, filters, toggles, and approval click.
- Backend tests for appointment list and approval status update.

--------------------------------------------------

---

## Completion Conditions

- [ ] Admin schedule route exists.
- [ ] Viewing schedule UI is no longer missing.
- [ ] List view and approval state are implemented.
- [ ] Viewing appointment API or typed stub exists.
- [ ] Role restriction is documented or implemented.
- [ ] Tests pass for changed code.

---

## Related Tasks

- Related: [01-01 Customer Homepage](./01-01-customer-homepage-branch-discovery.md)
- Related: [03-02 Admin Room Management](./03-02-admin-room-management.md)

---

## Notes

- Current frontend has no dedicated schedule route/component.
- Consider adding `/admin/schedules` instead of overloading `/admin`.
