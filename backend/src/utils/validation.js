/**
 * Validasi file XLSX upload
 */
export const validateXlsxFile = (file) => {
  if (!file) throw new Error('File is required')
  const allowed = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
  ]
  if (!allowed.includes(file.mimetype) && !file.originalname.match(/\.(xlsx|xls)$/i)) {
    throw new Error(`File "${file.originalname}" must be an Excel file (.xlsx or .xls)`)
  }
  const maxSize = parseInt(process.env.MAX_FILE_SIZE || '52428800')
  if (file.size > maxSize) {
    throw new Error(`File "${file.originalname}" exceeds maximum size of ${maxSize / 1024 / 1024}MB`)
  }
}

/**
 * Validasi required columns di sheet
 */
export const validateColumns = (row, required, sheetName) => {
  const missing = required.filter((col) => !(col in row))
  if (missing.length > 0) {
    throw new Error(`Sheet "${sheetName}" is missing columns: ${missing.join(', ')}`)
  }
}
