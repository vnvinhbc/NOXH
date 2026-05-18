# Skill: Write Tests In Project Service Style

Use this skill when adding or updating tests for this codebase or a new project modeled on it.

## Controller tests

- Use `@SpringBootTest` plus `@AutoConfigureMockMvc`.
- Mock the service layer with `@MockBean`.
- Serialize request payloads with Jackson.
- Assert status and key JSON fields such as `code`, `message`, and `result`.

## Service tests

- Choose one strategy before writing the class:
  - isolated unit test: instantiate the service directly and mock every collaborator
  - integration test: load Spring wiring and use a real schema or Testcontainers
- Do not mix Spring context plus selective mocked collaborators as the default service-test style.
- Use `@WithMockUser` when service methods depend on Spring Security context.
- If the test needs schema creation, do not keep `ddl-auto=none`.

## Naming

- Name test methods as `method_condition_expected`.

## Minimum scenarios

- success path
- validation or bad-request path when applicable
- not-found or business-error path
- authorization path when applicable

## Important caution

Existing tests show drift from the live implementation. When writing new tests, align with real dependencies and current behavior rather than blindly copying older tests.
