import { useDataTable } from '../../hooks/useDataTable.js'
import Pagination from './Pagination.jsx'
import TableShell, { DataTable } from './TableShell.jsx'

const columns = [
  { key: 'employee_id', label: 'Employee ID' },
  { key: 'employee_name', label: 'Name' },
  { key: 'directorate', label: 'Directorate' },
  { key: 'region', label: 'Region' },
  { key: 'branch', label: 'Branch' },
  { key: 'forward_30_score', label: 'Forward 30' },
  { key: 'completion_status', label: 'Status' },
  { key: 'completion_time', label: 'Time' },
]

export default function VRLearningTable() {
  const table = useDataTable('/api/data/vr-learning')

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
        placeholder="Region"
        value={table.filters.region || ''}
        onChange={(e) => table.updateFilter('region', e.target.value)}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm"
      />
      <input
        type="text"
        placeholder="Branch"
        value={table.filters.branch || ''}
        onChange={(e) => table.updateFilter('branch', e.target.value)}
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
    <TableShell title="VR Learning" toolbar={toolbar}>
      {table.isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : table.isError ? (
        <p className="text-sm text-red-600">Failed to load VR Learning data.</p>
      ) : (
        <>
          <DataTable columns={columns} rows={table.data} emptyMessage="No VR Learning data yet." />
          <Pagination page={table.page} totalPages={table.totalPages} onPageChange={table.setPage} isFetching={table.isFetching} />
        </>
      )}
    </TableShell>
  )
}
