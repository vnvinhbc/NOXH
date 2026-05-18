# Persistence Rules

## Entity style

- Use simple JPA entities with annotations plus Lombok.
- Prefer data-centric entities over rich domain models.
- Keep entity behavior minimal.

## Repository style

- Use Spring Data JPA repositories extending `JpaRepository`.
- Prefer derived query methods such as `findByUsername` and `existsByUsername`.
- Keep orchestration and cross-repository logic inside services.

## Schema management

- For production-oriented services, prefer managing schema evolution with Flyway or Liquibase.
- If migrations are not introduced yet, keep the gap explicit instead of assuming unmanaged schema changes are acceptable long term.
- Test configuration must match the chosen schema strategy:
  - migration-driven tests run migrations
  - auto-generated test schema must not use `ddl-auto=none`

## Query complexity

- Do not introduce Specification, Querydsl, custom repository implementations, or `@Query` unless the use case truly requires it.
- Start with derived queries and simple CRUD.

## Relationship modeling

- Many-to-many relationships are acceptable in this style when they match current project patterns.
- Let services manage relationship assignment after mapping.

## Mapping boundary

- Use MapStruct to map request DTOs into entities.
- Ignore relation fields in mappers when relation values depend on business logic.
- Assign roles, permissions, or similar associations in the service layer.
