import type { CollectionConfig } from 'payload'
import { seoField } from '@/payload/fields/seo'

export const Tags: CollectionConfig = {
  slug: 'tags',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug'],
    description: 'Blog post tags. URL: /tag/{slug}',
  },
  access: { read: () => true },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'description', type: 'textarea' },
    seoField,
  ],
}
