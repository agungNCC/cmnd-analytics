import { SHEET_OPTIONS } from '../../hooks/useExport.js'

export default function ExportCheckboxes({ selectedSheets, onChange, includeFormulas, onToggleFormulas }) {
  const toggleSheet = (sheetId) => {
    if (selectedSheets.includes(sheetId)) {
      onChange(selectedSheets.filter((id) => id !== sheetId))
    } else {
      onChange([...selectedSheets, sheetId])
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Sheets to include</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {SHEET_OPTIONS.map((sheet) => (
            <label
              key={sheet.id}
              className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2 hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={selectedSheets.includes(sheet.id)}
                onChange={() => toggleSheet(sheet.id)}
                className="h-4 w-4 rounded border-gray-300 text-primary-700 focus:ring-primary-700"
              />
              <span className="text-sm text-gray-700">{sheet.label}</span>
            </label>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2 hover:bg-gray-50">
        <input
          type="checkbox"
          checked={includeFormulas}
          onChange={(e) => onToggleFormulas(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-primary-700 focus:ring-primary-700"
        />
        <span className="text-sm text-gray-700">Include Excel formulas</span>
      </label>
    </div>
  )
}
