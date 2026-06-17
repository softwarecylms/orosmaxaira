import type { CollectionConfig } from 'payload'

export const Faqs: CollectionConfig = {
  slug: 'faqs',
  admin: {
    useAsTitle: 'question',
    defaultColumns: ['question', 'order'],
  },
  access: { read: () => true },
  defaultSort: 'order',
  fields: [
    { name: 'question', type: 'text', required: true },
    { name: 'answer', type: 'textarea', required: true },
    { name: 'order', type: 'number', defaultValue: 0 },
  ],
}
