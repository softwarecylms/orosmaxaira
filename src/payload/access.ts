import type { Access, FieldAccess } from 'payload'

/**
 * Who may do what in the CMS.
 *
 * - **Admins** manage everything, including user accounts.
 * - **Editors** edit the site — pages, posts, categories, media, settings — but
 *   cannot create, change or delete users (they can still update their own
 *   account, e.g. their password).
 * - **Visitors** (no login) only read what is published.
 */

type Role = 'admin' | 'editor'
const roleOf = (user: unknown): Role | undefined =>
  (user as { role?: Role } | null | undefined)?.role

export const isAdmin: Access = ({ req }) => roleOf(req.user) === 'admin'

export const isLoggedIn: Access = ({ req }) => Boolean(req.user)

/** Admins see every account; anyone else only their own. */
export const adminOrSelf: Access = ({ req }) => {
  if (!req.user) return false
  if (roleOf(req.user) === 'admin') return true
  return { id: { equals: req.user.id } }
}

/** Published documents for everyone; drafts only for logged-in users. */
export const publishedOrLoggedIn: Access = ({ req }) => {
  if (req.user) return true
  return { _status: { equals: 'published' } }
}

/** Only admins may change a user's role (an editor cannot promote themselves). */
export const adminFieldOnly: FieldAccess = ({ req }) => roleOf(req.user) === 'admin'
