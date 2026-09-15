import type { CollectionConfig } from 'payload'
import { seoField } from '@/payload/fields/seo'
import { isLoggedIn, publishedOrLoggedIn } from '@/payload/access'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'publishedAt'],
    description: 'Blog articles. URL: /{slug} (root, matches the old WordPress permalinks).',
  },
  access: {
    read: publishedOrLoggedIn,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  versions: { drafts: true },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'excerpt', type: 'textarea', localized: true },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
    },
    { name: 'cover', type: 'upload', relationTo: 'media' },
    { name: 'content', type: 'richText', localized: true },
    {
      name: 'legacyContent',
      type: 'textarea',
      localized: true,
      admin: {
        description:
          'Original WordPress HTML body, preserved verbatim from the migration. Used as a fallback when the rich text is empty.',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
    },
    seoField,
  ],
}
