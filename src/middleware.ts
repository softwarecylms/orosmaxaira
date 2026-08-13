import createMiddleware from 'next-intl/middleware'
import type { NextRequest } from 'next/server'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

/**
 * next-intl locale routing (el at root, en under /en) composed with the pre-launch
 * noindex header. The matcher excludes the Payload admin/api, top-level api,
 * Next internals, and any file with an extension (icons, llms.txt, robots.txt,
 * sitemap.xml) so those are never locale-rewritten.
 */
export function middleware(request: NextRequest) {
  const response = intlMiddleware(request)
  // Keep the whole site out of search indexes (pre-launch). Remove at launch.
  response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|admin|.*\\..*).*)'],
}
