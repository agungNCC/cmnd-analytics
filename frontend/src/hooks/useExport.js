import { useState } from 'react'
import api from '../services/api.js'

export const EXPORT_SHEET_OPTIONS = [
  { id: 'mandatory_2026', label: 'Mandatory 2026' },
  { id: 'log_plus', label: 'LOG+' },
  { id: 'vr_learning', label: 'VR Learning' },
]

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const readAxiosError = async (err) => {
  const status = err.response?.status
  const data = err.response?.data
  if (data instanceof Blob) {
    try {
      const text = await data.text()
      const parsed = JSON.parse(text)
      if (parsed?.error) return parsed.error
    } catch {
      // ignore non-JSON error bodies (e.g. nginx 502 HTML)
    }
  }
  if (typeof data?.error === 'string') return data.error
  if (status === 502 || status === 504) {
    return 'Server busy generating the report. Please wait and try again.'
  }
  return err.message || 'Export failed'
}

export const useExport = () => {
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)

  const exportXlsx = async () => {
    setIsExporting(true)
    setError(null)
    setProgress(0)

    try {
      const { data: started } = await api.post('/api/export/xlsx', null, { timeout: 60000 })

      const exportId = started.export_id
      let status = started.status
      let attempts = 0

      while (status === 'processing') {
        if (++attempts > 300) {
          throw new Error('Export timed out')
        }
        await sleep(2000)
        const { data } = await api.get(`/api/export/status/${exportId}`, { timeout: 60000 })
        status = data.status
        setProgress(data.progress ?? 0)
        if (status === 'failed') {
          throw new Error(data.error_message || 'Export failed')
        }
      }

      const response = await api.get(`/api/export/download/${exportId}`, {
        responseType: 'blob',
        timeout: 300000,
      })

      const filename = started.filename || `CMND_Analytics_${new Date().toISOString().slice(0, 10)}.xlsx`
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      setProgress(100)
      return filename
    } catch (err) {
      const message = await readAxiosError(err)
      setError(message)
      throw new Error(message)
    } finally {
      setIsExporting(false)
    }
  }

  return { exportXlsx, isExporting, error, progress }
}
