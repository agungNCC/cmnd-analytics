import { Router } from 'express'
import { verifyToken } from '../middleware/auth.js'
import { generateXlsxWorkbook } from '../services/excelExport.js'
import { logAudit } from '../services/audit.js'

const router = Router()

router.use(verifyToken)

// POST /api/export/xlsx
router.post('/xlsx', async (req, res, next) => {
  try {
    const {
      sheets = ['summary_all', 'mandatory_2026', 'log_plus', 'vr_learning'],
      include_formulas = true,
      filters = {},
    } = req.body || {}

    const workbook = await generateXlsxWorkbook({
      sheets,
      includeFormulas: include_formulas,
      filters,
    })

    const datePart = new Date().toISOString().slice(0, 10)
    const filename = `CMND_Analytics_${datePart}.xlsx`

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)

    await logAudit({
      userId: req.user.id,
      username: req.user.username,
      action: 'download',
      resourceType: 'data_export',
      resourceName: filename,
      status: 'success',
      details: {
        sheets,
        include_formulas,
        filters,
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    })

    await workbook.xlsx.write(res)
    res.end()
  } catch (err) {
    next(err)
  }
})

export default router
