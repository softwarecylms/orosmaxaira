/* eslint-disable no-console */
import 'dotenv/config'
import { getPayload, type Payload } from 'payload'
import configPromise from '../../payload.config'

// Minimal, brand-free seed: creates one admin user and a starter Home page so
// `/` renders. Everything else is built in the visual editor at /admin.
// Override the admin login via SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD.

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@example.com'
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!'

const HOME_CONTENT = {
  root: { props: {} },
  content: [
    {
      type: 'HeroHome',
      props: {
        id: 'hero-home-starter',
        eyebrow: 'Welcome',
        heading: 'Your headline goes here',
        subheading:
          'A short supporting sentence about what you do. Open /admin and edit this in the visual editor.',
        primaryCta: { label: 'Get in touch', href: '/contact', newTab: false },
        logos: [],
      },
    },
  ],
  zones: {},
}

async function ensureAdmin(payload: Payload) {
  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: ADMIN_EMAIL } },
    limit: 1,
  })
  if (existing.docs.length) {
    console.log(`Admin user ${ADMIN_EMAIL} already exists.`)
    return
  }
  console.log(`Creating admin user ${ADMIN_EMAIL}…`)
  await payload.create({
    collection: 'users',
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, name: 'Admin', role: 'admin' },
  })
}

async function ensureHomePage(payload: Payload) {
  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
  })
  if (existing.docs.length) {
    console.log('Home page already exists.')
    return
  }
  console.log('Creating starter Home page…')
  await payload.create({
    collection: 'pages',
    data: {
      title: 'Home',
      slug: 'home',
      content: HOME_CONTENT as unknown as Record<string, unknown>,
    },
  })
}

async function seed() {
  const payload = await getPayload({ config: configPromise })
  await ensureAdmin(payload)
  await ensureHomePage(payload)
  console.log(`\n✓ Seed complete. Log in at /admin as ${ADMIN_EMAIL} and edit the Home page in the visual editor.`)
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
