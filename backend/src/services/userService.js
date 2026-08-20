import bcrypt from 'bcryptjs'
import { query } from '../config/database.js'

/**
 * Cari user berdasarkan login name (username)
 */
export const findByUsername = async (username) => {
  const { rows } = await query(
    'SELECT * FROM users WHERE LOWER(username) = LOWER($1) AND is_active = true',
    [String(username).trim()],
  )
  return rows[0] || null
}

/**
 * Cari user berdasarkan ID
 */
export const findById = async (id) => {
  const { rows } = await query(
    'SELECT id, username, email, full_name, role, department, is_active, created_at FROM users WHERE id = $1',
    [id],
  )
  return rows[0] || null
}

/**
 * Validasi password plain terhadap hash bcrypt
 */
export const validatePassword = async (plain, hash) => {
  return bcrypt.compare(plain, hash)
}

/**
 * Buat user baru
 */
export const createUser = async ({ username, email, password, fullName, role, department }) => {
  const hash = await bcrypt.hash(password, 10)
  const { rows } = await query(
    `INSERT INTO users (username, email, password_hash, full_name, role, department)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, username, email, full_name, role, department, is_active, created_at`,
    [username, email.toLowerCase().trim(), hash, fullName || null, role || 'user', department || null],
  )
  return rows[0]
}

/**
 * Update user (role, is_active, full_name, department)
 */
export const updateUser = async (id, fields) => {
  const allowed = ['full_name', 'role', 'department', 'is_active', 'username']
  const updates = []
  const values  = []
  let   idx     = 1

  for (const key of allowed) {
    if (key in fields) {
      updates.push(`${key} = $${idx}`)
      values.push(fields[key])
      idx++
    }
  }
  if (updates.length === 0) return findById(id)

  updates.push(`updated_at = CURRENT_TIMESTAMP`)
  values.push(id)

  const { rows } = await query(
    `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx}
     RETURNING id, username, email, full_name, role, department, is_active, updated_at`,
    values,
  )
  return rows[0] || null
}

/**
 * Ambil semua users (untuk admin)
 */
export const listUsers = async () => {
  const { rows } = await query(
    'SELECT id, username, email, full_name, role, department, is_active, created_at FROM users ORDER BY created_at DESC',
  )
  return rows
}
