'use client'

import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import type { StripePaymentElementOptions } from '@stripe/stripe-js'
import { useLocale } from 'next-intl'
import { useState } from 'react'
import { ArrowLeft, Loader2, Lock } from 'lucide-react'
import {
  STRIPE_APPEARANCE,
  stripePromise,
  stripeTestMode,
} from '@/components/shop/checkout/stripe-elements'
import { getBookingUi } from './booking-ui'

/** A card payment in progress, as the booking modals track it. */
export type PendingPayment = {
  clientSecret: string
  reference: string
  /** The idempotency key the booking was created with — proves this browser
   *  owns the hold when confirming or releasing it. */
  key: string
  holdMinutes: number
  /** In euros, as the server computed it. */
  total: number
}

/**
 * Card only, and no Link. The method list itself comes from the intent
 * (`payment_method_types: ["card"]` — medusa/apps/backend/src/lib/booking-payment.ts);
 * Apple/Google Pay ride on the card type, so they are switched off here. Unlike
 * the shop checkout, which deliberately keeps Link, the booking step hides it.
 */
const PAYMENT_OPTIONS: StripePaymentElementOptions = {
  layout: {
    type: 'accordion',
    radios: 'never',
    defaultCollapsed: false,
    spacedAccordionItems: false,
  },
  wallets: { applePay: 'never', googlePay: 'never', link: 'never' },
}

/**
 * The payment step of an activity or workshop booking.
 *
 * By the time this renders the server has reserved the seats and opened a
 * PaymentIntent for the amount IT computed, so Elements is created from that
 * intent's client secret. Unlike the shop checkout there is no amount to keep in
 * sync — the charge can no longer change.
 */
export function BookingPaymentStep({
  payment,
  amountLabel,
  onPaid,
  onBack,
}: {
  payment: PendingPayment
  /** The total, formatted for display (e.g. "€8"). */
  amountLabel: string
  /** Stripe reports the card paid; resolves to an error to show, or null. */
  onPaid: () => Promise<string | null>
  /** Back to the details — the modal releases the held seats. */
  onBack: () => void
}) {
  const locale = useLocale()
  const ui = getBookingUi(locale)

  if (!stripePromise) {
    return (
      <p className="rounded-[8px] bg-red-50 px-4 py-3 text-[14px] text-red-700">
        {ui.cardUnavailable}
      </p>
    )
  }

  return (
    <Elements
      // A new hold is a new intent; the client secret cannot change in place.
      key={payment.clientSecret}
      stripe={stripePromise}
      options={{
        clientSecret: payment.clientSecret,
        locale: locale === 'en' ? 'en' : 'el',
        appearance: STRIPE_APPEARANCE,
      }}
    >
      <PayForm
        holdMinutes={payment.holdMinutes}
        amountLabel={amountLabel}
        onPaid={onPaid}
        onBack={onBack}
      />
    </Elements>
  )
}

function PayForm({
  holdMinutes,
  amountLabel,
  onPaid,
  onBack,
}: {
  holdMinutes: number
  amountLabel: string
  onPaid: () => Promise<string | null>
  onBack: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const ui = getBookingUi(useLocale())
  const [phase, setPhase] = useState<'idle' | 'paying' | 'confirming'>('idle')
  // Once the card is charged, never ask Stripe to charge it again — a retry
  // only repeats the confirmation call.
  const [paid, setPaid] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const busy = phase !== 'idle'

  const pay = async () => {
    if (!stripe || !elements || busy) return
    setError(null)

    if (!paid) {
      setPhase('paying')
      const { error: payError, paymentIntent } = await stripe.confirmPayment({
        elements,
        // Cards settle in-page; the return URL is only used by payment methods
        // that must leave the site.
        redirect: 'if_required',
        confirmParams: { return_url: window.location.href },
      })
      if (payError) {
        setError(payError.message ?? ui.paymentFailed)
        setPhase('idle')
        return
      }
      if (
        !paymentIntent ||
        !['succeeded', 'requires_capture', 'processing'].includes(paymentIntent.status)
      ) {
        setError(ui.paymentFailed)
        setPhase('idle')
        return
      }
      setPaid(true)
    }

    setPhase('confirming')
    const failure = await onPaid()
    if (failure) {
      setError(failure)
      setPhase('idle')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="rounded-[8px] bg-cream px-4 py-3 text-[13.5px] leading-[20px] text-foreground/80">
        {ui.holdNote(holdMinutes)}
      </p>

      <PaymentElement options={PAYMENT_OPTIONS} />

      <p className="flex items-center gap-1.5 text-[12px] leading-[16px] text-muted">
        <Lock className="size-3.5 shrink-0" aria-hidden="true" />
        {ui.securePayment}
      </p>
      {stripeTestMode ? (
        <p className="text-[12px] leading-[16px] text-muted">{ui.testModeNote}</p>
      ) : null}

      {error ? (
        <p className="rounded-[8px] bg-red-50 px-4 py-3 text-[14px] text-red-700">{error}</p>
      ) : null}

      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={onBack}
          disabled={busy || paid}
          className="flex items-center gap-1.5 rounded-[4px] px-3 py-[13px] text-[15px] font-medium text-foreground transition-colors hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {ui.back}
        </button>
        <button
          type="button"
          onClick={pay}
          disabled={!stripe || busy}
          className="flex items-center justify-center gap-2 rounded-[4px] bg-accent px-6 py-[14px] text-[16px] font-semibold text-white transition-colors hover:bg-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-accent"
        >
          {busy ? (
            <>
              <Loader2 className="size-5 animate-spin" aria-hidden="true" />
              {phase === 'confirming' ? ui.confirmingBooking : ui.processing}
            </>
          ) : (
            ui.payAmount(amountLabel)
          )}
        </button>
      </div>
    </div>
  )
}
