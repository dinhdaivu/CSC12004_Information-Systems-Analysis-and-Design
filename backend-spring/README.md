# homestay-backend (Spring Boot)

Spring Boot 4.0.6 / Java 25 rewrite of the Express backend — **migration epic #72**,
plan in `docs/tasks/06-01-backend-spring-boot-migration.md`. Runs **side-by-side**
with the existing `backend/` (Express) until the Phase 10 cutover; Express stays the
deployed service for now.

This is **Phase 0** (#75): scaffold only — no business logic, no database.

## Prerequisites

- **JDK 25** (the Gradle toolchain pins it; install via your JDK manager).
- No global Gradle needed — use the wrapper (`./gradlew`).

## Commands

```bash
cd backend-spring
./gradlew build        # compile + test + lint (spotlessCheck via `check`)
./gradlew test         # tests only
./gradlew check        # tests + lint
./gradlew spotlessApply # auto-fix lint
./gradlew bootRun      # run the app on http://localhost:8080
```

## Verify

```bash
curl -s http://localhost:8080/api/health
# {"status":"OK","timestamp":"2026-..."}  — matches the Express /api/health shape
```

## Layout (grows in later phases)

```
src/main/java/vn/edu/hcmus/homestay/
  HomestayBackendApplication.java
  web/          # @RestControllers (HealthController for now)
  # service/ repository/ entity/ config/ security/ support/ — added in Phase 1+
```

## Notes

- `/api/health` is a **custom** controller, not Actuator (Actuator's shape differs).
- Lint = Spotless with text-only rules for now; google-java-format will be enabled
  once it parses Java 25.
- Testcontainers (DB integration tests) is added in Phase 1 (#76), via the Testcontainers BOM.
