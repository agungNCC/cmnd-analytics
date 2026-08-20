import 'dotenv/config'
import app from './app.js'
import logger from './utils/logger.js'
import { startWorkers } from './jobs/queues.js'

const PORT = parseInt(process.env.PORT || '5000')

// Production runs workers in a separate container so export CPU/memory
// cannot block API health checks (which causes Nginx 502).
if (process.env.RUN_WORKERS !== 'false') {
  startWorkers()
}

app.listen(PORT, () => {
  logger.info(`Completion Analytics backend running on port ${PORT} [${process.env.NODE_ENV}]`)
})
