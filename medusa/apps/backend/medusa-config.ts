import { loadEnv, defineConfig } from '@medusajs/framework/utils'
import { ADMIN_ICON_PNG, ADMIN_ICON_SVG, ADMIN_TITLE } from './src/lib/admin-branding'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  admin: {
    // The admin is a single-page app; its HTML is where crawlers would land.
    // Mark it noindex (the API also sends X-Robots-Tag, see src/api/middlewares.ts).
    vite: () => ({
      plugins: [
        {
          name: "oros-admin-noindex",
          transformIndexHtml: (html: string) =>
            html.replace("<head>", '<head>\n    <meta name="robots" content="noindex, nofollow" />'),
        },
        {
          // The browser tab: "Oros Machaira Shop" and the storefront's favicon,
          // in place of the admin's empty placeholder icon (src/lib/admin-branding.ts).
          name: "oros-admin-branding",
          transformIndexHtml: (html: string) =>
            html
              .replace(/\s*<link rel="icon"[^>]*>/g, "")
              .replace(/\s*<title>[^<]*<\/title>/g, "")
              .replace(
                "</head>",
                `    <title>${ADMIN_TITLE}</title>\n` +
                  `    <link rel="icon" type="image/svg+xml" href="${ADMIN_ICON_SVG}" />\n` +
                  `    <link rel="apple-touch-icon" href="${ADMIN_ICON_PNG}" />\n` +
                  // The store badge top-left of the sidebar: the site's icon instead of the name's initial.
                  `    <style>.grid-cols-\\[24px_1fr_15px\\]>span:first-child{background:#fff url("${ADMIN_ICON_PNG}") center/cover no-repeat}` +
                  `.grid-cols-\\[24px_1fr_15px\\]>span:first-child>*{opacity:0}</style>\n  </head>`
              ),
        },
      ],
    }),
  },
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
    // Custom module: the media library behind the activity/workshop image picker
    // (media_asset). Its page-copy tables are being retired — site pages, articles
    // and settings are edited in Payload.
    { resolve: "./src/modules/content" },
    // Custom module: sales invoices (OMW001584, …) — numbering, settings and the
    // snapshot each PDF is rendered from (see src/lib/invoice).
    { resolve: "./src/modules/invoices" },
    // File module — images uploaded from the admin, import/export CSVs.
    // Railway's disk (./static) is wiped on every deploy, so production stores
    // files in Vercel Blob (the same store Payload uses, under medusa/). Without
    // BLOB_READ_WRITE_TOKEN (local dev) S3 is used if configured, else the
    // default local provider. The File module takes exactly one provider.
    ...(process.env.BLOB_READ_WRITE_TOKEN
      ? [
          {
            resolve: "@medusajs/file",
            options: {
              providers: [
                {
                  resolve: "./src/modules/vercel-blob-file",
                  id: "vercel-blob",
                  options: {
                    token: process.env.BLOB_READ_WRITE_TOKEN,
                    prefix: "medusa/",
                  },
                },
              ],
            },
          },
        ]
      : process.env.S3_BUCKET
        ? [
            {
              resolve: "@medusajs/file",
              options: {
                providers: [
                  {
                    resolve: "@medusajs/file-s3",
                    id: "s3",
                    options: {
                      file_url: process.env.S3_FILE_URL,
                      access_key_id: process.env.S3_ACCESS_KEY_ID,
                      secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
                      region: process.env.S3_REGION ?? "auto",
                      bucket: process.env.S3_BUCKET,
                      endpoint: process.env.S3_ENDPOINT,
                      prefix: "uploads/",
                    },
                  },
                ],
              },
            },
          ]
        : []),
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
