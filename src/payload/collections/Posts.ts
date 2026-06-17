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
      name: 'category',
      type: 'select',
      admin: {
        description:
          'Legacy single category for the BlogTeaser tone. Use Categories (multi) for the real taxonomy.',
      },
      options: [
        { label: 'Design', value: 'design' },
        { label: 'SEO', value: 'seo' },
        { label: 'Marketing', value: 'marketing' },
        { label: 'Development', value: 'development' },
        { label: 'Business', value: 'business' },
      ],
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: { description: 'Taxonomy categories — drives /category/{slug} archives.' },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      admin: { description: 'Taxonomy tags — drives /tag/{slug} archives.' },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'authors',
      admin: { description: 'Drives /author/{slug} archive.' },
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
