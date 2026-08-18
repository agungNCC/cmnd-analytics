import logger from '../utils/logger.js'

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  logger.error(err.message, { stack: err.stack, url: req.url, method: req.method })

  const status = err.status || err.statusCode || 500
  res.status(status).json({
    error: status === 500 ? 'Internal server error' : err.message,
  })
}
