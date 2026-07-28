import type { Metadata } from 'next'
import Image from 'next/image'
import { CERTIFICATES_PAGE, type Certificate } from '@/components/certificates/certificates-content'
import { PageHero } from '@/components/shared/page-hero'
import { RevealUp, RevealGroup, RevealItem } from '@/components/home/reveal-up'
import { RichText } from '@/components/activities/detail/rich-text'
import { cn } from '@/lib/utils'

const SITE = 'https://orosmaxaira.vercel.app'

export const metadata: Metadata = {
  title: 'Πιστοποιήσεις',
  description:
    'Οι πιστοποιήσεις του Όρος Μαχαιρά — ISO 22000 (Ασφάλεια Τροφίμων) και ISO 14001 (Περιβαλλοντική Διαχείριση). Δείτε και κατεβάστε τα επίσημα πιστοποιητικά.',
  alternates: { canonical: `${SITE}/certificates` },
}

/** Πιστοποιήσεις showcase — title banner + one full-width section per certificate
 *  (alternating 50/50 layout, live PDF preview, download links). Mirrors the
 *  Awards page structure. */
export default function CertificatesPage() {
  const { hero, certificates } = CERTIFICATES_PAGE

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Αρχική', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Πιστοποιήσεις', item: `${SITE}/certificates` },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      <PageHero
        image={hero.image}
        imageAlt={hero.imageAlt}
        title={hero.title}
        description={hero.description}
      />

      {certificates.map((cert, i) => (
        <section
          key={cert.code}
          id={cert.code.toLowerCase().replace(/\s+/g, '-')}
          className={cn('scroll-mt-28 py-14 md:py-20', i % 2 === 1 && 'bg-offwhite')}
        >
          <RevealUp className="container-wide">
            <CertificateSection cert={cert} reversed={i % 2 === 1} />
          </RevealUp>
        </section>
      ))}
    </>
  )
}

/** One certificate as an alternating 50/50 section: copy on one side, live PDF
 *  preview on the other (sides swap via `reversed`). Stacks on mobile. */
function CertificateSection({ cert, reversed = false }: { cert: Certificate; reversed?: boolean }) {
  return (
    <article className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
      {/* Copy — centered on mobile, left-aligned on desktop */}
      <div
        className={cn(
          'flex flex-col items-center gap-5 text-center lg:items-start lg:text-left',
          reversed && 'lg:order-2',
        )}
      >
        <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-[13px] font-bold uppercase tracking-[0.06em] text-gold-strong">
          {cert.code}
        </span>

        <h2 className="font-display text-[26px] font-bold leading-[1.12] text-foreground md:text-[34px]">
          {cert.title}
        </h2>

        <div className="flex flex-col gap-3 text-[16px] leading-[26px] text-foreground/90">
          <p className="text-[17px] leading-[27px] text-foreground">
            <RichText text={cert.body[0]} />
          </p>
          {cert.body.slice(1).map((p, i) => (
            <p key={i}>
              <RichText text={p} />
            </p>
          ))}
          {cert.highlights.length ? (
            <RevealGroup className="mt-1 flex flex-col gap-2" stagger={0.09}>
              {cert.highlights.map((h, i) => (
                // Bullets read poorly when centered — align them left on desktop only.
                <RevealItem key={i} className="lg:flex lg:items-start lg:gap-2.5">
                  <span
                    className="mt-[7px] hidden size-1.5 shrink-0 rounded-full bg-accent lg:block"
                    aria-hidden="true"
                  />
                  <span>{h}</span>
                </RevealItem>
              ))}
            </RevealGroup>
          ) : null}
        </div>
      </div>

      {/* Certificate preview (rendered first page — download the full PDF below) */}
      <div className={cn('w-full', reversed && 'lg:order-1')}>
        <div className="mx-auto w-full max-w-[440px]">
          <div className="relative aspect-[1/1.414] w-full overflow-hidden rounded-[12px] bg-white shadow-[0_0_26px_rgba(0,0,0,0.15)]">
            <Image
              src={cert.image}
              alt={cert.imageAlt}
              fill
              sizes="(min-width:1024px) 440px, 90vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </article>
  )
}
