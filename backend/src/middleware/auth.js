import jwt from 'jsonwebtoken'

/**
 * Verifikasi JWT dari Authorization header ATAU httpOnly cookie.
 * Menyimpan decoded payload ke req.user.
 */
export const verifyToken = (req, res, next) => {
  const token =
    req.headers.authorization?.split(' ')[1] ||
    req.cookies?.auth_token

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: no token provided' })
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    return res.status(403).json({ error: 'Forbidden: invalid or expired token' })
  }
}

/**
 * Pastikan req.user.role ada di daftar role yang diizinkan.
 * Gunakan setelah verifyToken.
 *
 * Contoh: requireRole('admin', 'user')
 */
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden: insufficient permissions' })
  }
  next()
}
