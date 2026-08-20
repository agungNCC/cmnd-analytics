-- ============================================================
-- 008_export_settings.sql
-- Singleton export configuration (admin-managed)
-- ============================================================

CREATE TABLE IF NOT EXISTS export_settings (
  id               INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  sheets           TEXT[] NOT NULL DEFAULT ARRAY['mandatory_2026', 'log_plus', 'vr_learning'],
  include_formulas BOOLEAN NOT NULL DEFAULT true,
  updated_by       UUID REFERENCES users(id),
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO export_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
