import Image from 'next/image'
import Link from 'next/link'
import { FLATLAY } from './home-content'
import { RevealFade } from './reveal-up'

/** Section 9 — full-bleed marble flatlay with floating price pills (Figma 118:617). */
export function FlatlayBand() {
  return (
    <section data-testid="flatlay-band" className="relative w-full overflow-hidden">
      <div className="relative h-[260px] w-full sm:h-[380px] lg:h-[520px]">
        <Image
          src={FLATLAY.image}
          alt={FLATLAY.imageAlt}
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
        {FLATLAY.prices.map((p, i) => (
          <RevealFade
            key={p.value}
            delay={0.1 + i * 0.12}
            style={{ left: p.left, top: p.top }}
            className="absolute hidden -translate-x-1/2 -translate-y-1/2 md:block"
          >
            <Link
              href={p.href}
              className="flex items-center justify-center rounded-[21px] bg-white px-5 py-2.5 text-[17px] leading-[24px] text-foreground shadow-[0_6px_20px_-8px_rgba(0,0,0,0.35)] transition-transform hover:scale-105"
              aria-label={`Προϊόν €${p.value}`}
            >
              {p.value}
            </Link>
          </RevealFade>
        ))}
      </div>
    </section>
  )
}
