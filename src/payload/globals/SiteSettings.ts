import type { GlobalConfig } from 'payload'
import { linkField } from '@/payload/fields/link'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: { read: () => true },
  fields: [
    { name: 'siteName', type: 'text', defaultValue: 'Your Brand' },
    { name: 'tagline', type: 'text' },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'logoDark', type: 'upload', relationTo: 'media', admin: { description: 'Used on dark backgrounds.' } },
    { name: 'defaultOgImage', type: 'upload', relationTo: 'media' },
    {
      name: 'contact',
      type: 'group',
      fields: [
        { name: 'email', type: 'text' },
        { name: 'phone', type: 'text' },
        { name: 'address', type: 'textarea' },
      ],
    },
    {
      name: 'social',
      type: 'group',
      fields: [
        { name: 'facebook', type: 'text' },
        { name: 'instagram', type: 'text' },
        { name: 'linkedin', type: 'text' },
        { name: 'youtube', type: 'text' },
        { name: 'tiktok', type: 'text' },
      ],
    },
    linkField({ name: 'callbackCta' }),
    {
      name: 'footerCta',
      type: 'group',
      fields: [
        { name: 'heading', type: 'text', defaultValue: 'Ready to get started?' },
        { name: 'body', type: 'text' },
        linkField({ name: 'cta' }),
      ],
    },
  ],
}
