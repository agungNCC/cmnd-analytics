const ACCEPT = '.xlsx,.xls'

export default function FileDropZone({ label, file, onChange, disabled }) {
  const handleDrop = (event) => {
    event.preventDefault()
    if (disabled) return
    const dropped = event.dataTransfer.files?.[0]
    if (dropped) onChange(dropped)
  }

  const handleSelect = (event) => {
    const selected = event.target.files?.[0]
    if (selected) onChange(selected)
  }

  return (
    <label
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className={[
        'flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors',
        disabled ? 'cursor-not-allowed opacity-60' : 'hover:border-primary-700 hover:bg-primary-50',
        file ? 'border-primary-700 bg-primary-50' : 'border-gray-300 bg-white',
      ].join(' ')}
    >
      <input
        type="file"
        accept={ACCEPT}
        disabled={disabled}
        onChange={handleSelect}
        className="hidden"
      />
      <p className="text-sm font-medium text-gray-900">{label}</p>
      <p className="mt-1 text-xs text-gray-500">Drag and drop or click to browse (.xlsx, .xls)</p>
      {file ? (
        <p className="mt-3 rounded-md bg-white px-3 py-1 text-sm text-primary-700">{file.name}</p>
      ) : null}
    </label>
  )
}
