import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Container } from '@/components/ui/section'
import { Reveal } from '@/components/motion/reveal'
import { ContactForm } from '@/components/contact/contact-form'
import { mediaSrc, mediaAlt } from '@/lib/utils'

type Block = {
  formHeading: string
  formBody?: string | null
  consentText?: string | null
  mapHeading?: string | null
  mapBody?: string | null
  mapImage?: unknown
  mapLink?: string | null
}

export function ContactFormMapRender({ block }: { block: Block }) {
  const mapSrc = mediaSrc(block.mapImage)

  return (
    <section className="py-10 md:py-16" data-testid="contact-form-map-section">
      <Container>
        <Reveal>
          <div className="overflow-hidden rounded-[30px] bg-surface-dark px-5 py-8 md:px-8 md:py-10 lg:px-10 lg:py-[100px]">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,674px)_minmax(0,1fr)] lg:gap-10">
              {/* Form card */}
              <div className="rounded-[20px] bg-white p-6 md:p-10" data-testid="contact-form-card" id="contact-form">
                <h2 className="font-display text-[28px] leading-[1.35] text-foreground md:text-[35px] md:leading-[52.5px]">
                  {block.formHeading}
                </h2>
                {block.formBody ? (
                  <p className="mt-5 text-[15.9px] leading-[26.4px] text-muted">{block.formBody}</p>
                ) : null}

                <div className="mt-8">
                  <ContactForm consentText={block.consentText} />
                </div>
              </div>

              {/* Map column */}
              <div className="flex flex-col gap-6 lg:pt-10">
                {block.mapHeading ? (
                  <h3 className="font-display text-[28px] leading-[1.35] text-white md:text-[35px] md:leading-[52.5px]">
                    {block.mapHeading}
                  </h3>
                ) : null}
                {block.mapBody ? (
                  <p className="max-w-[545px] text-[16px] leading-[26.4px] text-white">{block.mapBody}</p>
                ) : null}

                <div className="overflow-hidden rounded-[20px] bg-white p-[10px]" data-testid="contact-map-card">
                  <div className="relative aspect-[525/400] w-full overflow-hidden rounded-[10px] bg-[#ddd]">
                    {mapSrc ? (
                      <Image
                        src={mapSrc}
                        alt={mediaAlt(block.mapImage, 'Office location map')}
                        fill
                        sizes="(min-width: 1024px) 40vw, 100vw"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  {block.mapLink ? (
                    <Link
                      href={block.mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 flex items-center justify-between px-2 py-2 text-[14px] leading-[23.1px] text-foreground transition-colors hover:text-accent"
                    >
                      <span>Find us on the map</span>
                      <ArrowUpRight className="size-2.5" aria-hidden="true" />
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
