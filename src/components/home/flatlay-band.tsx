import Image from 'next/image'
import { FLATLAY } from './home-content'
import { FlatlayHotspot } from './flatlay-hotspot'

/** Section 9 — full-bleed marble flatlay with floating price pills that reveal
 *  a product quick-view card on hover (Figma 118:617 + 358:1793). */
export function FlatlayBand() {
  return (
    <section data-testid="flatlay-band" className="relative z-10 w-full overflow-x-clip">
      <div className="relative aspect-square w-full lg:aspect-auto lg:h-[520px]">
        {/* Image clipped to the band; the hover cards are free to overflow it */}
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={FLATLAY.image}
            alt={FLATLAY.imageAlt}
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
        {FLATLAY.prices.map((p, i) => (
          <FlatlayHotspot key={p.value} item={p} index={i} />
        ))}
      </div>
    </section>
  )
}
