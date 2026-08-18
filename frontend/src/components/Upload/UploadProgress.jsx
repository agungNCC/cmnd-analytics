export default function UploadProgress({ progress, status }) {
  if (status === 'idle') return null

  const label = status === 'success'
    ? 'Upload complete'
    : status === 'error'
      ? 'Upload failed'
      : 'Uploading files...'

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-gray-900">{label}</span>
        <span className="text-gray-500">{progress}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className={[
            'h-full transition-all duration-300',
            status === 'error' ? 'bg-red-500' : status === 'success' ? 'bg-green-500' : 'bg-primary-700',
          ].join(' ')}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
