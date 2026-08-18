import 'dotenv/config'
import app from './app.js'
import logger from './utils/logger.js'

const PORT = parseInt(process.env.PORT || '5000')

app.listen(PORT, () => {
  logger.info(`CMND Analytics backend running on port ${PORT} [${process.env.NODE_ENV}]`)
})
