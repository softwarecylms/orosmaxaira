'use client'

import Image from 'next/image'
import { usePathname } from '@/i18n/navigation'

/**
 * Shop pages: the product listing, a single category listing and a product
 * itself. The pathname from `@/i18n/navigation` carries no locale prefix, so
 * this one pattern covers Greek and English alike.
 */
const SHOP_ROUTE = /^\/(proionta|product)(\/|$)/

/**
 * The EU / ΘΑΛΕΙΑ co-funding notice — quiet by design: 20px logos and 11px type.
 *
 * It reads the path on the client for one reason: the footer is rendered once
 * in the locale layout, which cannot know which page sits below it. Shop pages
 * leave the notice out; everywhere else it renders exactly as before.
 */
export function FooterFunding({
  funding,
}: {
  funding: { thaleiaAlt: string; cyprusAlt: string; euAlt: string; text: string }
}) {
  const pathname = usePathname()
  if (SHOP_ROUTE.test(pathname)) return null

  return (
    <div className="flex flex-col items-center gap-3 lg:mt-auto lg:items-start">
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 lg:justify-start">
        <Image
          src="/images/funding/thaleia.png"
          alt={funding.thaleiaAlt}
          width={514}
          height={160}
          className="h-5 w-auto opacity-70"
        />
        <Image
          src="/images/funding/cyprus.png"
          alt={funding.cyprusAlt}
          width={196}
          height={160}
          className="h-5 w-auto opacity-70"
        />
        <Image
          src="/images/funding/eu.png"
          alt={funding.euAlt}
          width={873}
          height={160}
          className="h-5 w-auto opacity-70"
        />
      </div>
      <p className="max-w-[300px] text-[11px] leading-[1.5] text-muted/80">{funding.text}</p>
    </div>
  )
}
