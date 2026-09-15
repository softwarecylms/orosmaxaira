import type { CollectionConfig } from 'payload'
import { seoField } from '@/payload/fields/seo'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'publishedAt'],
    description: 'Blog posts. URL: /{slug} (root, matches the WordPress permalink structure).',
  },
  access: { read: () => true },
  versions: { drafts: true },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'excerpt', type: 'textarea' },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
    },
    { name: 'cover', type: 'upload', relationTo: 'media' },
    { name: 'content', type: 'richText' },
    {
      name: 'legacyContent',
      type: 'textarea',
      admin: {
        description:
          'Original WordPress HTML body, preserved verbatim from the migration. Used as a fallback when richText is empty.',
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
