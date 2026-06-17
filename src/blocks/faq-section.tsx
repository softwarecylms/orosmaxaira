import Image from 'next/image'
import Link from 'next/link'
import { Section, Container } from '@/components/ui/section'
import { Reveal } from '@/components/motion/reveal'
import type { Faq } from '@/payload-types'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { FaqSchema } from '@/components/seo/faq-schema'
import { LinkButton } from '@/components/ui/button'
import { mediaSrc, mediaAlt, cn } from '@/lib/utils'

type SidePanel = {
  eyebrow?: string | null
  heading?: string | null
  body?: string | null
  cta?: { label?: string | null; href?: string | null } | null
  image?: unknown
}

type Block = {
  heading?: string | null
  subheading?: string | null
  image?: unknown
  faqs?: (number | Faq)[] | null
  sidePanel?: SidePanel | null
  panelImageFallback?: string | null
}

function PlusMinusIcon({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'relative inline-flex size-[14px] shrink-0 items-center justify-center',
        className,
      )}
      aria-hidden="true"
    >
      <span className="absolute h-[2px] w-full rounded-full bg-foreground" />
      <span className="absolute h-full w-[2px] rounded-full bg-foreground group-data-[state=open]:hidden" />
    </span>
  )
}

export function FaqSectionRender({ block }: { block: Block }) {
  const faqs = (block.faqs ?? []).filter(
    (f): f is Faq => typeof f === 'object' && f !== null,
  )
  const sidePanel = block.sidePanel
  const panelSrc =
    mediaSrc(sidePanel?.image ?? block.image) ?? block.panelImageFallback ?? null
  const isContactLayout = Boolean(sidePanel?.heading || sidePanel?.body)

  return (
    <Section spacing="default" className="bg-background" data-testid="faq-section">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,685px)_minmax(0,1fr)] lg:gap-12">
          <Reveal as="div" className="flex flex-col gap-6">
            {block.heading ? (
              <h2 className="font-display text-[32px] leading-[1.35] text-foreground md:text-[35px] md:leading-[52.5px]">
                {block.heading}
              </h2>
            ) : null}

            {faqs.length ? (
              <Accordion
                type="single"
                collapsible
                defaultValue={String(faqs[0]?.id ?? '')}
                className={cn(isContactLayout ? 'divide-y divide-border-strong/20' : 'card-soft p-2 md:p-4')}
              >
                {faqs.map((q) => (
                  <AccordionItem
                    key={q.id}
                    value={String(q.id)}
                    className={cn(
                      'border-none',
                      isContactLayout ? 'px-0 py-1' : 'px-4 border-b border-border-strong/30 last:border-b-0',
                    )}
                  >
                    <AccordionTrigger
                      className={cn(
                        'group py-4 text-left text-[15px] font-normal leading-[24.75px] text-foreground hover:no-underline md:text-base',
                        isContactLayout && '[&>svg:last-child]:hidden',
                      )}
                    >
                      {q.question}
                      {isContactLayout ? <PlusMinusIcon className="ml-auto" /> : null}
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 text-[15px] leading-[24.75px] text-muted">
                      {q.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : null}

            {block.subheading ? (
              <p className="text-[15px] leading-[24.75px] text-muted">{block.subheading}</p>
            ) : null}
          </Reveal>

          <Reveal as="div" delay={0.1}>
            {isContactLayout ? (
              <div
                className="relative min-h-[480px] overflow-hidden rounded-[30px] bg-accent-soft lg:min-h-[588px]"
                data-testid="faq-side-panel"
              >
                {panelSrc ? (
                  <Image
                    src={panelSrc}
                    alt={mediaAlt(sidePanel?.image ?? block.image, 'Customer support')}
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover object-right"
                  />
                ) : null}
                <div className="relative z-10 flex h-full min-h-[480px] flex-col p-8 md:p-10 lg:min-h-[588px]">
                  {sidePanel?.eyebrow ? (
                    <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-[14px] text-foreground">
                      <span className="inline-flex size-4 items-center justify-center rounded-full bg-accent text-[10px] text-white">
                        ?
                      </span>
                      {sidePanel.eyebrow}
                    </span>
                  ) : null}
                  {sidePanel?.heading ? (
                    <h3 className="mt-6 max-w-[278px] font-display text-[20px] leading-[30px] text-foreground">
                      {sidePanel.heading}
                    </h3>
                  ) : null}
                  {sidePanel?.body ? (
                    <p className="mt-4 max-w-[278px] text-[14.8px] leading-[24.75px] text-foreground">
                      {sidePanel.body}
                    </p>
                  ) : null}
                  {sidePanel?.cta?.label && sidePanel?.cta?.href ? (
                    <div className="mt-auto pt-8">
                      <LinkButton
                        href={sidePanel.cta.href}
                        variant="primary"
                        withIcon
                        className="rounded-[40px] px-5 py-3 text-[14.9px]"
                      >
                        {sidePanel.cta.label}
                      </LinkButton>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.5rem] bg-pink">
                {panelSrc ? (
                  <Image
                    src={panelSrc}
                    alt={mediaAlt(block.image, 'Customer support')}
                    fill
                    sizes="(min-width: 768px) 40vw, 100vw"
                    className="object-cover"
                  />
                ) : null}
              </div>
            )}
          </Reveal>
        </div>
      </Container>
      <FaqSchema faqs={faqs.map((f) => ({ question: f.question, answer: f.answer }))} />
    </Section>
  )
}
