import Bull from 'bull'
import logger from '../utils/logger.js'
import { processUploadJob } from './uploadProcessor.js'
import { processExportJob } from './exportProcessor.js'

const Queue = Bull.default ?? Bull

const redis = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
}

export const uploadQueue = new Queue('cmnd-upload', {
  redis,
  defaultJobOptions: {
    removeOnComplete: 20,
    removeOnFail: 50,
    // processUploadJob removes temporary files in its finally block.
    // Retrying would only replace the original error with ENOENT.
    attempts: 1,
  },
})

export const exportQueue = new Queue('cmnd-export', {
  redis,
  settings: {
    // Export can take several minutes on large Mandatory sheets.
    lockDuration: 15 * 60 * 1000,
    stalledInterval: 60 * 1000,
    maxStalledCount: 2,
  },
  defaultJobOptions: {
    removeOnComplete: 20,
    removeOnFail: 50,
    attempts: 1,
    timeout: 20 * 60 * 1000,
  },
})

let workersStarted = false

export const startWorkers = () => {
  if (workersStarted) return
  workersStarted = true

  uploadQueue.process(1, async (job) => {
    logger.info(`Processing upload job ${job.data.uploadId}`)
    await processUploadJob(job.data)
  })

  exportQueue.process(1, async (job) => {
    logger.info(`Processing export job ${job.data.exportId}`)
    const keepAlive = setInterval(() => {
      job.progress(job.progress() || 15).catch(() => {})
    }, 30_000)
    try {
      await job.progress(15)
      await processExportJob(job.data, (progress) => job.progress(progress))
    } finally {
      clearInterval(keepAlive)
    }
  })

  uploadQueue.on('failed', (job, err) => {
    logger.error(`Upload job failed: ${job?.data?.uploadId}`, { err: err.message })
  })

  exportQueue.on('failed', (job, err) => {
    logger.error(`Export job failed: ${job?.data?.exportId}`, { err: err.message })
  })

  logger.info('Bull workers started (upload + export)')
}
