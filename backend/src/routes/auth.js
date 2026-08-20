import { Router }  from 'express'
import jwt          from 'jsonwebtoken'
import { findByUsername, findById, validatePassword } from '../services/userService.js'
import { logAudit } from '../services/audit.js'
import { verifyToken } from '../middleware/auth.js'

const router = Router()

const COOKIE_OPTS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge:   24 * 60 * 60 * 1000, // 24 jam
}

const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' },
  )

// ==================== POST /api/auth/login ====================
router.post('/login', async (req, res, next) => {
  const { username, login_name, password } = req.body
  const loginName = username || login_name

  if (!loginName || !password) {
    return res.status(400).json({ error: 'Login name and password are required' })
  }

  try {
    const user = await findByUsername(loginName)
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const valid = await validatePassword(password, user.password_hash)
    if (!valid) {
      await logAudit({
        userId: user.id, username: user.username,
        action: 'login', status: 'failure',
        details: { reason: 'wrong_password' },
        ipAddress: req.ip, userAgent: req.headers['user-agent'],
      })
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = signToken(user)
    res.cookie('auth_token', token, COOKIE_OPTS)

    await logAudit({
      userId: user.id, username: user.username,
      action: 'login', status: 'success',
      ipAddress: req.ip, userAgent: req.headers['user-agent'],
    })

    return res.json({
      token,
      user: {
        id:         user.id,
        username:   user.username,
        email:      user.email,
        full_name:  user.full_name,
        role:       user.role,
        department: user.department,
      },
    })
  } catch (err) {
    next(err)
  }
})

// ==================== POST /api/auth/logout ====================
router.post('/logout', verifyToken, async (req, res, next) => {
  try {
    res.clearCookie('auth_token')

    await logAudit({
      userId: req.user.id, username: req.user.username,
      action: 'logout', status: 'success',
      ipAddress: req.ip, userAgent: req.headers['user-agent'],
    })

    return res.json({ message: 'Logged out successfully' })
  } catch (err) {
    next(err)
  }
})

// ==================== GET /api/auth/me ====================
router.get('/me', verifyToken, async (req, res, next) => {
  try {
    const user = await findById(req.user.id)
    if (!user) return res.status(404).json({ error: 'User not found' })
    return res.json({ user })
  } catch (err) {
    next(err)
  }
})

// ==================== POST /api/auth/refresh ====================
router.post('/refresh', verifyToken, async (req, res, next) => {
  try {
    const user = await findById(req.user.id)
    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'User not found or inactive' })
    }

    const token = signToken(user)
    res.cookie('auth_token', token, COOKIE_OPTS)
    return res.json({ token })
  } catch (err) {
    next(err)
  }
})

export default router
