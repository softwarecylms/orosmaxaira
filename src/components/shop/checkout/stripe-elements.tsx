'use client'

import { Elements } from '@stripe/react-stripe-js'
import { loadStripe, type Appearance, type Stripe } from '@stripe/stripe-js'
import { useLocale } from 'next-intl'
import { useState } from 'react'
import { useCart } from '@/components/commerce/cart-store'

/**
 * Stripe Elements around the checkout form.
 *
 * Uses Stripe's *deferred intent* mode: the card field renders before any
 * PaymentIntent exists, and the client secret is fetched at submit time. That
 * keeps the current "one button places the order" flow — no Medusa cart is
 * created just because someone opened the checkout page.
 *
 * With no publishable key this renders nothing of its own, so checkout falls
 * back to exactly the pre-Stripe behaviour. That is the rollback switch: unset
 * the key and the card UI disappears.
 */

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim()

/** Module-scope so the Stripe script is fetched once, not per mount — shared
 *  by the shop checkout and the booking payment step. Guarded:
 *  `loadStripe('')` throws. */
export const stripePromise: Promise<Stripe | null> | null = PUBLISHABLE_KEY
  ? loadStripe(PUBLISHABLE_KEY)
  : null

/** Whether the checkout should render (and require) the card field at all. */
export const stripeConfigured = !!stripePromise

/** True while running against Stripe test keys — drives the test-card notice. */
export const stripeTestMode = !!PUBLISHABLE_KEY?.startsWith('pk_test_')

/** Stripe rejects EUR amounts under €0.50; Elements needs a positive seed. */
export const MIN_STRIPE_AMOUNT = 50

/** The site's look for Stripe's card fields — shop checkout and bookings alike. */
export const STRIPE_APPEARANCE: Appearance = {
  variables: {
    colorPrimary: '#b7791f',
    colorDanger: '#b91c1c',
    borderRadius: '4px',
    fontSizeBase: '15px',
    // Shrinks the Link banner ("Ασφαλής, γρήγορη ολοκλήρωση…") and the
    // field labels together — Stripe gives the banner no selector of its
    // own. 13px is as small as the labels take before they look starved.
    fontSizeSm: '13px',
  },
}

export function StripeCheckoutProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocale()
  const { subtotal } = useCart()

  // Seeded ONCE and never changed. react-stripe-js re-runs `elements.update()`
  // whenever these options change, so a live-bound amount here would fight the
  // form's own update — which is the one that knows about shipping and the
  // coupon. The form owns the amount from mount onwards.
  const [seedAmount] = useState(() => Math.max(subtotal, MIN_STRIPE_AMOUNT))

  // Even with no key, the provider must still be here: the form calls
  // `useStripe()`/`useElements()` unconditionally (rules of hooks), and those
  // throw outside an <Elements> ancestor. `stripe={null}` is react-stripe-js's
  // own "not loaded" state — both hooks return null and the form takes its
  // pre-Stripe path.
  if (!stripePromise) return <Elements stripe={null}>{children}</Elements>

  return (
    <Elements
      stripe={stripePromise}
      options={{
        mode: 'payment',
        currency: 'eur',
        amount: seedAmount,
        // Cards only. place-order.ts opens the PaymentIntent with
        // `payment_method_types: ['card']`, and a deferred Elements group must
        // declare the same list or Stripe refuses to confirm — the two sides
        // have to agree:
        //   intent automatic ⇄ Elements without paymentMethodTypes
        //   intent ['card']  ⇄ Elements paymentMethodTypes ['card']   ← this
        // The backend provider runs with `automaticPaymentMethods: false`,
        // because Stripe rejects an intent that names both.
        paymentMethodTypes: ['card'],
        // Matches `capture: true` on the backend provider, which creates the
        // PaymentIntent with capture_method 'automatic'.
        captureMethod: 'automatic',
        locale: locale === 'en' ? 'en' : 'el',
        appearance: STRIPE_APPEARANCE,
      }}
    >
      {children}
    </Elements>
  )
}
