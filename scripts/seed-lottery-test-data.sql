BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

INSERT INTO projects (
    name,
    description,
    location,
    province,
    total_units,
    available_units,
    price_per_sqm,
    min_area,
    max_area,
    registration_start,
    registration_end,
    lottery_date,
    status,
    created_at,
    updated_at
)
SELECT
    'Lottery Test - 200 Ho So / 80 Can Ho',
    'Du lieu test quay so NOXH: 200 ho so, 30 ho so uu tien, 80 can ho.',
    'Khu test quay so NOXH',
    'Ha Noi',
    80,
    80,
    16000000,
    45.0,
    60.0,
    CURRENT_DATE - 10,
    CURRENT_DATE + 20,
    now() + INTERVAL '7 days',
    'OPEN',
    now(),
    now()
WHERE NOT EXISTS (
    SELECT 1
    FROM projects
    WHERE name = 'Lottery Test - 200 Ho So / 80 Can Ho'
);

WITH target_project AS (
    SELECT id
    FROM projects
    WHERE name = 'Lottery Test - 200 Ho So / 80 Can Ho'
    ORDER BY created_at
    LIMIT 1
)
UPDATE projects p
SET
    total_units = 80,
    available_units = 80,
    price_per_sqm = 16000000,
    min_area = 45.0,
    max_area = 60.0,
    status = 'OPEN',
    updated_at = now()
FROM target_project tp
WHERE p.id = tp.id;

WITH target_project AS (
    SELECT id
    FROM projects
    WHERE name = 'Lottery Test - 200 Ho So / 80 Can Ho'
    ORDER BY created_at
    LIMIT 1
),
seed AS (
    SELECT generate_series(1, 200) AS n
)
INSERT INTO users (
    full_name,
    email,
    phone_number,
    cccd_number,
    password,
    date_of_birth,
    gender,
    permanent_address,
    current_address,
    province,
    district,
    ward,
    occupation,
    priority_category,
    role,
    is_verified,
    is_active,
    kyc_status,
    created_at,
    updated_at
)
SELECT
    'Lottery Test User ' || lpad(n::text, 3, '0'),
    'lotterytest' || lpad(n::text, 3, '0') || '@noxh.local',
    '0909' || lpad(n::text, 6, '0'),
    '8' || lpad(n::text, 11, '0'),
    crypt('Test@123456', gen_salt('bf', 10)),
    DATE '1990-01-01' + (n % 8000),
    CASE WHEN n % 2 = 0 THEN 'MALE' ELSE 'FEMALE' END,
    'Dia chi thuong tru test ' || n,
    'Dia chi hien tai test ' || n,
    'Ha Noi',
    'Dong Anh',
    'Xa Test',
    CASE WHEN n % 3 = 0 THEN 'Cong nhan' WHEN n % 3 = 1 THEN 'Nhan vien van phong' ELSE 'Giao vien' END,
    CASE WHEN n <= 30 THEN 'Nguoi co cong voi cach mang' ELSE 'Khong' END,
    'USER',
    TRUE,
    TRUE,
    'VERIFIED',
    now(),
    now()
FROM seed
ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone_number = EXCLUDED.phone_number,
    cccd_number = EXCLUDED.cccd_number,
    password = EXCLUDED.password,
    date_of_birth = EXCLUDED.date_of_birth,
    gender = EXCLUDED.gender,
    permanent_address = EXCLUDED.permanent_address,
    current_address = EXCLUDED.current_address,
    province = EXCLUDED.province,
    district = EXCLUDED.district,
    ward = EXCLUDED.ward,
    occupation = EXCLUDED.occupation,
    priority_category = EXCLUDED.priority_category,
    role = EXCLUDED.role,
    is_verified = EXCLUDED.is_verified,
    is_active = EXCLUDED.is_active,
    kyc_status = EXCLUDED.kyc_status,
    updated_at = now();

WITH target_project AS (
    SELECT id
    FROM projects
    WHERE name = 'Lottery Test - 200 Ho So / 80 Can Ho'
    ORDER BY created_at
    LIMIT 1
),
seed AS (
    SELECT generate_series(1, 200) AS n
),
test_users AS (
    SELECT
        u.id AS user_id,
        s.n
    FROM seed s
    JOIN users u ON u.email = 'lotterytest' || lpad(s.n::text, 3, '0') || '@noxh.local'
)
UPDATE applications a
SET
    project_id = tp.id,
    status = 'APPROVED',
    updated_at = now()
FROM test_users tu
CROSS JOIN target_project tp
WHERE a.user_id = tu.user_id
  AND a.project_id <> tp.id
  AND NOT EXISTS (
      SELECT 1
      FROM applications existing
      WHERE existing.user_id = a.user_id
        AND existing.project_id = tp.id
  )
  AND NOT EXISTS (
      SELECT 1
      FROM lottery_participant participant
      WHERE participant.application_id = a.id
  );

WITH target_project AS (
    SELECT id
    FROM projects
    WHERE name = 'Lottery Test - 200 Ho So / 80 Can Ho'
    ORDER BY created_at
    LIMIT 1
),
seed AS (
    SELECT generate_series(1, 200) AS n
),
test_users AS (
    SELECT
        u.id AS user_id,
        s.n
    FROM seed s
    JOIN users u ON u.email = 'lotterytest' || lpad(s.n::text, 3, '0') || '@noxh.local'
)
INSERT INTO applications (
    user_id,
    project_id,
    status,
    priority_score,
    lottery_number,
    province,
    district,
    ward,
    detailed_address,
    household_size,
    priority_category,
    income_per_month,
    tax_code,
    lottery_result,
    submitted_at,
    created_at,
    updated_at
)
SELECT
    tu.user_id,
    tp.id,
    'APPROVED',
    CASE WHEN tu.n <= 30 THEN 100 ELSE 0 END,
    NULL,
    'Ha Noi',
    'Dong Anh',
    'Xa Test',
    'Can ho test seed - ho so ' || lpad(tu.n::text, 3, '0'),
    NULL,
    CASE WHEN tu.n <= 30 THEN 'Nguoi co cong voi cach mang' ELSE 'Khong' END,
    NULL,
    'TAX' || lpad(tu.n::text, 9, '0'),
    NULL,
    now(),
    now(),
    now()
FROM test_users tu
CROSS JOIN target_project tp
ON CONFLICT (user_id, project_id) DO UPDATE SET
    status = 'APPROVED',
    priority_score = EXCLUDED.priority_score,
    lottery_number = NULL,
    province = EXCLUDED.province,
    district = EXCLUDED.district,
    ward = EXCLUDED.ward,
    detailed_address = EXCLUDED.detailed_address,
    household_size = NULL,
    priority_category = EXCLUDED.priority_category,
    income_per_month = NULL,
    tax_code = EXCLUDED.tax_code,
    lottery_result = NULL,
    submitted_at = now(),
    updated_at = now();

WITH target_project AS (
    SELECT id
    FROM projects
    WHERE name = 'Lottery Test - 200 Ho So / 80 Can Ho'
    ORDER BY created_at
    LIMIT 1
)
UPDATE apartment_unit au
SET
    project_id = tp.id,
    apartment_code = replace(au.apartment_code, 'TEST-GS-B-', 'TEST-LT-'),
    status = 'AVAILABLE',
    locked_event_id = NULL,
    assigned_result_id = NULL,
    updated_at = now()
FROM target_project tp
WHERE au.apartment_code LIKE 'TEST-GS-B-%'
  AND NOT EXISTS (
      SELECT 1
      FROM apartment_unit existing
      WHERE existing.project_id = tp.id
        AND existing.apartment_code = replace(au.apartment_code, 'TEST-GS-B-', 'TEST-LT-')
  );

WITH target_project AS (
    SELECT id
    FROM projects
    WHERE name = 'Lottery Test - 200 Ho So / 80 Can Ho'
    ORDER BY created_at
    LIMIT 1
),
seed AS (
    SELECT
        generate_series(1, 80) AS n
),
units AS (
    SELECT
        n,
        ((n - 1) / 8 + 1) AS floor_no,
        ((n - 1) % 8 + 1) AS unit_no
    FROM seed
)
INSERT INTO apartment_unit (
    project_id,
    apartment_code,
    building,
    block_name,
    floor,
    unit_number,
    area_sqm,
    bedroom_count,
    direction,
    price_per_sqm,
    total_price,
    status,
    locked_event_id,
    assigned_result_id,
    created_at,
    updated_at
)
SELECT
    tp.id,
    'TEST-LT-' || lpad(u.floor_no::text, 2, '0') || lpad(u.unit_no::text, 2, '0'),
    'Lottery Test',
    'LT',
    u.floor_no,
    lpad(u.unit_no::text, 2, '0'),
    CASE
        WHEN u.unit_no IN (1, 2) THEN 45.50
        WHEN u.unit_no IN (3, 4, 5) THEN 52.00
        ELSE 60.00
    END,
    CASE WHEN u.unit_no IN (1, 2) THEN 1 ELSE 2 END,
    CASE
        WHEN u.unit_no % 4 = 1 THEN 'Dong Nam'
        WHEN u.unit_no % 4 = 2 THEN 'Tay Bac'
        WHEN u.unit_no % 4 = 3 THEN 'Dong Bac'
        ELSE 'Tay Nam'
    END,
    16000000,
    CASE
        WHEN u.unit_no IN (1, 2) THEN 728000000
        WHEN u.unit_no IN (3, 4, 5) THEN 832000000
        ELSE 960000000
    END,
    'AVAILABLE',
    NULL,
    NULL,
    now(),
    now()
FROM units u
CROSS JOIN target_project tp
ON CONFLICT (project_id, apartment_code) DO UPDATE SET
    building = EXCLUDED.building,
    block_name = EXCLUDED.block_name,
    floor = EXCLUDED.floor,
    unit_number = EXCLUDED.unit_number,
    area_sqm = EXCLUDED.area_sqm,
    bedroom_count = EXCLUDED.bedroom_count,
    direction = EXCLUDED.direction,
    price_per_sqm = EXCLUDED.price_per_sqm,
    total_price = EXCLUDED.total_price,
    status = 'AVAILABLE',
    locked_event_id = NULL,
    assigned_result_id = NULL,
    updated_at = now();

WITH target_project AS (
    SELECT id
    FROM projects
    WHERE name = 'Lottery Test - 200 Ho So / 80 Can Ho'
    ORDER BY created_at
    LIMIT 1
)
UPDATE projects p
SET
    total_units = GREATEST(COALESCE(total_units, 0), 80),
    available_units = GREATEST(COALESCE(available_units, 0), 80),
    updated_at = now()
FROM target_project tp
WHERE p.id = tp.id;

COMMIT;
