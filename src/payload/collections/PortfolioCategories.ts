import type { CollectionConfig } from 'payload'
import { seoField } from '@/payload/fields/seo'

export const PortfolioCategories: CollectionConfig = {
  slug: 'portfolio-categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug'],
    description: 'Portfolio (case study) categories. URL: /portfolio-category/{slug}',
  },
  access: { read: () => true },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'description', type: 'textarea' },
    seoField,
  ],
}
