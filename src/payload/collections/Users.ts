import type { CollectionConfig } from 'payload'
import { adminFieldOnly, adminOrSelf, isAdmin } from '@/payload/access'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'role'],
  },
  auth: true,
  access: {
    // Admins manage accounts; everyone can see and update their own.
    read: adminOrSelf,
    create: isAdmin,
    update: adminOrSelf,
    delete: isAdmin,
  },
  fields: [
    { name: 'name', type: 'text' },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      access: { create: adminFieldOnly, update: adminFieldOnly },
      admin: {
        description: 'Admin: everything, including user accounts. Editor: pages, posts, media and settings.',
      },
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
    },
  ],
}
