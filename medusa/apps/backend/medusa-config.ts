import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules: [
    // Custom module: activities + availability + bookings (see src/modules/bookings).
    { resolve: "./src/modules/bookings" },
    // Notification module — booking confirmation emails (src/lib/booking-payment.ts).
    {
      resolve: "@medusajs/notification",
      options: {
        // Email goes out over SMTP whenever SMTP_HOST is set — the same Resend
        // account and variable names as the storefront. `notification-local`
        // keeps the admin feed, and takes email too when SMTP is not
        // configured, so a missing mail server logs instead of failing a
        // booking. Each channel may have only one provider.
        providers: process.env.SMTP_HOST
          ? [
              {
                resolve: "./src/modules/smtp-notification",
                id: "smtp",
                options: {
                  channels: ["email"],
                  host: process.env.SMTP_HOST,
                  port: Number(process.env.SMTP_PORT ?? 465),
                  secure: process.env.SMTP_SECURE !== "false",
                  user: process.env.SMTP_USER,
                  pass: process.env.SMTP_PASSWORD,
                  from: process.env.CONTACT_FROM_EMAIL,
                },
              },
              {
                resolve: "@medusajs/notification-local",
                id: "local",
                options: { channels: ["feed"] },
              },
            ]
          : [
              {
                resolve: "@medusajs/notification-local",
                id: "local",
                options: { channels: ["email", "feed"] },
              },
            ],
      },
    },
    // Payment module. The built-in system/manual provider (pp_system_default) is
    // always registered automatically. Stripe is registered ONLY when
    // STRIPE_API_KEY is set — so with no key (dev + prod today) behaviour is
    // identical: only pp_system_default exists and checkout takes no real charge.
    // To go live: set STRIPE_API_KEY + STRIPE_WEBHOOK_SECRET, redeploy, then
    // attach the provider to the region (npm run … src/scripts/seed-oros-stripe.ts).
    // See STRIPE.md. Provider id once enabled: "pp_stripe_stripe".
    {
      resolve: "@medusajs/payment",
      options: {
        providers: process.env.STRIPE_API_KEY
          ? [
              {
                resolve: "@medusajs/payment-stripe",
                id: "stripe",
                options: {
                  apiKey: process.env.STRIPE_API_KEY,
                  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
                  capture: true, // auto-capture on authorization
                  // FALSE, paired with `payment_method_types: ["card"]` on every
                  // payment we open (src/lib/booking-payment.ts for bookings,
                  // the storefront's src/lib/medusa/place-order.ts for the shop).
                  // Stripe rejects an intent that names both
                  // automatic_payment_methods and payment_method_types — even
                  // `enabled: false` counts — and when this is true the provider
                  // always sends the former. Off, it omits it and the explicit
                  // list wins: cards only, no Scalapay / MB WAY / Bancontact.
                  //
                  // Caveat: an intent opened WITHOUT a type list falls back to
                  // Stripe's automatic methods, so every new payment path must
                  // pass one.
                  automaticPaymentMethods: false,
                },
              },
            ]
          : [],
      },
    },
  ],
})
