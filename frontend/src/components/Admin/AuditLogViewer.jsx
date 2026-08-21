import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import api from '../../services/api.js'

const ACTIONS = [
  '',
  'login',
  'logout',
  'upload_started',
  'upload_completed',
  'download',
  'user_created',
  'user_updated',
  'user_deleted',
]

export default function AuditLogViewer() {
  const [filters, setFilters] = useState({
    action: '',
    status: '',
    from: '',
    to: '',
  })

  const { data: logs = [], isLoading, isError } = useQuery({
    queryKey: ['admin-audit-logs', filters],
    queryFn: async () => {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value),
      )
      const { data } = await api.get('/api/admin/audit-logs', { params })
      return data
    },
  })

  const updateFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }))

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-gray-900">Audit Logs</h2>

      <div className="flex flex-wrap gap-2">
        <select
          value={filters.action}
          onChange={(e) => updateFilter('action', e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All actions</option>
          {ACTIONS.filter(Boolean).map((action) => (
            <option key={action} value={action}>{action}</option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={(e) => updateFilter('status', e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All status</option>
          <option value="success">success</option>
          <option value="failure">failure</option>
          <option value="in_progress">in_progress</option>
        </select>
        <input
          type="date"
          value={filters.from}
          onChange={(e) => updateFilter('from', e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={filters.to}
          onChange={(e) => updateFilter('to', e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={() => setFilters({ action: '', status: '', from: '', to: '' })}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
        >
          Reset
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading audit logs...</p>
      ) : isError ? (
        <p className="text-sm text-red-600">Failed to load audit logs.</p>
      ) : !logs.length ? (
        <div className="rounded-lg border border-dashed border-gray-200 px-4 py-10 text-center text-sm text-gray-500">
          No audit logs found for the selected filters.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Time', 'User', 'Action', 'Resource', 'Status', 'Details'].map((label) => (
                  <th key={label} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-3 py-2 text-gray-700">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-gray-700">{log.username || '-'}</td>
                  <td className="px-3 py-2 text-gray-700">{log.action}</td>
                  <td className="px-3 py-2 text-gray-700">{log.resource_name || log.resource_type || '-'}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                      log.status === 'success'
                        ? 'bg-green-100 text-green-700'
                        : log.status === 'failure'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="max-w-sm px-3 py-2 text-gray-500">
                    {log.error_message || log.details ? (
                      <details>
                        <summary className="cursor-pointer font-medium text-gray-700 hover:text-primary-700">
                          View full details
                        </summary>
                        <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-all rounded-md bg-gray-50 p-3 text-xs text-gray-700">
                          {log.error_message || JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    ) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
