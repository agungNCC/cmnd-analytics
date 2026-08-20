-- ============================================================
-- 004_export_jobs.sql
-- Tracking status export XLSX (async via Bull)
-- ============================================================

CREATE TABLE IF NOT EXISTS export_jobs (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by       UUID        NOT NULL REFERENCES users(id),
  filename         VARCHAR(255),
  file_path        TEXT,
  sheets           TEXT[],
  include_formulas BOOLEAN     NOT NULL DEFAULT true,
  filters          JSONB,
  status           VARCHAR(50) NOT NULL DEFAULT 'processing', -- processing | ready | failed
  progress         INT         NOT NULL DEFAULT 0,
  error_message    TEXT,
  created_at       TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at     TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_export_jobs_user   ON export_jobs(created_by);
CREATE INDEX IF NOT EXISTS idx_export_jobs_status ON export_jobs(status);
CREATE INDEX IF NOT EXISTS idx_export_jobs_created ON export_jobs(created_at DESC);
