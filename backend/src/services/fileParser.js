import xlsx from 'xlsx'
import { validateColumns } from '../utils/validation.js'

const normalizeRow = (row) => {
  const normalized = {}
  for (const [key, value] of Object.entries(row)) {
    const cleanKey = String(key).trim().toLowerCase().replace(/\s+/g, '_')
    normalized[cleanKey] = typeof value === 'string' ? value.trim() : value
  }
  return normalized
}

const parseWorkbook = (filePath, requiredColumns, sheetLabel) => {
  const workbook = xlsx.readFile(filePath)
  const firstSheetName = workbook.SheetNames[0]
  if (!firstSheetName) {
    throw new Error(`Workbook "${sheetLabel}" does not contain any sheets`)
  }

  const sheet = workbook.Sheets[firstSheetName]
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: null })
  const normalized = rows.map(normalizeRow)

  if (normalized.length === 0) {
    throw new Error(`Workbook "${sheetLabel}" is empty`)
  }

  validateColumns(normalized[0], requiredColumns, sheetLabel)
  return normalized
}

export const parseLogPlus = (filePath) =>
  parseWorkbook(
    filePath,
    ['employee_id', 'employee_name', 'directorate', 'course_name', 'completion_status'],
    'LOG+',
  )

export const parseVrLearning = (filePath) =>
  parseWorkbook(
    filePath,
    ['employee_id', 'employee_name', 'directorate', 'region', 'branch', 'completion_status'],
    'VR Learning',
  )
