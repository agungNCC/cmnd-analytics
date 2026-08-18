import jwt from 'jsonwebtoken'

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
    || req.cookies?.auth_token

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

export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ error: 'Forbidden: insufficient permissions' })
  }
  next()
}
