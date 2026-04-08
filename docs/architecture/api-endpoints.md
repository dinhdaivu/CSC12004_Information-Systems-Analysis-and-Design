# API Endpoints

Base URL: `/api`

Auth: `Authorization: Bearer <JWT>` on all protected routes.

Roles: `customer`, `staff` (Sales/Kế toán), `admin` (Quản lý)

---

## Auth

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public | Register new customer account |
| POST | `/auth/login` | Public | Login, returns JWT |
| POST | `/auth/forgot-password` | Public | Request password reset email |
| POST | `/auth/logout` | Any | Logout |
| GET | `/auth/me` | Any | Get current user profile |
| PATCH | `/auth/me` | Any | Update current user profile |

---

## Rooms

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/rooms` | Public | List available rooms (filterable by type, capacity, price) |
| GET | `/rooms/:id` | Public | Get room detail |
| POST | `/rooms` | manager, admin | Create new room |
| PATCH | `/rooms/:id` | manager, admin | Update room info or status |
| DELETE | `/rooms/:id` | admin | Delete room |

---

## Branches

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/branches` | Public | List all branches |
| GET | `/branches/:id` | Public | Get branch detail with rooms |
| POST | `/branches` | admin | Create branch |
| PATCH | `/branches/:id` | admin | Update branch |

---

## Rental Requests (SUC2, SUC3)

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/rental-requests` | customer | Create rental request |
| GET | `/rental-requests` | staff, admin | List rental requests |
| GET | `/rental-requests/:id` | staff, admin | Get rental request detail |
| PATCH | `/rental-requests/:id` | staff, admin | Update rental request status or details |

---

## Viewing Appointments (SUC3, SUC14, SUC15)

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/viewing-appointments` | staff, admin | Create room viewing appointment |
| GET | `/viewing-appointments` | staff, admin | List viewing appointments with filters such as month, branch, and status |
| GET | `/viewing-appointments/:id` | staff, admin | Get viewing appointment detail |
| PATCH | `/viewing-appointments/:id/cancel` | staff, admin | Cancel viewing appointment |
| PATCH | `/viewing-appointments/:id/outcome` | staff, admin | Record viewing outcome |

---

## Deposits (UC2)

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/deposits` | customer | Create deposit request (UC2-3) |
| GET | `/deposits/:id` | Any | Get deposit detail |
| GET | `/deposits` | staff, admin | List all deposits |
| PATCH | `/deposits/:id` | staff, admin | Update deposit details such as amount |
| PATCH | `/deposits/:id/confirm` | staff, admin | Confirm deposit received (UC2-3) |
| PATCH | `/deposits/:id/cancel` | staff, admin | Cancel deposit |
| PATCH | `/deposits/:id/review` | admin | Review deposit request |

---

## Contracts (UC3)

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/contracts` | sale, manager, admin | Create contract (UC3-2) |
| GET | `/contracts/:id` | Any | Get contract detail |
| GET | `/contracts` | staff, admin | List all contracts |
| PATCH | `/contracts/:id/sign` | staff, admin | Mark contract as signed (UC3-2) |
| PATCH | `/contracts/:id/terminate` | staff, admin | Early termination (UC4-3) |

---

## Lodging Eligibility (SUC16)

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/lodging-eligibility/:customerId` | admin | Get lodging eligibility input data |
| POST | `/lodging-eligibility/check` | admin | Check and save lodging eligibility result |

---

## Check-in / Check-out Handovers (UC3, UC4)

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/handovers` | manager, admin | Create handover record (checkin or checkout) |
| GET | `/handovers/:id` | Any | Get handover detail |
| PATCH | `/handovers/:id/sign` | manager, admin | Manager signs handover report |

---

## Payments (UC4)

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/transactions` | staff, admin | List all transactions |
| GET | `/transactions/:id` | Any | Get transaction detail |
| POST | `/transactions` | staff, admin | Record a transaction such as deposit, rent, fee, or refund |
| PATCH | `/transactions/:id/confirm` | staff, admin | Confirm and reconcile transaction |

---

## Cost Calculation (SUC4, SUC7, SUC8, SUC9)

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/costs/calculate` | staff, admin | Calculate deposit, contract, or checkout costs |

---

## Check-out Requests (SUC10, SUC11)

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/checkout-requests` | customer | Create checkout request |
| GET | `/checkout-requests` | staff, admin | List checkout requests |
| GET | `/checkout-requests/:id` | staff, admin | Get checkout request detail |
| GET | `/checkout-requests/:id/settlement-input` | staff, admin | Get input data for settlement calculation |
| PATCH | `/checkout-requests/:id/complete` | admin | Mark checkout as completed |

---

## Settlements (SUC8, SUC11)

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/settlements` | staff, admin | Create or update checkout settlement |
| POST | `/settlements/calculate` | staff, admin | Calculate checkout settlement draft |

---

## Customer Bookings (SUC20)

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/my-bookings` | customer | List current customer's rental, deposit, contract, transaction, and checkout statuses |
| GET | `/my-bookings/:id` | customer | Get current customer's booking detail |
| POST | `/my-bookings/:id/actions` | customer | Execute allowed action for the current booking status |

---

## Admin Dashboard (SUC21)

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/admin/dashboard` | admin | Get dashboard metrics and pending tasks |
| GET | `/admin/dashboard/link-target` | admin | Get navigation target for dashboard quick link |

---

## Users (Admin)

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/users` | admin | List all users |
| GET | `/users/:id` | admin | Get user detail |
| PATCH | `/users/:id` | admin | Update user role or status |
| DELETE | `/users/:id` | admin | Delete user |

---

## Health

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/health` | Public | Server health check |
