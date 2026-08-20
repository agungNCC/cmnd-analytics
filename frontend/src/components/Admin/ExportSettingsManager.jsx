import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../services/api.js'
import ExportCheckboxes from '../Export/ExportCheckboxes.jsx'
import { EXPORT_SHEET_OPTIONS } from '../../hooks/useExport.js'

export default function ExportSettingsManager() {
  const queryClient = useQueryClient()
  const [selectedSheets, setSelectedSheets] = useState(
    EXPORT_SHEET_OPTIONS.map((sheet) => sheet.id),
  )
  const [includeFormulas, setIncludeFormulas] = useState(true)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-export-settings'],
    queryFn: async () => {
      const { data: response } = await api.get('/api/admin/export-settings')
      return response
    },
  })

  useEffect(() => {
    if (!data) return
    setSelectedSheets(data.sheets?.length ? data.sheets : EXPORT_SHEET_OPTIONS.map((s) => s.id))
    setIncludeFormulas(data.include_formulas ?? true)
  }, [data])

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { data: response } = await api.put('/api/admin/export-settings', {
        sheets: selectedSheets,
        include_formulas: includeFormulas,
      })
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-export-settings'] })
      toast.success('Export settings saved')
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to save export settings'),
  })

  const handleSave = () => {
    if (selectedSheets.length === 0) {
      toast.error('Select at least one sheet to include in export')
      return
    }
    saveMutation.mutate()
  }

  if (isLoading) return <p className="text-sm text-gray-500">Loading export settings...</p>
  if (isError) return <p className="text-sm text-red-600">Failed to load export settings.</p>

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-gray-900">Export Settings</h2>
        <p className="mt-1 text-sm text-gray-500">
          Configure which sheets are included when users download the report from the dashboard.
          Summary All is always included in the Excel file.
        </p>
      </div>

      <ExportCheckboxes
        options={EXPORT_SHEET_OPTIONS}
        selectedSheets={selectedSheets}
        onChange={setSelectedSheets}
        includeFormulas={includeFormulas}
        onToggleFormulas={setIncludeFormulas}
      />

      {data?.updated_at ? (
        <p className="text-xs text-gray-500">
          Last updated: {new Date(data.updated_at).toLocaleString('id-ID')}
        </p>
      ) : null}

      <button
        type="button"
        onClick={handleSave}
        disabled={saveMutation.isPending || selectedSheets.length === 0}
        className="rounded-md bg-primary-700 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-60"
      >
        {saveMutation.isPending ? 'Saving...' : 'Save Export Settings'}
      </button>
    </div>
  )
}
