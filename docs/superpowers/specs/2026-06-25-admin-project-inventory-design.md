# Admin Project And Inventory Management Design

## Goal

Provide an admin workflow to create and manage projects and apartment units without database seed scripts. Admins can add apartments manually or import a validated CSV/XLSX batch, while users see the uploaded project image on the projects page.

## Admin Experience

- Add a `Du lieu du an` item to the admin navigation.
- The page shows a paginated project table with continuous STT numbering.
- Selecting a project opens its apartment inventory with manual create/edit/delete and CSV/XLSX import.
- Project create/edit fields: name, description, location, province, price per square meter, registration dates, lottery date, status, and optional image.
- Project images upload to ImageKit and persist in `projects.image_url`.
- The existing user `/projects` page continues rendering `ProjectResponse.imageUrl`.
- Project edit and delete are disabled once the project has any application or lottery event.
- Deleting an eligible project cascades all apartment units.

## Import Contract

- The admin must create or select one project before importing apartments.
- Supported formats: UTF-8 CSV and XLSX.
- A downloadable template uses these columns:
  `apartment_code,building,block_name,floor,unit_number,area_sqm,bedroom_count,direction,price_per_sqm,total_price,status`.
- `apartment_code`, `area_sqm`, `price_per_sqm`, and `status` are required.
- Allowed status values: `AVAILABLE`, `UNAVAILABLE`.
- Duplicate apartment codes within the file or already stored for the selected project invalidate the whole import.
- Any invalid row invalidates the whole import. The API returns row number, field, and message.
- Database inserts are atomic.
- Only after apartment insertion succeeds is the original file uploaded to ImageKit.
- An import history record stores project, original filename, ImageKit URL, imported count, and timestamp.

## API Design

- `GET /admin/projects`
- `POST /admin/projects` multipart request with JSON project payload and optional image
- `PUT /admin/projects/{projectId}` multipart request with JSON project payload and optional image
- `DELETE /admin/projects/{projectId}`
- `GET /admin/projects/{projectId}/apartments`
- `POST /admin/projects/{projectId}/apartments`
- `PUT /admin/projects/{projectId}/apartments/{apartmentId}`
- `DELETE /admin/projects/{projectId}/apartments/{apartmentId}`
- `POST /admin/projects/{projectId}/apartments/import` multipart file
- `GET /admin/projects/{projectId}/imports`
- `GET /admin/projects/apartments/template.csv`
- `GET /admin/projects/apartments/template.xlsx`

## Data Integrity

- A project is considered to have business activity when at least one application or lottery event references it.
- Business-active projects cannot be edited or deleted.
- Locked or assigned apartment units cannot be edited or deleted.
- Project totals are recalculated from apartment records after create, update, delete, and import.
- Project deletion relies on the existing apartment foreign key cascade but is guarded before deletion.

## Admin Tables

- Add a small `STT` column to applications, recent dashboard applications, housing stock, lottery results, and audit logs.
- STT is continuous across pagination: `page * pageSize + rowIndex + 1`.
- The dashboard recent-applications table gains client-side pagination and limits `5/10/20`.

## Testing

- Service tests cover project business-activity locks, cascade-safe deletion, apartment locks, full-batch validation, duplicate detection, CSV parsing, XLSX parsing, totals recalculation, and ImageKit upload ordering.
- Controller tests cover multipart project requests and import error responses.
- Frontend tests cover continuous STT and import preview helpers.
- Final verification runs backend tests/package plus frontend tests, lint for touched files, and production build.
