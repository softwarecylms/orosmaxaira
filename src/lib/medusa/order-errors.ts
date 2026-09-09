/**
 * Why an order could not be placed, as a code rather than a sentence.
 *
 * The order actions run on the server and have no locale, so returning Greek
 * prose (as they used to) left every checkout error untranslated under /en. The
 * client maps these codes onto `checkout-ui.ts`, which is where all display text
 * lives.
 *
 * `message` carries Medusa's own text for the cases we cannot phrase better than
 * it can; `serverTotalCents` lets the client tell the customer what the total
 * actually became.
 */

export type OrderErrorCode =
  | 'no_region'
  | 'empty_cart'
  | 'free_shipping_lost'
  | 'no_shipping'
  | 'no_payment_provider'
  | 'coupon_rejected'
  | 'total_mismatch'
  | 'no_client_secret'
  | 'complete_failed'
  | 'unknown'

export type OrderError = {
  code: OrderErrorCode
  /** Medusa's raw message, for the fallback cases. Never shown alone. */
  message?: string
  /** The total Medusa actually priced, in cents — for `total_mismatch`. */
  serverTotalCents?: number
}

export const orderError = (
  code: OrderErrorCode,
  extra?: Omit<OrderError, 'code'>,
): { error: OrderError } => ({ error: { code, ...extra } })

/** Medusa v2 totals are decimal euros; the storefront counts in cents. */
export const eurToCents = (euros: number | string | null | undefined): number =>
  Math.round(Number(euros ?? 0) * 100)
