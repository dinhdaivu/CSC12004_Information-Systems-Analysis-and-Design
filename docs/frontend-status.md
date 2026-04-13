# Frontend Implementation Status

**Status Legend:**
- Done (implemented)
- In progress (route/component scaffold exists, but Figma UI/API not implemented)
- Not started
- `-` Not applicable

---

## Auth Screens

| # | Screen | Angular Route | Backend Task | UI | API | Notes |
|---|--------|---------------|--------------|----|-----|-------|
| 1 | Login | `/login` | SUC1 | Done | Done | Login form now calls `/api/auth/login`, stores session, and redirects by role |
| 2 | Confirm email | `/confirm-email` | SUC18 follow-up / signup verification | Done | Done | Verification screen now calls `/api/auth/verify-email` and `/api/auth/resend-verification` |
| 3 | Reset password | `/reset-password` | SUC1 alt flow | Done | Done | Recovery screen now completes the reset flow after `/api/auth/forgot-password` sends the code |
| 4 | Register | `/register` | Derived SUC18 / task 00-04 | Done | Done | Register form now calls `/api/auth/register`, stores the pending email, and redirects to `/confirm-email` as soon as signup succeeds |

---

## Customer / Resident Screens

| # | Figma Screen | Figma Link | Angular Route | Backend Task | UI | API | Notes |
|---|-------------|------------|---------------|--------------|----|-----|-------|
| 1 | Homepage To Hien Thanh | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=211-672) | `/dashboard` | SUC13 / UC1 | In progress | Not started | Dashboard route exists, but only placeholder UI |
| 2 | Homepage Tran Nao | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=211-722) | `/dashboard` | SUC13 / UC1 | In progress | Not started | Same homepage state/branch variation |
| 3 | Homepage Nguyen Cuu Van | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=211-772) | `/dashboard` | SUC13 / UC1 | In progress | Not started | Same homepage state/branch variation |
| 4 | View Detail To Hien Thanh | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=18-113) | `/rooms/:id` | SUC13 | In progress | Not started | Room detail route exists, but placeholder only |
| 5 | View Detail Tran Nao | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=275-480) | `/rooms/:id` | SUC13 | In progress | Not started | Room detail route exists, but placeholder only |
| 6 | View Detail Nguyen Cuu Van | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=270-435) | `/rooms/:id` | SUC13 | In progress | Not started | Parent frame ID was truncated; link points to title/body text inside the screen |
| 7 | Checkout / Payment - Default | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=331-305) | `/bookings/:id` | SUC5 / UC2 | In progress | Not started | Booking detail route exists, but payment UI not implemented |
| 8 | Checkout / Payment - Voucher Expired | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=341-306) | `/bookings/:id` | SUC5 / UC2 | Not started | Not started | State variation not implemented |
| 9 | Checkout / Payment - MoMo QR Modal | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=341-351) | `/bookings/:id` | SUC5 / UC2 | Not started | Not started | Payment modal state not implemented |
| 10 | Checkout / Payment - Success | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=341-406) | `/bookings/:id` | SUC5 / UC2 | Not started | Not started | Payment success state not implemented |

---

## Staff / Admin Screens

| # | Figma Screen | Figma Link | Angular Route | Backend Task | UI | API | Notes |
|---|-------------|------------|---------------|--------------|----|-----|-------|
| 1 | Viewing Schedule - Approve | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=504-994) | `/admin` | UC1-2 / SUC3 | Not started | Not started | No dedicated schedule route/component |
| 2 | Viewing Schedule - List View | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=506-936) | `/admin` | UC1-2 / SUC3 | Not started | Not started | No dedicated schedule route/component |
| 3 | Room Management | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=512-1591) | `/admin/rooms` | SUC12 | In progress | Not started | Admin rooms route exists, but placeholder only |
| 4 | Deposit Tracking Dashboard | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=512-1722) | `/admin/payments` | SUC4 / SUC6 | In progress | Not started | Payments route exists, but placeholder only |

---

## Repo Notes

- Frontend feature components currently render placeholder text such as `Dashboard component works!`, `Room detail component works!`, and similar scaffold messages.
- Backend auth routes are live for `/api/auth/register`, `/api/auth/login`, `/api/auth/verify-email`, `/api/auth/resend-verification`, `/api/auth/forgot-password`, `/api/auth/reset-password/verify`, and `/api/auth/me`; most feature APIs outside auth are still documented ahead of implementation.
- The app already has English/Vietnamese i18n support through `@ngx-translate/core`, `LanguageService`, `LanguageSwitcherComponent`, and `frontend/src/assets/i18n/{en,vi}.json`; every implemented screen should use translation keys instead of hard-coded user-facing copy.
