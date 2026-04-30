# [Task] Frontend i18n and Vietnamese Localization

> **Implementation Rules**
> 1. **Before implementation**: Check `frontend/src/app/core/i18n/language.service.ts`, `frontend/src/app/shared/components/language-switcher/language-switcher.component.ts`, `frontend/src/assets/i18n/en.json`, and `frontend/src/assets/i18n/vi.json`.
> 2. **Stubs**: If a screen is not implemented yet, reserve translation key namespaces for that feature and add `// TODO: Implemented in task 00-05` only where a typed frontend stub is required.
> 3. **After implementation**: Update both English and Vietnamese translation files whenever user-facing copy changes.

## GitHub Issue

- Link: TBD

---

## Overview

Ensure every user-facing frontend screen supports the website language option. The Angular app already uses `@ngx-translate/core`, `LanguageService`, `LanguageSwitcherComponent`, and translation JSON files for English and Vietnamese.

### Current i18n Files

| Area | File |
|------|------|
| Language service | `frontend/src/app/core/i18n/language.service.ts` |
| Language switcher | `frontend/src/app/shared/components/language-switcher/language-switcher.component.ts` |
| English translations | `frontend/src/assets/i18n/en.json` |
| Vietnamese translations | `frontend/src/assets/i18n/vi.json` |
| App bootstrap config | `frontend/src/app/app.config.ts` |

---

## Scope

### Frontend (Angular)

- [x] Keep `en` and `vi` as supported languages.
- [x] Keep English as fallback unless product requirements change.
- [x] Add translation keys for all new screen titles, labels, buttons, validation errors, empty states, success messages, and API error messages.
- [x] Replace hard-coded user-facing template strings with `| translate` or `TranslateService` lookups.
- [x] Keep backend enum/status values separate from display labels; map them through translation keys in the UI.
- [x] Verify Vietnamese strings render correctly with UTF-8 encoding.
- [x] Ensure the language switcher remains available in the shared app shell.

### Tests

| Layer | Test File | Mock Target |
|-------|-----------|-------------|
| Frontend | `frontend/src/app/core/i18n/language.service.spec.ts` | TranslateService/localStorage |
| Frontend | `frontend/src/app/shared/components/language-switcher/language-switcher.component.spec.ts` | LanguageService |
| Frontend | affected feature specs | Translation files / TranslateModule |

---

## AI Implementation Prompt

--------------------------------------------------

Implement `docs/tasks/00-05-frontend-i18n-localization.md`.

## References
- `frontend/src/app/core/i18n/language.service.ts`
- `frontend/src/app/shared/components/language-switcher/language-switcher.component.ts`
- `frontend/src/assets/i18n/en.json`
- `frontend/src/assets/i18n/vi.json`

## Implementation
- Audit user-facing frontend text in implemented screens.
- Add missing translation keys to both English and Vietnamese JSON files.
- Replace hard-coded labels/messages with `ngx-translate` usage.
- Keep status/enum display labels localized without changing backend values.
- Preserve UTF-8 Vietnamese text.

## Test Requirements
- Language service initializes saved/browser/default language correctly.
- Language switcher changes language and persists selection.
- Feature tests render through `TranslateModule` without missing keys.

--------------------------------------------------

---

## Completion Conditions

- [x] All implemented user-facing screens use translation keys instead of hard-coded display copy.
- [x] `en.json` and `vi.json` contain matching key coverage.
- [x] Vietnamese copy renders correctly.
- [x] The language switcher remains accessible from the shared shell.
- [x] Tests pass for changed frontend code.

---

## Related Tasks

- Related: [00-03 App Shell Layout and Navigation](./00-03-app-shell-layout-and-navigation.md)
- Applies to: all frontend feature implementation tasks
