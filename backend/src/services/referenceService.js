import path from 'path'
import fs from 'fs'
import xlsx from 'xlsx'
import { query } from '../config/database.js'

const REFERENCE_DIR = path.resolve(process.env.UPLOAD_DIR || 'uploads', 'references')
fs.mkdirSync(REFERENCE_DIR, { recursive: true })

// Default files bundled with the app (used when no upload yet)
const DEFAULT_REFERENCE_DIR = process.env.REFERENCE_DEFAULT_DIR
  || path.resolve('samples')
const DEFAULTS = {
  mc:            path.resolve(DEFAULT_REFERENCE_DIR, 'reference_file.xlsx'),
  mandatory_nip: path.resolve(DEFAULT_REFERENCE_DIR, 'Mandatory2026.xlsx'),
  template:      path.resolve(DEFAULT_REFERENCE_DIR, 'template.xlsx'),
}

const TEMPLATE_FALLBACKS = [
  process.env.EXPORT_SAMPLE_PATH,
  DEFAULTS.template,
  path.resolve('frontend-public/template.xlsx'),
  path.resolve('samples/template.xlsx'),
  path.resolve('samples/sample.xlsx'),
].filter(Boolean)

const DEFAULT_META = {
  mc: {
    original_name: 'reference_file.xlsx',
    sheet_name: 'MC Jul 26',
    nip_sheet_name: null,
  },
  mandatory_nip: {
    original_name: 'Mandatory2026.xlsx',
    sheet_name: null,
    nip_sheet_name: 'Mandatory 2026',
  },
  template: {
    original_name: 'template.xlsx',
    sheet_name: 'Summary All, Mandatory 2026, LOG+, VR Learning',
    nip_sheet_name: null,
  },
}

/**
 * Derive sheet display name from A1 cell title.
 * "Monthly Closing Jul 2026" → "MC Jul 26"
 * Falls back to the raw sheet name in the workbook if pattern doesn't match.
 */
export const deriveSheetName = (a1Title, fallback = 'MC') => {
  if (!a1Title) return fallback
  // Pattern: Monthly Closing <Month> <YYYY>
  const match = String(a1Title).match(/monthly\s+closing\s+(\w+)\s+(\d{4})/i)
  if (match) {
    const mon = match[1].slice(0, 3)
    const yy  = match[2].slice(-2)
    return `MC ${mon.charAt(0).toUpperCase()}${mon.slice(1).toLowerCase()} ${yy}`
  }
  return fallback
}

/**
 * Derive mandatory NIP sheet name from filename.
 * "Mandatory2026.xlsx" → "Mandatory 2026"
 * "Mandatory2027.xlsx" → "Mandatory 2027"
 */
export const deriveMandatorySheetName = (filename) => {
  const match = String(filename).match(/Mandatory(\d{4})/i)
  if (match) return `Mandatory ${match[1]}`
  return 'Mandatory 2026'
}

/**
 * Read active reference metadata from DB.
 * Falls back to default files when no row exists.
 */
export const getReference = async (fileType) => {
  const { rows } = await query(
    'SELECT * FROM reference_files WHERE file_type = $1',
    [fileType],
  )
  if (rows[0]) return rows[0]

  const meta = DEFAULT_META[fileType]
  if (!meta) throw new Error(`Unknown file_type: ${fileType}`)

  // Return default metadata without DB row
  return {
    file_type:      fileType,
    original_name:  meta.original_name,
    file_path:      DEFAULTS[fileType],
    sheet_name:     meta.sheet_name,
    sheet_title:    null,
    nip_sheet_name: meta.nip_sheet_name,
    row_count:      null,
  }
}

/**
 * Resolve the active export template workbook path.
 * Uses uploaded template from DB, then bundled defaults.
 */
export const getExportTemplatePath = async () => {
  const ref = await getReference('template')
  if (ref.file_path && fs.existsSync(ref.file_path)) {
    return ref.file_path
  }

  const fallback = TEMPLATE_FALLBACKS.find((candidate) => fs.existsSync(candidate))
  if (!fallback) {
    throw new Error(`Export template not found. Checked: ${TEMPLATE_FALLBACKS.join(', ')}`)
  }
  return fallback
}

/**
 * Read all NIP rows from the active Mandatory NIP file.
 * Returns array of NIP strings.
 */
export const getMandatoryNipList = async () => {
  const ref = await getReference('mandatory_nip')
  const filePath = ref.file_path
  if (!fs.existsSync(filePath)) {
    throw new Error(`Mandatory NIP file not found: ${filePath}`)
  }

  const wb = xlsx.readFile(filePath)
  const sheetName = ref.nip_sheet_name || wb.SheetNames[0]
  const sh = wb.Sheets[sheetName] || wb.Sheets[wb.SheetNames[0]]
  const rows = xlsx.utils.sheet_to_json(sh, { header: 1, defval: null, raw: false })

  // Header row: ["No","NIP"] → data starts row 2 (index 1)
  const nips = []
  for (let i = 1; i < rows.length; i++) {
    const nipRaw = rows[i]?.[1]
    if (nipRaw !== null && nipRaw !== undefined && String(nipRaw).trim()) {
      nips.push(String(nipRaw).trim())
    }
  }
  return nips
}

/**
 * Read MC reference workbook.
 * Returns { wb, sheetName, allRows, headerRowIndex }
 */
export const getMcReference = async () => {
  const ref = await getReference('mc')
  const filePath = ref.file_path
  if (!fs.existsSync(filePath)) {
    throw new Error(`MC reference file not found: ${filePath}`)
  }

  const wb = xlsx.readFile(filePath, { cellFormula: false, raw: false })
  const rawSheetName = wb.SheetNames[0]
  const sh = wb.Sheets[rawSheetName]

  // Derive sheet display name from A1
  const a1Title = sh.A1?.v ?? sh.A1?.w ?? null
  const sheetName = ref.sheet_name || deriveSheetName(a1Title, rawSheetName)

  const rows = xlsx.utils.sheet_to_json(sh, { header: 1, defval: null, raw: false })

  // Find header row — row with "NIP" in it (row index 3 in acuan = index 3)
  let headerRowIndex = 3
  for (let i = 0; i < Math.min(rows.length, 8); i++) {
    const keys = (rows[i] || []).map((c) => String(c ?? '').trim().toUpperCase())
    if (keys.includes('NIP')) {
      headerRowIndex = i
      break
    }
  }

  return { wb, sheetName, rows, headerRowIndex, a1Title, filePath }
}

/**
 * Build a Map<NIP, rowObject> from MC reference.
 * Uses row at headerRowIndex as column headers.
 */
export const buildMcLookup = async (mcRef = null) => {
  const { rows, headerRowIndex } = mcRef || await getMcReference()
  const headerRow = rows[headerRowIndex] || []

  const nipColIndex = headerRow.findIndex((h) =>
    String(h ?? '').trim().toUpperCase() === 'NIP',
  )
  if (nipColIndex === -1) throw new Error('MC reference: NIP column not found')

  const map = new Map()
  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i] || []
    const nip = String(row[nipColIndex] ?? '').trim()
    if (!nip) continue
    const obj = {}
    headerRow.forEach((h, col) => {
      if (h) obj[String(h).trim()] = row[col] ?? null
    })
    map.set(nip, obj)
  }
  return map
}

/**
 * Save an uploaded reference file and update DB.
 */
export const saveReferenceFile = async ({
  fileType,
  originalName,
  tempPath,
  uploadedBy,
}) => {
  if (!DEFAULTS[fileType]) throw new Error(`Unknown file_type: ${fileType}`)

  const destPath = path.join(REFERENCE_DIR, `${fileType}_${Date.now()}_${originalName}`)
  fs.copyFileSync(tempPath, destPath)

  // Parse metadata from file
  const wb = xlsx.readFile(destPath, { raw: false })
  const sh = wb.Sheets[wb.SheetNames[0]]
  const rows = xlsx.utils.sheet_to_json(sh, { header: 1, defval: null, raw: false })

  let sheetName = null
  let sheetTitle = null
  let nipSheetName = null
  let rowCount = null

  if (fileType === 'mc') {
    sheetTitle = sh.A1?.v ?? sh.A1?.w ?? null
    sheetName  = deriveSheetName(sheetTitle, wb.SheetNames[0])
    rowCount   = rows.length - 4  // roughly data rows
  } else if (fileType === 'mandatory_nip') {
    nipSheetName = deriveMandatorySheetName(originalName)
    rowCount     = rows.length - 1
  } else if (fileType === 'template') {
    sheetName = wb.SheetNames.join(', ')
    rowCount = wb.SheetNames.length
    if (wb.SheetNames.length < 4) {
      throw new Error(
        'Template harus memiliki minimal 4 sheet (Summary All, Mandatory, LOG+, VR Learning)',
      )
    }
  }

  await query(
    `INSERT INTO reference_files
       (file_type, original_name, file_path, sheet_name, sheet_title, nip_sheet_name, row_count, uploaded_by, uploaded_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,CURRENT_TIMESTAMP)
     ON CONFLICT (file_type) DO UPDATE SET
       original_name  = EXCLUDED.original_name,
       file_path      = EXCLUDED.file_path,
       sheet_name     = EXCLUDED.sheet_name,
       sheet_title    = EXCLUDED.sheet_title,
       nip_sheet_name = EXCLUDED.nip_sheet_name,
       row_count      = EXCLUDED.row_count,
       uploaded_by    = EXCLUDED.uploaded_by,
       uploaded_at    = CURRENT_TIMESTAMP`,
    [fileType, originalName, destPath, sheetName, sheetTitle, nipSheetName, rowCount, uploadedBy],
  )

  return { destPath, sheetName, sheetTitle, nipSheetName, rowCount }
}

export { REFERENCE_DIR }
