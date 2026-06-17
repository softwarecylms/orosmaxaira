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
  bullets?: { text: string }[] | null
  teamMember?: {
    name?: string | null
    role?: string | null
    photo?: unknown
    cta?: { label?: string | null; href?: string | null } | null
  } | null
  heroImage?: unknown
  logosLabel?: string | null
  logos?: (number | ClientLogo)[] | null
}

function CheckIcon() {
  return (
    <svg className="size-3 shrink-0 text-accent" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
      <path d="M4.5 8.5L1.5 5.5L0 7L4.5 11.5L12 4L10.5 2.5L4.5 8.5Z" />
    </svg>
  )
}

export function HeroContactRender({ block }: { block: Block }) {
  const bullets = (block.bullets ?? []).filter(Boolean)
  const heroSrc = mediaSrc(block.heroImage)
  const teamSrc = mediaSrc(block.teamMember?.photo)
  const team = block.teamMember

  return (
    <section className="relative overflow-hidden bg-background pb-10 md:pb-14" data-testid="contact-hero-section">
      <HeroBackground />

      <Container className="relative pt-10 md:pt-[72px]">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,628px)_minmax(0,1fr)] lg:gap-16">
          <RevealMountStagger className="flex flex-col">
            <RevealMountItem>
              <h1 className="font-display text-[42px] leading-[1.25] text-foreground md:text-[60px] md:leading-[75px]">
                {block.heading.split('\n').map((line, i) => (
                  <span key={i} className="block">
                    {line}
                  </span>
                ))}
              </h1>
            </RevealMountItem>

            {bullets.length ? (
              <RevealMountItem>
                <ul className="mt-8 flex flex-col gap-[10px] md:mt-10">
                  {bullets.map((b, i) => (
                    <li key={i} className="flex items-center gap-3 text-[15px] leading-[24.75px] text-foreground">
                      <CheckIcon />
                      <span>{b.text}</span>
                    </li>
                  ))}
                </ul>
              </RevealMountItem>
            ) : null}

            {team?.name ? (
              <RevealMountItem>
                <div
                  className="mt-10 flex w-full max-w-[628px] items-center gap-4 rounded-[30px] bg-white p-[10px] md:mt-[52px]"
                  data-testid="contact-team-card"
                >
                  <div className="relative size-[190px] shrink-0 overflow-hidden rounded-[20px] bg-peach md:w-[230px]">
                    {teamSrc ? (
                      <Image
                        src={teamSrc}
                        alt={mediaAlt(team.photo, team.name)}
                        fill
                        sizes="230px"
                        className="object-cover object-top"
                        priority
                      />
                    ) : null}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-2 py-2 pr-2">
                    <p className="font-display text-[20px] leading-[30px] text-foreground">{team.name}</p>
                    {team.role ? (
                      <p className="text-[14px] leading-[23.1px] text-muted">{team.role}</p>
                    ) : null}
                    {team.cta?.label && team.cta?.href ? (
                      <LinkButton
                        href={team.cta.href}
                        variant="primary"
                        withIcon
                        className="mt-3 w-fit rounded-[40px] px-4 py-3 text-[15px]"
                      >
                        {team.cta.label}
                      </LinkButton>
                    ) : null}
                  </div>
                </div>
              </RevealMountItem>
            ) : null}
          </RevealMountStagger>

          <Reveal delay={0.1} immediate className="relative min-h-[420px] lg:min-h-[642px]">
            <div className="relative h-full min-h-[420px] overflow-hidden rounded-[30px] bg-peach lg:min-h-[642px]">
              {heroSrc ? (
                <Image
                  src={heroSrc}
                  alt={mediaAlt(block.heroImage, 'Team')}
                  fill
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover object-center"
                  priority
                />
              ) : null}
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.15} className="mt-14 flex flex-col items-center gap-6 md:mt-16">
          {block.logosLabel ? (
            <p className="text-center font-display text-[17px] leading-[25.5px] text-foreground md:text-[20px] md:leading-[30px]">
              {block.logosLabel}
            </p>
          ) : null}
          <ClientLogoStrip logos={block.logos} />
        </Reveal>
      </Container>
    </section>
  )
}
