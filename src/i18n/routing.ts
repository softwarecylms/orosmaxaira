import { defineRouting } from 'next-intl/routing'

/**
 * Locale routing: Greek (el) is the default and lives at the root (`/…`), English
 * (en) lives under a `/en/…` prefix over the SAME slugs — matching the live site
 * (orosmaxaira.com). `localeDetection` is off so `/` never auto-redirects to a
 * locale; the root is always Greek.
 */
export const routing = defineRouting({
  locales: ['el', 'en'],
  defaultLocale: 'el',
  localePrefix: 'as-needed',
  localeDetection: false,
})

export type Locale = (typeof routing.locales)[number]
