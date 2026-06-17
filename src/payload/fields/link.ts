import type { Field } from 'payload'

export const linkField = (overrides?: { name?: string; required?: boolean }): Field => ({
  name: overrides?.name ?? 'link',
  type: 'group',
  fields: [
    { name: 'label', type: 'text', required: overrides?.required ?? false },
    { name: 'href', type: 'text', required: overrides?.required ?? false },
    {
      name: 'newTab',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Open in a new tab.' },
    },
  ],
})
