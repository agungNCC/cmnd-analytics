-- ============================================================
-- 001_init_schema.sql
-- Tabel utama: auth, raw data, processed data
-- ============================================================

-- Ekstensi
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==================== AUTH ====================

CREATE TABLE IF NOT EXISTS users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  username      VARCHAR(100) UNIQUE NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(255),
  role          VARCHAR(50)  NOT NULL DEFAULT 'viewer',  -- admin | uploader | viewer
  department    VARCHAR(255),
  is_active     BOOLEAN      NOT NULL DEFAULT true,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_sessions (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP   NOT NULL,
  created_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==================== RAW DATA ====================

CREATE TABLE IF NOT EXISTS raw_log_plus (
  id                    SERIAL      PRIMARY KEY,
  upload_id             UUID        NOT NULL,
  employee_id           VARCHAR(50),
  employee_name         VARCHAR(255),
  directorate           VARCHAR(255),
  sub_directorate       VARCHAR(255),
  course_name           VARCHAR(255),
  completion_status     VARCHAR(50),
  completion_percentage DECIMAL(5,2),
  completion_date       TIMESTAMP,
  score                 INT,
  created_at            TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS raw_vr_learning (
  id                SERIAL      PRIMARY KEY,
  upload_id         UUID        NOT NULL,
  employee_id       VARCHAR(50),
  employee_name     VARCHAR(255),
  directorate       VARCHAR(255),
  sub_directorate   VARCHAR(255),
  region            VARCHAR(100),
  branch            VARCHAR(255),
  forward_30_score  INT,
  completion_time   VARCHAR(50),
  completion_status VARCHAR(50),
  created_at        TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==================== PROCESSED DATA ====================

CREATE TABLE IF NOT EXISTS processed_mandatory_2026 (
  id                        SERIAL       PRIMARY KEY,
  employee_id               VARCHAR(50)  UNIQUE,
  employee_name             VARCHAR(255),
  directorate               VARCHAR(255),
  sub_directorate           VARCHAR(255),
  hire_date                 DATE,
  email                     VARCHAR(255),
  -- LOG+
  log_plus_status           VARCHAR(50),
  log_plus_completion       DECIMAL(5,2),
  log_plus_last_updated     TIMESTAMP,
  -- VR Learning
  vr_learning_status        VARCHAR(50),
  vr_learning_completion    DECIMAL(5,2),
  vr_learning_last_updated  TIMESTAMP,
  -- Overall (dihitung via ETL)
  overall_status            VARCHAR(50),
  overall_completion        DECIMAL(5,2),
  last_processed            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS processed_summary_all (
  id                          SERIAL       PRIMARY KEY,
  directorate                 VARCHAR(255) UNIQUE,
  total_employees             INT          DEFAULT 0,
  -- LOG+
  log_plus_completed          INT          DEFAULT 0,
  log_plus_incompleted        INT          DEFAULT 0,
  log_plus_completion_rate    DECIMAL(5,2) DEFAULT 0,
  -- VR Learning
  vr_learning_completed       INT          DEFAULT 0,
  vr_learning_incompleted     INT          DEFAULT 0,
  vr_learning_completion_rate DECIMAL(5,2) DEFAULT 0,
  -- Combined
  combined_completed          INT          DEFAULT 0,
  combined_incompleted        INT          DEFAULT 0,
  combined_completion_rate    DECIMAL(5,2) DEFAULT 0,
  last_processed              TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
