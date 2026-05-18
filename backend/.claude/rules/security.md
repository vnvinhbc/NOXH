# Security Rules

## Overall approach

- Keep Spring Security close to the authentication business flow.
- Use both HTTP security rules and method-level security.

## Configuration style

- Split security-related configuration into focused classes instead of one large config file.
- Follow the current pattern with classes such as:
  - `SecurityConfig`
  - `CustomJwtDecoder`
  - `JwtAuthenticationEntryPoint`
  - `ApplicationInitConfig`
- Expose `PasswordEncoder` as a bean and inject it consistently wherever password hashing or matching is needed.

## Access control

- Keep public endpoint lists explicit.
- Use `@PreAuthorize` and `@PostAuthorize` in services for authorization rules tied to business behavior.
- Secure non-public endpoints by default.

## JWT handling

- Follow the current style where JWT validation and auth business logic are connected.
- Claims should carry scope information for roles and permissions.
- Keep authority prefix handling aligned with current config when generating secured features.

## Practical guidance

- Do not move authorization rules into controllers.
- Do not bypass `AuthenticationService`-like flows with ad-hoc token logic.
- Reuse the existing error model for authentication and authorization failures.
- Do not instantiate `BCryptPasswordEncoder` or similar encoders inline inside services, seeders, or utility classes.
