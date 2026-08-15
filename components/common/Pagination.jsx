const Pagination = ({
  hasMore = false,
  onLoadMore,
  loading = false,
  className = '',
}) => {
  if (!hasMore) return null

  return (
    <div className={`flex justify-center py-8 ${className}`}>
      <button
        type="button"
        onClick={onLoadMore}
        disabled={loading}
        className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--nova-border)] bg-[var(--nova-surface)] px-6 py-3 text-sm font-semibold text-[var(--nova-text)] transition hover:border-[var(--nova-blue)] hover:text-[var(--nova-blue)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Load more'}
      </button>
    </div>
  )
}

export default Pagination
