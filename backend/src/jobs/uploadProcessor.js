import { unlink } from 'fs/promises'
import { query, pool } from '../config/database.js'
import { parseLogPlus, parseVrLearning } from '../services/fileParser.js'
import { calculateMandatory2026, calculateSummaryAll } from '../services/etl.js'
import { logAudit } from '../services/audit.js'

const insertLogPlusRows = async (client, uploadId, rows) => {
  for (const row of rows) {
    await client.query(
      `INSERT INTO raw_log_plus (
        upload_id, employee_id, employee_name, directorate, sub_directorate,
        course_name, completion_status, completion_percentage, completion_date, score
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        uploadId,
        row.employee_id ?? row.nik ?? null,
        row.employee_name ?? row.nama ?? null,
        row.directorate ?? null,
        row.sub_directorate ?? null,
        row.course_name ?? row.course ?? null,
        row.completion_status ?? null,
        row.completion_percentage ?? row.progress ?? null,
        row.completion_date ?? null,
        row.score ?? null,
      ],
    )
  }
}

const insertVrLearningRows = async (client, uploadId, rows) => {
  for (const row of rows) {
    await client.query(
      `INSERT INTO raw_vr_learning (
        upload_id, employee_id, employee_name, directorate, sub_directorate,
        region, branch, forward_30_score, completion_time, completion_status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        uploadId,
        row.employee_id ?? row.nik ?? null,
        row.employee_name ?? row.nama ?? null,
        row.directorate ?? null,
        row.sub_directorate ?? null,
        row.region ?? null,
        row.branch ?? null,
        row.forward_30_score ?? row.score ?? null,
        row.completion_time ?? null,
        row.completion_status ?? null,
      ],
    )
  }
}

export const processUploadJob = async ({
  uploadId,
  userId,
  username,
  logPlusPath,
  vrLearningPath,
  uploadedFilenames,
  ipAddress,
  userAgent,
}) => {
  const client = await pool.connect()
  let transactionStarted = false

  try {
    const logPlusRows = parseLogPlus(logPlusPath)
    const vrLearningRows = parseVrLearning(vrLearningPath)

    await client.query('BEGIN')
    transactionStarted = true
    await insertLogPlusRows(client, uploadId, logPlusRows)
    await insertVrLearningRows(client, uploadId, vrLearningRows)
    await client.query(
      `UPDATE upload_history
       SET log_plus_rows = $2, vr_learning_rows = $3, processing_status = 'processing'
       WHERE id = $1`,
      [uploadId, logPlusRows.length, vrLearningRows.length],
    )
    await client.query('COMMIT')

    await calculateMandatory2026()
    await calculateSummaryAll()

    await query(
      `UPDATE upload_history
       SET processing_status = 'complete', completed_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [uploadId],
    )

    await logAudit({
      userId,
      username,
      action: 'upload_completed',
      resourceType: 'file_upload',
      resourceName: `${uploadedFilenames.log_plus} + ${uploadedFilenames.vr_learning}`,
      status: 'success',
      details: {
        upload_id: uploadId,
        rows_processed: {
          log_plus: logPlusRows.length,
          vr_learning: vrLearningRows.length,
        },
      },
      ipAddress,
      userAgent,
    })

    return {
      logPlusRows: logPlusRows.length,
      vrLearningRows: vrLearningRows.length,
    }
  } catch (err) {
    if (transactionStarted) {
      await client.query('ROLLBACK')
    }
    await query(
      `UPDATE upload_history
       SET processing_status = 'error', error_message = $2
       WHERE id = $1`,
      [uploadId, err.message],
    )

    await logAudit({
      userId,
      username,
      action: 'upload_completed',
      resourceType: 'file_upload',
      resourceName: `${uploadedFilenames.log_plus} + ${uploadedFilenames.vr_learning}`,
      status: 'failure',
      errorMessage: err.message,
      details: { upload_id: uploadId },
      ipAddress,
      userAgent,
    })

    throw err
  } finally {
    await Promise.allSettled([
      unlink(logPlusPath),
      unlink(vrLearningPath),
    ])
    client.release()
  }
}
