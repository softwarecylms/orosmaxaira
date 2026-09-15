import type { CollectionConfig } from 'payload'
import { seoField } from '@/payload/fields/seo'
import { isLoggedIn } from '@/payload/access'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug'],
    description: 'Blog post categories.',
  },
  access: { read: () => true, create: isLoggedIn, update: isLoggedIn, delete: isLoggedIn },
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'description', type: 'textarea', localized: true },
    seoField,
  ],
}
