const Toast = ({ msg, handleShow, type = 'success' }) => {
  const isError = type === 'error'

  return (
    <div
      className={`fixed z-[1100] rounded-lg border shadow-lg ${
        isError
          ? 'border-red-200 bg-white'
          : 'border-emerald-200 bg-white'
      }`}
      style={{
        top: 'var(--notify-top)',
        right: '1rem',
        width: 'min(320px, calc(100vw - 2rem))',
      }}
      role="alert"
    >
      <div
        className={`flex items-center justify-between gap-3 border-b px-4 py-3 ${
          isError
            ? 'border-red-100 bg-red-50'
            : 'border-emerald-100 bg-emerald-50'
        }`}
      >
        <strong
          className={`text-sm font-semibold ${
            isError ? 'text-red-700' : 'text-emerald-700'
          }`}
        >
          {msg.title}
        </strong>
        <button
          type="button"
          onClick={handleShow}
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-sm transition hover:bg-white/80 ${
            isError ? 'text-red-600' : 'text-emerald-600'
          }`}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
      <div className="px-4 py-3 text-sm text-slate-700">{msg.msg}</div>
    </div>
  )
}

export default Toast
