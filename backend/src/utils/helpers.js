import { PAGINATION } from '../config/constants.js'

/**
 * Parse pagination params dari query string
 */
export const parsePagination = (query) => {
  const page  = Math.max(1, parseInt(query.page  || PAGINATION.DEFAULT_PAGE))
  const limit = Math.min(
    parseInt(query.limit || PAGINATION.DEFAULT_LIMIT),
    PAGINATION.MAX_LIMIT,
  )
  const offset = (page - 1) * limit
  return { page, limit, offset }
}

/**
 * Build pagination metadata untuk response
 */
export const buildPaginationMeta = (total, page, limit) => ({
  total,
  page,
  pageSize: limit,
  totalPages: Math.ceil(total / limit),
})

/**
 * Bersihkan string (trim + lowercase optional)
 */
export const sanitizeString = (str, lower = false) => {
  if (!str) return null
  const trimmed = String(str).trim()
  return lower ? trimmed.toLowerCase() : trimmed
}
