# API Endpoints

Base URL: `/api/v1`

Auth: `Authorization: Bearer <JWT>` on all protected routes.

Roles: `customer`, `staff`, `admin`

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
| POST | `/rooms` | admin, staff | Create new room |
| PATCH | `/rooms/:id` | admin, staff | Update room info or status |
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

## Deposits (UC2)

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/deposits` | customer | Create deposit request (UC2-3) |
| GET | `/deposits/:id` | Any | Get deposit detail |
| GET | `/deposits` | staff, admin | List all deposits |
| PATCH | `/deposits/:id/confirm` | staff, admin | Confirm deposit received (UC2-3) |
| PATCH | `/deposits/:id/cancel` | staff, admin | Cancel deposit |

---

## Contracts (UC3)

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/contracts` | staff, admin | Create draft contract (UC3-2) |
| GET | `/contracts/:id` | Any | Get contract detail |
| GET | `/contracts` | staff, admin | List all contracts |
| PATCH | `/contracts/:id/sign` | staff, admin | Mark contract as signed (UC3-2) |
| PATCH | `/contracts/:id/terminate` | staff, admin | Early termination (UC4-3) |

---

## Check-in / Check-out Handovers (UC3, UC4)

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/handovers` | staff, admin | Create handover record (checkin or checkout) |
| GET | `/handovers/:id` | Any | Get handover detail |
| PATCH | `/handovers/:id/sign` | staff, admin | Manager signs handover report |

---

## Transactions (UC4)

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/transactions` | staff, admin | List all transactions |
| GET | `/transactions/:id` | Any | Get transaction detail |
| POST | `/transactions` | staff, admin | Record a payment or refund |

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
