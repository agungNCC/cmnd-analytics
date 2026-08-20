import path from 'path'
import fs from 'fs'
import { query } from '../config/database.js'
import { buildExportBuffer, buildExportFilename } from '../services/excelExport.js'
import { logAudit } from '../services/audit.js'

const exportDir = path.resolve(process.env.UPLOAD_DIR || 'uploads', 'exports')
fs.mkdirSync(exportDir, { recursive: true })

export const processExportJob = async (jobData, onProgress = async () => {}) => {
  const {
    exportId,
    userId,
    username,
    sheets,
    includeFormulas,
    filters,
    filename,
    ipAddress,
    userAgent,
  } = jobData

  try {
    await query(
      `UPDATE export_jobs SET status = 'processing', progress = 20 WHERE id = $1`,
      [exportId],
    )
    await onProgress(20)

    const buffer = await buildExportBuffer()

    await query(`UPDATE export_jobs SET progress = 70 WHERE id = $1`, [exportId])
    await onProgress(70)

    const exportFilename = buildExportFilename()
    const filePath = path.join(exportDir, `${exportId}_${exportFilename}`)
    fs.writeFileSync(filePath, buffer)

    await query(
      `UPDATE export_jobs
       SET status = 'ready', progress = 100, file_path = $2, completed_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [exportId, filePath],
    )
    await onProgress(100)

    await logAudit({
      userId,
      username,
      action: 'download',
      resourceType: 'data_export',
      resourceName: exportFilename,
      status: 'success',
      details: { export_id: exportId },
      ipAddress,
      userAgent,
    })
  } catch (err) {
    await query(
      `UPDATE export_jobs
       SET status = 'failed', error_message = $2, progress = 100
       WHERE id = $1`,
      [exportId, err.message],
    )

    await logAudit({
      userId,
      username,
      action: 'download',
      resourceType: 'data_export',
      resourceName: filename,
      status: 'failure',
      errorMessage: err.message,
      details: { export_id: exportId },
      ipAddress,
      userAgent,
    })

    throw err
  }
}
