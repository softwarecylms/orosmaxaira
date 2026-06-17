import type { GlobalConfig } from 'payload'
import { linkField } from '@/payload/fields/link'

export const Header: GlobalConfig = {
  slug: 'header',
  access: { read: () => true },
  fields: [
    {
      name: 'nav',
      type: 'array',
      fields: [
        linkField({ name: 'link', required: true }),
        {
          name: 'children',
          type: 'array',
          label: 'Dropdown links',
          admin: {
            description: 'Optional submenu items (e.g. Website Design and SEO under Services).',
          },
          fields: [linkField({ name: 'link', required: true })],
        },
      ],
    },
  ],
}
