const Loading = ({ text = 'Loading...', className = '' }) => {
  return (
    <div
      className={`flex min-h-[240px] items-center justify-center ${className}`}
    >
      <div className="flex items-center gap-3 text-sm text-[var(--nova-muted)]">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--nova-border)] border-t-[var(--nova-blue)]" />
        {text}
      </div>
    </div>
  )
}

export default Loading