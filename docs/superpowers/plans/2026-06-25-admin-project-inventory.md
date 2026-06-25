# Admin Project And Inventory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build admin CRUD for projects and apartments, atomic CSV/XLSX apartment imports with ImageKit history, and continuous STT across admin tables.

**Architecture:** Add a guarded admin project service around the existing project and apartment repositories. Parse CSV/XLSX into a shared row model, validate the entire batch, persist in one transaction, then upload and record the source file. Add one React admin page that manages projects and the selected project's inventory.

**Tech Stack:** Java 21, Spring Boot 4, JPA, Flyway, Apache Commons CSV, Apache POI, React 19, TanStack Query, Tailwind CSS.

---

### Task 1: Persistence And Dependencies

**Files:**
- Modify: `backend/pom.xml`
- Create: `backend/src/main/resources/db/migration/V8__add_apartment_import_history.sql`
- Create: `backend/src/main/java/com/caovinh/noxh/entity/ApartmentImportHistory.java`
- Create: `backend/src/main/java/com/caovinh/noxh/repository/ApartmentImportHistoryRepository.java`
- Modify: project, apartment, application, and lottery repositories

- [ ] Add Apache Commons CSV and Apache POI dependencies.
- [ ] Add the import-history table and entity.
- [ ] Add repository existence/count methods required for business locks and duplicate detection.
- [ ] Run `mvn -DskipTests package` and confirm compilation.

### Task 2: Project And Apartment DTO Contracts

**Files:**
- Create request DTOs under `backend/src/main/java/com/caovinh/noxh/dto/request/admin/`
- Create response DTOs under `backend/src/main/java/com/caovinh/noxh/dto/response/admin/`
- Modify: `backend/src/main/java/com/caovinh/noxh/exception/ErrorCode.java`

- [ ] Write validation tests for project date ranges, apartment numeric fields, and import error output.
- [ ] Add project create/update, apartment create/update, import result, import error, and import history DTOs.
- [ ] Add explicit error codes for active-project mutation, locked apartment mutation, duplicate apartment code, and invalid import file.

### Task 3: Admin Project Service

**Files:**
- Create: `backend/src/test/java/com/caovinh/noxh/service/admin/AdminProjectServiceTest.java`
- Create: `backend/src/main/java/com/caovinh/noxh/service/admin/AdminProjectService.java`

- [ ] Write failing tests proving active projects cannot be edited or deleted.
- [ ] Write failing tests proving eligible project deletion calls repository delete and apartments cascade.
- [ ] Write failing tests for project image upload and totals recalculation.
- [ ] Implement project list/create/update/delete and apartment CRUD.
- [ ] Verify all service tests pass.

### Task 4: CSV/XLSX Import Service

**Files:**
- Create: `backend/src/test/java/com/caovinh/noxh/service/admin/ApartmentImportServiceTest.java`
- Create: `backend/src/main/java/com/caovinh/noxh/service/admin/ApartmentImportService.java`
- Create: `backend/src/main/java/com/caovinh/noxh/service/admin/ApartmentImportParser.java`

- [ ] Write failing CSV parsing and validation tests.
- [ ] Write failing XLSX parsing and validation tests.
- [ ] Write failing tests for duplicate codes and all-or-nothing persistence.
- [ ] Implement shared row parsing, validation, and transactional persistence.
- [ ] Upload the source file after persistence and save import history.
- [ ] Generate downloadable CSV and XLSX templates.
- [ ] Verify parser and service tests pass.

### Task 5: Admin REST Controller

**Files:**
- Create: `backend/src/test/java/com/caovinh/noxh/controller/admin/AdminProjectControllerTest.java`
- Create: `backend/src/main/java/com/caovinh/noxh/controller/admin/AdminProjectController.java`

- [ ] Write failing controller tests for multipart project creation, blocked mutation, apartment CRUD, and import errors.
- [ ] Implement the admin endpoints from the design spec.
- [ ] Verify controller tests and the backend package.

### Task 6: Frontend Admin Project Management

**Files:**
- Create: `frontend/src/admin/api/adminProjects.ts`
- Create: `frontend/src/admin/pages/AdminProjectsPage.tsx`
- Modify: `frontend/src/admin/layout/AdminLayout.tsx`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/admin/types.ts`

- [ ] Add API types and query/mutation functions.
- [ ] Add the `Du lieu du an` navigation and route.
- [ ] Build project create/edit/delete UI with optional image preview.
- [ ] Build selected-project apartment table and manual CRUD.
- [ ] Build CSV/XLSX import UI, template downloads, and row-error display.
- [ ] Show mutation locks when a project has business activity.

### Task 7: STT And Dashboard Pagination

**Files:**
- Create: `frontend/tests/rowNumber.test.ts`
- Create: `frontend/src/components/common/rowNumber.ts`
- Modify all admin table pages and `frontend/src/admin/pages/AdminDashboardPage.tsx`

- [ ] Write a failing test for continuous row numbering.
- [ ] Implement `getRowNumber(page, pageSize, index)`.
- [ ] Add STT to applications, dashboard recent applications, housing stock, results, audit logs, and the new project/apartment tables.
- [ ] Add dashboard client-side pagination with limits `5/10/20`.

### Task 8: Verification

**Files:**
- Review all changed files.

- [ ] Run focused backend tests.
- [ ] Run `mvn -DskipTests package`.
- [ ] Run frontend Node tests.
- [ ] Run ESLint for changed frontend files.
- [ ] Run `npm run build`.
- [ ] Run `git diff --check`.
