-- init-db.sql
-- Dijalankan otomatis oleh PostgreSQL saat container pertama kali start
-- (docker-entrypoint-initdb.d)

-- Ekstensi
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Selesai: migration sebenarnya dijalankan via npm run migrate
