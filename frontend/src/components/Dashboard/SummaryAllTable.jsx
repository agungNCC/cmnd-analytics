import { useSummaryAll } from '../../hooks/useDataTable.js'
import TableShell, { DataTable } from './TableShell.jsx'

const columns = [
  { key: 'directorate', label: 'Directorate' },
  { key: 'total_employees', label: 'Total' },
  { key: 'log_plus_completion_rate', label: 'LOG+ Rate', render: (r) => `${r.log_plus_completion_rate ?? 0}%` },
  { key: 'vr_learning_completion_rate', label: 'VR Rate', render: (r) => `${r.vr_learning_completion_rate ?? 0}%` },
  { key: 'combined_completion_rate', label: 'Combined', render: (r) => `${r.combined_completion_rate ?? 0}%` },
]

export default function SummaryAllTable() {
  const { data, isLoading, isError } = useSummaryAll()

  if (isLoading) return <TableShell title="Summary All"><p className="text-sm text-gray-500">Loading...</p></TableShell>
  if (isError) return <TableShell title="Summary All"><p className="text-sm text-red-600">Failed to load summary data.</p></TableShell>

  return (
    <TableShell title="Summary All">
      <DataTable columns={columns} rows={data} emptyMessage="No summary data yet. Upload files to populate this tab." />
    </TableShell>
  )
}
