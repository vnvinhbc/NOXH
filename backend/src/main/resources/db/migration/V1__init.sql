CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE,
    cccd_number VARCHAR(20) UNIQUE,
    password VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10),
    permanent_address TEXT,
    current_address TEXT,
    province VARCHAR(100),
    district VARCHAR(100),
    ward VARCHAR(100),
    occupation VARCHAR(255),
    income_per_month BIGINT,
    household_size INT,
    priority_category VARCHAR(100),
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    kyc_status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    province VARCHAR(100),
    total_units INT,
    available_units INT,
    price_per_sqm BIGINT,
    min_area DOUBLE PRECISION,
    max_area DOUBLE PRECISION,
    registration_start DATE,
    registration_end DATE,
    lottery_date TIMESTAMP,
    status VARCHAR(30) DEFAULT 'OPEN',
    image_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    project_id UUID NOT NULL REFERENCES projects(id),
    status VARCHAR(30) DEFAULT 'DRAFT',
    priority_score INT DEFAULT 0,
    lottery_number VARCHAR(20),
    province VARCHAR(100),
    district VARCHAR(100),
    ward VARCHAR(100),
    detailed_address TEXT,
    household_size INT,
    priority_category VARCHAR(100),
    income_per_month BIGINT,
    tax_code VARCHAR(20),
    lottery_result VARCHAR(30),
    submitted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE(user_id, project_id)
);

CREATE TABLE application_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id),
    document_type VARCHAR(50) NOT NULL,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    status VARCHAR(20) DEFAULT 'UPLOADED',
    uploaded_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    type VARCHAR(30),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

INSERT INTO projects (name, description, location, province, total_units, available_units, price_per_sqm, min_area, max_area, registration_start, registration_end, lottery_date, status)
VALUES (
    'Green Sky - Block B',
    'Dự án nhà ở xã hội Green Sky tọa lạc tại Khu đô thị mới Đông Anh, kết nối trực tiếp với trục Nhật Tân - Nội Bài.',
    'Khu đô thị mới Đông Anh, Hà Nội',
    'Hà Nội',
    1200,
    1200,
    16000000,
    45.0,
    75.0,
    '2024-10-15',
    '2024-11-30',
    '2024-12-20 09:00:00',
    'OPEN'
);
