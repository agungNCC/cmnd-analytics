import { useState } from 'react'
import api from '../services/api.js'

export const SHEET_OPTIONS = [
  { id: 'summary_all', label: 'Summary All' },
  { id: 'mandatory_2026', label: 'Mandatory 2026' },
  { id: 'log_plus', label: 'LOG+' },
  { id: 'vr_learning', label: 'VR Learning' },
]

export const useExport = () => {
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState(null)

  const exportXlsx = async ({ sheets, includeFormulas, filters }) => {
    setIsExporting(true)
    setError(null)

    try {
      const response = await api.post(
        '/api/export/xlsx',
        {
          sheets,
          include_formulas: includeFormulas,
          filters,
        },
        { responseType: 'blob' },
      )

      const disposition = response.headers['content-disposition'] || ''
      const match = disposition.match(/filename="(.+)"/)
      const filename = match?.[1] || `CMND_Analytics_${new Date().toISOString().slice(0, 10)}.xlsx`

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      return filename
    } catch (err) {
      const message = err.response?.data instanceof Blob
        ? 'Export failed'
        : err.response?.data?.error || 'Export failed'
      setError(message)
      throw new Error(message)
    } finally {
      setIsExporting(false)
    }
  }

  return { exportXlsx, isExporting, error }
}
