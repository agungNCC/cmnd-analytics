const statusClass = {
  complete: 'bg-green-100 text-green-700',
  processing: 'bg-yellow-100 text-yellow-700',
  pending: 'bg-gray-100 text-gray-700',
  error: 'bg-red-100 text-red-700',
}

export default function UploadHistory({ items, isLoading, isError }) {
  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading upload history...</p>
  }

  if (isError) {
    return <p className="text-sm text-red-600">Failed to load upload history.</p>
  }

  if (!items?.length) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 px-4 py-10 text-center text-sm text-gray-500">
        No uploads yet. Upload LOG+ and VR Learning files to get started.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {['Date', 'User', 'LOG+ File', 'VR File', 'Rows', 'Status', 'Error details'].map((label) => (
              <th key={label} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-3 py-2 text-gray-700">
                {new Date(item.upload_date).toLocaleString()}
              </td>
              <td className="px-3 py-2 text-gray-700">{item.username || item.email || '-'}</td>
              <td className="px-3 py-2 text-gray-700">{item.log_plus_filename}</td>
              <td className="px-3 py-2 text-gray-700">{item.vr_learning_filename}</td>
              <td className="px-3 py-2 text-gray-700">
                {item.log_plus_rows ?? 0} / {item.vr_learning_rows ?? 0}
              </td>
              <td className="px-3 py-2">
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusClass[item.processing_status] || statusClass.pending}`}>
                  {item.processing_status}
                </span>
              </td>
              <td className="max-w-sm px-3 py-2 text-gray-600">
                {item.error_message ? (
                  <details>
                    <summary className="cursor-pointer font-medium text-red-700 hover:text-red-800">
                      View full error
                    </summary>
                    <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-all rounded-md bg-red-50 p-3 text-xs text-red-800">
                      {item.error_message}
                    </pre>
                  </details>
                ) : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
