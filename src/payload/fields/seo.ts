import type { Field } from 'payload'

export const seoField: Field = {
  name: 'seo',
  type: 'group',
  label: 'SEO',
  admin: { position: 'sidebar' },
  fields: [
    {
      name: 'title',
      type: 'text',
      admin: { description: 'Defaults to the page title if empty (max 60 chars recommended).' },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: { description: 'Meta description (140–160 chars recommended).' },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Open Graph / Twitter image (1200×630).' },
    },
    { name: 'noindex', type: 'checkbox', defaultValue: false },
  ],
}
