# Skill: Scaffold Identity Feature

Use this skill when asked to add a new business resource or feature in the style of this repository's service layer architecture.

## Goal

Create a feature that looks native to this codebase, not to a generic Spring Boot template.

## Follow this sequence

1. Identify the main resource and whether it is resource-style (`/users`) or workflow-style (`/auth/...`).
2. Add or update the entity only if persistence is part of the feature.
3. Add request DTOs in `dto.request`.
4. Add response DTOs in `dto.response`.
5. Place shared wrappers such as `ApiResponse` in `dto.response` or a shared/common DTO package if they do not already exist in the right place.
6. Add a MapStruct mapper in `mapper`.
7. Add a Spring Data JPA repository in `repository` if needed.
8. Implement a concrete service in `service`.
9. Add a thin controller in `controller`.
10. Integrate validation, error codes, security rules, and HTTP status semantics.
11. If persistence changes are production-relevant, update or create Flyway/Liquibase migrations.
12. Add or update tests with a clear unit or integration strategy.

## Hard requirements

- Keep layer-based packaging.
- Do not create service interfaces by default.
- Use `ApiResponse<T>` for controller responses.
- For create/delete endpoints, prefer `201 Created` and `204 No Content` rather than flattening to `200 OK`.
- Use `ErrorCode` and `AppException` for business errors.
- Put business orchestration in the service, not the controller.
- Use MapStruct instead of manual repetitive mapping.
- Inject `PasswordEncoder` consistently if the feature handles passwords or credential-like secrets.

## Feature checklist

- request DTO validated
- response DTO defined
- mapper created
- repository added or reused
- service contains orchestration
- controller is thin
- error paths mapped through `ErrorCode`
- authorization added in service if needed
- tests added with a clear strategy
- test schema strategy is explicit
- migration impact considered if schema changed

## Output expectation

The final implementation should resemble the current project structure while using the improved defaults documented in `.claude/rules`.
