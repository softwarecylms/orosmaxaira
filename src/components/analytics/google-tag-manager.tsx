import { headers } from 'next/headers'
import { canonicalHost } from '@/lib/seo'

/** The site's Google Tag Manager container. Tags (analytics, ads, pixels) are
 *  added and published in Tag Manager itself — no code change needed. */
const GTM_ID = 'GTM-WZMJFB2M'

/**
 * Tag Manager runs on the public domain only. orosmaxaira.vercel.app, preview
 * deployments and the dev server serve the very same pages, and counting their
 * visits would skew the site's statistics — the same host rule that keeps them
 * out of Google's index (src/middleware.ts).
 */
export async function tagManagerEnabled(): Promise<boolean> {
  if (process.env.NODE_ENV !== 'production') return false
  const h = await headers()
  return (h.get('x-forwarded-host') ?? h.get('host')) === canonicalHost()
}

/** Google's container snippet, as high in <head> as possible. */
export function TagManagerScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
      }}
    />
  )
}

/** The no-JavaScript fallback. It must come immediately after <body> opens —
 *  Search Console's "Google Tag Manager" verification looks for it there. */
export function TagManagerNoscript() {
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  )
}
