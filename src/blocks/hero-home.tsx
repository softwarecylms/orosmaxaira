import type { ClientLogo } from '@/payload-types'
import { Container } from '@/components/ui/section'
import { LinkButton } from '@/components/ui/button'
import { HeroBackground } from '@/components/illustrations/hero-background'
import { ClientLogoStrip } from '@/components/layout/client-logo-strip'
import { SparkleIcon } from '@/components/icons/sparkle-icon'
import { RevealMountItem, RevealMountStagger } from '@/components/motion/reveal'

type Block = {
  eyebrow?: string | null
  heading: string
  subheading?: string | null
  primaryCta?: { label?: string | null; href?: string | null; newTab?: boolean | null } | null
  logos?: (number | ClientLogo)[] | null
}

export function HeroHomeRender({ block }: { block: Block }) {
  const cta = block.primaryCta

  return (
    <section className="relative bg-background pb-14 md:pb-20">
      <HeroBackground />

      <Container className="relative flex flex-col items-center pt-14 text-center md:pt-[72px]">
        <RevealMountStagger className="flex w-full flex-col items-center">
          {block.eyebrow ? (
            <RevealMountItem>
              <div className="mb-6 inline-flex h-[47px] items-center gap-3 rounded-[50px] bg-white px-[17px]">
                <SparkleIcon className="shrink-0 text-accent" />
                <span className="text-[14px] leading-[21px] text-foreground">{block.eyebrow}</span>
                <SparkleIcon className="shrink-0 text-accent" />
              </div>
            </RevealMountItem>
          ) : null}

          <RevealMountItem>
            <h1 className="max-w-4xl text-4xl font-bold leading-[1.15] tracking-tight text-foreground md:text-6xl lg:text-[3.75rem] lg:leading-[1.2]">
              {block.heading}
            </h1>
          </RevealMountItem>

          {block.subheading ? (
            <RevealMountItem>
              <p className="mt-5 max-w-2xl text-[15.9px] leading-relaxed text-muted md:text-base">
                {block.subheading}
              </p>
            </RevealMountItem>
          ) : null}

          {cta?.label && cta?.href ? (
            <RevealMountItem>
              <div className="mt-8">
                <LinkButton
                  href={cta.href}
                  target={cta.newTab ? '_blank' : undefined}
                  size="lg"
                  variant="primary"
                  withIcon
                  className="h-[49px] rounded-[40px] px-9 text-[17px]"
                >
                  {cta.label}
                </LinkButton>
              </div>
            </RevealMountItem>
          ) : null}

          <RevealMountItem className="mt-14 w-full md:mt-[72px]">
            <ClientLogoStrip logos={block.logos} />
          </RevealMountItem>
        </RevealMountStagger>
      </Container>
    </section>
  )
}
