-- ============================================================
-- 006_reference_files.sql
-- Menyimpan metadata file referensi aktif (MC & Mandatory NIP)
-- ============================================================

CREATE TABLE IF NOT EXISTS reference_files (
  id            SERIAL       PRIMARY KEY,
  file_type     VARCHAR(50)  NOT NULL UNIQUE,  -- 'mc' | 'mandatory_nip'
  original_name VARCHAR(255) NOT NULL,
  file_path     TEXT         NOT NULL,
  -- MC: sheet name derived from A1 (e.g. "MC Jul 26")
  sheet_name    VARCHAR(100),
  -- MC: A1 title (e.g. "Monthly Closing Jul 2026")
  sheet_title   VARCHAR(255),
  -- Mandatory NIP: sheet name (e.g. "Mandatory 2026")
  nip_sheet_name VARCHAR(100),
  -- row count
  row_count     INT,
  uploaded_by   UUID         REFERENCES users(id),
  uploaded_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
