import Image from 'next/image'
import type { Certificate, CertificatesContent } from '@/components/certificates/certificates-content'
import { RevealUp, RevealGroup, RevealItem } from '@/components/home/reveal-up'
import { RichText } from '@/components/activities/detail/rich-text'
import { cn } from '@/lib/utils'

/**
 * «Πιστοποιήσεις» sections. They take the page copy as `content` and fetch
 * nothing, so the same component renders the live page and the visual editor.
 * (The hero is PageHero.)
 */

/** One full-width section per certificate, alternating 50/50 with a soft band
 *  on every other one. The download link opens the English PDF on /en. */
export function CertificatesList({
  content,
  locale,
}: {
  content: { certificates: CertificatesContent['certificates']; downloadLabel: string }
  locale: string
}) {
  const en = locale === 'en'
  return (
    <>
      {content.certificates.map((cert, i) => (
        <section
          data-edit="certificates"
          key={cert.code}
          id={cert.code.toLowerCase().replace(/\s+/g, '-')}
          className={cn('scroll-mt-28 py-14 md:py-20', i % 2 === 1 && 'bg-offwhite')}
        >
          <RevealUp className="container-wide">
            <CertificateSection
              cert={cert}
              reversed={i % 2 === 1}
              pdf={en ? cert.pdfEn ?? cert.pdfGr : cert.pdfGr}
              downloadLabel={content.downloadLabel}
            />
          </RevealUp>
        </section>
      ))}
    </>
  )
}

/** One certificate as an alternating 50/50 section: copy on one side, live PDF
 *  preview on the other (sides swap via `reversed`). Stacks on mobile. */
function CertificateSection({
  cert,
  reversed = false,
  pdf,
  downloadLabel,
}: {
  cert: Certificate
  reversed?: boolean
  pdf: string
  downloadLabel: string
}) {
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

      {/* Certificate preview (rendered first page) — the whole card + the button
          below link to the official PDF (English file on /en). */}
      <div className={cn('w-full', reversed && 'lg:order-1')}>
        <div className="mx-auto flex w-full max-w-[440px] flex-col items-center gap-5">
          <a
            href={pdf}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${downloadLabel} — ${cert.code}`}
            className="group relative aspect-[1/1.414] w-full overflow-hidden rounded-[12px] bg-white shadow-[0_0_26px_rgba(0,0,0,0.15)]"
          >
            <Image
              src={cert.image}
              alt={cert.imageAlt}
              fill
              sizes="(min-width:1024px) 440px, 90vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </a>
        </div>
      </div>
    </article>
  )
}
