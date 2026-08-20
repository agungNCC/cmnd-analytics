import logger from '../utils/logger.js'

const uniqueConstraintMessage = (err) => {
  const detail = String(err.detail || '')
  if (detail.includes('(email)')) return 'Email already in use by another user'
  if (detail.includes('(username)')) return 'Username already in use by another user'
  return 'A record with the same unique value already exists'
}

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  logger.error(err.message, { stack: err.stack, url: req.url, method: req.method, code: err.code })

  if (err.code === '23505') {
    return res.status(409).json({ error: uniqueConstraintMessage(err) })
  }

  const status = err.status || err.statusCode || 500
  res.status(status).json({
    error: status === 500 ? 'Internal server error' : err.message,
  })
}
