CREATE TABLE priority_tag (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(80) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE application_priority_tag (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    priority_tag_id UUID NOT NULL REFERENCES priority_tag(id),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE(application_id, priority_tag_id)
);

CREATE TABLE apartment_unit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    apartment_code VARCHAR(80) NOT NULL,
    building VARCHAR(80),
    block_name VARCHAR(80),
    floor INT,
    unit_number VARCHAR(40),
    area_sqm NUMERIC(10, 2),
    bedroom_count INT,
    direction VARCHAR(100),
    price_per_sqm BIGINT,
    total_price BIGINT,
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    locked_event_id UUID,
    assigned_result_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE(project_id, apartment_code)
);

CREATE INDEX idx_apartment_unit_project_status ON apartment_unit(project_id, status);

CREATE TABLE lottery_event (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id),
    name VARCHAR(255) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'CREATED',
    algorithm_type VARCHAR(80) NOT NULL DEFAULT 'NOXH_COMMIT_REVEAL_V1',
    private_salt TEXT,
    commitment_hash VARCHAR(64),
    participant_hash VARCHAR(64),
    apartment_hash VARCHAR(64),
    xsmb_draw_date DATE,
    xsmb_result TEXT,
    eth_chain_id BIGINT,
    eth_block_number BIGINT,
    eth_block_hash VARCHAR(66),
    seed_source_note TEXT,
    clicked_timestamp TIMESTAMP,
    final_seed VARCHAR(64),
    sorted_normal_hash VARCHAR(64),
    sorted_winner_hash VARCHAR(64),
    sorted_apartment_hash VARCHAR(64),
    assignment_list_hash VARCHAR(64),
    result_hash VARCHAR(64),
    failed_reason TEXT,
    locked_at TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_lottery_event_project ON lottery_event(project_id);
CREATE INDEX idx_lottery_event_status ON lottery_event(status);

ALTER TABLE apartment_unit
    ADD CONSTRAINT fk_apartment_unit_locked_event
    FOREIGN KEY (locked_event_id) REFERENCES lottery_event(id);

CREATE TABLE lottery_participant (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES lottery_event(id) ON DELETE CASCADE,
    application_id UUID NOT NULL REFERENCES applications(id),
    lottery_code VARCHAR(80) NOT NULL,
    pool_type VARCHAR(30) NOT NULL,
    priority_tags TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE(event_id, application_id),
    UNIQUE(event_id, lottery_code)
);

CREATE INDEX idx_lottery_participant_event_pool ON lottery_participant(event_id, pool_type);

CREATE TABLE lottery_job (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lottery_event_id UUID NOT NULL REFERENCES lottery_event(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL DEFAULT 'QUEUED',
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    UNIQUE(lottery_event_id)
);

CREATE TABLE lottery_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES lottery_event(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES lottery_participant(id),
    lottery_code VARCHAR(80) NOT NULL,
    pool_type VARCHAR(30) NOT NULL,
    result_type VARCHAR(30) NOT NULL,
    normal_random_value VARCHAR(64),
    winner_unit_hash VARCHAR(64),
    apartment_id UUID REFERENCES apartment_unit(id),
    apartment_code VARCHAR(80),
    unit_random_value VARCHAR(64),
    draw_order INT,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE(event_id, participant_id)
);

CREATE INDEX idx_lottery_result_event ON lottery_result(event_id);
CREATE INDEX idx_lottery_result_event_type ON lottery_result(event_id, result_type);

ALTER TABLE apartment_unit
    ADD CONSTRAINT fk_apartment_unit_assigned_result
    FOREIGN KEY (assigned_result_id) REFERENCES lottery_result(id);

CREATE TABLE lottery_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES lottery_event(id) ON DELETE CASCADE,
    event_type VARCHAR(80) NOT NULL,
    payload TEXT,
    previous_hash VARCHAR(64),
    current_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_lottery_audit_log_event_created ON lottery_audit_log(event_id, created_at);

INSERT INTO priority_tag (code, name, description)
VALUES
    ('REVOLUTION_CONTRIBUTOR', 'Nguoi co cong', 'Nhom doi tuong co cong voi cach mang'),
    ('LOW_INCOME', 'Thu nhap thap', 'Nhom nguoi thu nhap thap'),
    ('DISABLED', 'Nguoi khuyet tat', 'Nhom nguoi khuyet tat')
ON CONFLICT (code) DO NOTHING;

INSERT INTO apartment_unit (
    project_id, apartment_code, building, block_name, floor, unit_number,
    area_sqm, bedroom_count, direction, price_per_sqm, total_price, status
)
SELECT p.id, seed.apartment_code, seed.building, seed.block_name, seed.floor, seed.unit_number,
       seed.area_sqm, seed.bedroom_count, seed.direction, seed.price_per_sqm, seed.total_price, 'AVAILABLE'
FROM projects p
CROSS JOIN (
    VALUES
        ('GS-B-0101', 'Green Sky', 'B', 1, '0101', 45.50, 1, 'Dong Nam', 16000000, 728000000),
        ('GS-B-0102', 'Green Sky', 'B', 1, '0102', 52.00, 2, 'Tay Bac', 16000000, 832000000),
        ('GS-B-0103', 'Green Sky', 'B', 1, '0103', 60.00, 2, 'Dong Bac', 16500000, 990000000),
        ('GS-B-0201', 'Green Sky', 'B', 2, '0201', 45.50, 1, 'Dong Nam', 16000000, 728000000),
        ('GS-B-0202', 'Green Sky', 'B', 2, '0202', 52.00, 2, 'Tay Bac', 16000000, 832000000),
        ('GS-B-0203', 'Green Sky', 'B', 2, '0203', 60.00, 2, 'Dong Bac', 16500000, 990000000),
        ('GS-B-0301', 'Green Sky', 'B', 3, '0301', 45.50, 1, 'Dong Nam', 16000000, 728000000),
        ('GS-B-0302', 'Green Sky', 'B', 3, '0302', 52.00, 2, 'Tay Bac', 16000000, 832000000),
        ('GS-B-0303', 'Green Sky', 'B', 3, '0303', 60.00, 2, 'Dong Bac', 16500000, 990000000),
        ('GS-B-0401', 'Green Sky', 'B', 4, '0401', 45.50, 1, 'Dong Nam', 16000000, 728000000),
        ('GS-B-0402', 'Green Sky', 'B', 4, '0402', 52.00, 2, 'Tay Bac', 16000000, 832000000),
        ('GS-B-0403', 'Green Sky', 'B', 4, '0403', 60.00, 2, 'Dong Bac', 16500000, 990000000)
) AS seed(apartment_code, building, block_name, floor, unit_number, area_sqm, bedroom_count, direction, price_per_sqm, total_price)
WHERE p.name = 'Green Sky - Block B'
ON CONFLICT (project_id, apartment_code) DO NOTHING;
