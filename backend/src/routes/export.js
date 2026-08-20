import path from 'path'
import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import { verifyToken } from '../middleware/auth.js'
import { query } from '../config/database.js'
import { getExportSettings, resolveExportSheets } from '../services/exportSettingsService.js'

const router = Router()

router.use(verifyToken)

// POST /api/export/xlsx — enqueue export job
router.post('/xlsx', async (req, res, next) => {
  try {
    const settings = await getExportSettings()
    const sheets = await resolveExportSheets()
    const include_formulas = settings.include_formulas

    const exportId = uuid()
    const d = new Date()
    const ymd = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`
    const filename = `LOG_VR_completion_${ymd}.xlsx`

    await query(
      `INSERT INTO export_jobs (
         id, created_by, filename, sheets, include_formulas, filters, status, progress
       ) VALUES ($1, $2, $3, $4, $5, $6, 'processing', 0)`,
      [exportId, req.user.id, filename, sheets, include_formulas, JSON.stringify({})],
    )

    await exportQueue.add({
      exportId,
      userId: req.user.id,
      username: req.user.username,
      sheets,
      includeFormulas: include_formulas,
      filters: {},
      filename,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    })

    return res.status(202).json({
      export_id: exportId,
      status: 'processing',
      progress: 0,
      filename,
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/export/status/:exportId
router.get('/status/:exportId', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT id, filename, status, progress, error_message, created_at, completed_at
       FROM export_jobs
       WHERE id = $1 AND created_by = $2`,
      [req.params.exportId, req.user.id],
    )

    if (!rows[0]) {
      return res.status(404).json({ error: 'Export job not found' })
    }

    return res.json({
      export_id: rows[0].id,
      filename: rows[0].filename,
      status: rows[0].status,
      progress: rows[0].progress,
      error_message: rows[0].error_message,
      created_at: rows[0].created_at,
      completed_at: rows[0].completed_at,
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/export/download/:exportId
router.get('/download/:exportId', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT id, filename, status, file_path
       FROM export_jobs
       WHERE id = $1 AND created_by = $2`,
      [req.params.exportId, req.user.id],
    )

    const job = rows[0]
    if (!job) return res.status(404).json({ error: 'Export job not found' })
    if (job.status !== 'ready' || !job.file_path) {
      return res.status(409).json({
        error: 'Export is not ready yet',
        status: job.status,
      })
    }

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )
    res.setHeader('Content-Disposition', `attachment; filename="${job.filename}"`)
    return res.sendFile(path.resolve(job.file_path))
  } catch (err) {
    next(err)
  }
})

export default router
