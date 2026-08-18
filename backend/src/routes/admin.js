import { Router } from 'express'
import { query } from '../config/database.js'
import { requireRole, verifyToken } from '../middleware/auth.js'
import { createUser, findById, listUsers, updateUser } from '../services/userService.js'
import { logAudit } from '../services/audit.js'

const router = Router()

const VALID_ROLES = ['admin', 'uploader', 'viewer']

router.use(verifyToken)
router.use(requireRole('admin'))

// GET /api/admin/users
router.get('/users', async (_req, res, next) => {
  try {
    const users = await listUsers()
    return res.json(users)
  } catch (err) {
    next(err)
  }
})

// POST /api/admin/users
router.post('/users', async (req, res, next) => {
  try {
    const { username, email, password, role, full_name, department } = req.body || {}

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'username, email, and password are required' })
    }
    if (role && !VALID_ROLES.includes(role)) {
      return res.status(400).json({ error: `role must be one of: ${VALID_ROLES.join(', ')}` })
    }

    const user = await createUser({
      username,
      email,
      password,
      fullName: full_name,
      role,
      department,
    })

    await logAudit({
      userId: req.user.id,
      username: req.user.username,
      action: 'user_created',
      resourceType: 'user_management',
      resourceName: user.email,
      status: 'success',
      details: { created_user_id: user.id, role: user.role },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    })

    return res.status(201).json(user)
  } catch (err) {
    next(err)
  }
})

// PUT /api/admin/users/:id
router.put('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const payload = {}
    const { username, full_name, role, department, is_active } = req.body || {}

    if (role !== undefined) {
      if (!VALID_ROLES.includes(role)) {
        return res.status(400).json({ error: `role must be one of: ${VALID_ROLES.join(', ')}` })
      }
      payload.role = role
    }
    if (username !== undefined) payload.username = username
    if (full_name !== undefined) payload.full_name = full_name
    if (department !== undefined) payload.department = department
    if (is_active !== undefined) payload.is_active = Boolean(is_active)

    const existing = await findById(id)
    if (!existing) {
      return res.status(404).json({ error: 'User not found' })
    }

    const updated = await updateUser(id, payload)
    await logAudit({
      userId: req.user.id,
      username: req.user.username,
      action: 'user_updated',
      resourceType: 'user_management',
      resourceName: updated.email,
      status: 'success',
      details: { updated_user_id: id, changes: payload },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    })

    return res.json(updated)
  } catch (err) {
    next(err)
  }
})

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params

    if (id === req.user.id) {
      return res.status(400).json({ error: 'Cannot deactivate your own account' })
    }

    const existing = await findById(id)
    if (!existing) {
      return res.status(404).json({ error: 'User not found' })
    }

    const updated = await updateUser(id, { is_active: false })
    await logAudit({
      userId: req.user.id,
      username: req.user.username,
      action: 'user_deleted',
      resourceType: 'user_management',
      resourceName: updated.email,
      status: 'success',
      details: { deactivated_user_id: id },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    })

    return res.json({ message: 'User deactivated successfully' })
  } catch (err) {
    next(err)
  }
})

// GET /api/admin/audit-logs?action=upload&user_id=...&from=2026-01-01&to=2026-01-31
router.get('/audit-logs', async (req, res, next) => {
  try {
    const { action, user_id, from, to, status } = req.query
    const clauses = []
    const values = []

    if (action) {
      clauses.push(`action ILIKE $${values.length + 1}`)
      values.push(`%${action}%`)
    }
    if (user_id) {
      clauses.push(`user_id = $${values.length + 1}`)
      values.push(user_id)
    }
    if (status) {
      clauses.push(`status ILIKE $${values.length + 1}`)
      values.push(`%${status}%`)
    }
    if (from) {
      clauses.push(`created_at >= $${values.length + 1}`)
      values.push(from)
    }
    if (to) {
      clauses.push(`created_at <= $${values.length + 1}`)
      values.push(`${to} 23:59:59`)
    }

    const whereSql = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
    const { rows } = await query(
      `SELECT
         id,
         user_id,
         username,
         action,
         resource_type,
         resource_name,
         details,
         status,
         error_message,
         ip_address,
         user_agent,
         created_at
       FROM audit_logs
       ${whereSql}
       ORDER BY created_at DESC
       LIMIT 500`,
      values,
    )

    return res.json(rows)
  } catch (err) {
    next(err)
  }
})

export default router
