import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import multer from 'multer'
import { v4 as uuid } from 'uuid'

import { query } from '../config/database.js'
import { verifyToken, requireRole } from '../middleware/auth.js'
import { validateXlsxFile } from '../utils/validation.js'
import { logAudit } from '../services/audit.js'
import { processUploadJob } from '../jobs/uploadProcessor.js'

const router = Router()

const uploadDir = path.resolve(process.env.UPLOAD_DIR || 'uploads')
fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')
    cb(null, `${Date.now()}-${safeName}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800') },
})

router.use(verifyToken)

// POST /api/upload
router.post(
  '/upload',
  requireRole('admin', 'uploader'),
  upload.fields([
    { name: 'log_plus', maxCount: 1 },
    { name: 'vr_learning', maxCount: 1 },
  ]),
  async (req, res, next) => {
    const uploadId = uuid()

    try {
      const logPlusFile = req.files?.log_plus?.[0]
      const vrLearningFile = req.files?.vr_learning?.[0]

      if (!logPlusFile || !vrLearningFile) {
        return res.status(400).json({
          error: 'Both log_plus and vr_learning files are required',
        })
      }

      validateXlsxFile(logPlusFile)
      validateXlsxFile(vrLearningFile)

      await query(
        `INSERT INTO upload_history (
          id, uploaded_by, log_plus_filename, vr_learning_filename, processing_status
        ) VALUES ($1, $2, $3, $4, 'pending')`,
        [uploadId, req.user.id, logPlusFile.originalname, vrLearningFile.originalname],
      )

      await logAudit({
        userId: req.user.id,
        username: req.user.username,
        action: 'upload_started',
        resourceType: 'file_upload',
        resourceName: `${logPlusFile.originalname} + ${vrLearningFile.originalname}`,
        status: 'in_progress',
        details: {
          upload_id: uploadId,
          file_sizes: {
            log_plus: logPlusFile.size,
            vr_learning: vrLearningFile.size,
          },
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      })

      const result = await processUploadJob({
        uploadId,
        userId: req.user.id,
        username: req.user.username,
        logPlusPath: logPlusFile.path,
        vrLearningPath: vrLearningFile.path,
        uploadedFilenames: {
          log_plus: logPlusFile.originalname,
          vr_learning: vrLearningFile.originalname,
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      })

      return res.json({
        upload_id: uploadId,
        status: 'complete',
        message: 'Files uploaded and processed successfully',
        log_plus_rows: result.logPlusRows,
        vr_learning_rows: result.vrLearningRows,
      })
    } catch (err) {
      next(err)
    }
  },
)

// GET /api/upload-history
router.get('/upload-history', async (_req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT
        uh.id,
        uh.uploaded_by,
        u.username,
        u.email,
        uh.upload_date,
        uh.log_plus_filename,
        uh.log_plus_rows,
        uh.vr_learning_filename,
        uh.vr_learning_rows,
        uh.processing_status,
        uh.error_message,
        uh.completed_at
      FROM upload_history uh
      LEFT JOIN users u ON u.id = uh.uploaded_by
      ORDER BY uh.upload_date DESC
    `)

    return res.json(rows)
  } catch (err) {
    next(err)
  }
})

export default router
