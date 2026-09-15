import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { routing } from './i18n/routing'
import { canonicalHost } from './lib/seo'
import { LEGACY_REDIRECTS } from './lib/legacy-redirects'

const intlMiddleware = createMiddleware(routing)

/**
 * next-intl locale routing (el at root, en under /en). The matcher excludes the
 * Payload admin/api, top-level api, Next internals, and any file with an
 * extension (icons, llms.txt, robots.txt, sitemap.xml) so those are never
 * locale-rewritten.
 */
export function middleware(request: NextRequest) {
  // Old WordPress URLs with no page of their own → their new home, permanently.
  const { pathname } = request.nextUrl
  const legacy = LEGACY_REDIRECTS[pathname.endsWith('/') ? pathname : `${pathname}/`]
  if (legacy) {
    const url = request.nextUrl.clone()
    url.pathname = legacy
    url.search = ''
    return NextResponse.redirect(url, 301)
  }

  const response = intlMiddleware(request)
  // Only the public domain is indexed. orosmaxaira.vercel.app and preview
  // deployments serve the very same pages, and indexing them would publish the
  // site twice — so any other host answers noindex.
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  if (host && host !== canonicalHost()) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  }
  // Framing for the admin's `?preview=1` iframe is handled in `next.config.ts`,
  // which is where `X-Frame-Options` is set — config headers are applied after
  // middleware, so deleting it here would not stick.
  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|admin|.*\\..*).*)'],
}
