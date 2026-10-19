import type { Block } from 'payload'

/**
 * An image by address inside an article's text. The articles brought over from
 * the old WordPress site use it for their pictures (files kept on the site under
 * /wp-content/uploads/, or on a partner's site). For a new picture, use the
 * editor's «Upload» instead, which adds it to the Media library.
 */
export const LegacyImageBlock: Block = {
  slug: 'legacyImage',
  labels: { singular: 'Image by address', plural: 'Images by address' },
  fields: [
    {
      name: 'src',
      label: 'Image address',
      type: 'text',
      required: true,
      admin: { description: 'e.g. /wp-content/uploads/2024/08/photo.jpg or https://…' },
    },
    { name: 'alt', label: 'Alt text', type: 'text' },
  ],
}
