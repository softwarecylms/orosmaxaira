import type { CollectionConfig } from 'payload'
import { seoField } from '@/payload/fields/seo'
import { isLoggedIn, publishedOrLoggedIn } from '@/payload/access'
import { pagePaths, revalidatePage, revalidateDeletedPage } from '@/payload/hooks/revalidate-page'

/** Top-level paths that are not free for a CMS page (app routes). */
const RESERVED_SLUGS = new Set([
  'admin',
  'api',
  'editor',
  'en',
  'blog',
  'proionta',
  'product',
  'cart',
  'checkout',
  'order',
  'account',
])

const siteOrigin = () =>
  (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SERVER_URL || '').replace(/\/$/, '')

/** Where a page lives on the site, per language. */
const pageUrl = (slug: string | undefined, locale?: string) => {
  const [el, en] = pagePaths(slug)
  return `${siteOrigin()}${locale === 'en' ? en : el}`
}

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    // Every page on one screen.
    pagination: { defaultLimit: 50 },
    description:
      'All the site’s pages. Open one to change its title, link and SEO, and use the Visual Editor to edit what the page shows.',
    preview: (doc, { locale }) => pageUrl(doc?.slug as string | undefined, locale),
    livePreview: {
      url: ({ data, locale }) => pageUrl(data?.slug as string | undefined, locale?.code),
    },
  },
  access: {
    read: publishedOrLoggedIn,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  versions: {
    drafts: { autosave: { interval: 2000 } },
    maxPerDoc: 20,
  },
  hooks: {
    afterChange: [revalidatePage],
    afterDelete: [revalidateDeletedPage],
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'slug',
      label: 'Link',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'The page’s address: orosmaxaira.com/<link>/ (and /en/<link>/). The home page is “home”.',
      },
      validate: (value: unknown) => {
        const slug = String(value ?? '').trim()
        if (!slug) return 'Required'
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return 'Use lower-case Latin letters, numbers and dashes only.'
        if (RESERVED_SLUGS.has(slug)) return `“${slug}” is used by another part of the site.`
        return true
      },
    },
    {
      name: 'content',
      type: 'json',
      localized: true,
      admin: {
        description: 'What the page shows — edit it in the Visual Editor.',
        components: {
          Field: '/payload/admin/PuckField.tsx',
        },
      },
    },
    seoField,
  ],
}
