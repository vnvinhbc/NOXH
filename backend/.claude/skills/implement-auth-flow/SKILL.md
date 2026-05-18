# Skill: Implement Auth Flow

Use this skill when asked to add or modify authentication, token, introspection, refresh, logout, or authorization-related behavior.

## Model to follow

- `AuthenticationController`
- `AuthenticationService`
- `SecurityConfig`
- `CustomJwtDecoder`
- `JwtAuthenticationEntryPoint`

## Rules

- Treat auth endpoints as workflow endpoints under `/auth`.
- Keep controller logic minimal.
- Put token orchestration and verification logic in the service layer.
- Reuse the existing error contract for auth failures.
- Keep security config explicit about public endpoints.
- Prefer method-level authorization in services for business-sensitive operations.
- Inject `PasswordEncoder` from configuration instead of creating encoder instances inline.

## Implementation checklist

- endpoint path chosen consistently
- request and response DTOs added
- token or auth logic added to service
- security config updated if public access changes
- proper `ErrorCode` added for new failure modes
- response wrapper placement stays in shared/common DTO space or `dto.response`
- generic exception handling still maps auth failures to the intended `ErrorCode` and HTTP status
- tests cover success and failure cases

## Avoid

- Avoid pushing auth logic into controllers.
- Avoid introducing a second error format.
- Avoid bypassing existing JWT and invalidation patterns unless the task explicitly changes architecture.
