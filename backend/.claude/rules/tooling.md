# Tooling Rules

## Stack

- Java
- Spring Boot
- Spring Web
- Spring Data JPA
- Spring Security Resource Server
- Validation
- Lombok
- MapStruct
- Maven

## Build and formatting

- Keep code compatible with the existing Maven build.
- Preserve Lombok and MapStruct usage patterns already configured in `pom.xml`.
- Respect Spotless and Palantir Java Format style even if the check is not currently enforced in the build.

## Configuration style

- Prefer small focused config classes.
- Keep application configuration in `application.yaml` with profile-specific overrides only where needed.
- Continue using environment-variable-backed datasource configuration if adding new deployable settings.

## Development posture

- Favor fast-moving, pragmatic defaults consistent with this project.
- For production-oriented services, stricter REST semantics and schema migration tooling are sensible defaults, not exotic extras.
- Prefer introducing Flyway or Liquibase before schema changes start accumulating across environments.
