# HomeStay Dorm

Modern dormitory management system for private housing facilities

A comprehensive web-based platform for room rental, deposits, contracts, and payment tracking. Built with Angular 21, Spring Boot, and Supabase.

---

## Quick Navigation

| Link                                                              | Purpose                       |
| ----------------------------------------------------------------- | ----------------------------- |
| **[Getting Started](#getting-started)**                          | Complete setup guide          |
| **[frontend/README.md](frontend/README.md)**                    | Angular-specific setup        |
| **[backend-spring/README.md](backend-spring/README.md)**        | Spring Boot backend setup     |
| **[supabase/README.md](supabase/README.md)**                    | Database configuration        |
| **[CONTRIBUTING.md](CONTRIBUTING.md)**                          | Development guidelines        |

---

## Overview

HomeStay Dorm is a private dormitory (ký túc xá) management system covering the full tenant lifecycle:

| Process | Description |
|---|---|
| **UC1 — Tư vấn & Tiếp nhận yêu cầu** | Inquiry intake, room availability consultation, room visit scheduling and viewing |
| **UC2 — Đặt cọc & xác nhận thuê** | Room availability check, rental confirmation, deposit collection |
| **UC3 — Nhận phòng & bàn giao** | Lodging condition check, contract signing, room handover |
| **UC4 — Trả phòng** | Check-out request, room inspection, deposit reconciliation & refund |

**Actors:**

- **Khách hàng** (Customer) — initiates all major flows
- **Nhân viên Sales** (Sales Staff) — coordinates with customer for bookings and check-out
- **Quản lý** (Manager) — inspects rooms, approves conditions, oversees handovers
- **Kế toán** (Accountant) — calculates deposits, fees, and refunds

## Technology Stack

| Component        | Technology                                              |
| ---------------- | ------------------------------------------------------- |
| Frontend         | Angular 21, TypeScript 5.9, Tailwind CSS 4, RxJS 7.8   |
| Backend          | Spring Boot 4.0.6, Java 25, Gradle                      |
| Database         | Supabase (PostgreSQL), Row Level Security               |
| Storage          | Cloudinary                                              |
| Email            | Resend                                                  |
| Payments         | VietQR                                                  |
| Authentication   | Custom HS256 JWT + bcrypt (Spring Security)             |
| Testing          | Jest (Frontend), JUnit / Spring Boot Test (Backend)     |
| CI/CD            | GitHub Actions                                          |

## Current Auth Flow

- Customers register on `/register` with email and password.
- The frontend calls `POST /api/auth/register` and redirects to `/confirm-email` as soon as the signup request succeeds.
- Email verification calls `POST /api/auth/verify-email`, which creates or loads the application profile and returns the signed session payload.

---

## Project Structure

```text
HomeStay Dorm/
├── frontend/                  # Angular 21 SPA
│   ├── src/app/
│   │   ├── core/             # Services, guards, interceptors
│   │   ├── shared/           # Reusable components
│   │   ├── features/         # Feature modules
│   │   └── environments/     # Config
│   └── README.md
│
├── backend-spring/            # Spring Boot REST API (primary backend)
│   └── src/main/java/        # Clean Architecture (hexagonal/ports-and-adapters)
│       ├── domain/           # Pure Java domain models — zero framework deps
│       ├── application/      # Use-case interfaces and services
│       ├── adapter/          # Web controllers, JPA persistence adapters
│       └── config/           # Spring @Configuration classes
│
├── backend/                   # Express.js REST API (legacy)
│   └── README.md
│
├── docs/                      # Reference documentation
│   ├── README.md             # Architecture & API docs
│   ├── GitHub_Development_Standards.pdf
│   └── Requirements.pdf
│
├── .github/workflows/         # CI/CD pipelines
│   ├── frontend-ci.yml
│   └── backend-ci.yml
│
├── supabase/                  # Database setup
│   ├── migrations/            # SQL migration files
│   │   └── 001_initial_schema.sql
│   ├── policies/              # RLS policies
│   │   └── README.md
│   └── README.md
│
├── README.md                  # This file
├── CONTRIBUTING.md            # Guidelines
├── LICENSE                    # MIT
└── .gitignore
```

---

## Getting Started

### Prerequisites

- **JDK 25** — install via [sdkman.io](https://sdkman.io) (`sdk install java 25-open`) or [Adoptium](https://adoptium.net)
- **Node.js** 20.x — [nodejs.org](https://nodejs.org) (frontend only)
- **npm** 10.x (included with Node.js)
- **Git** — for version control
- **Code Editor** — VS Code or IntelliJ IDEA recommended

### Step 1: Install Dependencies

```bash
# Frontend — the Spring Boot backend uses the Gradle wrapper (no install step needed)
cd frontend
npm install
```

### Step 2: Setup External Services

Create free accounts and get credentials:

1. **Supabase** - [supabase.com](https://supabase.com)
   - Project URL
   - API Key (anon)
   - Direct database connection string (Supavisor pooler, port 6543)

2. **Cloudinary** - [cloudinary.com](https://cloudinary.com)
   - Cloud Name
   - API Key & Secret

3. **Resend** - [resend.com](https://resend.com)
   - API Key

4. **VietQR** (optional)
   - Client ID & Secret

### Step 3: Configure Environment

#### Backend Environment Setup

Edit `backend-spring/src/main/resources/application.properties` with your credentials:

```properties
# Datasource — Supabase Supavisor pooler, transaction mode (port 6543)
spring.datasource.url=jdbc:postgresql://<pooler-host>:6543/postgres?sslmode=require
spring.datasource.username=postgres.<your-project-ref>
spring.datasource.password=<your-db-password>

# JWT — HS256, min 32 chars
jwt.secret=your_strong_secret_key_at_least_32_characters

# Cloudinary
cloudinary.cloud-name=your_cloud_name
cloudinary.api-key=your_api_key
cloudinary.api-secret=your_api_secret

# Resend
resend.api-key=your_resend_api_key

# VietQR (optional)
vietqr.client-id=your_client_id
vietqr.client-secret=your_client_secret
```

**Important Notes:**
- `application.properties` is excluded from git via `git update-index --assume-unchanged` — credentials won't be committed
- `spring.jpa.hibernate.ddl-auto=validate` — schema is managed by Supabase migrations, not JPA
- Pool size defaults to 5 (`hikari.maximum-pool-size=5`), sized for Supavisor transaction mode

#### Frontend Environment Setup

Edit `frontend/src/environments/environment.ts` for local development:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  supabaseUrl: 'https://your-project.supabase.co',
  supabaseAnonKey: 'your_anon_key_here'
};
```

**Important Notes:**
- Frontend environment files ARE committed to the repository
- Only use public keys (never service role keys) in frontend
- Update `apiUrl` to match your backend deployment URL in production

### Step 4: Run Development Servers

Terminal 1 — Backend:

```bash
cd backend-spring
./gradlew bootRun
# Runs on http://localhost:8080
```

Terminal 2 — Frontend:

```bash
cd frontend
npm start
# Runs on http://localhost:4200
```

### Step 5: Verify

- Backend health: [http://localhost:8080/api/health](http://localhost:8080/api/health)
- Frontend: [http://localhost:4200](http://localhost:4200)
- No console errors in browser

---

## Available Commands

### Frontend

```bash
npm start              # Development server
npm run build          # Production build
npm test               # Run unit tests
npm run lint           # ESLint check
npm run lint:fix       # Auto-fix lint issues
```

### Backend (Spring Boot)

```bash
./gradlew bootRun       # Dev server on http://localhost:8080
./gradlew build         # Compile + test + lint
./gradlew test          # Tests only
./gradlew check         # Tests + lint
./gradlew spotlessApply # Auto-fix lint
```

---

## Business Processes

### UC1 — Tư vấn & Tiếp nhận yêu cầu (Inquiry & Consultation)

- **UC1-1** Tiếp nhận yêu cầu — Customer contacts Sales; Sales logs rental needs and advises on available room types and services; confirms rental intent
  - Alt: if no matching room available, Sales suggests other dormitory services
- **UC1-2** Ghi nhận đăng ký & sắp xếp lịch xem phòng — Sales checks room availability against rental policy; records booking registration; schedules room visit appointment
  - Alt: if requested room type unavailable, Sales proposes alternatives
- **UC1-3** Xem phòng — Sales accompanies customer on room tour; presents room details; confirms deposit intent → triggers UC2-1
  - Alt: if customer is unsatisfied, Sales suggests other room options

### UC2 — Deposit & Rental Confirmation
- **UC2-1** Xác nhận tình trạng phòng — Sales staff + Manager verify room is available and clean
- **UC2-2** Xác nhận nhu cầu thuê — Collect tenant documents and rental info; forward to accounting
- **UC2-3** Xác nhận đặt cọc — Accounting calculates deposit; Sales collects and records payment; room status updated

### UC3 — Check-in, Contract & Room Handover
- **UC3-1** Kiểm tra điều kiện lưu trú — Verify identity docs and deposit; invalid info triggers 80% refund
- **UC3-2** Lập hợp đồng — Draft and sign contract; Accounting collects initial fees
- **UC3-3** Nhận phòng — Manager inspects room, briefs tenant on rules, signs handover report

### UC4 — Check-out
- **UC4-1** Xử lý đơn đăng ký trả phòng — Sales receives request; Manager inspects room; Accounting calculates refund:
  - Deposit paid, no contract (cancelled): **refund 80%**
  - Contract signed, < 6 months stayed: **refund 50%**
  - Contract signed, ≥ 6 months stayed: **refund 70%**
  - Contract expired naturally: **refund 100%**
  - Deductions: unpaid rent, utilities, damages, penalties
- **UC4-2** Xác nhận đối soát & thanh toán — Manager presents settlement; customer confirms and pays/receives refund
- **UC4-3** Trả phòng — Sign check-out report and contract termination; finalize handover

---

## Development Workflow

1. Create Branch

   ```bash
   git checkout -b feature/your-feature
   ```

2. Make Changes

   - Follow [CONTRIBUTING.md](CONTRIBUTING.md)
   - Write tests
   - Run linting

3. Commit

   ```bash
   git commit -m "feat: description"
   ```

4. Push & Create PR

   ```bash
   git push origin feature/your-feature
   ```

---

## Documentation

- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Development guidelines
- **[frontend/README.md](frontend/README.md)** - Angular setup and commands
- **[backend-spring/README.md](backend-spring/README.md)** - Spring Boot setup and commands
- **[supabase/README.md](supabase/README.md)** - Database setup and migrations
- **[docs/README.md](docs/README.md)** - System architecture and API documentation

---

## CI/CD Pipeline

GitHub Actions automatically:

- Runs linting
- Executes tests
- Builds production version
- Reports coverage

Workflows: `.github/workflows/frontend-ci.yml`, `backend-ci.yml`

---

## Troubleshooting

Port already in use

```bash
# Windows: Find and kill process on port 8080
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac: Find and kill process on port 8080
lsof -i :8080
kill -9 <PID>
```

Module not found (frontend)

```bash
rm -rf node_modules package-lock.json
npm install
```

Java build errors

```bash
cd backend-spring
./gradlew clean build
```

JDK version mismatch

```bash
# Verify JDK 25 is active
java -version
# Install via sdkman: sdk install java 25-open && sdk use java 25-open
```

---

## Course Information

- **Course:** CSC12004 - Systems Analysis and Design
- **Institution:** HCMUS - Faculty of Information Technology

---

## License

MIT License - See [LICENSE](LICENSE)

---

**Ready to start?** Follow [Getting Started](#getting-started) above!
