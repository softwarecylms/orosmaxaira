import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import sharp from 'sharp'
import { migrations } from '@/migrations'

import { Users } from '@/payload/collections/Users'
import { Media } from '@/payload/collections/Media'
import { Pages } from '@/payload/collections/Pages'
import { Posts } from '@/payload/collections/Posts'
import { TeamMembers } from '@/payload/collections/TeamMembers'
import { Jobs } from '@/payload/collections/Jobs'
import { Faqs } from '@/payload/collections/Faqs'
import { CaseStudies } from '@/payload/collections/CaseStudies'
import { Testimonials } from '@/payload/collections/Testimonials'
import { ClientLogos } from '@/payload/collections/ClientLogos'
import { Categories } from '@/payload/collections/Categories'
import { Tags } from '@/payload/collections/Tags'
import { PortfolioCategories } from '@/payload/collections/PortfolioCategories'
import { Authors } from '@/payload/collections/Authors'

import { SiteSettings } from '@/payload/globals/SiteSettings'
import { Header } from '@/payload/globals/Header'
import { Footer } from '@/payload/globals/Footer'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: ' — CMS',
    },
  },
  collections: [
    Pages,
    Posts,
    CaseStudies,
    Categories,
    Tags,
    PortfolioCategories,
    Authors,
    TeamMembers,
    Jobs,
    Faqs,
    Testimonials,
    ClientLogos,
    Media,
    Users,
  ],
  globals: [SiteSettings, Header, Footer],
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
