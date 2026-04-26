# Frontend Implementation Status

**Status Legend:**
- Done (implemented)
- In progress (route/component scaffold exists, but Figma UI/API not implemented)
- Not started
- `-` Not applicable

---

## Auth Screens — task `00-01`, `00-04`

| # | Figma Screen | Figma Link | Angular Route | Task | UI | API | Notes |
|---|-------------|------------|---------------|------|----|-----|-------|
| 1 | Log In Page | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=197-240) | `/login` | 00-01 | Done | Done | Login form calls `/api/auth/login`, stores session, redirects by role |
| 2 | Reset Password Page | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=197-275) | `/reset-password` | 00-01 | Done | Done | Completes reset flow after `/api/auth/forgot-password` sends the code |
| 3 | Sign Up Page | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=180-147) | `/register` | 00-04 | Done | Done | Calls `/api/auth/register`, redirects to `/confirm-email` |
| 4 | Confirm Mail Page | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=197-205) | `/confirm-email` | 00-04 | Done | Done | Calls `/api/auth/verify-email` and `/api/auth/resend-verification` |
| 5 | Profile Page - View Mode | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=224-244) | `/profile` | 00-01 | Not started | Not started | Customer/staff profile view |
| 6 | Profile Page - Edit Mode | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=398-351) | `/profile` | 00-01 | Not started | Not started | Inline edit state |
| 7 | Profile Page - Edit CF Mode | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=399-415) | `/profile` | 00-01 | Not started | Not started | Edit confirmation popup state |

---

## Static / Informational Pages — no dedicated task

| # | Figma Screen | Figma Link | Angular Route | Notes |
|---|-------------|------------|---------------|-------|
| 1 | About us Page | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=59-219) | `/about` | Static content; no backend required |
| 2 | Contact Page | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=91-16) | `/contact` | Static content |
| 3 | Guidelines Page | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=176-108) | `/guidelines` | Static content |

---

## Customer Screens — Branch Discovery — task `01-01`

| # | Figma Screen | Figma Link | Angular Route | UI | API | Notes |
|---|-------------|------------|---------------|----|-----|-------|
| 1 | Homepage Tô Hiến Thành | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=211-672) | `/dashboard` | Done | Done | Branch carousel with `BranchService` → `GET /api/branches`; search, auto-play, "View more" all working |
| 2 | Homepage Trần Não | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=211-722) | `/dashboard` | Done | Done | Same carousel — data-driven branch variant |
| 3 | Homepage Nguyễn Cửu Vân | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=211-772) | `/dashboard` | Done | Done | Same carousel — data-driven branch variant |

---

## Customer Screens — Room Detail — task `01-02`

| # | Figma Screen | Figma Link | Angular Route | UI | API | Notes |
|---|-------------|------------|---------------|----|-----|-------|
| 1 | View Detail Tô Hiến Thành | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=18-113) | `/rooms/:id` | Done | Done | `RoomDetailComponent` fully implemented; loads via `BranchService` → `GET /api/branches/:id`; renders facilities, room types, policies, i18n |
| 2 | View Detail Trần Não | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=275-480) | `/rooms/:id` | Done | Done | Same data-driven component |
| 3 | View Detail Nguyễn Cửu Vân | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=275-572) | `/rooms/:id` | Done | Done | Same data-driven component |

---

## Customer Screens — Rental Request — task `01-03`

| # | Figma Screen | Figma Link | Angular Route | UI | API | Notes |
|---|-------------|------------|---------------|----|-----|-------|
| 1 | Rental Registration Form | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=405-345) | `/bookings/new` | Done | Done | `NewBookingComponent` implemented; `RentalRequestService` → `POST /api/rental-requests`; pre-fills branch/room, captures move-in date/duration/tenants/preferences |
| 2 | Rental Registration Form - Processing | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=411-647) | `/bookings/new` | Done | Done | Submit loading/success/error states implemented |
| 3 | Viewing Appointment | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=413-423) | `/bookings/new` | Done | Done | Appointment scheduling integrated in form flow |

---

## Customer Screens — Booking & Request List — task `01-06`

| # | Figma Screen | Figma Link | Angular Route | UI | API | Notes |
|---|-------------|------------|---------------|----|-----|-------|
| 1 | Request Tracking 1 | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=418-427) | `/bookings` | In progress | Not started | List view — initial/pending state |
| 2 | Request Tracking 2 | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=418-543) | `/bookings` | In progress | Not started | List view — deposit paid state |
| 3 | Request Tracking 3 | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=418-821) | `/bookings` | In progress | Not started | List view — active contract state |
| 4 | Request Tracking 4 | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=418-914) | `/bookings` | In progress | Not started | List view — checkout pending state |

---

## Customer Screens — Deposit Payment — task `02-01`

| # | Figma Screen | Figma Link | Angular Route | UI | API | Notes |
|---|-------------|------------|---------------|----|-----|-------|
| 1 | Deposit Payment | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=425-499) | `/bookings/:id` | Not started | Not started | Default deposit payment screen |
| 2 | Deposit Payment - QR | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=425-757) | `/bookings/:id` | Not started | Not started | VietQR modal state |
| 3 | Payment Status - Failed | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=425-871) | `/bookings/:id` | Not started | Not started | Payment failed state |
| 4 | Payment Status - Timeout | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=426-591) | `/bookings/:id` | Not started | Not started | Payment timeout/expired state |
| 5 | Payment Status - Confirmed | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=426-659) | `/bookings/:id` | Not started | Not started | Payment success state |

---

## Customer Screens — Contract & Residency — task `04-01`

| # | Figma Screen | Figma Link | Angular Route | UI | API | Notes |
|---|-------------|------------|---------------|----|-----|-------|
| 1 | My Residency & Contract | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=430-627) | `/bookings/:id` | Not started | Not started | Customer contract view |
| 2 | My Residency & Contract (variation) | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=899-2668) | `/bookings/:id` | Not started | Not started | Updated contract view variant |
| 3 | My Residency & Contract - Cf Popup | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=900-2846) | `/bookings/:id` | Not started | Not started | Confirmation popup state |
| 4 | My Residency & Contract - View Image | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=900-2979) | `/bookings/:id` | Not started | Not started | Contract document image viewer |

---

## Customer Screens — Checkout Request — task `05-01`

| # | Figma Screen | Figma Link | Angular Route | UI | API | Notes |
|---|-------------|------------|---------------|----|-----|-------|
| 1 | Checkout Registration | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=433-894) | `/bookings/:id` | Not started | Not started | Customer submits checkout request |
| 2 | Checkout Confirmation | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=449-682) | `/bookings/:id` | Not started | Not started | Customer sees settlement summary |
| 3 | Checkout Confirmation - Confirm | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=449-828) | `/bookings/:id` | Not started | Not started | Customer confirms checkout |
| 4 | Refund Payment - Success | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=449-1047) | `/bookings/:id` | Not started | Not started | Refund received state |
| 5 | Refund Payment - Fail | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=449-1213) | `/bookings/:id` | Not started | Not started | Refund failed state |
| 6 | Checkout Confirmation - Dispute | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=451-1297) | `/bookings/:id` | Not started | Not started | Customer disputes settlement |

---

## Staff Screens — Rental Registration Management — task `01-04`

| # | Figma Screen | Figma Link | Angular Route | UI | API | Notes |
|---|-------------|------------|---------------|----|-----|-------|
| 1 | Rental Inquiries Management | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=457-1652) | `/admin/rental-requests` | Done | Done | `RentalRequestsComponent` implemented; lists all requests; staff can view, filter, and update status; `GET /api/rental-requests`, `PATCH /api/rental-requests/:id/status` |
| 2 | Guest Inquiry Profile | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=459-1869) | `/admin/rental-requests` | Done | Done | Customer detail panel included in the list view |
| 3 | Lead Eligibility Verification | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=470-865) | `/admin/rental-requests` | Done | Done | Mandatory checklist + verification results panel; part of 01-04 staff flow (not 04-01) |
| 4 | Rental Registration Form (staff) | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=471-1103) | `/admin/rental-requests` | Done | Done | Staff review/edit form integrated |
| 5 | Rental Registration Form - Processing (staff) | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=471-1216) | `/admin/rental-requests` | Done | Done | Processing/loading state handled |

---

## Staff Screens — Viewing Schedule Management — task `03-01`

| # | Figma Screen | Figma Link | Angular Route | UI | API | Notes |
|---|-------------|------------|---------------|----|-----|-------|
| 1 | Viewing Schedule - Calendar View | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=490-888) | `/admin/schedules` | Not started | Not started | Calendar overview of appointments |
| 2 | Viewing Schedule - Approve | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=504-994) | `/admin/schedules` | Not started | Not started | Approve/reject appointment action |
| 3 | Viewing Schedule - List View | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=506-936) | `/admin/schedules` | Not started | Not started | Table list of appointments |

---

## Staff Screens — Room Management — task `03-02`

| # | Figma Screen | Figma Link | Angular Route | UI | API | Notes |
|---|-------------|------------|---------------|----|-----|-------|
| 1 | Room Management | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=512-1591) | `/admin/rooms` | In progress | Not started | Room/bed grid; route uses shared admin shell; placeholder content |
| 2 | Room Management - Detail | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=576-1387) | `/admin/rooms/:id` | In progress | Not started | Room detail panel — being implemented |
| 3 | Room Management for Manager | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=841-1678) | `/admin/rooms` | In progress | Not started | Manager-role room overview — being implemented |
| 4 | Room Detail - Viewing Mode | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=851-1712) | `/admin/rooms/:id` | In progress | Not started | Read-only room detail — being implemented |
| 5 | Room Detail - Edit Mode | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=855-1955) | `/admin/rooms/:id` | In progress | Not started | Edit room fields — being implemented |
| 6 | Room Detail - Edit Mode - Confirm Popup | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=855-2078) | `/admin/rooms/:id` | In progress | Not started | Save confirmation popup — being implemented |

---

## Staff Screens — Deposit Management — tasks `02-02`, `03-03`

| # | Figma Screen | Figma Link | Angular Route | Task | UI | API | Notes |
|---|-------------|------------|---------------|------|----|-----|-------|
| 1 | Deposit Tracking Dashboard | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=512-1722) | `/admin/payments` | 03-03 | In progress | Not started | Main deposit dashboard; route uses shared admin shell; placeholder content |
| 2 | Upload Deposit Proof | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=512-1809) | `/admin/payments` | 02-02 | Not started | Not started | Staff/customer uploads payment proof |
| 3 | Payment Under Review - Proof Submitted | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=514-1919) | `/admin/payments` | 02-02 | Not started | Not started | Proof submitted, awaiting review |
| 4 | Payment Under Review - Sales Review | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=528-1074) | `/admin/payments` | 02-02 | Not started | Not started | Sales staff reviewing proof |
| 5 | Payment Under Review - Management Approval | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=528-1159) | `/admin/payments` | 02-02 | Not started | Not started | Manager approving deposit |
| 6 | DTD - Add Request | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=580-1776) | `/admin/payments` | 03-03 | Not started | Not started | Staff creates a deposit request |
| 7 | DTD - Add Request Confirmation | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=580-1980) | `/admin/payments` | 03-03 | Not started | Not started | Confirm new request |
| 8 | DTD - Proof Upload | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=580-2365) | `/admin/payments` | 03-03 | Not started | Not started | Upload proof from dashboard |
| 9 | DTD - Proof Upload Reject | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=581-2826) | `/admin/payments` | 03-03 | Not started | Not started | Proof rejected state |
| 10 | DTD - Proof Upload Confirmation | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=581-2935) | `/admin/payments` | 03-03 | Not started | Not started | Proof accepted confirmation |
| 11 | Payment & Transaction | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=701-1295) | `/admin/payments` | 03-03 | Not started | Not started | Payment transaction history |
| 12 | Payment & Transaction - View Image | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=716-1466) | `/admin/payments` | 03-03 | Not started | Not started | View uploaded payment proof image |

---

## Staff Screens — Contract Management — task `04-01`

| # | Figma Screen | Figma Link | Angular Route | UI | API | Notes |
|---|-------------|------------|---------------|----|-----|-------|
| 1 | Lead Eligibility Verification | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=470-865) | `/admin/contracts` | Not started | Not started | Staff checks customer lodging eligibility |
| 2 | Contract Management | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=581-3045) | `/admin/contracts` | Not started | Not started | Staff contract list view |
| 3 | Create Official E-Contract | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=585-1412) | `/admin/contracts/new` | Not started | Not started | Draft and create contract |
| 4 | Create Official E-Contract - Confirmation | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=602-1370) | `/admin/contracts/new` | Not started | Not started | Contract creation confirmation popup |
| 5 | Recurring Monthly Charges | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=716-1671) | `/admin/contracts/:id` | Not started | Not started | Monthly billing overview for a contract |
| 6 | Recurring Monthly Charges - Detail | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=721-2091) | `/admin/contracts/:id` | Not started | Not started | Line-item detail of monthly charges |

---

## Staff Screens — Check-in & Handover — task `04-02`

| # | Figma Screen | Figma Link | Angular Route | UI | API | Notes |
|---|-------------|------------|---------------|----|-----|-------|
| 1 | Check-in & Asset Handover | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=892-1760) | `/admin/checkin` | Not started | Not started | Manager initiates room handover |
| 2 | Check-in & Asset Handover - Detail | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=893-2007) | `/admin/checkin/:id` | Not started | Not started | Asset/condition checklist detail |
| 3 | Check-in & Asset Handover - Detail - Cf Popup | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=899-2525) | `/admin/checkin/:id` | Not started | Not started | Handover confirmation popup |

---

## Staff Screens — Checkout & Settlement — task `05-02`

| # | Figma Screen | Figma Link | Angular Route | UI | API | Notes |
|---|-------------|------------|---------------|----|-----|-------|
| 1 | Checkout Inspection | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=901-1902) | `/admin/checkout` | Not started | Not started | Manager room inspection list |
| 2 | Checkout Inspection - Detail 1 | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=903-2098) | `/admin/checkout/:id` | Not started | Not started | Room condition form |
| 3 | Checkout Inspection - Detail 2 | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=909-1963) | `/admin/checkout/:id` | Not started | Not started | Completed inspection summary |
| 4 | Checkout Inspection - Add Damage | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=910-2129) | `/admin/checkout/:id` | Not started | Not started | Add damage/deduction item |
| 5 | Checkout Inspection - Detail 2 (variant) | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=911-2439) | `/admin/checkout/:id` | Not started | Not started | Alternative detail state |
| 6 | Final Settlement | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=753-1497) | `/admin/checkout/:id` | Not started | Not started | Accountant settlement sheet |
| 7 | Final Settlement - Refundable | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=755-1783) | `/admin/checkout/:id` | Not started | Not started | Customer receives refund state |
| 8 | Final Settlement - Refundable - Confirmation | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=756-1916) | `/admin/checkout/:id` | Not started | Not started | Confirm refund dispatch |
| 9 | Final Settlement - Arrears (1) | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=758-1466) | `/admin/checkout/:id` | Not started | Not started | Customer owes balance state |
| 10 | Final Settlement - Arrears (2) | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=758-1571) | `/admin/checkout/:id` | Not started | Not started | Arrears variant |
| 11 | Refund Execution | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=760-1502) | `/admin/checkout/:id` | Not started | Not started | Accountant processes refund |
| 12 | Refund Execution - Completed | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=762-1782) | `/admin/checkout/:id` | Not started | Not started | Refund sent confirmation |
| 13 | Refund Execution - In Progress | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=815-1607) | `/admin/checkout/:id` | Not started | Not started | Transfer in-flight state |
| 14 | Refund Execution - In Progress - Cf Popup | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=822-1872) | `/admin/checkout/:id` | Not started | Not started | Confirmation popup |
| 15 | Refund Execution - Payment Popup (1) | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=829-2467) | `/admin/checkout/:id` | Not started | Not started | Payment method selection popup |
| 16 | Refund Execution - Payment Popup (2) | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=829-2596) | `/admin/checkout/:id` | Not started | Not started | Payment popup variant |
| 17 | Final Approval | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=917-2107) | `/admin/checkout/:id` | Not started | Not started | Manager final approval screen |
| 18 | Final Approval - Awaiting Response | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=923-2045) | `/admin/checkout/:id` | Not started | Not started | Waiting for customer response |
| 19 | Final Approval - Awaiting - Cf Popup | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=926-2312) | `/admin/checkout/:id` | Not started | Not started | Confirmation popup |
| 20 | Checkout Confirmation (staff) | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=926-2437) | `/admin/checkout/:id` | Not started | Not started | Staff confirms checkout complete |
| 21 | Final Approval - Pending (1) | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=926-2728) | `/admin/checkout/:id` | Not started | Not started | Pending approval status |
| 22 | Final Approval - Pending (2) | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=926-2863) | `/admin/checkout/:id` | Not started | Not started | Pending variant |
| 23 | Final Approval - Pending (3) | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=926-3013) | `/admin/checkout/:id` | Not started | Not started | Pending variant |

---

## Repo Notes

- Task `00-03` is implemented: the app now has a shared public shell for customer-facing routes, a shared admin shell with sidebar navigation, role-aware navigation links, a reusable profile menu, and route metadata for access/navigation behavior.
- Task `01-01` is implemented: `DashboardComponent` is fully built with a branch carousel, `BranchService` calling real Supabase-backed endpoints (`GET /api/branches`, `GET /api/branches/:id`), branch search/filter, auto-play, and "View more" → `/rooms/:id` navigation. All three Figma homepage variants (Tô Hiến Thành, Trần Não, Nguyễn Cửu Vân) are handled data-driven through the same route.
- Placeholder feature routes now render translated stub panels inside the shared shells instead of raw scaffold text.
- Backend auth routes are live for `/api/auth/register`, `/api/auth/login`, `/api/auth/verify-email`, `/api/auth/resend-verification`, `/api/auth/forgot-password`, `/api/auth/reset-password/verify`, and `/api/auth/me`; most feature APIs outside auth are still documented ahead of implementation.
- The app already has English/Vietnamese i18n support through `@ngx-translate/core`, `LanguageService`, `LanguageSwitcherComponent`, and `frontend/src/assets/i18n/{en,vi}.json`; every implemented screen should use translation keys instead of hard-coded user-facing copy.
- **Figma node IDs corrected:** View Detail Nguyễn Cửu Vân is `275:572` (not `270:435`); Deposit Payment screens replaced old stale IDs `331:305`/`341:xxx` with correct current IDs `425:xxx`/`426:xxx`; Viewing Schedule now includes Calendar View (`490:888`) in addition to Approve and List View.
