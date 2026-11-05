import { Check } from 'lucide-react'

const STEPS = ['Cart', 'Delivery', 'Payment']

// step: 1 = cart, 2 = delivery, 3 = payment
const CheckoutSteps = ({ step }) => (
  <ol className="mb-6 flex items-center justify-center gap-2 sm:gap-4">
    {STEPS.map((label, index) => {
      const number = index + 1
      const done = number < step
      const active = number === step

      return (
        <li key={label} className="flex items-center gap-2 sm:gap-4">
          <span className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                done || active
                  ? 'bg-[var(--nova-primary)] text-white'
                  : 'border border-[var(--nova-border)] bg-[var(--nova-surface)] text-[var(--nova-muted)]'
              }`}
            >
              {done ? <Check size={14} /> : number}
            </span>
            <span
              className={`text-sm font-semibold ${
                active
                  ? 'text-[var(--nova-text)]'
                  : 'text-[var(--nova-muted)]'
              }`}
            >
              {label}
            </span>
          </span>

          {number < STEPS.length && (
            <span className="h-px w-6 bg-[var(--nova-border)] sm:w-12" />
          )}
        </li>
      )
    })}
  </ol>
)

export default CheckoutSteps
