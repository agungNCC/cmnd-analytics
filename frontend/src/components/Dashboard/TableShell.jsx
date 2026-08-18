export default function TableShell({ title, children, toolbar }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-4 py-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          {toolbar}
        </div>
      </div>
      <div className="overflow-x-auto p-4">{children}</div>
    </div>
  )
}

export function DataTable({ columns, rows, emptyMessage = 'No data available' }) {
  if (!rows?.length) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 px-4 py-10 text-center text-sm text-gray-500">
        {emptyMessage}
      </div>
    )
  }

  return (
    <table className="min-w-full divide-y divide-gray-200 text-sm">
      <thead className="bg-gray-50">
        <tr>
          {columns.map((col) => (
            <th
              key={col.key}
              className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 bg-white">
        {rows.map((row, idx) => (
          <tr key={row.id ?? idx} className="hover:bg-gray-50">
            {columns.map((col) => (
              <td key={col.key} className="whitespace-nowrap px-3 py-2 text-gray-700">
                {col.render ? col.render(row) : row[col.key] ?? '-'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
