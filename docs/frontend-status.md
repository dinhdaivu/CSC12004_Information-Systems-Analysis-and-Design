# Frontend Implementation Status

**Status Legend:**
- ✅ Done (implemented)
- 🚧 In progress (route/component scaffold exists, but Figma UI/API not implemented)
- 🔲 Not started
- `-` Not applicable

---

## Customer / Resident Screens

| # | Figma Screen | Figma Link | Angular Route | Backend Task | UI | API | Notes |
|---|-------------|------------|---------------|--------------|----|----|-------|
| 1 | Homepage Tô Hiến Thành | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=211-672) | `/dashboard` | SUC13 / UC1 | 🚧 | 🔲 | Dashboard route exists, but only placeholder UI |
| 2 | Homepage Trần Não | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=211-722) | `/dashboard` | SUC13 / UC1 | 🚧 | 🔲 | Same homepage state/branch variation |
| 3 | Homepage Nguyễn Cửu Vân | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=211-772) | `/dashboard` | SUC13 / UC1 | 🚧 | 🔲 | Same homepage state/branch variation |
| 4 | View Detail Tô Hiến Thành | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=18-113) | `/rooms/:id` | SUC13 | 🚧 | 🔲 | Room detail route exists, but placeholder only |
| 5 | View Detail Trần Não | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=275-480) | `/rooms/:id` | SUC13 | 🚧 | 🔲 | Room detail route exists, but placeholder only |
| 6 | View Detail Nguyễn Cửu Vân | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=270-435) | `/rooms/:id` | SUC13 | 🚧 | 🔲 | Parent frame ID was truncated; link points to title/body text inside the screen |
| 7 | Checkout / Payment - Default | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=331-305) | `/bookings/:id` | SUC5 / UC2 | 🚧 | 🔲 | Booking detail route exists, but payment UI not implemented |
| 8 | Checkout / Payment - Voucher Expired | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=341-306) | `/bookings/:id` | SUC5 / UC2 | 🔲 | 🔲 | State variation not implemented |
| 9 | Checkout / Payment - MoMo QR Modal | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=341-351) | `/bookings/:id` | SUC5 / UC2 | 🔲 | 🔲 | Payment modal state not implemented |
| 10 | Checkout / Payment - Success | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=341-406) | `/bookings/:id` | SUC5 / UC2 | 🔲 | 🔲 | Payment success state not implemented |

---

## Staff / Admin Screens

| # | Figma Screen | Figma Link | Angular Route | Backend Task | UI | API | Notes |
|---|-------------|------------|---------------|--------------|----|----|-------|
| 1 | Viewing Schedule - Approve | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=504-994) | `/admin` | UC1-2 / SUC3 | 🔲 | 🔲 | No dedicated schedule route/component |
| 2 | Viewing Schedule - List View | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=506-936) | `/admin` | UC1-2 / SUC3 | 🔲 | 🔲 | No dedicated schedule route/component |
| 3 | Room Management | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=512-1591) | `/admin/rooms` | SUC12 | 🚧 | 🔲 | Admin rooms route exists, but placeholder only |
| 4 | Deposit Tracking Dashboard | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=512-1722) | `/admin/transactions` | SUC4 / SUC6 | 🚧 | 🔲 | Transactions route exists, but placeholder only |

---

## Repo Notes

- Frontend feature components currently render placeholder text such as `Dashboard component works!`, `Room detail component works!`, and similar scaffold messages.
- Backend code currently exposes `/api/health`; the richer API endpoints are documented as planned in `docs/architecture/api-endpoints.md`, but are not wired into frontend feature screens yet.
