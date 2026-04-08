# API Endpoints

Base URL: `/api/v1`

Auth: `Authorization: Bearer <JWT>` on all protected routes.

Roles: `customer`, `sale`, `accountant`, `manager`, `admin`

---

## Auth

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public | Register new customer account |
| POST | `/auth/login` | Public | Login, returns JWT |
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
| POST | `/branches` | manager, admin | Create branch |
| PATCH | `/branches/:id` | manager, admin | Update branch |

---

## Deposits (UC2)

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/deposits` | customer | Create deposit request (UC2-3) |
| GET | `/deposits/:id` | Any | Get deposit detail |
| GET | `/deposits` | sale, accountant, manager, admin | List all deposits |
| PATCH | `/deposits/:id/confirm` | accountant, manager, admin | Confirm deposit received (UC2-3) |
| PATCH | `/deposits/:id/cancel` | sale, accountant, manager, admin | Cancel deposit |

---

## Contracts (UC3)

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/contracts` | sale, manager, admin | Create contract (UC3-2) |
| GET | `/contracts/:id` | Any | Get contract detail |
| GET | `/contracts` | sale, accountant, manager, admin | List all contracts |
| PATCH | `/contracts/:id/sign` | sale, manager, admin | Mark contract as signed (UC3-2) |
| PATCH | `/contracts/:id/terminate` | manager, admin | Early termination (UC4-3) |

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
| GET | `/payments` | accountant, manager, admin | List all payments |
| GET | `/payments/:id` | Any | Get payment detail |
| POST | `/payments` | accountant, manager, admin | Record a payment or refund |

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
