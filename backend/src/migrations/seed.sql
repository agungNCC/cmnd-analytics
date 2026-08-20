-- ============================================================
-- seed.sql
-- Default users
-- Admin: adminncc / Welcome1!
-- User:  user01 / Welcome1!
-- ============================================================

INSERT INTO users (username, email, password_hash, full_name, role, department, is_active)
VALUES
  (
    'adminncc',
    'adminncc@cimb.local',
    crypt('Welcome1!', gen_salt('bf', 10)),
    'Administrator',
    'admin',
    'IT Department',
    true
  ),
  (
    'user01',
    'user01@cimb.local',
    crypt('Welcome1!', gen_salt('bf', 10)),
    'User',
    'user',
    'Learning & Development',
    true
  )
ON CONFLICT (username) DO UPDATE SET
  email = EXCLUDED.email,
  password_hash = EXCLUDED.password_hash,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  is_active = true,
  updated_at = CURRENT_TIMESTAMP;

UPDATE users
SET is_active = false
WHERE username NOT IN ('adminncc', 'user01');
