import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

export const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432'),
  user:     process.env.DB_USER     || 'vr_learning',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME     || 'vr_learning_db',
  max:      parseInt(process.env.DB_POOL_MAX || '20'),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err)
})

export const query = (text, params) => pool.query(text, params)
