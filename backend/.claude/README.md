# Claude Workspace Guide

This `.claude` folder captures the Spring Boot service style used in this repository, with a few deliberate improvements for reuse in new projects.

- `rules/` contains durable implementation rules Claude should follow when creating or modifying code.
- `skills/` contains task-oriented playbooks for recurring work in projects that should look like this service.
- `settings.json` is the shared repository-level permission policy for Claude.
- `settings.local.json` is the local-machine override for extra development commands.

Primary source of truth:

- `PROJECT_STYLE_GUIDE.md` if present
- existing code under the current root package in `src/main/java`
- existing tests under the matching package in `src/test/java`
- the rules in `.claude/rules`

Important posture for cloned projects:

- Keep the layer-based style, thin controllers, service orchestration, MapStruct mapping, and `ErrorCode`-driven errors.
- Do not preserve accidental quirks from older templates if a rule here defines a better default.
- Prefer `ApiResponse` in a shared/common package or `dto.response`, not under `dto.request`.
- Prefer `201 Created` for create and `204 No Content` for delete when following REST semantics.
- Keep `PasswordEncoder` injected consistently anywhere password hashing or matching happens.
- Choose one test style per service test class: isolated unit test or integration test with real schema/Testcontainers.
- Do not keep `ddl-auto=none` in tests that still rely on auto-created schema.
- Keep `GlobalExceptionHandler` aligned with `ErrorCode` so fallback statuses do not drift.
- For production-oriented services, strongly consider Flyway or Liquibase.

## Settings usage

- Commit `settings.json` when you want the team to share the same default permission boundaries.
- Use `settings.local.json` for machine-specific convenience such as running the app or formatting code locally.
- Keep `settings.local.json` narrower than necessary and do not treat it as the team-wide security baseline.
- If your team does not want to share local overrides, keep `settings.local.json` out of version control.
