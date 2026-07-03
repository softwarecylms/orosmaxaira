import type { Metadata } from 'next'
import { Sprout, Users, GraduationCap } from 'lucide-react'
import { ADOPT_PAGE, type AdoptBenefitIcon } from '@/components/adopt/adopt-content'
import { AdoptHero } from '@/components/adopt/adopt-hero'
import { GalleryCarousel } from '@/components/adopt/gallery-carousel'
import { LogoCarousel } from '@/components/adopt/logo-carousel'
import { GoalBand } from '@/components/adopt/goal-band'
import { VisitsShowcase } from '@/components/adopt/visits-showcase'
import { AdoptProgress } from '@/components/adopt/adopt-progress'
import { AdoptTestimonials } from '@/components/adopt/adopt-testimonials'
import { FormVideoBg } from '@/components/adopt/form-video-bg'
import { Reveal, RevealStagger, RevealStaggerItem } from '@/components/motion/reveal'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { AdoptCtaForm } from '@/components/adopt/adopt-cta-form'
import { CtaLink } from '@/components/home/cta-link'
import { FaqSchema } from '@/components/seo/faq-schema'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Υιοθετώ μια Κυψέλη',
  description:
    'Εταιρικό πρόγραμμα «Υιοθετώ μια Κυψέλη» του Όρους Μαχαιρά: υιοθετήστε μια κυψέλη, ζήστε μια μοναδική βιωματική εμπειρία με την ομάδα σας και στηρίξτε τις μέλισσες και το περιβάλλον.',
}

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

export default function AdoptAHivePage() {
  const a = ADOPT_PAGE

  return (
    <>
      {/* 1 · Hero */}
      <AdoptHero />

      {/* 2 · Intro + Why adopt */}
      <section className="container-wide py-12 md:py-[70px]">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <Reveal className="flex flex-col gap-5">
            <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-accent">
              {a.intro.eyebrow}
            </span>
            <p className="font-display text-[24px] font-semibold leading-[1.3] text-foreground md:text-[31px]">
              {a.intro.hook}
            </p>
            <p className="text-[16px] leading-[1.7] text-muted">{a.intro.body}</p>
            <CtaLink href="#cta" variant="gold" className="mt-1 self-start">
              Υιοθετήστε μια κυψέλη
            </CtaLink>
          </Reveal>

          <div className="flex flex-col gap-4">
            <h2 className="font-display text-[21px] font-bold text-foreground md:text-[24px]">
              {a.intro.whyHeading}
            </h2>
            <RevealStagger className="flex flex-col gap-3">
              {a.intro.benefits.map((b) => {
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

      {/* 3 · Partner logos — early trust bar */}
      <section className="bg-offwhite py-10 md:py-12">
        <div className="container-wide flex flex-col gap-8">
          <SectionHead eyebrow={a.partners.eyebrow} heading={a.partners.heading} />
          <LogoCarousel logos={a.partners.logos} />
        </div>
      </section>

      {/* 4 · The package — 3 steps */}
      <section id="package" className="scroll-mt-24 bg-white pb-6 pt-12 md:pb-10 md:pt-[70px]">
        <div className="container-wide flex flex-col gap-10">
          <SectionHead eyebrow={a.package.eyebrow} heading={a.package.heading} />
          <RevealStagger className="grid gap-5 md:grid-cols-3">
            {a.package.steps.map((step) => (
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

      {/* 5 · Goal + why it matters */}
      <GoalBand />

      {/* 6 · The two visits */}
      <VisitsShowcase />

      {/* 7 · Gallery */}
      <section className="bg-offwhite py-10 md:py-12">
        <div className="container-wide flex flex-col gap-8">
          <SectionHead eyebrow={a.gallery.eyebrow} heading={a.gallery.heading} />
          <GalleryCarousel images={a.gallery.images} />
        </div>
      </section>

      {/* 8 · Adoption progress toward the goal */}
      <AdoptProgress />

      {/* 9 · Testimonials */}
      <section className="bg-offwhite py-12 md:py-[70px]">
        <div className="container-wide flex flex-col gap-10">
          <SectionHead eyebrow={a.testimonials.eyebrow} heading={a.testimonials.heading} />
          <AdoptTestimonials />
        </div>
      </section>

      {/* 10 · FAQ */}
      <section className="container-wide pb-6 pt-12 md:pb-10 md:pt-[70px]">
        <FaqSchema faqs={a.faq.items.map((f) => ({ question: f.q, answer: f.a }))} />
        <div className="flex flex-col gap-8">
          <SectionHead eyebrow={a.faq.eyebrow} heading={a.faq.heading} sub={a.faq.intro} />
          <Reveal className="mx-auto w-full lg:w-[55%]">
            <Accordion type="single" collapsible defaultValue="faq-0" className="w-full">
              {a.faq.items.map((f, i) => (
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

      {/* 11 · CTA + contact */}
      <section id="cta" className="scroll-mt-24 pb-12 pt-4 md:pb-[70px] md:pt-6">
        <div className="container-wide">
          <Reveal className="relative isolate overflow-hidden rounded-[30px] bg-accent p-8 text-white md:p-14">
            {/* form-bg video (poster falls back to form-bg.webp) + accent overlay */}
            <FormVideoBg />
            <div className="relative z-10 grid items-center gap-10 lg:grid-cols-2">
              <div className="flex flex-col gap-5">
                <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-cream">
                  {a.cta.eyebrow}
                </span>
                <h2 className="font-display text-[28px] font-bold leading-[1.15] text-white md:text-[38px]">
                  {a.cta.heading}
                </h2>
                <p className="max-w-[520px] text-[16px] leading-[1.6] text-white/85">{a.cta.body}</p>
              </div>

              <AdoptCtaForm />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
