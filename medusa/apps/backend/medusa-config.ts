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
    // Notification module with a local (log-only) email provider so booking
    // confirmation emails "send" in dev. Swap the provider for SendGrid/Resend
    // (both first-party packages are installable) before going live.
    {
      resolve: "@medusajs/notification",
      options: {
        providers: [
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
                  automaticPaymentMethods: true, // cards + wallets (Apple/Google Pay)
                },
              },
            ]
          : [],
      },
    },
  ],
})
