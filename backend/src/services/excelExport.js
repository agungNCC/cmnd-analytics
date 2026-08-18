import ExcelJS from 'exceljs'
import { query } from '../config/database.js'

const DEFAULT_SHEETS = ['summary_all', 'mandatory_2026', 'log_plus', 'vr_learning']

const styleHeaderRow = (sheet) => {
  const headerRow = sheet.getRow(1)
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFC80A0A' },
  }
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' }
}

const freezeHeader = (sheet) => {
  sheet.views = [{ state: 'frozen', ySplit: 1 }]
}

const buildMandatoryFilters = (filters = {}) => {
  const clauses = []
  const values = []

  if (filters.directorate) {
    clauses.push(`directorate ILIKE $${values.length + 1}`)
    values.push(`%${filters.directorate}%`)
  }
  if (filters.status) {
    clauses.push(`overall_status ILIKE $${values.length + 1}`)
    values.push(`%${filters.status}%`)
  }

  return {
    whereSql: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '',
    values,
  }
}

const buildLogFilters = (filters = {}) => {
  const clauses = []
  const values = []

  if (filters.directorate) {
    clauses.push(`directorate ILIKE $${values.length + 1}`)
    values.push(`%${filters.directorate}%`)
  }
  if (filters.status) {
    clauses.push(`completion_status ILIKE $${values.length + 1}`)
    values.push(`%${filters.status}%`)
  }
  if (filters.date_from) {
    clauses.push(`completion_date >= $${values.length + 1}`)
    values.push(filters.date_from)
  }
  if (filters.date_to) {
    clauses.push(`completion_date <= $${values.length + 1}`)
    values.push(`${filters.date_to} 23:59:59`)
  }

  return {
    whereSql: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '',
    values,
  }
}

const buildVrFilters = (filters = {}) => {
  const clauses = []
  const values = []

  if (filters.directorate) {
    clauses.push(`directorate ILIKE $${values.length + 1}`)
    values.push(`%${filters.directorate}%`)
  }
  if (filters.status) {
    clauses.push(`completion_status ILIKE $${values.length + 1}`)
    values.push(`%${filters.status}%`)
  }

  return {
    whereSql: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '',
    values,
  }
}

const addSummarySheet = async (workbook, includeFormulas) => {
  const sheet = workbook.addWorksheet('Summary All')
  sheet.columns = [
    { header: 'Directorate', key: 'directorate', width: 24 },
    { header: 'Total Employees', key: 'total_employees', width: 16 },
    { header: 'LOG+ Completed', key: 'log_plus_completed', width: 16 },
    { header: 'LOG+ Incompleted', key: 'log_plus_incompleted', width: 18 },
    { header: 'LOG+ Completion %', key: 'log_plus_completion_rate', width: 18 },
    { header: 'VR Completed', key: 'vr_learning_completed', width: 15 },
    { header: 'VR Incompleted', key: 'vr_learning_incompleted', width: 17 },
    { header: 'VR Completion %', key: 'vr_learning_completion_rate', width: 18 },
    { header: 'Combined Completion %', key: 'combined_completion_rate', width: 22 },
  ]

  const { rows } = await query(`
    SELECT *
    FROM processed_summary_all
    ORDER BY directorate ASC
  `)

  rows.forEach((row, idx) => {
    const rowNumber = idx + 2
    sheet.addRow({
      directorate: row.directorate,
      total_employees: row.total_employees,
      log_plus_completed: row.log_plus_completed,
      log_plus_incompleted: includeFormulas
        ? { formula: `=B${rowNumber}-C${rowNumber}` }
        : row.log_plus_incompleted,
      log_plus_completion_rate: includeFormulas
        ? { formula: `=IF(B${rowNumber}=0,0,C${rowNumber}/B${rowNumber}*100)` }
        : Number(row.log_plus_completion_rate),
      vr_learning_completed: row.vr_learning_completed,
      vr_learning_incompleted: includeFormulas
        ? { formula: `=B${rowNumber}-F${rowNumber}` }
        : row.vr_learning_incompleted,
      vr_learning_completion_rate: includeFormulas
        ? { formula: `=IF(B${rowNumber}=0,0,F${rowNumber}/B${rowNumber}*100)` }
        : Number(row.vr_learning_completion_rate),
      combined_completion_rate: includeFormulas
        ? { formula: `=IF(B${rowNumber}=0,0,(E${rowNumber}+H${rowNumber})/2)` }
        : Number(row.combined_completion_rate),
    })
  })

  ;['E', 'H', 'I'].forEach((col) => {
    sheet.getColumn(col).numFmt = '0.00'
  })
  styleHeaderRow(sheet)
  freezeHeader(sheet)
}

const addMandatorySheet = async (workbook, includeFormulas, filters) => {
  const sheet = workbook.addWorksheet('Mandatory 2026')
  sheet.columns = [
    { header: 'Employee ID', key: 'employee_id', width: 16 },
    { header: 'Employee Name', key: 'employee_name', width: 24 },
    { header: 'Directorate', key: 'directorate', width: 22 },
    { header: 'LOG+ Status', key: 'log_plus_status', width: 15 },
    { header: 'LOG+ %', key: 'log_plus_completion', width: 12 },
    { header: 'VR Status', key: 'vr_learning_status', width: 15 },
    { header: 'VR %', key: 'vr_learning_completion', width: 12 },
    { header: 'Overall Status', key: 'overall_status', width: 16 },
    { header: 'Overall %', key: 'overall_completion', width: 12 },
  ]

  const { whereSql, values } = buildMandatoryFilters(filters)
  const { rows } = await query(
    `SELECT *
     FROM processed_mandatory_2026
     ${whereSql}
     ORDER BY employee_name ASC NULLS LAST`,
    values,
  )

  rows.forEach((row, idx) => {
    const rowNumber = idx + 2
    sheet.addRow({
      employee_id: row.employee_id,
      employee_name: row.employee_name,
      directorate: row.directorate,
      log_plus_status: row.log_plus_status,
      log_plus_completion: Number(row.log_plus_completion),
      vr_learning_status: row.vr_learning_status,
      vr_learning_completion: Number(row.vr_learning_completion),
      overall_status: includeFormulas
        ? { formula: `=IF(AND(D${rowNumber}="Completed",F${rowNumber}="Completed"),"Completed","Incompleted")` }
        : row.overall_status,
      overall_completion: includeFormulas
        ? { formula: `=ROUND((E${rowNumber}+G${rowNumber})/2,2)` }
        : Number(row.overall_completion),
    })
  })

  ;['E', 'G', 'I'].forEach((col) => {
    sheet.getColumn(col).numFmt = '0.00'
  })
  styleHeaderRow(sheet)
  freezeHeader(sheet)
}

const addLogSheet = async (workbook, filters) => {
  const sheet = workbook.addWorksheet('LOG+')
  sheet.columns = [
    { header: 'Employee ID', key: 'employee_id', width: 16 },
    { header: 'Employee Name', key: 'employee_name', width: 24 },
    { header: 'Directorate', key: 'directorate', width: 22 },
    { header: 'Sub Directorate', key: 'sub_directorate', width: 24 },
    { header: 'Course Name', key: 'course_name', width: 26 },
    { header: 'Status', key: 'completion_status', width: 14 },
    { header: 'Completion %', key: 'completion_percentage', width: 14 },
    { header: 'Completion Date', key: 'completion_date', width: 20 },
    { header: 'Score', key: 'score', width: 10 },
  ]

  const { whereSql, values } = buildLogFilters(filters)
  const { rows } = await query(
    `SELECT *
     FROM raw_log_plus
     ${whereSql}
     ORDER BY completion_date DESC NULLS LAST, created_at DESC
     LIMIT 5000`,
    values,
  )

  rows.forEach((row) => {
    sheet.addRow({
      ...row,
      completion_percentage: row.completion_percentage === null ? null : Number(row.completion_percentage),
    })
  })

  sheet.getColumn('G').numFmt = '0.00'
  styleHeaderRow(sheet)
  freezeHeader(sheet)
}

const addVrSheet = async (workbook, filters) => {
  const sheet = workbook.addWorksheet('VR Learning')
  sheet.columns = [
    { header: 'Employee ID', key: 'employee_id', width: 16 },
    { header: 'Employee Name', key: 'employee_name', width: 24 },
    { header: 'Directorate', key: 'directorate', width: 22 },
    { header: 'Sub Directorate', key: 'sub_directorate', width: 24 },
    { header: 'Region', key: 'region', width: 16 },
    { header: 'Branch', key: 'branch', width: 22 },
    { header: 'Forward 30 Score', key: 'forward_30_score', width: 18 },
    { header: 'Completion Time', key: 'completion_time', width: 16 },
    { header: 'Status', key: 'completion_status', width: 14 },
  ]

  const { whereSql, values } = buildVrFilters(filters)
  const { rows } = await query(
    `SELECT *
     FROM raw_vr_learning
     ${whereSql}
     ORDER BY created_at DESC
     LIMIT 5000`,
    values,
  )

  rows.forEach((row) => sheet.addRow(row))
  styleHeaderRow(sheet)
  freezeHeader(sheet)
}

export const generateXlsxWorkbook = async ({
  sheets = DEFAULT_SHEETS,
  includeFormulas = true,
  filters = {},
} = {}) => {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Cursor'
  workbook.created = new Date()

  if (sheets.includes('summary_all')) {
    await addSummarySheet(workbook, includeFormulas)
  }
  if (sheets.includes('mandatory_2026')) {
    await addMandatorySheet(workbook, includeFormulas, filters)
  }
  if (sheets.includes('log_plus')) {
    await addLogSheet(workbook, filters)
  }
  if (sheets.includes('vr_learning')) {
    await addVrSheet(workbook, filters)
  }

  return workbook
}
