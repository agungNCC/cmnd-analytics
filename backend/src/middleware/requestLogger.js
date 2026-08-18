import morgan from 'morgan'
import logger from '../utils/logger.js'

const stream = { write: (msg) => logger.http(msg.trim()) }

export const requestLogger = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  { stream },
)
