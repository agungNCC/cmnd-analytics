import 'dotenv/config'
import logger from './utils/logger.js'
import { startWorkers } from './jobs/queues.js'

startWorkers()
logger.info(`Export/upload worker running [${process.env.NODE_ENV || 'development'}]`)

// Keep process alive for Bull consumers
setInterval(() => {}, 60_000)
