import type { ClientLogo } from '@/payload-types'
import { mediaSrc } from '@/lib/utils'

export const DEFAULT_CLIENT_LOGOS: { name: string; src: string; width: number; height: number }[] =
  []

type ClientLogoStripProps = {
  logos?: (number | ClientLogo)[] | null
}

export function ClientLogoStrip({ logos }: ClientLogoStripProps) {
  const cmsLogos = (logos ?? []).filter(
    (logo): logo is ClientLogo => typeof logo === 'object' && logo !== null,
  )

  const items =
    cmsLogos.length > 0
      ? cmsLogos
          .map((logo) => {
            const src = mediaSrc(logo.logo)
            if (!src) return null
            return {
              key: String(logo.id),
              name: logo.name,
              src,
              width: 88,
              height: 30,
            }
          })
          .filter(Boolean)
      : DEFAULT_CLIENT_LOGOS.map((logo) => ({
          key: logo.name,
          name: logo.name,
          src: logo.src,
          width: logo.width,
          height: logo.height,
        }))

  if (items.length === 0) return null

  return (
    <div className="w-full">
      <ul className="mx-auto flex w-full max-w-[1223px] items-center justify-between">
        {items.map((item) =>
          item ? (
            <li key={item.key} className="flex shrink-0 items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.src}
                alt={item.name}
                width={item.width}
                height={item.height}
                loading="lazy"
                decoding="async"
                className="h-[30px] w-auto max-h-[30px] object-contain object-center"
              />
            </li>
          ) : null,
        )}
      </ul>
    </div>
  )
}
