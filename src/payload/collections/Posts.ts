import type { CollectionConfig, TextFieldSingleValidation } from 'payload'
import { BlocksFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { seoField } from '@/payload/fields/seo'
import { slugify } from '@/payload/fields/slugify'
import { LegacyImageBlock } from '@/payload/blocks/legacy-image'
import { isLoggedIn, publishedOrLoggedIn } from '@/payload/access'
import { revalidatePost, revalidateDeletedPost } from '@/payload/hooks/revalidate-post'

/** Top-level paths taken by the site's own routes — an article can't live there. */
const RESERVED_SLUGS = new Set([
  'admin', 'api', 'editor', 'en', 'blog', 'proionta', 'product', 'cart', 'checkout', 'order', 'account',
  'drastiriotites', 'epikoinonia', 'poioi-eimaste', 'pistopioiseis', 'vraveia', 'yiotheto-mia-kypseli',
  'afaneis-iroes-tis-fysis', 'terms', 'privacy-amp-cookie-policy', 'paraggelies-kai-epistrofes',
  'politiki-apostolis-proionton', 'home',
])

const siteOrigin = () =>
  (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SERVER_URL || '').replace(/\/$/, '')

/** An article's address, per language — the old WordPress permalinks, off the site root. */
const postUrl = (slug: string | undefined, locale?: string) =>
  slug ? `${siteOrigin()}${locale === 'en' ? '/en' : ''}/${slug}/` : `${siteOrigin()}/blog/`

/** Lower-case Latin, not taken by the site's own routes or by a page. */
const validateSlug: TextFieldSingleValidation = async (value, { req }) => {
  const slug = String(value ?? '').trim()
  if (!slug) return 'Required — or write the Greek title first.'
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return 'Use lower-case Latin letters, numbers and dashes only.'
  if (RESERVED_SLUGS.has(slug)) return `“${slug}” is used by another part of the site.`
  if (!req?.payload) return true
  // Pages and articles share the site root; a page would hide the article.
  try {
    const pages = await req.payload.find({ collection: 'pages', where: { slug: { equals: slug } }, limit: 1, depth: 0 })
    if (pages.docs.length) return `“${slug}” is already a page’s link.`
  } catch {
    // no clash check without the database — the unique index still guards posts
  }
  return true
}

export const Posts: CollectionConfig = {
  slug: 'posts',
  // Newest first, as on the site.
  defaultSort: '-publishedAt',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedAt', '_status', 'slug'],
    pagination: { defaultLimit: 25, limits: [25, 50, 100] },
    description:
      'The blog’s articles. «Create New» writes a new one; open one to change it. «Publish changes» puts it on the site (orosmaxaira.com/blog and the home page) straight away.',
    preview: (doc, { locale }) => postUrl(doc?.slug as string | undefined, locale),
  },
  access: {
    read: publishedOrLoggedIn,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  versions: { drafts: true, maxPerDoc: 20 },
  hooks: {
    afterChange: [revalidatePost],
    afterDelete: [revalidateDeletedPost],
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
        description:
          'The article’s address: orosmaxaira.com/<link>/ (and /en/<link>/). Left empty, it is made from the Greek title. Changing it breaks links to the old address.',
      },
      hooks: {
        beforeValidate: [
          ({ value, data, req }) => {
            if (typeof value === 'string' && value.trim()) return value.trim()
            // Only the Greek title names a new article's link.
            const title = req.locale === 'en' ? '' : (data?.title as string | undefined)
            return title ? slugify(title) : value
          },
        ],
      },
      validate: validateSlug,
    },
    {
      name: 'publishedAt',
      label: 'Date',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime', displayFormat: 'd MMM yyyy, HH:mm' },
        description: 'Shown on the article; the blog lists newest first.',
      },
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: { position: 'sidebar', description: 'The first one is shown on the article’s picture.' },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      localized: true,
      admin: { description: 'A sentence or two for the blog list and search results. Left empty, the opening paragraph is used.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'cover',
          label: 'Cover image',
          type: 'upload',
          relationTo: 'media',
          admin: { width: '50%', description: 'The article’s main picture (about 1200×800).' },
        },
        {
          name: 'legacyCover',
          label: 'Cover from the old site',
          type: 'text',
          admin: {
            width: '50%',
            description: 'Used while no «Cover image» is uploaded. Articles from the old site keep their picture here.',
          },
        },
      ],
    },
    {
      name: 'content',
      label: 'Text',
      type: 'richText',
      localized: true,
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [...defaultFeatures, BlocksFeature({ blocks: [LegacyImageBlock] })],
      }),
    },
    {
      type: 'collapsible',
      label: 'Old site (reference only)',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'legacyContent',
          label: 'Original text (HTML)',
          type: 'textarea',
          localized: true,
          admin: {
            readOnly: true,
            description:
              'The article’s text as it was on the old WordPress site, kept for reference. The site shows «Text» above; this only shows if «Text» is empty.',
          },
        },
      ],
    },
    seoField,
  ],
}
