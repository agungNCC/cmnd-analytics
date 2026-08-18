-- ============================================================
-- seed.sql
-- 3 user default untuk development & testing
-- Password: password123
-- ============================================================

INSERT INTO users (username, email, password_hash, full_name, role, department, is_active)
VALUES
  (
    'admin',
    'admin@cimb.local',
    crypt('password123', gen_salt('bf', 10)),
    'Administrator',
    'admin',
    'IT Department',
    true
  ),
  (
    'uploader',
    'uploader@cimb.local',
    crypt('password123', gen_salt('bf', 10)),
    'Data Uploader',
    'uploader',
    'Learning & Development',
    true
  ),
  (
    'viewer',
    'viewer@cimb.local',
    crypt('password123', gen_salt('bf', 10)),
    'Dashboard Viewer',
    'viewer',
    'HR Department',
    true
  )
ON CONFLICT (email) DO NOTHING;
