# [Task] App Shell Layout and Navigation

> **Implementation Rules**
> 1. **Before implementation**: Check [frontend-status.md](../frontend-status.md), [layers.md](../architecture/layers.md), and shared navigation elements visible in the Figma frames.
> 2. **Stubs**: If a dependency is not implemented, create a typed stub and add `// TODO: Implemented in task 00-03`.
> 3. **After implementation**: Update frontend status if shared layout, route names, or navigation behavior changes.

## GitHub Issue

- Link: TBD

---

## Overview

Create the shared frontend shell used by customer and admin screens: logo, language switcher, profile menu, public navigation, admin sidebar, and route guards. Existing `AppComponent` has a simple header, while the Figma screens use a more specific HomeStay Dorm navigation language.

---

## Reference Documents

| Document | Section |
|----------|---------|
| [Frontend Status](../frontend-status.md) | All Figma route mappings |
| `report/diagrams/system_usecase_diagram.mmd` | Actor-specific access |
| [Software Layers](../architecture/layers.md) | Presentation layer |
| [Frontend i18n](./00-05-frontend-i18n-localization.md) | English/Vietnamese language support |

---

## Scope

### Frontend (Angular)

- [ ] Use existing `ngx-translate` i18n pattern for all user-facing copy; add/update matching keys in `frontend/src/assets/i18n/en.json` and `frontend/src/assets/i18n/vi.json`.

- [ ] Create shared public layout for customer screens.
- [ ] Create shared admin layout with sidebar navigation.
- [ ] Add route metadata for customer/staff/accountant/manager/admin access.
- [ ] Wire language switcher into the Figma-style navigation.
- [ ] Keep the existing `LanguageService` and `LanguageSwitcherComponent` behavior for English/Vietnamese switching.
- [ ] Add profile menu placeholder or real profile/logout actions.
- [ ] Ensure child pages do not duplicate the same shell markup.

### Tests

| Layer | Test File | Mock Target |
|-------|-----------|-------------|
| Frontend | `frontend/src/app/app.component.spec.ts` | Router/auth service |
| Frontend | shared layout specs | Auth/role service |

---

## AI Implementation Prompt

--------------------------------------------------

Implement `docs/tasks/00-03-app-shell-layout-and-navigation.md`.

## References
- Figma navigation elements from the CSC12004 file
- Frontend status: `docs/frontend-status.md`
- Actor mapping: `report/diagrams/system_usecase_diagram.mmd`

## Implementation
- Create shared public and admin layout components.
- Add route metadata/guards for roles.
- Preserve the existing `ngx-translate` language switcher and keep navigation labels localized in both English and Vietnamese.
- Keep layout reusable across dashboard, rooms, bookings, admin rooms, schedules, deposits, contracts, and checkout screens.
- If profile data is not ready, create a typed stub with `// TODO: Implemented in task 00-03`.

## Test Requirements
- Layout renders navigation links.
- Role-based links show/hide correctly.
- Router outlet still renders child pages.

--------------------------------------------------

---

## Completion Conditions

- [ ] Public and admin layouts exist.
- [ ] Navigation is reusable and not duplicated per page.
- [ ] Role-based links are represented.
- [ ] Language switcher remains usable.
- [ ] Tests pass for changed code.
