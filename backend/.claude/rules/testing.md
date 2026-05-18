# Testing Rules

## Test types in this codebase

- Controller tests use Spring Boot test support with `MockMvc`.
- Service tests must choose one clear strategy per class:
  - isolated unit test with all dependencies mocked
  - integration test with real persistence wiring, real schema, or Testcontainers
- Do not mix a half-integration Spring context with selectively mocked service dependencies unless there is a deliberate slice-test reason.

## Controller test style

- Prefer:
  - `@SpringBootTest`
  - `@AutoConfigureMockMvc`
  - `@TestPropertySource("/test.properties")`
  - `@MockBean` for the service under test
- Assert both HTTP status and response payload fields.

## Service test style

- Unit tests should instantiate the service directly and mock every dependency the method touches.
- Integration tests should bootstrap the required Spring context and use a real schema strategy.
- If persistence behavior matters, prefer integration tests backed by a real database setup or Testcontainers instead of over-mocking repository behavior.
- If tests still need Hibernate to create schema automatically, do not leave `ddl-auto=none`; use a fitting test value such as `create`, `create-drop`, or run migrations before the test.

## Naming

- Use the pattern `method_condition_expected`.
- Examples:
  - `createUser_validRequest_success`
  - `createUser_usernameInvalid_fail`
  - `getMyInfo_userNotFound_error`

## Practical cautions

- The current suite is not fully healthy; do not assume existing tests are the gold standard.
- Prefer writing tests that align with actual service dependencies rather than copying outdated mocks.
- Be explicit in the test class name, annotations, and setup about whether the class is unit or integration focused.
