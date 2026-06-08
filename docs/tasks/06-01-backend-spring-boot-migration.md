# 06-01 — Backend Migration to Spring Boot (Epic #72)

Migrate `backend/` from **Express 5 + TypeScript** to **Spring Boot 4.0.6 / Java 25 /
Gradle / Spring Data JPA**, preserving behavior exactly.

- **Epic:** #72
- **Hard constraint:** behavior parity — same REST contract, status codes, JSON payloads.
- **API base path:** `/api` (NOT `/api/v1`).
- **Data layer:** JDBC / Spring Data JPA, direct to PostgreSQL (decision: B).
- **Architecture:** Clean Architecture (hexagonal / ports-and-adapters) following
  https://www.baeldung.com/spring-boot-clean-architecture — see `backend-spring/README.md`.
- **Out of scope:** the chat/AI (RAG) surface — deferred to a later task.

## ⚠️ Key risk taken on by the JDBC/JPA choice

The current code reaches Postgres through **Supabase PostgREST** with **anon** and
**service-role** keys, so **RLS** provides a coarse access gate. A direct JDBC
connection **bypasses RLS** — every table's access rule must be **re-enforced in app
code / Spring Security**. This is addressed explicitly in **Phase 2**; it is the
single biggest source of behavioral drift and must be verified, not assumed.

## Current backend at a glance (what we're porting)

- 18 domains (routes) in scope (+ `chat` excluded): auth, users, admin, branch, zone,
  room, bed, viewing-appointments, rental-request, my-booking, deposit, payment,
  contracts, lodging-eligibility, checkout, handover, dispute, default-handover-item.
- Custom **HS256 JWT** (`{id,email,role}`, 7d, `JWT_SECRET`) + **bcrypt** passwords.
- Response envelope: success `{success,data,message?}`, error
  `{success,error:{code,message,details?}}`, paginated adds `pagination` — null fields omitted.
- **Two scheduler jobs:** `expireOverdueDeposits` (hourly), `processPendingRentalRequests` (60s).
- Integrations: Cloudinary (uploads), Resend (email), VietQR (payments).
- ~41 Jest unit tests (Supabase client is mocked).

## Sequencing principle

Foundation → one vertical slice to prove the stack → domains in dependency order →
background jobs → integrations → CI/cutover. Keep Express runnable until parity is
proven (rollback safety). Each phase is one PR and ends with a **parity check**.

---

## Phases

### Phase 0 — Scaffold & build ✅
Gradle + Spring Boot 4.0.6 + Java 25; clean architecture package layout
(`domain/model/`, `application/port/`, `application/service/`, `adapter/in/web/`,
`adapter/out/persistence/`, `common/`, `config/`, `security/`); Spotless (lint);
JUnit 5 + Testcontainers-Postgres; `/api/health` → `{status,timestamp}`.
**Exit:** app boots; `/api/health` matches; `gradle build` + `test` green. ✅

### Phase 1 — Cross-cutting foundation + Auth ✅
JPA datasource (Supavisor pooler); `BaseEntity` (UUID pk, audit timestamps);
**response envelope** (`ApiResponse` + `@JsonInclude(NON_NULL)`);
`@RestControllerAdvice` mapping `AppException` hierarchy + 404 + 413 + bean-validation;
CORS, security headers, 25 MB body limit; HS256 JWT filter + `SecurityConfig`;
`/api/auth/*` (register / login / me / change-password).
**Parity harness:** `ParityHarnessTest` replays requests against both Express and Spring.
**Exit:** tokens interoperate with Express; auth parity; all tests green. ✅

### Phase 2 — RLS re-enforcement
Audit every table's current anon/service-role policy and re-implement the equivalent
gate in app code / Spring Security → produce a **table → access-rule matrix** with
per-role tests.
**Exit:** access-control matrix documented + tested. *This phase proves security parity.*

### Phase 3 — Catalog / inventory
`branch`, `zone`, `room`, `bed` (read-heavy, referenced by everything else).
**Exit:** endpoint parity for all four via the harness.

### Phase 4 — UC1 inquiry
`rental-request`, `viewing-appointments`.
**Exit:** parity + inquiry flow tests.

### Phase 5 — UC2 deposit & payment
`deposit`, `payment` (VietQR), `my-booking`.
**Exit:** parity; VietQR payload identical.

### Phase 6 — UC3 check-in
`contracts`, `lodging-eligibility`, `handover`, `default-handover-item`.
**Exit:** parity; refund-eligibility rules verified.

### Phase 7 — UC4 checkout
`checkout`, `dispute`, settlement + refund calculation (80 / 50 / 70 / 100%).
**Exit:** parity; refund math verified against the documented rules.

### Phase 8 — Admin
`users` management, `admin`, admin-dashboard aggregates.
**Exit:** parity.

### Phase 9 — Scheduler & integrations
Both `@Scheduled` jobs (`expireOverdueDeposits` hourly, `processPendingRentalRequests`
60s, both with email side-effects); Cloudinary uploads; Resend email templates.
**Exit:** jobs fire on the same cadence/logic; uploads + emails work.

### Phase 10 — CI/CD & cutover
`backend-ci.yml` → Gradle/JVM build + tests; `deploy.yml` (Railway) deploys the JAR;
decommission Express; update `CLAUDE.md`/`docs`. Frontend `apiUrl` unchanged (same
`/api` path/host).
**Exit:** CI green on JVM; prod parity confirmed; Express retired.

---

## Dependency notes

- Phases 3–8 depend only on 0–2, so after the foundation they can be parallelized.
- Phase 5 (payment) depends on Phase 4 (rental-request) and Phase 2 (users).
- Phase 7 (checkout) depends on Phase 6 (contracts).
- Phase 9 depends on the deposit/rental-request domains (3–5) existing.
