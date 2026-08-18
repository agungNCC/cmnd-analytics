-- ============================================================
-- 002_audit_logs.sql
-- Tabel audit, upload history, export configs
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id            SERIAL       PRIMARY KEY,
  user_id       UUID         NOT NULL REFERENCES users(id),
  username      VARCHAR(100),
  action        VARCHAR(100) NOT NULL,  -- login | logout | upload_started | upload_completed | download | user_created | user_updated | user_deleted
  resource_type VARCHAR(100),           -- file_upload | data_export | user_management
  resource_name VARCHAR(255),           -- nama file atau nama report
  details       JSONB,                  -- { upload_id, rows_processed, file_size, filters_applied, ... }
  status        VARCHAR(50),            -- success | failure | in_progress
  error_message TEXT,
  ip_address    VARCHAR(45),
  user_agent    TEXT,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS upload_history (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by         UUID        NOT NULL REFERENCES users(id),
  upload_date         TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  log_plus_filename   VARCHAR(255),
  log_plus_rows       INT,
  vr_learning_filename VARCHAR(255),
  vr_learning_rows    INT,
  processing_status   VARCHAR(50) NOT NULL DEFAULT 'pending',  -- pending | processing | complete | error
  error_message       TEXT,
  completed_at        TIMESTAMP
);

CREATE TABLE IF NOT EXISTS export_configs (
  id                  SERIAL       PRIMARY KEY,
  config_name         VARCHAR(255) UNIQUE,
  sheets_included     TEXT[],      -- ARRAY['summary_all', 'mandatory_2026', 'log_plus', 'vr_learning']
  include_formulas    BOOLEAN      NOT NULL DEFAULT true,
  include_charts      BOOLEAN      NOT NULL DEFAULT false,
  formula_definitions JSONB,       -- template formula per sheet
  created_by          UUID         REFERENCES users(id),
  created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
