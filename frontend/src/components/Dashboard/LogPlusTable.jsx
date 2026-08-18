import { useDataTable } from '../../hooks/useDataTable.js'
import Pagination from './Pagination.jsx'
import TableShell, { DataTable } from './TableShell.jsx'

const columns = [
  { key: 'employee_id', label: 'Employee ID' },
  { key: 'employee_name', label: 'Name' },
  { key: 'directorate', label: 'Directorate' },
  { key: 'course_name', label: 'Course' },
  { key: 'completion_status', label: 'Status' },
  { key: 'completion_percentage', label: 'Completion %', render: (r) => `${r.completion_percentage ?? 0}%` },
  { key: 'completion_date', label: 'Completed', render: (r) => r.completion_date ? new Date(r.completion_date).toLocaleDateString() : '-' },
  { key: 'score', label: 'Score' },
]

export default function LogPlusTable() {
  const table = useDataTable('/api/data/log-plus')

  const toolbar = (
    <div className="flex flex-wrap gap-2">
      <input
        type="search"
        placeholder="Search..."
        value={table.search}
        onChange={(e) => table.setSearch(e.target.value)}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm"
      />
      <input
        type="text"
        placeholder="Course"
        value={table.filters.course || ''}
        onChange={(e) => table.updateFilter('course', e.target.value)}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm"
      />
      <select
        value={table.filters.status || ''}
        onChange={(e) => table.updateFilter('status', e.target.value)}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm"
      >
        <option value="">All status</option>
        <option value="Completed">Completed</option>
        <option value="Incompleted">Incompleted</option>
      </select>
      <button type="button" onClick={table.resetFilters} className="rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50">
        Reset
      </button>
    </div>
  )

  return (
    <TableShell title="LOG+" toolbar={toolbar}>
      {table.isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : table.isError ? (
        <p className="text-sm text-red-600">Failed to load LOG+ data.</p>
      ) : (
        <>
          <DataTable columns={columns} rows={table.data} emptyMessage="No LOG+ data yet." />
          <Pagination page={table.page} totalPages={table.totalPages} onPageChange={table.setPage} isFetching={table.isFetching} />
        </>
      )}
    </TableShell>
  )
}
