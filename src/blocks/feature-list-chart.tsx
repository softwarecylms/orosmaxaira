import Image from 'next/image'
import { Section, Container } from '@/components/ui/section'
import { LinkButton } from '@/components/ui/button'
import { Reveal } from '@/components/motion/reveal'
import { AnimatedSeoChart } from '@/components/motion/animated-seo-chart'
import { mediaSrc, mediaAlt } from '@/lib/utils'

type Block = {
  heading: string
  body?: string | null
  image?: unknown
  bullets?: { text: string }[] | null
  primaryCta?: { label?: string | null; href?: string | null; newTab?: boolean | null } | null
  secondaryHeading?: string | null
  secondaryBody?: string | null
  secondaryCta?: { label?: string | null; href?: string | null; newTab?: boolean | null } | null
}

export function FeatureListChartRender({ block }: { block: Block }) {
  const src = mediaSrc(block.image)
  const bullets = (block.bullets ?? []).filter(Boolean)
  const cta = block.primaryCta
  const secondaryCta = block.secondaryCta

  return (
    <Section spacing="default" className="bg-white" data-testid="feature-list-chart-section">
      <Container>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.75fr)]">
          {/* Left: design-feature card (Figma 18:194) */}
          <div data-testid="feature-design-card">
            <Reveal
              as="div"
              className="relative isolate h-full overflow-hidden rounded-[30px] bg-peach"
            >
              {/* Figma 18:194: image positioned with left-[29.53%] / w-[100.42%] so the
                  woman sits on the right while peach background fills the left column. */}
              {src ? (
                <div className="pointer-events-none absolute inset-y-0 left-[29.53%] z-0 w-[100.42%]">
                  <Image
                    src={src}
                    alt={mediaAlt(block.image, block.heading)}
                    fill
                    sizes="(min-width: 1024px) 35vw, 100vw"
                    className="object-cover object-top"
                    priority={false}
                  />
                </div>
              ) : null}

              <div className="relative z-10 flex min-h-[483px] flex-col p-[40px]">
                <h2 className="max-w-[260px] font-display text-[20px] leading-[30px] text-foreground">
                  {block.heading}
                </h2>

                {bullets.length ? (
                  <ul className="mt-[34px] flex max-w-[280px] flex-col gap-[10px]">
                    {bullets.map((b, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-[12px] text-[15px] font-medium leading-[24.75px] text-foreground"
                      >
                        <svg
                          className="size-[14px] shrink-0 text-foreground"
                          viewBox="0 0 14 14"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M1.5 7.2L5.2 10.9L12.5 3.5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span>{b.text}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {cta?.label && cta?.href ? (
                  <div className="mt-auto pt-8">
                    <LinkButton
                      href={cta.href}
                      target={cta.newTab ? '_blank' : undefined}
                      variant="primary"
                      withIcon
                      className="rounded-[40px] px-7 py-3 text-[15px]"
                    >
                      {cta.label}
                    </LinkButton>
                  </div>
                ) : null}
              </div>
            </Reveal>
          </div>

          {/* Right: SEO chart card (Figma 18:215) */}
          <div data-testid="feature-seo-card">
            <Reveal
              as="div"
              delay={0.1}
              className="flex h-full flex-col rounded-[30px] border-[3px] border-[#f9f9fb] p-[40px]"
            >
              <h2 className="font-display text-[20px] leading-[30px] text-foreground">
                {block.secondaryHeading ?? 'Increase your traffic with our SEO Services'}
              </h2>
              {block.secondaryBody ? (
                <p className="mt-[18px] max-w-[707px] text-[16px] leading-[26.4px] text-muted">
                  {block.secondaryBody}
                </p>
              ) : null}

              {secondaryCta?.label && secondaryCta?.href ? (
                <div className="mt-[22px]">
                  <LinkButton
                    href={secondaryCta.href}
                    target={secondaryCta.newTab ? '_blank' : undefined}
                    variant="primary"
                    withIcon
                    className="rounded-[40px] px-7 py-[12px] text-[14.8px]"
                  >
                    {secondaryCta.label}
                  </LinkButton>
                </div>
              ) : null}

              <AnimatedSeoChart className="mt-auto pt-[60px]" />
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  )
}
