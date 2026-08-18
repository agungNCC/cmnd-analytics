-- ============================================================
-- 003_indexes.sql
-- Index untuk performa query
-- ============================================================

-- users
CREATE INDEX IF NOT EXISTS idx_user_email      ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_role       ON users(role);
CREATE INDEX IF NOT EXISTS idx_user_is_active  ON users(is_active);

-- user_sessions
CREATE INDEX IF NOT EXISTS idx_session_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_session_expires ON user_sessions(expires_at);

-- raw_log_plus
CREATE INDEX IF NOT EXISTS idx_raw_log_upload      ON raw_log_plus(upload_id);
CREATE INDEX IF NOT EXISTS idx_raw_log_employee    ON raw_log_plus(employee_id);
CREATE INDEX IF NOT EXISTS idx_raw_log_directorate ON raw_log_plus(directorate);
CREATE INDEX IF NOT EXISTS idx_raw_log_status      ON raw_log_plus(completion_status);

-- raw_vr_learning
CREATE INDEX IF NOT EXISTS idx_raw_vr_upload      ON raw_vr_learning(upload_id);
CREATE INDEX IF NOT EXISTS idx_raw_vr_employee    ON raw_vr_learning(employee_id);
CREATE INDEX IF NOT EXISTS idx_raw_vr_directorate ON raw_vr_learning(directorate);
CREATE INDEX IF NOT EXISTS idx_raw_vr_region      ON raw_vr_learning(region);
CREATE INDEX IF NOT EXISTS idx_raw_vr_status      ON raw_vr_learning(completion_status);

-- processed_mandatory_2026
CREATE INDEX IF NOT EXISTS idx_proc_mandatory_employee    ON processed_mandatory_2026(employee_id);
CREATE INDEX IF NOT EXISTS idx_proc_mandatory_directorate ON processed_mandatory_2026(directorate);
CREATE INDEX IF NOT EXISTS idx_proc_mandatory_status      ON processed_mandatory_2026(overall_status);

-- processed_summary_all
CREATE INDEX IF NOT EXISTS idx_proc_summary_directorate ON processed_summary_all(directorate);

-- audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_user_id  ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action   ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_created  ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_status   ON audit_logs(status);

-- upload_history
CREATE INDEX IF NOT EXISTS idx_upload_by     ON upload_history(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_upload_date   ON upload_history(upload_date DESC);
CREATE INDEX IF NOT EXISTS idx_upload_status ON upload_history(processing_status);
