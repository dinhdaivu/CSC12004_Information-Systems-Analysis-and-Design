# homestay-backend (Spring Boot)

Spring Boot 4.0.6 / Java 25 rewrite of the Express backend — **migration epic #72**,
plan in `docs/tasks/06-01-backend-spring-boot-migration.md`. Runs **side-by-side**
with the existing `backend/` (Express) until the Phase 10 cutover; Express stays the
deployed service for now.

**Phases 0–4 complete:**
- Phase 0+1: scaffold, clean architecture (hexagonal/ports-and-adapters), auth endpoints
- Phase 3: catalog domains — branch, zone, room, bed (PR #96)
- Phase 4: UC1 inquiry — rental-request, viewing-appointments (PR #97)

## Prerequisites

- **JDK 25** (the Gradle toolchain pins it; install via your JDK manager).
- No global Gradle needed — use the wrapper (`./gradlew`).

## Local environment setup

Fill in your Supabase credentials directly in `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require
spring.datasource.username=postgres.<your-project-ref>
spring.datasource.password=<your-password>
```

`application.properties` is excluded from git tracking via `git update-index --assume-unchanged`
so your credentials won't be committed.

## Commands

```bash
cd backend-spring
./gradlew build         # compile + test + lint
./gradlew test          # tests only
./gradlew check         # tests + lint
./gradlew spotlessApply # auto-fix lint
./gradlew bootRun       # run on http://localhost:8080
```

## Verify

```bash
curl -s http://localhost:8080/api/health
# {"status":"OK","timestamp":"2026-..."}

curl -s -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"secret123","confirmPassword":"secret123"}'
```

## Architecture

This backend follows the **Clean Architecture** (hexagonal / ports-and-adapters) pattern
as described at https://www.baeldung.com/spring-boot-clean-architecture.

```
Dependency rule:  adapter → application → domain
                  (outer layers depend on inner layers, never the reverse)
```

### Package layout

```
src/main/java/vn/edu/hcmus/homestay/
│
├── domain/                        ← innermost ring — pure Java, zero framework deps
│   └── model/
│       ├── user/        User, AppRole, UserStatus
│       ├── branch/      Branch
│       ├── zone/        Zone
│       ├── room/        Room, RoomStatus
│       ├── bed/         Bed, BedStatus
│       ├── rental/      RentalRequest, RentalRequestStatus (+ VALID_TRANSITIONS map)
│       └── viewing/     ViewingAppointment, ViewingAppointmentStatus
│
├── application/                   ← use-cases and ports
│   ├── port/
│   │   ├── in/                    inbound ports (what controllers call)
│   │   │   ├── RegisterUseCase.java
│   │   │   ├── LoginUseCase.java
│   │   │   ├── GetCurrentUserUseCase.java
│   │   │   └── ChangePasswordUseCase.java
│   │   └── out/                   outbound ports (what services need from infra)
│   │       ├── LoadUserPort.java
│   │       └── SaveUserPort.java
│   └── service/
│       └── AuthService.java       implements all four use-case interfaces
│
├── adapter/                       ← outermost ring — framework-specific code
│   ├── in/
│   │   ├── web/                   REST controllers + DTOs
│   │   │   ├── AuthController.java
│   │   │   ├── HealthController.java
│   │   │   └── dto/
│   │   └── security/              Spring Security input adapter
│   │       ├── JwtAuthenticationFilter.java
│   │       └── UserPrincipal.java
│   └── out/
│       ├── persistence/           JPA entities + Spring Data + adapters
│       │   ├── BaseEntity.java    @MappedSuperclass (JPA-only — lives here, not common/)
│       │   ├── UserEntity.java
│       │   ├── UserJpaRepository.java
│       │   ├── UserPersistenceAdapter.java  implements LoadUserPort + SaveUserPort
│       │   ├── AppRoleConverter.java
│       │   └── UserStatusConverter.java
│       └── security/              JWT output adapter
│           └── JwtTokenProvider.java        implements TokenPort
│
├── application/port/out/
│   ├── LoadUserPort.java
│   ├── SaveUserPort.java
│   └── TokenPort.java             ← interface; keeps application/ free of JWT deps
│
├── common/                        ← shared kernel (pure Java, no JPA, no Spring)
│   ├── ApiResponse.java
│   ├── ApiResponseBuilder.java
│   ├── PaginatedResponse.java
│   └── exception/
│       ├── AppException.java      base runtime exception
│       └── ...                    ConflictException, NotFoundException, etc.
│
└── config/                        ← Spring @Configuration wiring
    ├── SecurityConfig.java        @EnableWebSecurity — wires the JWT filter chain
    ├── GlobalExceptionHandler.java
    ├── JpaConfig.java
    └── WebConfig.java
```

### Adding a new feature (e.g. rooms)

1. **Domain** — add `domain/model/room/Room.java`, `RoomStatus.java` (pure Java)
2. **Ports** — add `application/port/in/ListRoomsUseCase.java`, `application/port/out/LoadRoomPort.java`
3. **Service** — add `application/service/RoomService.java` (implements the use-case interfaces)
4. **Persistence** — add `adapter/out/persistence/RoomEntity.java`, `RoomJpaRepository.java`, `RoomPersistenceAdapter.java`
5. **Web** — add `adapter/in/web/RoomController.java` + `dto/`

Each layer only depends on its inner layer. `RoomController` calls use-case interfaces; it never touches `RoomEntity` or `RoomJpaRepository` directly. `AuthService` calls `TokenPort`; it never imports `JwtTokenProvider`.

## Notes

- `/api/health` is a **custom** controller, not Spring Actuator (Actuator's shape differs).
- Lint = Spotless text-only rules; google-java-format will be enabled once it parses Java 25.
- Testcontainers (DB integration tests) is wired via `AbstractContainerBaseTest`.
- RLS is no longer enforced by the JDBC connection — security must be re-enforced in
  `SecurityConfig` and `@PreAuthorize` annotations (see CLAUDE.md for details).
