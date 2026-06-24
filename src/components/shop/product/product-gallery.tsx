'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

/** Product detail gallery (Figma 239:1021 + Gallery row): large main image with
 *  a thumbnail strip. Controlled — `active` is the shown image; selecting a
 *  product variation updates it from the parent <ProductView>. */
export function ProductGallery({
  images,
  active,
  onSelect,
  alt,
}: {
  images: string[]
  active: string
  onSelect: (src: string) => void
  alt: string
}) {
  const gallery = images.length ? images : []
  const main = gallery.includes(active) ? active : gallery[0]

  return (
    <div className="flex flex-col gap-[9px]">
      <div className="relative aspect-square w-full overflow-hidden rounded-[4px] bg-offwhite">
        {main ? (
          <Image
            key={main}
            src={main}
            alt={alt}
            fill
            sizes="(min-width:1024px) 50vw, 100vw"
            priority
            className="object-cover"
          />
        ) : null}
      </div>

      {gallery.length > 1 ? (
        <div className="flex gap-[9px] overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {gallery.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => onSelect(src)}
              aria-label={`${alt} — εικόνα ${i + 1}`}
              aria-current={src === main}
              className={cn(
                'relative aspect-square w-[88px] shrink-0 overflow-hidden rounded-[4px] bg-offwhite transition-opacity md:w-[104px]',
                src === main ? 'opacity-100' : 'opacity-60 hover:opacity-100',
              )}
            >
              <Image src={src} alt="" fill sizes="104px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
