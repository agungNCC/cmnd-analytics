import { useState } from 'react'
import toast from 'react-hot-toast'
import ExportCheckboxes from '../components/Export/ExportCheckboxes.jsx'
import FilterPanel from '../components/Export/FilterPanel.jsx'
import { SHEET_OPTIONS, useExport } from '../hooks/useExport.js'

export default function Export() {
  const [selectedSheets, setSelectedSheets] = useState(SHEET_OPTIONS.map((s) => s.id))
  const [includeFormulas, setIncludeFormulas] = useState(true)
  const [filters, setFilters] = useState({})
  const { exportXlsx, isExporting, error } = useExport()

  const handleExport = async () => {
    if (selectedSheets.length === 0) {
      toast.error('Select at least one sheet to export')
      return
    }

    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value),
    )

    try {
      const filename = await exportXlsx({
        sheets: selectedSheets,
        includeFormulas,
        filters: cleanFilters,
      })
      toast.success(`Downloaded ${filename}`)
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Export Report</h1>
        <p className="mt-1 text-sm text-gray-500">
          Generate an Excel report with selected sheets, optional formulas, and filters.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <ExportCheckboxes
            selectedSheets={selectedSheets}
            onChange={setSelectedSheets}
            includeFormulas={includeFormulas}
            onToggleFormulas={setIncludeFormulas}
          />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <FilterPanel filters={filters} onChange={setFilters} />
        </div>
      </div>

      {error ? (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <button
        type="button"
        onClick={handleExport}
        disabled={isExporting || selectedSheets.length === 0}
        className="rounded-md bg-primary-700 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-60"
      >
        {isExporting ? 'Generating report...' : 'Download XLSX'}
      </button>
    </div>
  )
}
