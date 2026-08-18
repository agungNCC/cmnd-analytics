import 'dotenv/config'
import { readFile } from 'fs/promises'
import { fileURLToPath } from 'url'
import path from 'path'
import pg from 'pg'

const { Pool } = pg
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432'),
  user:     process.env.DB_USER     || 'vr_learning',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME     || 'vr_learning_db',
})

async function seedUsers() {
  const client = await pool.connect()
  try {
    const seedPath = path.join(__dirname, '../migrations/seed.sql')
    const sql = await readFile(seedPath, 'utf8')

    await client.query(sql)
    console.log('✅  Seed users complete:')
    console.log('     admin@cimb.local    / password123  [admin]')
    console.log('     uploader@cimb.local / password123  [uploader]')
    console.log('     viewer@cimb.local   / password123  [viewer]')

    const { rows } = await client.query(
      'SELECT email, role, is_active FROM users ORDER BY role',
    )
    console.log('\nCurrent users in DB:')
    rows.forEach((r) => console.log(`  • ${r.email} (${r.role}) active=${r.is_active}`))
  } finally {
    client.release()
    await pool.end()
  }
}

seedUsers().catch((err) => {
  console.error('❌  Seed error:', err.message)
  process.exit(1)
})
