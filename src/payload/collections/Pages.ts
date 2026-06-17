import type { CollectionConfig } from 'payload'
import { seoField } from '@/payload/fields/seo'
import { revalidatePage, revalidateDeletedPage } from '@/payload/hooks/revalidate-page'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data }) =>
        `${process.env.NEXT_PUBLIC_SERVER_URL || ''}/${
          data?.slug === 'home' ? '' : data?.slug ?? ''
        }`,
    },
  },
  access: { read: () => true },
  versions: {
    drafts: { autosave: { interval: 800 } },
    maxPerDoc: 20,
  },
  hooks: {
    afterChange: [revalidatePage],
    afterDelete: [revalidateDeletedPage],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'URL slug. Use "home" for the homepage.',
      },
    },
    {
      name: 'content',
      type: 'json',
      required: true,
      defaultValue: { root: { props: {} }, content: [], zones: {} },
      admin: {
        description: 'Drag-and-drop visual editor powered by Puck.',
        components: {
          Field: '/payload/admin/PuckField.tsx',
        },
      },
    },
    seoField,
  ],
}
