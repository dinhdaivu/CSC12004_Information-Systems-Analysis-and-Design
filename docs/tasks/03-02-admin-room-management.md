# [Task] Admin Room Management

> **Implementation Rules**
> 1. **Before implementation**: Check [frontend-status.md](../frontend-status.md), [api-endpoints.md](../architecture/api-endpoints.md), [database.md](../architecture/database.md), and [state-machine.md](../architecture/state-machine.md).
> 2. **Stubs**: If a dependency is not implemented, create a typed stub and add `// TODO: Implemented in task 03-02`.
> 3. **After implementation**: Update docs if room fields, endpoints, or room statuses change.

## GitHub Issue

- Link: TBD

---

## Overview

Implement the admin room management screen for visual overview of rooms and beds across branches. Admin/staff can search, filter, view status, and manage room/bed information.

### Figma Screen

| Screen | Figma Link | Angular Route |
|--------|------------|---------------|
| Room Management | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=512-1591) | `/admin/rooms` |

---

## Reference Documents

| Document | Section |
|----------|---------|
| [API Endpoints](../architecture/api-endpoints.md) | Rooms |
| [Database Design](../architecture/database.md) | Room/Bed tables when defined |
| [State Machine](../architecture/state-machine.md) | RoomStatus |
| [Software Layers](../architecture/layers.md) | RoomView, Room entity |

---

## Flow Summary

```text
Admin room management flow:

1. Admin opens /admin/rooms.
2. Frontend loads rooms and beds across branches.
3. Admin searches by room/branch/bed.
4. Admin filters by branch, room status, bed status, or room type.
5. Admin views visual room/bed grid.
6. Admin creates, edits, or deletes room data if permissions allow.
7. Backend updates room/bed records.
```

---

## Scope

### Frontend (Angular)

- [ ] Use existing `ngx-translate` i18n pattern for all user-facing copy; add/update matching keys in `frontend/src/assets/i18n/en.json` and `frontend/src/assets/i18n/vi.json`.

- [ ] Replace `RoomsManagementComponent` placeholder.
- [ ] Add room/bed status visualization.
- [ ] Add search input.
- [ ] Add filter controls.
- [ ] Add create/edit/delete actions if in scope.
- [ ] Add loading/empty/error states.
- [ ] Reuse common admin layout if introduced by schedule task.

### Backend (Express/Supabase)

- [ ] Implement `GET /api/rooms` with filters.
- [ ] Implement `POST /api/rooms`.
- [ ] Implement `PATCH /api/rooms/:id`.
- [ ] Implement `DELETE /api/rooms/:id`.
- [ ] Add bed-level endpoints if room/bed management requires separate updates.
- [ ] Enforce admin/staff permissions.

### Tests

| Layer | Test File | Mock Target |
|-------|-----------|-------------|
| Frontend | `frontend/src/app/features/admin/components/rooms-management/rooms-management.component.spec.ts` | Room admin service |
| Backend | `backend/src/__tests__/rooms.spec.ts` | Supabase client |

| # | Test Case | Layer | Expected |
|---|-----------|-------|----------|
| 1 | Room management loads | Frontend | Rooms/beds are rendered |
| 2 | Search filters results | Frontend | Matching rooms remain visible |
| 3 | Status filter | Frontend | Service receives filter params |
| 4 | Update room status | Backend | Room status is persisted |
| 5 | Unauthorized delete | Backend | Non-admin deletion is rejected |

---

## AI Implementation Prompt

--------------------------------------------------

Implement `docs/tasks/03-02-admin-room-management.md`.

## References
- API: `docs/architecture/api-endpoints.md`
- State machine: `docs/architecture/state-machine.md`
- Figma: Room Management

## Implementation
- Replace `RoomsManagementComponent` placeholder.
- Add typed room and bed management models.
- Implement search and filter UI.
- Use `GET /api/rooms` with filter params.
- If create/edit/delete are included, implement the documented room endpoints and role checks.
- If backend is missing, create a typed stub service with `// TODO: Implemented in task 03-02`.

## Test Requirements
- Frontend tests for loading, rendering, search, and filters.
- Backend tests for CRUD endpoints if implemented.

--------------------------------------------------

---

## Completion Conditions

- [ ] `/admin/rooms` no longer shows placeholder text.
- [ ] Room/bed overview is rendered.
- [ ] Search and filter controls work.
- [ ] Room API or typed stub exists.
- [ ] Admin/staff permissions are implemented or documented.
- [ ] Tests pass for changed code.

---

## Related Tasks

- Related: [01-01 Customer Homepage](./01-01-customer-homepage-branch-discovery.md)
- Related: [03-01 Viewing Schedule Management](./03-01-viewing-schedule-management.md)

---

## Notes

- Current implementation status: route exists, UI is placeholder, API is not wired.
- Room statuses must stay consistent with `RoomStatus` in the state-machine documentation.
