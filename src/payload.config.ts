import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import sharp from 'sharp'
import { migrations } from '@/migrations'

import { Users } from '@/payload/collections/Users'
import { Media } from '@/payload/collections/Media'
import { Pages } from '@/payload/collections/Pages'
import { Posts } from '@/payload/collections/Posts'
import { Categories } from '@/payload/collections/Categories'

import { SiteSettings } from '@/payload/globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: ' — CMS',
      icons: [{ rel: 'icon', type: 'image/svg+xml', url: '/admin/softwarecy-dot.svg' }],
    },
    components: {
      graphics: {
        Logo: '/payload/admin/Logo.tsx',
        Icon: '/payload/admin/Icon.tsx',
      },
      // Top of the sidebar: shortcuts to the Medusa admin (shop & bookings).
      beforeNavLinks: ['/payload/admin/MedusaLinks.tsx'],
      // Foot of the sidebar, directly above logout: the SoftwareCy credit.
      afterNavLinks: ['/payload/admin/SoftwareCyCredit.tsx'],
      // Dashboard: shop & bookings boxes (Medusa) above Collections, the
      // editors' training video below.
      beforeDashboard: ['/payload/admin/ShopDashboard.tsx'],
      afterDashboard: ['/payload/admin/TrainingVideo.tsx'],
    },
  },
  collections: [Pages, Posts, Categories, Media, Users],
  globals: [SiteSettings],
  // Every page, post and setting has a Greek and an English version; a field
  // left empty in English shows the Greek text.
  localization: {
    locales: [
      { label: 'Ελληνικά', code: 'el' },
      { label: 'English', code: 'en' },
    ],
    defaultLocale: 'el',
    fallback: true,
  },
  // Password-reset and other CMS emails go out through the site's SMTP account
  // (the same SMTP_* settings as the contact forms); without it Payload only
  // logs them.
  ...(process.env.SMTP_HOST
    ? {
        email: nodemailerAdapter({
          defaultFromAddress: (process.env.CONTACT_FROM_EMAIL || process.env.SMTP_USER || '').replace(/^.*<([^>]+)>.*$/, '$1'),
          defaultFromName: 'Όρος Μαχαιρά',
          transportOptions: {
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT ?? 465),
            secure: process.env.SMTP_SECURE !== 'false',
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
          },
        }),
      }
    : {}),
  plugins: [
    // Uploaded images live in Vercel Blob in production (Vercel's disk is wiped
    // on every deploy). Without a token (local dev) they stay in public/media.
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN,
      clientUploads: true,
    }),
  ],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || 'dev-secret-change-me',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      // Reads DATABASE_URI first; falls back to the vars Vercel's Postgres
      // (Neon-backed) integration injects, so "Add Storage" in Vercel just works.
      connectionString:
        process.env.DATABASE_URI ||
        process.env.DATABASE_URL ||
        process.env.POSTGRES_URL ||
        'postgres://postgres:postgres@localhost:5432/app',
    },
    push: false,
    prodMigrations: migrations,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  sharp,
  upload: {
    limits: {
      fileSize: 10_000_000,
    },
  },
})
