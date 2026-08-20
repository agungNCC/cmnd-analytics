import xlsx from 'xlsx'

const ALIASES = {
  employee_id: [
    'employee_id', 'employeeid', 'emp_id', 'nik', 'npp', 'personnel_number',
    'personnel_no', 'id_karyawan', 'no_pegawai', 'nomor_induk', 'staff_id',
    'username', 'user_name', 'login_name', 'login',
  ],
  employee_name: [
    'employee_name', 'employeename', 'nama', 'name', 'nama_karyawan',
    'full_name', 'nama_pegawai', 'employee',
  ],
  directorate: [
    'directorate', 'direktorat', 'directorate_name', 'nama_direktorat', 'dir',
  ],
  sub_directorate: [
    'sub_directorate', 'subdirectorate', 'sub_direktorat', 'division', 'divisi',
  ],
  course_name: [
    'course_name', 'coursename', 'course', 'training', 'training_name',
    'nama_course', 'program', 'program_name', 'learning_item',
  ],
  completion_status: [
    'completion_status', 'completionstatus', 'status', 'status_completion',
    'progress_status', 'hasil', 'status_penyelesaian',
  ],
  completion_percentage: [
    'completion_percentage', 'completionpercentage', 'progress', 'percentage',
    'persentase', 'pct', 'percent', 'progress_',
  ],
  completion_date: [
    'completion_date', 'completiondate', 'completed_date', 'date_completed',
    'tanggal_selesai', 'tanggal', 'completed_on',
  ],
  score: ['score', 'nilai', 'nilai_akhir', 'final_score'],
  region: ['region', 'wilayah', 'area', 'zona'],
  branch: ['branch', 'cabang', 'branch_name', 'nama_cabang', 'unit', 'outlet'],
  forward_30_score: [
    'forward_30_score', 'forward_30', 'forward30', 'score_forward_30',
    'skor_forward_30', 'forward_30_skor',
  ],
  completion_time: [
    'completion_time', 'completiontime', 'duration', 'waktu',
    'waktu_penyelesaian', 'time',
  ],
}

const LOG_IDENTITY_KEYS = new Set([
  'no', 'username', 'name', 'hire_date', 'email', 'directorate', 'sub_directorate',
  'status_active', 'completion', 'nik', 'employee_id', 'employee_name',
])

const normalizeKey = (key) =>
  String(key ?? '')
    .trim()
    .toLowerCase()
    .replace(/%/g, 'percent')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

const looksLikeEmployeeId = (value) => {
  if (value === null || value === undefined || value === '') return false
  return /^\d{4,}$/.test(String(value).trim())
}

const parseNumber = (value) => {
  if (value === null || value === undefined || value === '' || value === '-') return null
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const text = String(value).replace(/%/g, '').replace(/,/g, '').trim()
  if (!text) return null
  const num = Number(text)
  return Number.isFinite(num) ? num : null
}

const parsePercent = (value) => {
  const num = parseNumber(value)
  if (num === null) return null
  if (num > 0 && num <= 1) return Number((num * 100).toFixed(2))
  return Number(num.toFixed(2))
}

const excelDateToValue = (value) => {
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'number' && value > 20000 && value < 80000) {
    const utc = Date.UTC(1899, 11, 30) + Math.round(value) * 86400000
    return new Date(utc).toISOString()
  }
  return typeof value === 'string' ? value.trim() : value
}

const pickAliasedValue = (row, canonical) => {
  for (const alias of ALIASES[canonical] || [canonical]) {
    if (row[alias] !== undefined && row[alias] !== null && row[alias] !== '') {
      return row[alias]
    }
  }
  return null
}

const normalizeMappedRow = (rawRow) => {
  const raw = {}
  for (const [key, value] of Object.entries(rawRow)) {
    raw[normalizeKey(key)] = excelDateToValue(value)
  }

  const mapped = {}
  for (const canonical of Object.keys(ALIASES)) {
    mapped[canonical] = pickAliasedValue(raw, canonical)
  }

  if (mapped.completion_percentage !== null) {
    mapped.completion_percentage = parsePercent(mapped.completion_percentage)
  }
  if (mapped.score !== null) mapped.score = parseNumber(mapped.score)
  if (mapped.forward_30_score !== null) mapped.forward_30_score = parseNumber(mapped.forward_30_score)

  return mapped
}

const scoreHeaderRow = (cells = []) => {
  const keys = cells.map(normalizeKey).filter(Boolean)
  let score = 0
  const bump = (canonical, points) => {
    if (keys.some((key) => (ALIASES[canonical] || []).includes(key))) score += points
  }
  bump('employee_id', 4)
  bump('employee_name', 3)
  bump('directorate', 2)
  bump('sub_directorate', 1)
  bump('region', 1)
  bump('branch', 1)
  bump('course_name', 2)
  bump('completion_status', 1)
  bump('score', 1)
  return score
}

const isSubHeaderRow = (row = []) => {
  if (looksLikeEmployeeId(row[0]) || looksLikeEmployeeId(row[1])) return false
  const firstFilled = [0, 1, 2].filter((i) => row[i] !== null && String(row[i]).trim() !== '').length
  if (firstFilled > 0) return false
  return row.some((cell) => /score|status|time|completion/i.test(String(cell || '')))
}

const readSheetMatrix = (filePath, sheetLabel) => {
  const workbook = xlsx.readFile(filePath)
  const firstSheetName = workbook.SheetNames[0]
  if (!firstSheetName) {
    throw new Error(`Workbook "${sheetLabel}" does not contain any sheets`)
  }
  const sheet = workbook.Sheets[firstSheetName]
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null, raw: false })
  if (!rows.length) {
    throw new Error(`Workbook "${sheetLabel}" is empty`)
  }
  return rows
}

const findHeaderRowIndex = (rows) => {
  let best = { index: 0, score: -1 }
  const limit = Math.min(rows.length, 12)
  for (let i = 0; i < limit; i += 1) {
    const score = scoreHeaderRow(rows[i] || [])
    if (score > best.score) best = { index: i, score }
  }
  return best
}

const findDataStartIndex = (rows, fromIndex) => {
  for (let i = fromIndex; i < rows.length; i += 1) {
    const row = rows[i] || []
    if (looksLikeEmployeeId(row[0]) || looksLikeEmployeeId(row[1])) return i
  }
  return fromIndex
}

const assertRequired = (row, required, sheetLabel) => {
  const missing = required.filter((col) => {
    const value = row[col]
    return value === null || value === undefined || value === ''
  })
  if (missing.length > 0) {
    throw new Error(
      `Sheet "${sheetLabel}" is missing required columns (or values): ${missing.join(', ')}. ` +
      'Accepted aliases include NIK/USERNAME/employee_id, Nama/employee_name, Direktorat/directorate, etc.',
    )
  }
}

const parseCourseCell = (value) => {
  if (value === null || value === undefined || value === '' || value === '-') {
    return { status: 'Incompleted', date: null, score: null, percentage: 0 }
  }

  const text = String(value).trim()
  const dateMatch = text.match(/(\d{4}-\d{2}-\d{2})(?:[ T](\d{2}:\d{2}:\d{2}))?/)
  const scoreMatch = text.match(/\((\d+(?:\.\d+)?)\)\s*$/)
  const score = scoreMatch ? Number(scoreMatch[1]) : parseNumber(text)
  let status = 'Incompleted'
  if (/^completed/i.test(text)) status = 'Completed'
  else if (/not enrolled|not started/i.test(text)) status = 'Not Started'

  const date = dateMatch
    ? new Date(`${dateMatch[1]}T${dateMatch[2] || '00:00:00'}`).toISOString()
    : null

  return {
    status,
    date,
    score,
    percentage: status === 'Completed' ? (score ?? 100) : (score ?? 0),
  }
}

const isWideLogPlus = (rows) => {
  const headerKeys = (rows[0] || []).map(normalizeKey)
  const hasUsername = headerKeys.includes('username') || headerKeys.includes('nik')
  const hasName = headerKeys.includes('name') || headerKeys.includes('nama')
  const hasDirectorate = headerKeys.includes('directorate')
  const hasCourse = headerKeys.includes('course_name') || headerKeys.includes('course')
  const extraColumns = headerKeys.slice(9).filter(Boolean).length
  return hasUsername && hasName && hasDirectorate && !hasCourse && extraColumns >= 1
}

const parseWideLogPlus = (rows) => {
  const headerRow = rows[0] || []
  const dataStart = findDataStartIndex(rows, 1)
  if (dataStart < 0 || dataStart >= rows.length) {
    throw new Error('Workbook "LOG+" is empty')
  }

  const courseHeaderRow = rows[Math.max(dataStart - 1, 0)] || []
  const identityIndex = {}
  headerRow.forEach((cell, index) => {
    const key = normalizeKey(cell)
    if (!key) return
    if (['username', 'nik', 'employee_id'].includes(key)) identityIndex.employee_id = index
    if (['name', 'nama', 'employee_name'].includes(key)) identityIndex.employee_name = index
    if (key === 'directorate') identityIndex.directorate = index
    if (key === 'sub_directorate') identityIndex.sub_directorate = index
    if (key === 'completion') identityIndex.overall_completion = index
  })

  const courseColumns = []
  const width = Math.max(headerRow.length, courseHeaderRow.length)
  for (let index = 0; index < width; index += 1) {
    if (Object.values(identityIndex).includes(index)) continue
    const identityKey = normalizeKey(headerRow[index])
    if (LOG_IDENTITY_KEYS.has(identityKey)) continue
    const courseName = String(courseHeaderRow[index] || headerRow[index] || '').trim()
    if (!courseName) continue
    if (normalizeKey(courseName) === 'attempt') continue
    courseColumns.push({ index, courseName })
  }

  if (courseColumns.length === 0) {
    throw new Error('Sheet "LOG+" does not contain course columns')
  }

  const parsed = []
  for (let i = dataStart; i < rows.length; i += 1) {
    const row = rows[i] || []
    const employeeId = row[identityIndex.employee_id]
    const employeeName = row[identityIndex.employee_name]
    if (!looksLikeEmployeeId(employeeId) && !employeeName) continue
    const overallCompletion = parsePercent(row[identityIndex.overall_completion])

    for (const course of courseColumns) {
      const cell = parseCourseCell(row[course.index])
      parsed.push({
        employee_id: employeeId == null ? null : String(employeeId).trim(),
        employee_name: employeeName == null ? null : String(employeeName).trim(),
        directorate: row[identityIndex.directorate] ?? null,
        sub_directorate: row[identityIndex.sub_directorate] ?? null,
        course_name: course.courseName,
        completion_status: cell.status,
        completion_percentage: cell.percentage,
        overall_completion: overallCompletion,
        completion_date: cell.date,
        score: cell.score,
      })
    }
  }

  if (parsed.length === 0) {
    throw new Error('Workbook "LOG+" is empty')
  }

  assertRequired(parsed[0], ['employee_id', 'employee_name', 'directorate', 'course_name', 'completion_status'], 'LOG+')
  return parsed
}

const parseGeneric = (rows, requiredColumns, sheetLabel) => {
  const headerInfo = findHeaderRowIndex(rows)
  if (headerInfo.score < 4) {
    throw new Error(
      `Sheet "${sheetLabel}" is missing required columns (or values): ${requiredColumns.join(', ')}. ` +
      'Accepted aliases include NIK/USERNAME/employee_id, Nama/employee_name, Direktorat/directorate, etc.',
    )
  }

  const headerRow = rows[headerInfo.index] || []
  const nextRow = rows[headerInfo.index + 1] || []
  const useSubHeader = isSubHeaderRow(nextRow)
  const width = Math.max(headerRow.length, useSubHeader ? nextRow.length : 0)
  const headers = []
  for (let i = 0; i < width; i += 1) {
    const specific = useSubHeader ? nextRow[i] : null
    headers.push(specific !== null && String(specific).trim() !== '' ? specific : headerRow[i])
  }

  const dataStart = findDataStartIndex(rows, headerInfo.index + 1 + (useSubHeader ? 1 : 0))
  const mappedRows = []
  for (let i = dataStart; i < rows.length; i += 1) {
    const row = rows[i] || []
    const raw = {}
    headers.forEach((header, index) => {
      if (header === null || header === undefined || String(header).trim() === '') return
      raw[header] = row[index] ?? null
    })
    const mapped = normalizeMappedRow(raw)
    const hasValue = Object.values(mapped).some((value) => value !== null && value !== '')
    if (!hasValue) continue
    mappedRows.push(mapped)
  }

  if (mappedRows.length === 0) {
    throw new Error(`Workbook "${sheetLabel}" is empty`)
  }

  assertRequired(mappedRows[0], requiredColumns, sheetLabel)
  return mappedRows
}

export const parseLogPlus = (filePath) => {
  const rows = readSheetMatrix(filePath, 'LOG+')
  if (isWideLogPlus(rows)) return parseWideLogPlus(rows)
  return parseGeneric(
    rows,
    ['employee_id', 'employee_name', 'directorate', 'course_name', 'completion_status'],
    'LOG+',
  )
}

export const parseVrLearning = (filePath) => {
  const rows = readSheetMatrix(filePath, 'VR Learning')
  return parseGeneric(
    rows,
    ['employee_id', 'employee_name', 'directorate', 'region', 'branch', 'completion_status'],
    'VR Learning',
  ).map((row) => ({
    ...row,
    forward_30_score: row.forward_30_score ?? row.score ?? null,
  }))
}
