import { query } from '../config/database.js'
import logger from '../utils/logger.js'

/**
 * Catat satu baris audit log ke database.
 *
 * @param {object} params
 * @param {string}  params.userId
 * @param {string}  [params.username]
 * @param {string}  params.action          - login | logout | upload_started | upload_completed | download | ...
 * @param {string}  [params.resourceType]  - file_upload | data_export | user_management
 * @param {string}  [params.resourceName]
 * @param {object}  [params.details]       - JSONB bebas
 * @param {string}  [params.status]        - success | failure | in_progress
 * @param {string}  [params.errorMessage]
 * @param {string}  [params.ipAddress]
 * @param {string}  [params.userAgent]
 */
export const logAudit = async ({
  userId,
  username,
  action,
  resourceType,
  resourceName,
  details,
  status = 'success',
  errorMessage,
  ipAddress,
  userAgent,
}) => {
  try {
    await query(
      `INSERT INTO audit_logs
         (user_id, username, action, resource_type, resource_name, details, status, error_message, ip_address, user_agent)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        userId,
        username   || null,
        action,
        resourceType  || null,
        resourceName  || null,
        details ? JSON.stringify(details) : null,
        status,
        errorMessage  || null,
        ipAddress     || null,
        userAgent     || null,
      ],
    )
  } catch (err) {
    // Jangan sampai gagal audit menghentikan request utama
    logger.error('Failed to write audit log', { err: err.message, action, userId })
  }
}
