export default function Pagination({ page, totalPages, onPageChange, isFetching }) {
  if (totalPages <= 1) return null

  return (
    <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
      <span>{isFetching ? 'Refreshing...' : `Page ${page} of ${totalPages}`}</span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-md border border-gray-300 px-3 py-1 disabled:opacity-50 hover:bg-gray-50"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-md border border-gray-300 px-3 py-1 disabled:opacity-50 hover:bg-gray-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}
