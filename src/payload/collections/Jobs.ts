import type { CollectionConfig } from 'payload'

export const Jobs: CollectionConfig = {
  slug: 'jobs',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'location', 'type', 'status'],
  },
  access: { read: () => true },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'location', type: 'text', defaultValue: 'Remote' },
    {
      name: 'type',
      type: 'select',
      defaultValue: 'full-time',
      options: [
        { label: 'Full time', value: 'full-time' },
        { label: 'Part time', value: 'part-time' },
        { label: 'Internship', value: 'internship' },
        { label: 'Contract', value: 'contract' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'open',
      options: [
        { label: 'Open', value: 'open' },
        { label: 'Closed', value: 'closed' },
      ],
    },
    { name: 'summary', type: 'textarea' },
    { name: 'description', type: 'richText' },
    { name: 'applyUrl', type: 'text' },
  ],
}
