# [Task] Room and Bed Search List

> **Implementation Rules**
> 1. **Before implementation**: Check [api-endpoints.md](../architecture/api-endpoints.md), [state-machine.md](../architecture/state-machine.md), and `report/content/2_System Analyze.tex` SUC13.
> 2. **Stubs**: If a dependency is not implemented, create a typed stub and add `// TODO: Implemented in task 01-05`.
> 3. **After implementation**: Update [frontend-status.md](../frontend-status.md) and API docs if route or filter behavior changes.

## GitHub Issue

- Link: TBD

---

## Overview

Implement the `/rooms` list/search screen for SUC13. This route is distinct from the homepage branch discovery screen and should let customers or staff browse available rooms/beds with filters before opening a detail page or starting a rental request.

### Related Route

| Screen/Area | Angular Route | Requirement |
|-------------|---------------|-------------|
| Room/bed search list | `/rooms` | SUC13 |

---

## Reference Documents

| Document | Section |
|----------|---------|
| `report/content/2_System Analyze.tex` | SUC13: Room/bed lookup |
| [API Endpoints](../architecture/api-endpoints.md) | Rooms |
| [State Machine](../architecture/state-machine.md) | RoomStatus |

---

## Scope

### Frontend (Angular)

- [ ] Replace `RoomsListComponent` placeholder.
- [ ] Render room/bed cards or table.
- [ ] Add filters for branch, availability, room type, capacity, and price.
- [ ] Add search by room name/type/branch.
- [ ] Add navigation to `/rooms/:id`.
- [ ] Add booking/rental request action.

### Backend (Express/Supabase)

- [ ] Implement `GET /api/v1/rooms` with filters.
- [ ] Return availability and bed/room summary.
- [ ] Ensure public-safe room fields for customer access.

### Tests

| Layer | Test File | Mock Target |
|-------|-----------|-------------|
| Frontend | `frontend/src/app/features/rooms/components/rooms-list/rooms-list.component.spec.ts` | Rooms service |
| Backend | `backend/src/__tests__/rooms.spec.ts` | Supabase client |

---

## Completion Conditions

- [ ] `/rooms` no longer shows placeholder text.
- [ ] Search and filters work.
- [ ] Room selection navigates to detail.
- [ ] API or typed stub exists.
- [ ] Tests pass for changed code.

