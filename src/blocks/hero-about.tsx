import Image from 'next/image'
import type { ClientLogo } from '@/payload-types'
import { Container } from '@/components/ui/section'
import { LinkButton } from '@/components/ui/button'
import { HeroBackground } from '@/components/illustrations/hero-background'
import { ClientLogoStrip } from '@/components/layout/client-logo-strip'
import { Reveal, RevealMountItem, RevealMountStagger } from '@/components/motion/reveal'
import { mediaSrc, mediaAlt } from '@/lib/utils'

type Block = {
  heading: string
  body?: string | null
  cta?: { label?: string | null; href?: string | null } | null
  heroImage?: unknown
  logosLabel?: string | null
  logos?: (number | ClientLogo)[] | null
}

export function HeroAboutRender({ block }: { block: Block }) {
  const heroSrc = mediaSrc(block.heroImage)

  return (
    <section className="relative overflow-hidden bg-background pb-10 md:pb-14" data-testid="about-hero-section">
      <HeroBackground />

      <Container className="relative pt-10 md:pt-[72px]">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,602px)_minmax(0,1fr)] lg:gap-16">
          <Reveal delay={0.05} immediate className="relative min-h-[420px] lg:min-h-[616px]">
            <div className="relative h-full min-h-[420px] overflow-hidden rounded-[30px] bg-peach lg:min-h-[616px]">
              {heroSrc ? (
                <Image
                  src={heroSrc}
                  alt={mediaAlt(block.heroImage, 'Office')}
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover object-center"
                  priority
                />
              ) : null}
            </div>
          </Reveal>

          <RevealMountStagger className="flex flex-col lg:pt-2">
            <RevealMountItem>
              <h1 className="font-display text-[42px] capitalize leading-[1.22] text-foreground md:text-[49px] md:leading-[60px]">
                {block.heading.split('\n').map((line, i) => (
                  <span key={i} className="block">
                    {line}
                  </span>
                ))}
              </h1>
            </RevealMountItem>

            {block.body ? (
              <RevealMountItem>
                <div className="mt-6 space-y-4 text-[16px] leading-[27.2px] text-muted md:mt-8">
                  {block.body.split('\n\n').map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </RevealMountItem>
            ) : null}

            {block.cta?.label && block.cta?.href ? (
              <RevealMountItem>
                <LinkButton
                  href={block.cta.href}
                  variant="primary"
                  withIcon
                  className="mt-8 w-fit rounded-[40px] px-6 py-3 text-[17px] md:mt-10"
                >
                  {block.cta.label}
                </LinkButton>
              </RevealMountItem>
            ) : null}
          </RevealMountStagger>
        </div>

        <Reveal delay={0.15} className="mt-14 flex flex-col items-center gap-6 md:mt-16">
          {block.logosLabel ? (
            <p className="text-center font-display text-[14px] leading-[25.5px] text-foreground md:text-[20px] md:leading-[30px]">
              {block.logosLabel}
            </p>
          ) : null}
          <ClientLogoStrip logos={block.logos} />
        </Reveal>
      </Container>
    </section>
  )
}
