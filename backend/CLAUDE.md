# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run

```bash
./mvnw clean package          # build
./mvnw spring-boot:run        # run the application
./mvnw test                   # run all tests
./mvnw spotless:apply         # format code (Palantir Java Format)
```

## Project Identity

- **Root package**: `com.caovinh.noxh`
- **Java**: 21 | **Spring Boot**: 4.0.5 | **Build**: Maven

## Architecture

Layer-based Spring Boot REST service. Packages: `configuration`, `controller`, `service`, `repository`, `entity`, `dto.request`, `dto.response`, `mapper`, `exception`, `validator`, `constant`.

**Key patterns:**
- Controllers are thin — receive DTO, call service, return wrapped result
- Services own all business logic; no service interfaces by default
- MapStruct mappers handle structure conversion; services handle business-dependent transformation (password encoding, role assignment)
- Dependencies injected via `@RequiredArgsConstructor`; classes use `@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)`

## Response Contract

All endpoints return `ApiResponse<T>` (code `1000` = success, `result` omitted when null via `@JsonInclude`). Use `ResponseEntity<ApiResponse<T>>` when status ≠ 200. Use `ResponseEntity<Void>` (no wrapper) for `204 No Content`.

## Error Handling

`ErrorCode` enum is the single source of truth — each entry defines numeric code, message, and HTTP status. Business failures throw `AppException(errorCode)`. `GlobalExceptionHandler` maps all exceptions to `ApiResponse`. Validation annotations go on request DTOs, not entities; messages use ErrorCode keys (e.g. `USERNAME_INVALID`).

## Security

Split into focused config classes (`SecurityConfig`, `CustomJwtDecoder`, `JwtAuthenticationEntryPoint`, `ApplicationInitConfig`). Public endpoints listed explicitly; all others secured by default. Use `@PreAuthorize` / `@PostAuthorize` in services. `PasswordEncoder` exposed as a bean and constructor-injected — never instantiated inline.

## Testing

- **Controller tests**: `@SpringBootTest` + `@AutoConfigureMockMvc` + `@TestPropertySource("/test.properties")` + `@MockBean` for the service
- **Service tests**: choose one strategy — pure unit test (mock all deps) **or** integration test (real DB/Testcontainers) — never mix
- **Naming**: `method_condition_expected` (e.g. `createUser_validRequest_success`)
- Test `ddl-auto` must not be `none` if the schema is auto-generated

## Convention References

Detailed rules are in `.claude/rules/`:
- `api.md` — endpoint style, HTTP status semantics, DTO naming
- `architecture.md` — package layout, layer responsibilities
- `error-handling.md` — ErrorCode model, exception handler patterns
- `mapping-and-dto.md` — MapStruct style, DTO placement
- `persistence.md` — entity/repository style, schema management
- `security.md` — JWT, Spring Security configuration
- `testing.md` — test types, annotations, naming
- `tooling.md` — full stack list, formatting, config style
