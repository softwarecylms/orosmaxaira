import type { GlobalConfig } from 'payload'
import { linkField } from '@/payload/fields/link'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: { read: () => true },
  fields: [
    {
      name: 'columns',
      type: 'array',
      maxRows: 5,
      fields: [
        { name: 'heading', type: 'text', required: true },
        {
          name: 'links',
          type: 'array',
          fields: [linkField({ name: 'link', required: true })],
        },
      ],
    },
    {
      name: 'bottomNote',
      type: 'text',
      defaultValue: '© Your Brand. All rights reserved.',
    },
    {
      name: 'badges',
      type: 'array',
      admin: { description: 'Small trust badges at the bottom (e.g. Google Reviews).' },
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'sublabel', type: 'text' },
      ],
    },
  ],
}
