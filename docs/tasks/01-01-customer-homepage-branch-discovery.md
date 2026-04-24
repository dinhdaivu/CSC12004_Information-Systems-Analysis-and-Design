# [Task] Customer Homepage / Branch Discovery

> **Implementation Rules**
> 1. **Before implementation**: Check [frontend-status.md](../frontend-status.md), [api-endpoints.md](../architecture/api-endpoints.md), and [layers.md](../architecture/layers.md).
> 2. **Stubs**: If a dependency is not implemented, create a typed stub and add `// TODO: Implemented in task 01-01`.
> 3. **After implementation**: Compare the implementation with these docs and update them if behavior changes:
>    - [frontend-status.md](../frontend-status.md) - UI/API status
>    - [api-endpoints.md](../architecture/api-endpoints.md) - endpoint definitions
>    - [database.md](../architecture/database.md) - table definitions, only if migrations are added
>    - [state-machine.md](../architecture/state-machine.md) - status transitions, only if enums change

## GitHub Issue

- Link: TBD

---

## Overview

Implement the public customer homepage for HomeStay Dorm branch discovery. The screen lets customers browse branch cards, switch between branch highlights, search by branch/location text, and navigate to detail pages.

### Figma Screens

| Screen | Figma Link | Angular Route |
|--------|------------|---------------|
| Homepage To Hien Thanh | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=211-672) | `/dashboard` |
| Homepage Tran Nao | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=211-722) | `/dashboard` |
| Homepage Nguyen Cuu Van | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=211-772) | `/dashboard` |

---

## Reference Documents

| Document | Section |
|----------|---------|
| [UC1](../UC/UC1.md) | Inquiry intake and room consultation |
| [API Endpoints](../architecture/api-endpoints.md) | Branches, Rooms |
| [Software Layers](../architecture/layers.md) | RoomView, BookingController |

---

## Flow Summary

```text
Customer homepage flow:

1. User opens /dashboard.
2. Frontend loads branch list.
3. User views highlighted branch card and branch background.
4. User switches branch using up/down controls or branch card selection.
5. User searches by branch name or address.
6. User clicks View more.
7. Frontend navigates to /rooms/:id or /rooms?branchId=:id.
```

---

## Scope

### Frontend (Angular)

- [ ] Use existing `ngx-translate` i18n pattern for all user-facing copy; add/update matching keys in `frontend/src/assets/i18n/en.json` and `frontend/src/assets/i18n/vi.json`.

- [ ] Replace `DashboardComponent` placeholder with homepage UI.
- [ ] Add branch data model/view model.
- [ ] Add branch carousel/selection state for the three Figma homepage variants.
- [ ] Add search input and filtered branch list.
- [ ] Add navigation from branch card to branch/room detail.
- [ ] Add language/profile UI placeholders consistent with the app shell.
- [ ] Use Tailwind or SCSS according to existing frontend conventions.

### Backend (Express/Supabase)

- [ ] Implement `GET /api/branches`.
- [ ] Implement `GET /api/branches/:id`.
- [ ] Return branch name, address, description, hero image, and related room summary.
- [ ] Add temporary mock data only if Supabase schema is not ready.

### Tests

#### Unit Tests

| Layer | Test File | Mock Target |
|-------|-----------|-------------|
| Frontend | `frontend/src/app/features/dashboard/components/dashboard/dashboard.component.spec.ts` | Branch API service |
| Backend | `backend/src/__tests__/branches.spec.ts` | Supabase client |

#### Test Cases

| # | Test Case | Layer | Expected |
|---|-----------|-------|----------|
| 1 | Homepage loads branches | Frontend | Three branch cards are rendered |
| 2 | Search filters branches | Frontend | Non-matching branches are hidden |
| 3 | View more navigation | Frontend | Router navigates to selected branch/room detail |
| 4 | Branch list API | Backend | `GET /branches` returns branch summaries |
| 5 | Empty branch result | Frontend | Empty state is shown |

---

## AI Implementation Prompt

Copy this prompt into an AI coding agent:

--------------------------------------------------

Implement `docs/tasks/01-01-customer-homepage-branch-discovery.md`.

## References
- Figma: Homepage To Hien Thanh, Homepage Tran Nao, Homepage Nguyen Cuu Van
- UC: `docs/UC/UC1.md`
- API: `docs/architecture/api-endpoints.md`
- Layers: `docs/architecture/layers.md`

## Implementation
- Replace the placeholder `DashboardComponent` with the customer homepage.
- Add a typed Angular service for branch loading.
- Use `GET /api/branches`; if backend is missing, create a typed frontend stub with `// TODO: Implemented in task 01-01`.
- Implement search, branch selection, and "View more" navigation.
- Preserve the existing Angular standalone component pattern.

## Constraints
- Do not introduce a new UI framework.
- Keep branch data typed.
- Keep static Figma assets local or behind a data field; do not hard-code expiring Figma MCP asset URLs.

## Test Requirements
- Add/update Angular tests for branch rendering, search, and navigation.
- Add backend route tests if implementing the branch endpoint.

--------------------------------------------------

---

## Completion Conditions

- [x] `/dashboard` no longer shows placeholder text.
- [x] Three branch homepage states are represented through branch data/selection.
- [x] Search filters branches.
- [x] "View more" navigates to detail.
- [x] Branch API or typed stub exists.
- [x] Tests pass for the changed frontend/backend code.

---

## Related Tasks

- Next: [01-02 Branch Room Detail Pages](./01-02-branch-room-detail-pages.md)
- Related: [03-02 Admin Room Management](./03-02-admin-room-management.md)

---

## Notes

- Current implementation status: route exists, UI is placeholder, API is not wired.
- Prefer data-driven branch variants instead of duplicating three homepage components.
