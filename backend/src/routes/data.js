import { Router } from 'express'
import { query } from '../config/database.js'
import { verifyToken } from '../middleware/auth.js'
import { buildPaginationMeta, parsePagination, sanitizeString } from '../utils/helpers.js'

const router = Router()

const addFilter = (filters, clause, value) => {
  if (value === null || value === undefined || value === '') return
  filters.push({ clause, value })
}

router.use(verifyToken)

// GET /api/data/summary-all
router.get('/summary-all', async (_req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT
        directorate,
        total_employees,
        log_plus_completed,
        log_plus_incompleted,
        log_plus_completion_rate,
        vr_learning_completed,
        vr_learning_incompleted,
        vr_learning_completion_rate,
        combined_completed,
        combined_incompleted,
        combined_completion_rate,
        last_processed
      FROM processed_summary_all
      ORDER BY directorate ASC
    `)

    return res.json(rows)
  } catch (err) {
    next(err)
  }
})

// GET /api/data/mandatory-2026?page=1&limit=100&directorate=xxx&status=Completed&search=abc
router.get('/mandatory-2026', async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query)
    const directorate = sanitizeString(req.query.directorate)
    const status = sanitizeString(req.query.status)
    const search = sanitizeString(req.query.search)

    const filters = []
    if (search) {
      filters.push({
        clause: '(employee_id ILIKE ? OR employee_name ILIKE ? OR email ILIKE ?)',
        value: `%${search}%`,
      })
    }
    addFilter(filters, 'directorate ILIKE ?', directorate ? `%${directorate}%` : null)
    addFilter(filters, 'overall_status ILIKE ?', status ? `%${status}%` : null)

    const values = []
    const clauses = []
    for (const filter of filters) {
      if (filter.clause.includes('employee_id ILIKE')) {
        clauses.push(
          filter.clause
            .replace('?', `$${values.length + 1}`)
            .replace('?', `$${values.length + 2}`)
            .replace('?', `$${values.length + 3}`),
        )
        values.push(filter.value, filter.value, filter.value)
      } else {
        clauses.push(filter.clause.replace('?', `$${values.length + 1}`))
        values.push(filter.value)
      }
    }

    const whereSql = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''

    const countSql = `SELECT COUNT(*)::int AS total FROM processed_mandatory_2026 ${whereSql}`
    const dataSql = `
      SELECT
        id,
        employee_id,
        employee_name,
        directorate,
        sub_directorate,
        hire_date,
        email,
        log_plus_status,
        log_plus_completion,
        log_plus_last_updated,
        vr_learning_status,
        vr_learning_completion,
        vr_learning_last_updated,
        overall_status,
        overall_completion,
        last_processed
      FROM processed_mandatory_2026
      ${whereSql}
      ORDER BY employee_name ASC NULLS LAST
      LIMIT $${values.length + 1}
      OFFSET $${values.length + 2}
    `

    const [{ total }] = (await query(countSql, values)).rows
    const { rows } = await query(dataSql, [...values, limit, offset])

    return res.json({
      data: rows,
      ...buildPaginationMeta(total, page, limit),
      filters: {
        directorate,
        status,
        search,
      },
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/data/log-plus?search=employee_id&course=BCM&date_from=2026-01-01&date_to=2026-01-31&status=Completed
router.get('/log-plus', async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query)
    const search = sanitizeString(req.query.search)
    const course = sanitizeString(req.query.course)
    const status = sanitizeString(req.query.status)
    const dateFrom = sanitizeString(req.query.date_from)
    const dateTo = sanitizeString(req.query.date_to)

    const filters = []
    if (search) {
      filters.push({
        clause: '(employee_id ILIKE ? OR employee_name ILIKE ? OR course_name ILIKE ?)',
        value: `%${search}%`,
      })
    }
    addFilter(filters, 'course_name ILIKE ?', course ? `%${course}%` : null)
    addFilter(filters, 'completion_status ILIKE ?', status ? `%${status}%` : null)
    addFilter(filters, 'completion_date >= ?', dateFrom)
    addFilter(filters, 'completion_date <= ?', dateTo ? `${dateTo} 23:59:59` : null)

    const values = []
    const clauses = []
    for (const filter of filters) {
      if (filter.clause.includes('employee_id ILIKE')) {
        clauses.push(
          filter.clause
            .replace('?', `$${values.length + 1}`)
            .replace('?', `$${values.length + 2}`)
            .replace('?', `$${values.length + 3}`),
        )
        values.push(filter.value, filter.value, filter.value)
      } else {
        clauses.push(filter.clause.replace('?', `$${values.length + 1}`))
        values.push(filter.value)
      }
    }

    const whereSql = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''

    const countSql = `SELECT COUNT(*)::int AS total FROM raw_log_plus ${whereSql}`
    const dataSql = `
      SELECT
        id,
        upload_id,
        employee_id,
        employee_name,
        directorate,
        sub_directorate,
        course_name,
        completion_status,
        completion_percentage,
        completion_date,
        score,
        created_at
      FROM raw_log_plus
      ${whereSql}
      ORDER BY completion_date DESC NULLS LAST, created_at DESC
      LIMIT $${values.length + 1}
      OFFSET $${values.length + 2}
    `

    const [{ total }] = (await query(countSql, values)).rows
    const { rows } = await query(dataSql, [...values, limit, offset])

    return res.json({
      data: rows,
      ...buildPaginationMeta(total, page, limit),
      filters: { search, course, status, date_from: dateFrom, date_to: dateTo },
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/data/vr-learning?region=Jakarta&branch=xxx&status=Completed&search=abc
router.get('/vr-learning', async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query)
    const search = sanitizeString(req.query.search)
    const region = sanitizeString(req.query.region)
    const branch = sanitizeString(req.query.branch)
    const status = sanitizeString(req.query.status)

    const filters = []
    if (search) {
      filters.push({
        clause: '(employee_id ILIKE ? OR employee_name ILIKE ? OR branch ILIKE ?)',
        value: `%${search}%`,
      })
    }
    addFilter(filters, 'region ILIKE ?', region ? `%${region}%` : null)
    addFilter(filters, 'branch ILIKE ?', branch ? `%${branch}%` : null)
    addFilter(filters, 'completion_status ILIKE ?', status ? `%${status}%` : null)

    const values = []
    const clauses = []
    for (const filter of filters) {
      if (filter.clause.includes('employee_id ILIKE')) {
        clauses.push(
          filter.clause
            .replace('?', `$${values.length + 1}`)
            .replace('?', `$${values.length + 2}`)
            .replace('?', `$${values.length + 3}`),
        )
        values.push(filter.value, filter.value, filter.value)
      } else {
        clauses.push(filter.clause.replace('?', `$${values.length + 1}`))
        values.push(filter.value)
      }
    }

    const whereSql = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''

    const countSql = `SELECT COUNT(*)::int AS total FROM raw_vr_learning ${whereSql}`
    const dataSql = `
      SELECT
        id,
        upload_id,
        employee_id,
        employee_name,
        directorate,
        sub_directorate,
        region,
        branch,
        forward_30_score,
        completion_time,
        completion_status,
        created_at
      FROM raw_vr_learning
      ${whereSql}
      ORDER BY created_at DESC
      LIMIT $${values.length + 1}
      OFFSET $${values.length + 2}
    `

    const [{ total }] = (await query(countSql, values)).rows
    const { rows } = await query(dataSql, [...values, limit, offset])

    return res.json({
      data: rows,
      ...buildPaginationMeta(total, page, limit),
      filters: { search, region, branch, status },
    })
  } catch (err) {
    next(err)
  }
})

export default router
