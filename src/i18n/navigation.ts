import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

/**
 * Locale-aware navigation. Use these `Link`/`redirect`/`usePathname`/`useRouter`
 * in localized components instead of the `next/*` originals — they automatically
 * apply the `/en` prefix (and none for Greek).
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)

/**
 * Prefix a root-relative path with the locale when needed (el = no prefix, en = `/en`).
 * For raw `<a href>` / canonical / JSON-LD strings where the next-intl `Link` isn't used.
 */
export function localeHref(locale: string, path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`
  return locale === routing.defaultLocale ? clean : `/${locale}${clean === '/' ? '' : clean}`
}
