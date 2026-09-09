/**
 * Which Medusa payment provider the checkout uses.
 *
 * Two providers can be registered on the EUR region at once: Medusa's built-in
 * manual provider, which auto-authorizes and takes no money, and Stripe, which
 * only registers when `STRIPE_API_KEY` is set on the backend (see
 * `medusa/apps/backend/medusa-config.ts` and `STRIPE.md`).
 *
 * Picking `payment_providers[0]` is unsafe: the order is not guaranteed, so
 * enabling Stripe on the region could silently hijack a checkout that has no
 * card UI. The choice is therefore explicit, and keyed off the storefront's own
 * publishable key — if the browser cannot render a card field, the server must
 * not open a Stripe session that nobody can confirm.
 */

export const STRIPE_PROVIDER_ID = 'pp_stripe_stripe'
export const SYSTEM_PROVIDER_ID = 'pp_system_default'

/**
 * True when the storefront is configured to take cards. `NEXT_PUBLIC_*` is
 * inlined at build time, so this reads the same on the server and in the
 * browser — the card UI and the provider choice can never disagree.
 */
export function stripeEnabled(): boolean {
  return !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim()
}

/** True while the configured key is a test key — drives the test-mode notice. */
export function stripeTestMode(): boolean {
  return !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim().startsWith('pk_test_')
}

/**
 * The provider to open a session with, given what the region actually offers.
 * Stripe only when the storefront can confirm a card; otherwise the manual
 * provider; otherwise whatever the region has, so a misconfigured region still
 * produces a clear "no payment method" error rather than a crash.
 */
export function pickProvider(
  providers: { id: string }[] | null | undefined,
): { id: string; isStripe: boolean } | null {
  const list = providers ?? []
  if (stripeEnabled()) {
    const stripe = list.find((p) => p.id === STRIPE_PROVIDER_ID)
    if (stripe) return { id: stripe.id, isStripe: true }
  }
  const system = list.find((p) => p.id === SYSTEM_PROVIDER_ID)
  if (system) return { id: system.id, isStripe: false }

  const first = list[0]
  if (!first) return null
  return { id: first.id, isStripe: first.id.startsWith('pp_stripe') }
}
