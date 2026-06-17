import type { CollectionConfig } from 'payload'
import { seoField } from '@/payload/fields/seo'

export const CaseStudies: CollectionConfig = {
  slug: 'case-studies',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'client', 'updatedAt'],
    description: 'Portfolio items. URL: /portfolio/{slug}',
  },
  access: { read: () => true },
  versions: { drafts: true },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'client', type: 'text' },
    {
      name: 'device',
      type: 'select',
      defaultValue: 'desktop',
      options: [
        { label: 'Mobile', value: 'mobile' },
        { label: 'Laptop', value: 'laptop' },
        { label: 'Desktop', value: 'desktop' },
      ],
      admin: { description: 'Used to pick a frame in the portfolio card.' },
    },
    { name: 'cover', type: 'upload', relationTo: 'media' },
    { name: 'summary', type: 'textarea' },
    { name: 'content', type: 'richText' },
    {
      name: 'legacyContent',
      type: 'textarea',
      admin: {
        description:
          'Original WordPress HTML body, preserved verbatim from the migration. Used as a fallback when richText is empty.',
      },
    },
    { name: 'liveUrl', type: 'text' },
    {
      name: 'portfolioCategories',
      type: 'relationship',
      relationTo: 'portfolio-categories',
      hasMany: true,
      admin: { description: 'Drives /portfolio-category/{slug} archives.' },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
    },
    seoField,
  ],
}
