import { Lock } from 'lucide-react'
import { formatPrice } from '@/lib/formatPrice'

const Row = ({ label, value, tone }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-[var(--nova-muted)]">{label}</span>
    <span
      className={`font-semibold ${
        tone === 'success'
          ? 'text-[var(--nova-success)]'
          : 'text-[var(--nova-text)]'
      }`}
    >
      {value}
    </span>
  </div>
)

// Always-visible summary; the action slot holds the step's main button.
const OrderSummary = ({
  itemCount,
  subtotal,
  discount,
  total,
  children,
}) => (
  <aside className="h-fit rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-5 shadow-[var(--shadow-md)] sm:p-6 lg:sticky lg:top-24">
    <h2 className="text-lg font-bold tracking-tight text-[var(--nova-text)]">
      Order summary
    </h2>

    <div className="mt-5 space-y-3">
      <Row
        label={`Subtotal (${itemCount} ${itemCount === 1 ? 'item' : 'items'})`}
        value={formatPrice(subtotal)}
      />
      {discount > 0 && (
        <Row
          label="Discount"
          value={`-${formatPrice(discount)}`}
          tone="success"
        />
      )}
      <Row label="Delivery" value="FREE" tone="success" />
    </div>

    <div className="my-5 flex items-center justify-between rounded-xl bg-[var(--nova-surface-soft)] p-4">
      <span className="font-bold text-[var(--nova-text)]">Total</span>
      <span className="text-2xl font-bold tracking-tight text-[var(--nova-text)]">
        {formatPrice(total)}
      </span>
    </div>

    {children}

    <p className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[var(--nova-muted)]">
      <Lock size={12} />
      Secure checkout powered by Razorpay
    </p>
  </aside>
)

export default OrderSummary
