# Stripe — go-live checklist

The backend is **Stripe-ready but dormant**. With `STRIPE_API_KEY` unset (today, on
local dev and Railway prod) nothing changes: only the built-in manual provider
`pp_system_default` exists and checkout takes **no real charge**. Turning Stripe on is
a keys-and-config flip — the code is already in place.

## What's already wired
- **`@medusajs/payment-stripe@2.15.5`** is a backend dependency (`package.json`).
- **`medusa-config.ts`** registers the `@medusajs/payment` module. The Stripe provider
  is added to its `providers` array **only when `STRIPE_API_KEY` is set** (env-gated).
  Options: `apiKey`, `webhookSecret`, `capture: true` (auto-capture on auth),
  `automaticPaymentMethods: true` (cards + Apple/Google Pay).
- **`.env.template`** documents `STRIPE_API_KEY` / `STRIPE_WEBHOOK_SECRET`.
- **`src/scripts/seed-oros-stripe.ts`** — idempotent, guarded script that attaches the
  Stripe provider to the EUR region. No-ops (with a clear log) if Stripe isn't registered.
- **Storefront safety:** `src/lib/medusa/place-order.ts` explicitly picks
  `pp_system_default` (not `payment_providers[0]`), so enabling Stripe on the region
  can't silently break the current checkout before the card UI exists.

## Go-live steps (backend)
1. **Get keys** from the Stripe dashboard: secret key `sk_...` and publishable key `pk_...`.
2. **Set env** on **Railway** (backend service) and in local `.env`:
   ```
   STRIPE_API_KEY=sk_live_or_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...      # from the webhook you create in step 5
   ```
3. **Redeploy** the backend. Stripe now registers as provider id **`pp_stripe_stripe`**.
   Confirm: `GET /store/payment-providers?region_id=<eur-region-id>` lists it.
4. **Enable it on the region** — run against **local and prod**:
   ```bash
   cd medusa/apps/backend
   npx medusa exec ./src/scripts/seed-oros-stripe.ts
   ```
   (For prod, run it locally with `DATABASE_URL=<railway public proxy>` — same pattern
   used to seed prod. Fallback: admin → Settings → Regions → enable Stripe.)
5. **Webhook** — in the Stripe dashboard add an endpoint:
   ```
   https://<railway-backend-url>/hooks/payment/stripe_stripe
   ```
   Subscribe to `payment_intent.succeeded`, `payment_intent.payment_failed`,
   `payment_intent.amount_capturable_updated`. Copy its signing secret into
   `STRIPE_WEBHOOK_SECRET` (step 2) and redeploy.
   > The exact path segment (`stripe_stripe`) is `<provider>_<id>`; Medusa logs the
   > registered webhook route on boot — verify there if unsure. The region provider id
   > is `pp_stripe_stripe` (the seed script auto-discovers it by `pp_stripe*`).

## Go-live steps (storefront — Phase 2, not built yet)
"Backend ready" does **not** charge cards on its own. To actually take payment:
1. Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...` to the storefront env (Vercel + local).
2. Install `@stripe/stripe-js` + `@stripe/react-stripe-js` in the storefront.
3. In `src/components/shop/checkout/checkout-form.tsx`, render **Stripe Elements** (a
   real card field) in the "Τρόπος πληρωμής" fieldset (today it's a single cosmetic radio).
4. In `src/lib/medusa/place-order.ts`: select `pp_stripe_stripe`, read the
   `client_secret` returned by `initiatePaymentSession`, and run
   `stripe.confirmCardPayment(client_secret, …)` on the client **before**
   `sdk.store.cart.complete()`. Only complete once the PaymentIntent is authorized.
5. Preserve the order-confirmation snapshot (localStorage `oros_order_{id}`) across any
   Stripe redirect/return so `order/[id]` still renders totals.
6. Remove the "Δοκιμαστική παραγγελία — δεν πραγματοποιείται χρέωση." footer note.

## Test
- Use test keys + card **`4242 4242 4242 4242`**, any future expiry, any CVC.
- Verify the order appears in Medusa admin with an **authorized/captured** Stripe payment.
- Then swap test keys for live keys and repeat with a real card (refund it).

## Production note
Prod Medusa currently runs with an in-memory event bus/cache (no Redis). Stripe works
this way, but before higher volume consider a Redis-backed event bus + workflow engine
so webhook-driven payment events are processed reliably across restarts.
