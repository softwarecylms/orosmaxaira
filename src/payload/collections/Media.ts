import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: { read: () => true },
  admin: { useAsTitle: 'filename' },
  upload: {
    staticDir: 'public/media',
    imageSizes: [
      { name: 'thumbnail', width: 480, height: undefined, position: 'centre' },
      { name: 'card', width: 768, height: undefined, position: 'centre' },
      { name: 'feature', width: 1280, height: undefined, position: 'centre' },
      { name: 'hero', width: 1920, height: undefined, position: 'centre' },
    ],
    formatOptions: {
      format: 'webp',
      options: { quality: 82 },
    },
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: { description: 'Describe the image for screen readers and SEO.' },
    },
    { name: 'caption', type: 'text' },
  ],
}
