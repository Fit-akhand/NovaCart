const Toast = ({ msg, handleShow, type = 'success' }) => {
  const isError = type === 'error'

  return (
    <div
      className="fixed z-[1100] rounded-lg border border-[var(--nova-border)] bg-[var(--nova-surface)] text-[var(--nova-text)] shadow-[var(--shadow-md)]"
      style={{
        top: '5.5rem',
        right: '1rem',
        width: 'min(320px, calc(100vw - 2rem))',
      }}
      role="alert"
    >
      <div className="flex items-center justify-between gap-3 border-b border-[var(--nova-border)] px-4 py-3">
        <strong
          className={`text-sm font-semibold ${
            isError ? 'text-[var(--nova-danger)]' : 'text-[var(--nova-success)]'
          }`}
        >
          {msg.title}
        </strong>
        <button
          type="button"
          onClick={handleShow}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
      <div className="px-4 py-3 text-sm">{msg.msg}</div>
    </div>
  )
}

export default Toast
