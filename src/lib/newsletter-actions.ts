'use server'

import { getLocale } from 'next-intl/server'
import { subscribeToNewsletter } from './klaviyo'

export type NewsletterState = { status: 'idle' | 'done' | 'invalid' | 'error' }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** The footer signup. Asks for the address and an explicit consent tick. */
export async function subscribeNewsletter(
  _prev: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  // Honeypot: a real visitor never fills this hidden field.
  if (String(formData.get('company_website') ?? '')) return { status: 'done' }

  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  if (!EMAIL.test(email) || email.length > 200 || formData.get('consent') !== 'on') {
    return { status: 'invalid' }
  }
  const locale = await getLocale()
  const ok = await subscribeToNewsletter(email, locale === 'en' ? 'en' : 'el', 'Footer')
  return { status: ok ? 'done' : 'error' }
}
