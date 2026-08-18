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

const MIGRATIONS = [
  '001_init_schema.sql',
  '002_audit_logs.sql',
  '003_indexes.sql',
]

async function runMigrations() {
  const client = await pool.connect()
  try {
    // Tabel tracking migrasi agar tidak dijalankan dua kali
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id         SERIAL      PRIMARY KEY,
        filename   VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)

    for (const filename of MIGRATIONS) {
      const { rows } = await client.query(
        'SELECT id FROM _migrations WHERE filename = $1',
        [filename],
      )
      if (rows.length > 0) {
        console.log(`  ⏭  Skipping ${filename} (already applied)`)
        continue
      }

      const filePath = path.join(__dirname, filename)
      const sql = await readFile(filePath, 'utf8')

      await client.query('BEGIN')
      try {
        await client.query(sql)
        await client.query(
          'INSERT INTO _migrations (filename) VALUES ($1)',
          [filename],
        )
        await client.query('COMMIT')
        console.log(`  ✅  Applied ${filename}`)
      } catch (err) {
        await client.query('ROLLBACK')
        throw new Error(`Migration ${filename} failed: ${err.message}`)
      }
    }

    console.log('\nAll migrations complete.')
  } finally {
    client.release()
    await pool.end()
  }
}

runMigrations().catch((err) => {
  console.error('\n❌  Migration error:', err.message)
  process.exit(1)
})
