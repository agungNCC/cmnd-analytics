export default function FilterPanel({ filters, onChange }) {
  const update = (key, value) => onChange({ ...filters, [key]: value })

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">Export filters</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm text-gray-600">Directorate</span>
          <input
            type="text"
            value={filters.directorate || ''}
            onChange={(e) => update('directorate', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="e.g. IT"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-gray-600">Status</span>
          <select
            value={filters.status || ''}
            onChange={(e) => update('status', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">All</option>
            <option value="Completed">Completed</option>
            <option value="Incompleted">Incompleted</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-gray-600">Date from</span>
          <input
            type="date"
            value={filters.date_from || ''}
            onChange={(e) => update('date_from', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-gray-600">Date to</span>
          <input
            type="date"
            value={filters.date_to || ''}
            onChange={(e) => update('date_to', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </label>
      </div>
    </div>
  )
}
