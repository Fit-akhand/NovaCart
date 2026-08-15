import { AlertCircle, RefreshCw } from 'lucide-react'

const ErrorState = ({
  title = 'Something went wrong',
  description = 'We could not load this information.',
  onRetry,
}) => {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-950">
        <AlertCircle size={26} />
      </div>

      <h3 className="text-lg font-semibold text-[var(--nova-text)]">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-sm text-[var(--nova-muted)]">
        {description}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--nova-blue)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <RefreshCw size={16} />
          Try again
        </button>
      )}
    </div>
  )
}

export default ErrorState