import { query } from '../config/database.js'

export const CONFIGURABLE_SHEETS = ['mandatory_2026', 'log_plus', 'vr_learning']
const ALLOWED_SHEETS = new Set(CONFIGURABLE_SHEETS)

const DEFAULT_SETTINGS = {
  sheets: [...CONFIGURABLE_SHEETS],
  include_formulas: true,
  updated_at: null,
}

export const getExportSettings = async () => {
  const { rows } = await query(
    'SELECT sheets, include_formulas, updated_at FROM export_settings WHERE id = 1',
  )

  if (!rows[0]) return DEFAULT_SETTINGS

  const sheets = (rows[0].sheets || []).filter((sheet) => ALLOWED_SHEETS.has(sheet))
  return {
    sheets: sheets.length ? sheets : DEFAULT_SETTINGS.sheets,
    include_formulas: rows[0].include_formulas ?? true,
    updated_at: rows[0].updated_at,
  }
}

export const saveExportSettings = async ({ sheets, includeFormulas, updatedBy }) => {
  const validSheets = (sheets || []).filter((sheet) => ALLOWED_SHEETS.has(sheet))
  if (!validSheets.length) {
    throw new Error('Select at least one sheet to include in export')
  }

  await query(
    `INSERT INTO export_settings (id, sheets, include_formulas, updated_by, updated_at)
     VALUES (1, $1, $2, $3, CURRENT_TIMESTAMP)
     ON CONFLICT (id) DO UPDATE SET
       sheets = EXCLUDED.sheets,
       include_formulas = EXCLUDED.include_formulas,
       updated_by = EXCLUDED.updated_by,
       updated_at = CURRENT_TIMESTAMP`,
    [validSheets, includeFormulas ?? true, updatedBy],
  )

  return getExportSettings()
}

export const resolveExportSheets = async () => {
  const settings = await getExportSettings()
  return ['summary_all', ...settings.sheets]
}
