import 'dotenv/config'
import bcrypt from 'bcryptjs'
import pg from 'pg'

const { Pool } = pg

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432'),
  user:     process.env.DB_USER     || 'vr_learning',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME     || 'vr_learning_db',
})

const DEFAULT_USERS = [
  {
    username: 'adminncc',
    email: 'adminncc@cimb.local',
    password: 'Welcome1!',
    fullName: 'Administrator',
    role: 'admin',
    department: 'IT Department',
  },
  {
    username: 'user01',
    email: 'user01@cimb.local',
    password: 'Welcome1!',
    fullName: 'User',
    role: 'user',
    department: 'Learning & Development',
  },
]

async function seedUsers() {
  const client = await pool.connect()
  try {
    for (const user of DEFAULT_USERS) {
      const hash = await bcrypt.hash(user.password, 10)
      await client.query(
        `INSERT INTO users (username, email, password_hash, full_name, role, department, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, true)
         ON CONFLICT (username) DO UPDATE SET
           email = EXCLUDED.email,
           password_hash = EXCLUDED.password_hash,
           full_name = EXCLUDED.full_name,
           role = EXCLUDED.role,
           department = EXCLUDED.department,
           is_active = true,
           updated_at = CURRENT_TIMESTAMP`,
        [user.username, user.email, hash, user.fullName, user.role, user.department],
      )
    }

    await client.query(
      `UPDATE users SET is_active = false WHERE username NOT IN ('adminncc', 'user01')`,
    )

    console.log('✅  Seed users complete:')
    console.log('     adminncc / Welcome1!  [admin]')
    console.log('     user01   / Welcome1!  [user]')

    const { rows } = await client.query(
      'SELECT username, role, is_active FROM users ORDER BY role, username',
    )
    console.log('\nCurrent users in DB:')
    rows.forEach((r) => console.log(`  • ${r.username} (${r.role}) active=${r.is_active}`))
  } finally {
    client.release()
    await pool.end()
  }
}

seedUsers().catch((err) => {
  console.error('❌  Seed error:', err.message)
  process.exit(1)
})
