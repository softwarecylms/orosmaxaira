import type { HttpTypes } from '@medusajs/types'
import { formatPrice } from '@/lib/medusa/prices'

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted">
      <span>{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  )
}

export function CartTotals({ cart }: { cart: HttpTypes.StoreCart }) {
  const currency = cart.currency_code ?? cart.region?.currency_code ?? 'eur'

  return (
    <div className="flex flex-col gap-2 text-sm">
      <Row label="Subtotal" value={formatPrice(cart.subtotal ?? 0, currency)} />
      {cart.discount_total ? (
        <Row
          label="Discount"
          value={`-${formatPrice(cart.discount_total, currency)}`}
        />
      ) : null}
      <Row
        label="Shipping"
        value={
          cart.shipping_total
            ? formatPrice(cart.shipping_total, currency)
            : 'Calculated at checkout'
        }
      />
      {cart.tax_total ? (
        <Row label="Tax" value={formatPrice(cart.tax_total, currency)} />
      ) : null}
      <div className="mt-1 flex justify-between border-t border-border pt-3 text-base font-semibold">
        <span>Total</span>
        <span>{formatPrice(cart.total ?? 0, currency)}</span>
      </div>
    </div>
  )
}
