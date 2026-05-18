# API Rules

## Endpoint style

- Use noun-based endpoints for resources.
- Use action-style subpaths for auth workflows.
- Follow patterns already used in the project:
  - `/users`
  - `/users/{userId}`
  - `/users/my-info`
  - `/auth/token`
  - `/auth/introspect`
  - `/auth/refresh`
  - `/auth/logout`

## Controller conventions

- Annotate controllers with `@RestController` and `@RequestMapping`.
- Return `ApiResponse<T>` for endpoints that send a body.
- Use `ResponseEntity<ApiResponse<T>>` when the HTTP status is not the default `200 OK`.
- Use `ResponseEntity<Void>` or equivalent with no body for `204 No Content` responses.
- Keep `ApiResponse` in a shared/common package or under `dto.response`, never under `dto.request`.
- Build wrapped responses with `ApiResponse.<T>builder().result(...).build()`.
- Keep controller methods concise: receive DTO, call service, wrap result.
- It is acceptable in this codebase for controller methods to omit the `public` modifier.

## DTO naming

- Name request models with the `*Request` suffix.
- Name response models with the `*Response` suffix.
- Use explicit intent-based names such as:
  - `UserCreationRequest`
  - `UserUpdateRequest`
  - `AuthenticationRequest`
  - `AuthenticationResponse`

## Response contract

- Keep the common response envelope:
  - `code`
  - `message`
  - `result`
- Default successful code is `1000`.
- Omit `result` when null through `@JsonInclude(JsonInclude.Include.NON_NULL)`.

## HTTP status behavior

- Prefer explicit REST semantics instead of flattening everything to `200 OK`.
- Create endpoints should return `201 Created`.
- Delete endpoints should return `204 No Content` when no payload is needed.
- Read and update endpoints usually return `200 OK`.
- Validation errors return `400`.
- Authentication failures return `401`.
- Authorization failures return `403`.
- Resource-not-found errors should map to `404` through `ErrorCode`.
- If a response uses `204 No Content`, do not wrap it in `ApiResponse` because the response body must be empty.

## Validation

- Put validation annotations on request DTOs, not entities.
- For validation messages, use error-code keys such as `USERNAME_INVALID` rather than final human text.
