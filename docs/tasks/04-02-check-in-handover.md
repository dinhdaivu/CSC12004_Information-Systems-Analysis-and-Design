# [Task] Check-in Handover

> **Implementation Rules**
> 1. **Before implementation**: Check [api-endpoints.md](../architecture/api-endpoints.md), [state-machine.md](../architecture/state-machine.md), and `report/content/2_System Analyze.tex` SUC17.
> 2. **Stubs**: If a dependency is not implemented, create a typed stub and add `// TODO: Implemented in task 04-02`.
> 3. **After implementation**: Update docs if handover fields or room status transitions change.

## GitHub Issue

- Link: TBD

---

## Overview

Implement manager check-in handover after UC3-2 completes. The manager records room/bed condition, handed-over assets, keys/cards, and finalizes the tenant move-in.

### Related Routes

| Screen/Area | Angular Route | Backend Task |
|-------------|---------------|--------------|
| Check-in handover | `/admin/handovers` or `/admin/contracts/:id/handover` | SUC17 |

---

## Reference Documents

| Document | Section |
|----------|---------|
| `report/content/2_System Analyze.tex` | SUC17 |
| [UC3](../UC/UC3.md) | Room handover |
| [State Machine](../architecture/state-machine.md) | RoomStatus |
| [API Endpoints](../architecture/api-endpoints.md) | Handovers |

---

## Flow Summary

```text
Check-in handover flow:

1. Manager opens the signed contract after UC3-2 is complete.
2. System displays room/bed and asset list.
3. Manager records current condition and issued items.
4. Manager confirms keys/cards and residency rules were handed over.
5. Backend creates handover record.
6. Room status becomes OCCUPIED.
```

---

## Scope

### Frontend (Angular)

- [ ] Use existing `ngx-translate` i18n pattern for all user-facing copy; add/update matching keys in `frontend/src/assets/i18n/en.json` and `frontend/src/assets/i18n/vi.json`.

- [ ] Add handover route/component.
- [ ] Render contract, customer, room/bed, and asset details.
- [ ] Add handover checklist and notes.
- [ ] Add confirm handover action.
- [ ] Add loading/empty/error states.

### Backend (Express/Supabase)

- [ ] Implement `POST /api/handovers`.
- [ ] Implement `GET /api/handovers/:id`.
- [ ] Implement `PATCH /api/handovers/:id/sign`.
- [ ] Update room/bed status to `OCCUPIED` after successful check-in handover.

### Tests

| Layer | Test File | Mock Target |
|-------|-----------|-------------|
| Frontend | `frontend/src/app/features/admin/components/handovers/handovers.component.spec.ts` | Handover service |
| Backend | `backend/src/__tests__/handovers.spec.ts` | Supabase client |

---

## AI Implementation Prompt

--------------------------------------------------

Implement `docs/tasks/04-02-check-in-handover.md`.

## References
- Report: `report/content/2_System Analyze.tex` SUC17
- UC: `docs/UC/UC3.md`
- API: `docs/architecture/api-endpoints.md`
- State machine: `docs/architecture/state-machine.md`

## Implementation
- Add handover route/component.
- Add typed handover checklist model.
- Wire handover create/sign endpoints or typed stubs.
- Update room/bed status to `OCCUPIED` after successful handover.

## Test Requirements
- Frontend checklist validation tests.
- Backend handover creation/sign tests.
- Room status transition test.

--------------------------------------------------

---

## Completion Conditions

- [ ] Manager can record check-in handover.
- [ ] Assets/keys/cards are captured.
- [ ] Handover record is stored.
- [ ] Room status becomes `OCCUPIED`.
- [ ] Tests pass for changed code.

