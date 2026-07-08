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
  ],
})
