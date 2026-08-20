import { unlink } from 'fs/promises'
import { query, pool } from '../config/database.js'
import { parseLogPlus, parseVrLearning } from '../services/fileParser.js'
import { calculateMandatory2026, calculateSummaryAll } from '../services/etl.js'
import { logAudit } from '../services/audit.js'

const CHUNK_SIZE = 500

const insertChunk = async (client, sql, paramsPerRow, rows) => {
  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    const chunk = rows.slice(i, i + CHUNK_SIZE)
    const values = []
    const placeholders = chunk.map((row, index) => {
      const offset = index * paramsPerRow.length
      values.push(...paramsPerRow.map((pick) => pick(row)))
      return `(${paramsPerRow.map((_, col) => `$${offset + col + 1}`).join(',')})`
    })
    await client.query(`${sql} VALUES ${placeholders.join(',')}`, values)
  }
}

const insertLogPlusRows = async (client, uploadId, rows) => {
  await insertChunk(
    client,
    `INSERT INTO raw_log_plus (
      upload_id, employee_id, employee_name, directorate, sub_directorate,
      course_name, completion_status, completion_percentage, overall_completion,
      completion_date, score
    )`,
    [
      () => uploadId,
      (row) => row.employee_id ?? null,
      (row) => row.employee_name ?? null,
      (row) => row.directorate ?? null,
      (row) => row.sub_directorate ?? null,
      (row) => row.course_name ?? null,
      (row) => row.completion_status ?? null,
      (row) => row.completion_percentage ?? null,
      (row) => row.overall_completion ?? null,
      (row) => row.completion_date ?? null,
      (row) => row.score ?? null,
    ],
    rows,
  )
}

const insertVrLearningRows = async (client, uploadId, rows) => {
  await insertChunk(
    client,
    `INSERT INTO raw_vr_learning (
      upload_id, employee_id, employee_name, directorate, sub_directorate,
      region, branch, forward_30_score, completion_time, completion_status
    )`,
    [
      () => uploadId,
      (row) => row.employee_id ?? null,
      (row) => row.employee_name ?? null,
      (row) => row.directorate ?? null,
      (row) => row.sub_directorate ?? null,
      (row) => row.region ?? null,
      (row) => row.branch ?? null,
      (row) => row.forward_30_score ?? row.score ?? null,
      (row) => row.completion_time ?? null,
      (row) => row.completion_status ?? null,
    ],
    rows,
  )
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
    await query(
      `UPDATE upload_history SET processing_status = 'processing' WHERE id = $1`,
      [uploadId],
    )

    const logPlusRows = parseLogPlus(logPlusPath)
    const vrLearningRows = parseVrLearning(vrLearningPath)

    await client.query('BEGIN')
    transactionStarted = true
    // Each successful upload is the new authoritative LOG+ and VR dataset.
    await client.query('DELETE FROM raw_log_plus')
    await client.query('DELETE FROM raw_vr_learning')
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
