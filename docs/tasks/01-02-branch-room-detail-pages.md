# [Task] Branch Room Detail Pages

> **Implementation Rules**
> 1. **Before implementation**: Check [frontend-status.md](../frontend-status.md), [api-endpoints.md](../architecture/api-endpoints.md), and [layers.md](../architecture/layers.md).
> 2. **Stubs**: If a dependency is not implemented, create a typed stub and add `// TODO: Implemented in task 01-02`.
> 3. **After implementation**: Compare the implementation with these docs and update them if behavior changes:
>    - [frontend-status.md](../frontend-status.md)
>    - [api-endpoints.md](../architecture/api-endpoints.md)
>    - [database.md](../architecture/database.md)
>    - [state-machine.md](../architecture/state-machine.md)

## GitHub Issue

- Link: TBD

---

## Overview

Implement branch/room detail pages showing the branch title, address, description, shared community facilities, room facilities, policy information, and contact action.

### Figma Screens

| Screen | Figma Link | Angular Route |
|--------|------------|---------------|
| View Detail To Hien Thanh | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=18-113) | `/rooms/:id` |
| View Detail Tran Nao | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=275-480) | `/rooms/:id` |
| View Detail Nguyen Cuu Van | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=275-572) | `/rooms/:id` |

---

## Reference Documents

| Document | Section |
|----------|---------|
| [UC1](../UC/UC1.md) | Room viewing and consultation |
| [API Endpoints](../architecture/api-endpoints.md) | Rooms, Branches |
| [Software Layers](../architecture/layers.md) | RoomView |

---

## Flow Summary

```text
Branch detail flow:

1. User navigates from homepage to /rooms/:id.
2. Frontend loads branch/room detail data.
3. Page renders branch header, address, description, facility sections, and policies.
4. User clicks Contact Us Now.
5. System routes to the room and bed search flow (/rooms).
```

---

## Scope

### Frontend (Angular)

- [x] Use existing `ngx-translate` i18n pattern for all user-facing copy; add/update matching keys in `frontend/src/assets/i18n/en.json` and `frontend/src/assets/i18n/vi.json`.

- [x] Replace `RoomDetailComponent` placeholder with detail UI.
- [x] Read route param `id`.
- [x] Load detail data via a room/branch service.
- [x] Render shared community facilities and room facilities sections.
- [x] Render financial/legal policy content from data.
- [x] Add "Contact Us Now" action.
- [x] Add loading, empty, and error states.

### Backend (Express/Supabase)

- [x] Implement or verify `GET /api/rooms/:id`.
- [x] Implement or verify `GET /api/branches/:id`.
- [x] Include branch facilities, room facilities, policies, images, and available beds/rooms.

### Tests

| Layer | Test File | Mock Target |
|-------|-----------|-------------|
| Frontend | `frontend/src/app/features/rooms/components/room-detail/room-detail.component.spec.ts` | Room/branch service |
| Backend | `backend/src/__tests__/rooms.spec.ts` | Supabase client |

| # | Test Case | Layer | Expected |
|---|-----------|-------|----------|
| 1 | Detail loads by id | Frontend | Branch title/address rendered |
| 2 | Facility sections render | Frontend | Shared and room facilities shown |
| 3 | Contact action | Frontend | Routes or opens contact flow |
| 4 | Missing id/data | Frontend | Empty/error state shown |
| 5 | Room detail API | Backend | `GET /rooms/:id` returns detail payload |

---

## AI Implementation Prompt

--------------------------------------------------

Implement `docs/tasks/01-02-branch-room-detail-pages.md`.

## References
- Figma: View Detail To Hien Thanh, View Detail Tran Nao, View Detail Nguyen Cuu Van
- UC: `docs/UC/UC1.md`
- API: `docs/architecture/api-endpoints.md`

## Implementation
- Replace `RoomDetailComponent` placeholder.
- Add typed models for branch detail, facility sections, and room availability.
- Use route param `id` and load via `GET /api/rooms/:id` or `GET /api/branches/:id`.
- If API is missing, add a typed stub with `// TODO: Implemented in task 01-02`.
- Implement contact CTA behavior.

## Test Requirements
- Add route-param and service mock tests.
- Test rendering of branch title, address, facilities, policy, and contact action.

--------------------------------------------------

---

## Completion Conditions

- [x] `/rooms/:id` no longer shows placeholder text.
- [x] All three branch detail variants can be represented by data.
- [x] Facilities and policy sections render.
- [x] Contact action works.
- [x] Frontend tests pass.
- [x] Backend endpoint or stub is documented.

---

## Related Tasks

- Previous: [01-01 Customer Homepage](./01-01-customer-homepage-branch-discovery.md)
- Related: [02-01 Checkout Payment Flow](./02-01-checkout-payment-flow.md)

---

## Notes

- Implemented: `RoomDetailComponent` is fully built (489 lines) using `BranchService` → `GET /api/branches/:id`; renders branch hero, facilities, room types, policies, and "Contact Us Now" CTA with i18n support.
- Figma node ID for Nguyễn Cửu Vân corrected from `270:435` to `275:572`.
- All three branch detail variants are data-driven through the same component.
