import Image from 'next/image'
import { Check, Sprout, Users, GraduationCap } from 'lucide-react'
import type { AdoptBenefitIcon, AdoptContent } from '@/components/adopt/adopt-content'
import { GalleryCarousel } from '@/components/adopt/gallery-carousel'
import { LogoCarousel } from '@/components/adopt/logo-carousel'
import { AdoptTestimonials } from '@/components/adopt/adopt-testimonials'
import { FormVideoBg } from '@/components/adopt/form-video-bg'
import { AdoptCtaForm } from '@/components/adopt/adopt-cta-form'
import { Reveal, RevealStagger, RevealStaggerItem } from '@/components/motion/reveal'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { CtaLink } from '@/components/home/cta-link'
import { FaqSchema } from '@/components/seo/faq-schema'
import { cn } from '@/lib/utils'

/**
 * «Υιοθετώ μια κυψέλη» sections. Each takes its slice of the page copy as
 * `content` and fetches nothing, so the same component renders the live page
 * and the visual editor. (The hero, goal band and progress bar are the
 * existing AdoptHero, GoalBand and AdoptProgress components.)
 */

const BENEFIT_ICONS: Record<AdoptBenefitIcon, typeof Sprout> = {
  Sprout,
  Users,
  GraduationCap,
}

/** Centered section header (eyebrow → display heading → optional sub). */
function SectionHead({
  eyebrow,
  heading,
  sub,
  className,
}: {
  eyebrow: string
  heading: string
  sub?: string
  className?: string
}) {
  return (
    <Reveal className={cn('mx-auto flex max-w-[720px] flex-col items-center gap-3 text-center', className)}>
      <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-accent">
        {eyebrow}
      </span>
      <h2 className="font-display text-[28px] font-bold leading-[1.14] text-foreground md:text-[35px]">
        {heading}
      </h2>
      {sub ? <p className="text-[16px] leading-[1.6] text-muted">{sub}</p> : null}
    </Reveal>
  )
}

/** Intro + why adopt. */
export function AdoptIntro({ content }: { content: AdoptContent['intro'] }) {
  return (
    <section data-edit="intro" className="container-wide py-12 md:py-[70px]">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <Reveal className="flex flex-col gap-5">
          <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-accent">
            {content.eyebrow}
          </span>
          <p className="font-display text-[24px] font-semibold leading-[1.3] text-foreground md:text-[31px]">
            {content.hook}
          </p>
          <p className="text-[16px] leading-[1.7] text-muted">{content.body}</p>
          <CtaLink href="#cta" variant="gold" className="mt-1 self-start">
            {content.ctaLabel}
          </CtaLink>
        </Reveal>

        <div className="flex flex-col gap-4">
          <h2 className="font-display text-[21px] font-bold text-foreground md:text-[24px]">
            {content.whyHeading}
          </h2>
          <RevealStagger className="flex flex-col gap-3">
            {content.benefits.map((b) => {
              const Icon = BENEFIT_ICONS[b.icon]
              return (
                <RevealStaggerItem
                  key={b.title}
                  hoverLift
                  className="group flex items-start gap-4 rounded-[14px] bg-white p-5 shadow-card ring-1 ring-border/50 transition-shadow hover:shadow-card-lg"
                >
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-gold-strong text-white shadow-[0_6px_16px_-6px_rgba(241,172,16,0.75)]">
                    <Icon className="size-6 fill-white" aria-hidden="true" />
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="text-[16px] font-semibold text-foreground transition-colors group-hover:text-accent">
                      {b.title}
                    </span>
                    <span className="text-[14px] leading-[1.5] text-muted">{b.text}</span>
                  </span>
                </RevealStaggerItem>
              )
            })}
          </RevealStagger>
        </div>
      </div>
    </section>
  )
}

/** Partner logos — early trust bar. */
export function AdoptPartners({ content }: { content: AdoptContent['partners'] }) {
  return (
    <section data-edit="partners" className="bg-offwhite py-10 md:py-12">
      <div className="container-wide flex flex-col gap-8">
        <SectionHead eyebrow={content.eyebrow} heading={content.heading} />
        <LogoCarousel logos={content.logos} />
      </div>
    </section>
  )
}

/** The package — 3 steps. */
export function AdoptPackage({ content }: { content: AdoptContent['package'] }) {
  return (
    <section id="package" data-edit="package" className="scroll-mt-24 bg-white pb-6 pt-12 md:pb-10 md:pt-[70px]">
      <div className="container-wide flex flex-col gap-10">
        <SectionHead eyebrow={content.eyebrow} heading={content.heading} />
        <RevealStagger className="grid gap-5 md:grid-cols-3">
          {content.steps.map((step) => (
            <RevealStaggerItem
              key={step.num}
              hoverLift
              className="group flex flex-col rounded-[16px] bg-white p-7 shadow-card ring-1 ring-border/50 transition-shadow hover:shadow-card-lg"
            >
              <span className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-gold-strong font-display text-[22px] font-bold text-white shadow-[0_8px_20px_-8px_rgba(241,172,16,0.8)]">
                {step.num}
              </span>
              <h3 className="mt-5 text-[19px] font-semibold text-foreground transition-colors group-hover:text-accent">
                {step.title}
              </h3>
              <p className="mt-2 text-[15px] leading-[1.6] text-muted">{step.text}</p>
              {'link' in step && step.link ? (
                <div className="mt-auto pt-3">
                  <CtaLink href={step.link.href} variant="link" className="text-[15px]">
                    {step.link.label}
                  </CtaLink>
                </div>
              ) : null}
            </RevealStaggerItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  )
}

/** "Οι Δύο Επισκέψεις" — cinematic image cards with a dark gradient scrim, an
 *  overlaid season badge + title, a big ghost numeral, and a gold check-list of
 *  what each visit includes. */
export function AdoptVisits({ content: v }: { content: AdoptContent['visits'] }) {
  return (
    <section id="visits" className="scroll-mt-24 pb-14 pt-6 md:pb-20 md:pt-8">
      <div className="container-wide flex flex-col gap-10 md:gap-14">
        <Reveal className="mx-auto flex max-w-[720px] flex-col items-center gap-3 text-center">
          <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-accent">
            {v.eyebrow}
          </span>
          <h2 className="font-display text-[30px] font-bold leading-[1.1] text-foreground md:text-[40px]">
            {v.heading}
          </h2>
          <p className="text-[16px] leading-[1.6] text-muted">{v.sub}</p>
        </Reveal>

        <RevealStagger className="grid items-stretch gap-6 lg:grid-cols-2 lg:gap-8" stagger={0.14}>
          {v.items.map((visit, idx) => (
            <RevealStaggerItem
              key={visit.title}
              className="relative flex flex-col overflow-hidden rounded-[22px] bg-white shadow-card ring-1 ring-border"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={visit.image}
                  alt={visit.title}
                  fill
                  sizes="(min-width:1024px) 50vw, 100vw"
                  className={cn('object-cover', visit.imageClass)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-foreground/5" />
                <span className="pointer-events-none absolute -top-2 right-3 font-display text-[110px] font-bold leading-none text-white/35">
                  {idx === 0 ? '01' : '02'}
                </span>
                <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2.5 p-6">
                  <div className="flex flex-wrap gap-2">
                    {visit.pills.map((p) => (
                      <span
                        key={p}
                        className="rounded-full border border-white/30 bg-white/15 px-3 py-1 text-[13px] font-medium text-white backdrop-blur"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                  <h3 className="font-display text-[26px] font-bold text-white md:text-[30px]">
                    {visit.title}
                  </h3>
                </div>
              </div>
              <ul className="flex flex-col gap-4 p-6 md:p-7">
                {visit.activities.map((act, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-gold-strong">
                      <Check className="size-3.5" aria-hidden="true" />
                    </span>
                    <span className="text-[15px] leading-[1.55] text-foreground/90">{act.text}</span>
                  </li>
                ))}
              </ul>
            </RevealStaggerItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  )
}

export function AdoptGallery({ content }: { content: AdoptContent['gallery'] }) {
  return (
    <section data-edit="gallery" className="bg-offwhite py-10 md:py-12">
      <div className="container-wide flex flex-col gap-8">
        <SectionHead eyebrow={content.eyebrow} heading={content.heading} />
        <GalleryCarousel images={content.images} />
      </div>
    </section>
  )
}

export function AdoptTestimonialsSection({ content }: { content: AdoptContent['testimonials'] }) {
  return (
    <section data-edit="testimonials" className="bg-offwhite py-12 md:py-[70px]">
      <div className="container-wide flex flex-col gap-10">
        <SectionHead eyebrow={content.eyebrow} heading={content.heading} />
        <AdoptTestimonials items={content.items} />
      </div>
    </section>
  )
}

export function AdoptFaq({ content }: { content: AdoptContent['faq'] }) {
  return (
    <section data-edit="faq" className="container-wide pb-6 pt-12 md:pb-10 md:pt-[70px]">
      <FaqSchema faqs={content.items.map((f) => ({ question: f.q, answer: f.a }))} />
      <div className="flex flex-col gap-8">
        <SectionHead eyebrow={content.eyebrow} heading={content.heading} sub={content.intro} />
        <Reveal className="mx-auto w-full lg:w-[55%]">
          <Accordion type="single" collapsible defaultValue="faq-0" className="w-full">
            {content.items.map((f, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="hover:text-accent data-[state=open]:text-accent">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent>{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  )
}

/** CTA + contact form on the gold band. */
export function AdoptCta({
  content,
}: {
  content: { cta: AdoptContent['cta']; form: AdoptContent['form'] }
}) {
  return (
    <section id="cta" data-edit="cta" className="scroll-mt-24 pb-12 pt-4 md:pb-[70px] md:pt-6">
      <div className="container-wide">
        <Reveal className="relative isolate overflow-hidden rounded-[30px] bg-accent p-8 text-white md:p-14">
          {/* form-bg video (poster falls back to form-bg.webp) + accent overlay */}
          <FormVideoBg />
          <div className="relative z-10 grid items-center gap-10 lg:grid-cols-2">
            <div className="flex flex-col gap-5">
              <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-cream">
                {content.cta.eyebrow}
              </span>
              <h2 className="font-display text-[28px] font-bold leading-[1.15] text-white md:text-[38px]">
                {content.cta.heading}
              </h2>
              <p className="max-w-[520px] text-[16px] leading-[1.6] text-white/85">{content.cta.body}</p>
            </div>

            <div data-edit="form">
              <AdoptCtaForm form={content.form} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
