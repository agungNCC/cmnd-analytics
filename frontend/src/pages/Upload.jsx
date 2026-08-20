import { useState } from 'react'
import toast from 'react-hot-toast'
import FileDropZone from '../components/Upload/FileDropZone.jsx'
import UploadProgress from '../components/Upload/UploadProgress.jsx'
import UploadHistory from '../components/Upload/UploadHistory.jsx'
import { useFileUpload, useUploadHistory } from '../hooks/useFileUpload.js'

const validateXlsx = (file) => {
  if (!file) return 'File is required'
  const valid = /\.(xlsx|xls)$/i.test(file.name)
  return valid ? null : `${file.name} must be an Excel file`
}

export default function Upload() {
  const [logPlusFile, setLogPlusFile] = useState(null)
  const [vrLearningFile, setVrLearningFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('idle')

  const uploadMutation = useFileUpload()
  const historyQuery = useUploadHistory()

  const handleSubmit = async (event) => {
    event.preventDefault()

    const logError = validateXlsx(logPlusFile)
    const vrError = validateXlsx(vrLearningFile)
    if (logError || vrError) {
      toast.error(logError || vrError)
      return
    }

    setStatus('uploading')
    setProgress(0)

    try {
      const result = await uploadMutation.mutateAsync({
        logPlusFile,
        vrLearningFile,
        onProgress: setProgress,
      })

      setStatus('success')
      setProgress(100)
      toast.success(result.message || 'Files received, processing in background')
      setLogPlusFile(null)
      setVrLearningFile(null)
    } catch (err) {
      setStatus('error')
      toast.error(err.response?.data?.error || 'Upload failed')
    }
  }

  const isUploading = uploadMutation.isPending

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Upload Data</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload Mandatory LOG+ and VR Learning Excel files. Data will be processed and reflected on the dashboard.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <FileDropZone
            label="LOG+ File"
            file={logPlusFile}
            onChange={setLogPlusFile}
            disabled={isUploading}
          />
          <FileDropZone
            label="VR Learning File"
            file={vrLearningFile}
            onChange={setVrLearningFile}
            disabled={isUploading}
          />
        </div>

        <UploadProgress progress={progress} status={status} />

        <button
          type="submit"
          disabled={isUploading || !logPlusFile || !vrLearningFile}
          className="rounded-md bg-primary-700 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-60"
        >
          {isUploading ? 'Uploading...' : 'Upload & Process'}
        </button>
      </form>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-gray-900">Upload History</h2>
        <UploadHistory
          items={historyQuery.data}
          isLoading={historyQuery.isLoading}
          isError={historyQuery.isError}
        />
      </div>
    </div>
  )
}
