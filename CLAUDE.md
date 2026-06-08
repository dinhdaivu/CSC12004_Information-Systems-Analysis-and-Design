# HomeStay Dorm — Agent Context

Private dormitory (ký túc xá) management system. Covers the full tenant lifecycle: room availability checking, deposit collection, contract signing, room handover, and check-out/refund processing.

**Course:** CSC12004 - Systems Analysis and Design | HCMUS

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 21, TypeScript 5.9, Tailwind CSS 4, RxJS 7.8 |
| Backend | Express.js 5.2, TypeScript 5.9, Node.js 20+ — **migrating to Spring Boot 4.0.6 / Java 25 / Gradle / Spring Data JPA** (#72) |
| Database | Supabase (PostgreSQL) + Row Level Security |
| Auth | Custom HS256 JWT (`jsonwebtoken`) + bcrypt — *not* Supabase Auth |
| Storage | Cloudinary |
| Email | Resend |
| Payments | VietQR |
| Testing | Jest (both FE and BE) |
| CI/CD | GitHub Actions |

---

## Project Structure

```
CSC12004_Information-Systems-Analysis-and-Design/
├── frontend/               # Angular 21 SPA (port 4200)
│   └── src/app/
│       ├── core/           # Guards, interceptors, services
│       ├── features/       # auth, dashboard, rooms, bookings, admin
│       └── shared/         # Reusable components
├── backend/                # Express.js REST API (port 3000)
│   └── src/
│       ├── config/         # Service configs (supabase, cloudinary, etc.)
│       ├── middleware/      # Auth middleware, error handling
│       ├── routes/         # API route definitions
│       ├── controllers/    # Route handlers
│       ├── services/       # Business logic
│       ├── models/         # TypeScript interfaces
│       └── utils/          # Helpers
├── supabase/
│   ├── migrations/         # Numbered SQL files (001_, 002_, ...)
│   └── policies/           # RLS policy docs
├── .agent/
│   ├── workflows/          # Step-by-step runnable workflows
│   └── skills/             # Agent SKILL.md files
├── docs/                   # Architecture & API documentation
├── CLAUDE.md               # This file
└── CONTRIBUTING.md
```

---

## Key Commands

### Backend
```bash
cd backend
npm run dev          # Dev server with hot reload (tsx watch)
npm run build        # Compile TypeScript → dist/
npm test             # Jest tests
npm run test:coverage
npm run lint
npm run lint:fix
```

### Frontend
```bash
cd frontend
npm start            # ng serve (port 4200)
npm run build        # Production build
npm test             # Jest tests
npm run lint
npm run lint:fix
```

---

## Architecture

The system follows 3 complementary patterns:

| Pattern | Role |
| --- | --- |
| **3-Layer Architecture** | Overall deployment structure |
| **MVC Pattern** | Organizes processing between UI and business logic |
| **Boundary-Control-Entity (BCE)** | Class-level analysis model |

### Layers

| Layer | MVC | BCE | What lives here |
| --- | --- | --- | --- |
| Presentation | View | `<<boundary>>` | BookingView, PaymentView, ContractView, CheckoutView, RoomView |
| Business Logic | Controller | `<<control>>` | BookingController, PaymentController, ContractController, CheckoutController, RefundCalculator, **SchedulerController** |
| Data | Model | `<<entity>>` | Customer, Employee, Room, Bed, DepositRequest, Payment, Contract, CheckoutRequest, Settlement |

**SchedulerController** — auto-cancels deposit requests not paid within **24 hours** (sets `DepositStatus = EXPIRED`, `RoomStatus = AVAILABLE`).

### Backend mapping (Express.js)

- `routes/` = boundary layer (receives HTTP requests)
- `controllers/` = control layer (orchestrates business logic)
- `services/` = control layer (business logic implementation)
- `models/` = entity layer (TypeScript interfaces)

### Backend mapping (Spring Boot — clean architecture)

The Spring Boot backend follows the **hexagonal / ports-and-adapters** pattern
(see `backend-spring/README.md` for the full layout):

```
domain/model/       pure domain entities and enums — no Spring, no JPA
application/port/in/  inbound ports — use-case interfaces controllers call
application/port/out/ outbound ports — interfaces services call to reach DB
application/service/  use-case implementations
adapter/in/web/     REST controllers and DTOs
adapter/out/persistence/ JPA entities, Spring Data repos, persistence adapters
common/             shared response envelope, exception hierarchy, BaseEntity
config/             Spring @Configuration classes (CORS, JPA auditing, etc.)
security/           JWT filter, SecurityConfig, UserPrincipal
```

**Dependency rule:** `adapter → application → domain`. Outer layers depend on inner
layers; `domain/` has zero framework dependencies.

---

## Architecture Decisions

### Backend Migration → Spring Boot (in progress, #72)

The Express/TypeScript backend is being rewritten on **Spring Boot 4.0.6, Java 25,
Gradle** following the **Clean Architecture** pattern (hexagonal / ports-and-adapters).
Constraints and decisions:

- **Behavior parity is the hard requirement** — same REST contract, status codes,
  and JSON payloads. The API base path is **`/api`** (e.g. `/api/auth`, `/api/rooms`),
  **not** `/api/v1` (older docs were wrong; frontend `apiUrl` ends in `/api`).
- **Data layer = JDBC / Spring Data JPA** (direct PostgreSQL). Chosen over a
  PostgREST-over-HTTP port. ⚠️ Implication: a JDBC connection does **not** go through
  Supabase PostgREST, so **RLS no longer gates access the way it does today** (the
  current code uses anon vs service-role keys). Every table's access rules must be
  **re-enforced in app code / Spring Security**, and the migration plan must verify
  this explicitly. Needs a Postgres connection string + pooler (Supavisor) config —
  a new secret beyond the anon/service keys.
- **Auth** — replicate the custom **HS256 JWT** (`{id,email,role}`, 7-day expiry,
  same `JWT_SECRET`) via a Spring Security filter; **bcrypt** passwords via
  `BCryptPasswordEncoder` (hash-compatible).
- **Response envelope** preserved exactly: success `{success,data,message?}`, error
  `{success,error:{code,message,details?}}`, paginated adds `pagination`; null fields
  omitted (`@JsonInclude(NON_NULL)`).
- **Scheduler** — port **both** jobs: `expireOverdueDeposits` (hourly) and
  `processPendingRentalRequests` (every 60s) via `@Scheduled`.
- **Out of scope:** the chat/AI (RAG) surface — deferred to a later task.

### Backend Patterns
- **Express.js 5** — async errors propagate automatically (no try/catch needed in route handlers if using async functions)
- **Route → Controller → Service** layering: routes just bind paths, controllers handle req/res, services contain all business logic
- **Supabase client** is initialized once in `src/config/supabase.ts` and imported where needed
- **No ORM** — use Supabase JS client directly for data access
- **JWT** is verified in `src/middleware/auth.ts` using `jsonwebtoken`; attach `req.user` for downstream handlers
- **Error handling** — central error middleware in `src/index.ts` catches all thrown errors

### Frontend Patterns
- **Standalone components** — no NgModules; use `imports: []` in component decorator
- **Lazy-loaded routes** — each feature has its own `*.routes.ts` file
- **Dependency injection** — use `inject()` function (not constructor injection) in Angular 21
- **HTTP calls** — use Angular's `HttpClient` via `HttpClientModule`; backend URL from `environment.apiUrl`
- **Auth state** — managed via Supabase Auth client in `core/services/auth.service.ts`
- **Role-based guards** — in `core/guards/`; roles: `customer`, `sale`, `accountant`, `manager`, `admin`

### Database
- All tables use UUID primary keys
- Timestamps: `created_at`, `updated_at` on all tables
- RLS enabled on all tables; policies in `supabase/policies/`
- Migrations numbered sequentially: `001_initial_schema.sql`, `002_...`, etc.

---

## Actors

| Actor | Role in system |
|---|---|
| Khách hàng (Customer) | Initiates rental, deposit, check-in, check-out |
| Nhân viên Sales (Sales Staff) | Coordinates bookings, documents, contract signing |
| Quản lý (Manager) | Inspects rooms, approves conditions, signs handover reports |
| Kế toán (Accountant) | Calculates deposits, fees, refunds; processes payments |

In the system: `app_role` DB enum has five values — `customer`, `sale`, `accountant`, `manager`, `admin`. Customer = `customer`; Sales staff = `sale`; Manager = `manager`; Accountant = `accountant`; System admin = `admin`.

---

## Business Processes

### UC1 — Tư vấn & Tiếp nhận yêu cầu (Inquiry & Consultation)

```
UC1-1: Tiếp nhận yêu cầu
  Customer contacts Sales staff (individual or group)
  Sales logs rental needs and advises on room types / services
  Sales confirms customer's rental intent
  Alt: if no matching room → suggest other dormitory services

UC1-2: Ghi nhận đăng ký & sắp xếp lịch xem phòng
  Sales checks room availability vs. dormitory rental policy
  Records booking registration info
  Schedules an appointment to view the room
  Alt: if requested room type not available → propose alternative room/service

UC1-3: Xem phòng
  Sales accompanies customer on physical room tour
  Presents room details and features
  Confirms customer's intent to deposit → triggers UC2-1
  Alt: if customer unsatisfied → suggest other room options
```

### UC2 — Đặt cọc & Xác nhận thuê (Deposit & Rental Confirmation)

```
UC2-1: Xác nhận tình trạng phòng (Include in UC2)
  Sales staff reviews customer info + chosen room
  Manager physically inspects room (vacancy, cleanliness, assets)
  Result communicated back to customer
  Alt: if room fails inspection → propose another room

UC2-2: Xác nhận nhu cầu thuê (Extends UC2)
  Customer confirms intent to rent
  Sales collects required documents + rental info (ID, duration, occupants)
  Info forwarded to Accountant → triggers UC2-3
  Alt: pause if customer cannot provide complete documents

UC2-3: Xác nhận đặt cọc (Extends UC2)
  Accountant calculates deposit amount
  Sales notifies customer; customer pays deposit
  Sales records receipt; Manager confirms
  Room/bed status updated to reserved in system
  Alt: room not held if deposit not paid on time
```

### UC3 — Nhận phòng, Ký hợp đồng & Bàn giao (Check-in)

```
UC3-1: Kiểm tra điều kiện lưu trú (Include in UC3)
  Sales verifies deposit info on system
  Sales checks customer identity documents
  Manager reviews lodging conditions for each customer
  Alt A2: invalid customer info → refund 80% deposit, end UC
  Alt A3: customer fails condition → refund 80% for that customer

UC3-2: Lập hợp đồng (triggered after UC3-1 success)
  Sales drafts and signs rental contract with customer
  Contract forwarded to Accountant
  Accountant collects all initial fees per contract
  Triggers UC3-3

UC3-3: Nhận phòng (triggered after UC3-2 success)
  Manager inspects and records room condition before handover
  Manager briefs tenant on rules and regulations
  Handover report signed between Manager and customer
  Keys and assets handed over
```

### UC4 — Trả phòng (Check-out)

```
UC4-1: Xử lý đơn đăng ký trả phòng
  Sales receives check-out request; validates request form
  Manager physically inspects room at check-out time
  Manager records room condition vs. contract obligations
  Accountant calculates deposit refund:
    - Deposit paid, no contract (cancelled):    refund 80%
    - Contract signed, < 6 months stayed:       refund 50%
    - Contract signed, >= 6 months stayed:      refund 70%
    - Contract expired naturally:               refund 100%
  Accountant deducts: unpaid rent, utilities, damages, penalties
  Accountant produces settlement sheet → UC4-2

UC4-2: Xác nhận đối soát & thanh toán
  Manager presents settlement breakdown to customer
  If customer owes: Accountant guides payment
  If customer receives refund: Accountant agrees on method (cash/transfer)
  On success → UC4-3
  On payment failure → retry

UC4-3: Trả phòng
  Customer signs check-out report + contract termination
  Room/bed status updated to available in system
```

---

## Domain Model (BCE Entities)

```
-- ENTITY LAYER (<<entity>>) --

Customer       (BCE: Customer)
               id, email, full_name, phone, identity_number
               Maps to: users WHERE role = 'customer'

Employee       (BCE: Employee)
               id, email, full_name, phone, role (sale | manager | accountant | admin)
               Maps to: users WHERE role IN ('sale', 'accountant', 'manager', 'admin')

Branch         id, name, address, phone, manager_id

Room           (BCE: Room)
               id, branch_id, room_number, room_type, capacity, price
               status: AVAILABLE | HOLDING | DEPOSITED | OCCUPIED | CHECKOUT_PENDING

Bed            (BCE: Bed)
               id, room_id, bed_number, status
               A room can have multiple beds

DepositRequest (BCE: DepositRequest)
               id, customer_id, room_id, bed_id, amount, status, expires_at, paid_at
               status: PENDING | PAID | CANCELLED | EXPIRED
               Auto-expires after 24 hours via SchedulerController

Payment        (BCE: Payment)
               id, deposit_request_id, contract_id, amount, type, payment_method, status
               type: deposit | rent | refund | penalty | utility
               payment_method: cash | bank_transfer | vietqr

Contract       (BCE: Contract)
               id, customer_id, room_id, start_date, end_date, monthly_rent, terms
               status: ACTIVE | TERMINATED | COMPLETED

CheckoutRequest (BCE: CheckoutRequest)
               id, contract_id, customer_id, requested_at
               status: REQUESTED | CONFIRMED | COMPLETED

Settlement     (BCE: Settlement)
               id, checkout_request_id, deposit_refund_amount, deductions,
               net_amount, refund_method, created_by (accountant)
```

### Business Rules

- Deposit auto-expires: `SchedulerController` runs every hour, sets `EXPIRED` on `DepositRequest` older than 24h with status `PENDING`.
- Refund calculation (on Settlement):
  - Deposit paid, no contract (CANCELLED): 80%
  - Contract ACTIVE, stayed < 6 months: 50%
  - Contract ACTIVE, stayed >= 6 months: 70%
  - Contract COMPLETED (expired naturally): 100%
  - Deductions: unpaid rent, utilities, damages, penalties

---

## Environment

### Backend (`backend/.env`) — NOT committed
```
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:4200
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RESEND_API_KEY=
JWT_SECRET=          # min 32 chars
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:4200
```

### Frontend (`frontend/src/environments/environment.ts`) — committed
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1',
  supabaseUrl: '',
  supabaseAnonKey: ''   // anon key only, never service_role
};
```

---

## Code Style

- Commit format: `type(scope): subject` (Angular convention)
  - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`
- TypeScript strict mode in both FE and BE
- ESLint configured in both FE and BE; always run `lint` before pushing
- Test coverage target: >70%
- JSDoc comments required on public service methods (backend)

---

## Available Agent Skills

| Skill | When to use |
|---|---|
| `.agent/skills/tdd/` | Writing tests with Jest (red-green-refactor) |
| `.agent/skills/planning-with-files/` | Complex multi-step tasks; saves plan to disk |
| `.agent/skills/add-backend-route/` | Adding a new REST API endpoint |
| `.agent/skills/add-angular-feature/` | Adding a new Angular feature/page |
| `.agent/skills/github-pr-review/` | Reviewing a pull request with gh CLI |

## Available Workflows

| Workflow | Command |
|---|---|
| Start dev servers | `.agent/workflows/run-dev-servers.md` |
| Run all tests | `.agent/workflows/run-tests.md` |
| Lint check | `.agent/workflows/lint-check.md` |
| Apply DB migration | `.agent/workflows/db-migrations.md` |

## Project-Specialized Skills (`.claude/skills/`)

These are **concrete versions** of general user-layer skills, generated for THIS
repo by `specialize-skill`. They have the same names as the general skills and
therefore **shadow** them when invoked here (interface → concrete subclass).

| Skill | Purpose | Regenerate |
| --- | --- | --- |
| `.claude/skills/draft-report/` | Draft a grounded issue/PR report from a task → writes `.claude/drafts/draft-issue.md` | `specialize-skill draft-report` |
| `.claude/skills/create-issue/` | File the drafted report as a real GitHub issue (self-assign, set Type, create + checkout branch) | `specialize-skill create-issue` |
| `.claude/skills/open-pr/` | Open a PR from the current branch (fill template from diff, `Closes #n`, labels; no reviewers) | `specialize-skill open-pr` |
| `.claude/skills/ship/` | Gated finish pipeline: sync main → lint → build → test → code-review → security-review → commit → open-pr → watch CI | `specialize-skill ship` |

Typical flow: `draft-report "<task>"` → review draft → `create-issue` (lands you on
the branch) → do the work → `ship` (syncs main, runs the gates, commits, and calls
`open-pr`; you add reviewers yourself). Run `open-pr` standalone if you only want the PR step.

### Project setup / init

After `/init` on a fresh clone (or after the general skills change), run:

```text
specialize-skill all
```

This re-probes the repo and regenerates the concrete `.claude/skills/*` so they
stay in sync with their user-layer templates. The generated files carry a
"Generated by specialize-skill …" header; treat them as compiled output and edit
the general skill (then regenerate) rather than hand-editing the concrete copy.

**Repo conventions baked into these skills:** GitHub repo
`dinhdaivu/CSC12004_Information-Systems-Analysis-and-Design`; issue types
Task/Bug/Feature; branch format `<category>/#<issue#>-<kebab-slug>`
(e.g. `chore/#72-migrate-backend-to-spring-boot`). Project-board fields are not
wired yet (token lacks the `project` OAuth scope — `gh auth refresh -s project`).
