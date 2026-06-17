import type { CollectionConfig } from 'payload'
import { seoField } from '@/payload/fields/seo'

export const Authors: CollectionConfig = {
  slug: 'authors',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'role'],
    description: 'Blog authors. URL: /author/{slug}',
  },
  access: { read: () => true },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'role', type: 'text' },
    { name: 'bio', type: 'textarea' },
    { name: 'avatar', type: 'upload', relationTo: 'media' },
    {
      name: 'social',
      type: 'group',
      fields: [
        { name: 'twitter', type: 'text' },
        { name: 'linkedin', type: 'text' },
        { name: 'website', type: 'text' },
      ],
    },
    seoField,
  ],
}
