import type { CollectionConfig } from 'payload'

export const ClientLogos: CollectionConfig = {
  slug: 'client-logos',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'order'],
  },
  access: { read: () => true },
  defaultSort: 'order',
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'logo', type: 'upload', relationTo: 'media', required: true },
    { name: 'website', type: 'text' },
    { name: 'order', type: 'number', defaultValue: 0 },
  ],
}
