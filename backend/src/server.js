import 'dotenv/config'
import app from './app.js'
import logger from './utils/logger.js'
import { startWorkers } from './jobs/queues.js'

const PORT = parseInt(process.env.PORT || '5000')

startWorkers()

app.listen(PORT, () => {
  logger.info(`Completion Analytics backend running on port ${PORT} [${process.env.NODE_ENV}]`)
})
