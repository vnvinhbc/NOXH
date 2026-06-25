CREATE TABLE apartment_import_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    original_file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    imported_count INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_apartment_import_history_project_created
    ON apartment_import_history(project_id, created_at DESC);
