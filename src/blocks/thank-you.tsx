import { Check } from 'lucide-react'
import { Section, Container } from '@/components/ui/section'
import { Reveal, RevealStagger, RevealStaggerItem } from '@/components/motion/reveal'
import { LinkButton } from '@/components/ui/button'
import type { Link as LinkType } from '@/puck/types'

type Block = {
  eyebrow?: string | null
  heading?: string | null
  body?: string | null
  nextSteps?: Array<{ text: string }> | null
  primaryCta?: LinkType | null
  secondaryCta?: LinkType | null
}

export function ThankYouRender({ block }: { block: Block }) {
  return (
    <Section
      spacing="lg"
      className="bg-background"
      data-testid="thank-you-section"
    >
      <Container className="max-w-[760px]">
        <Reveal>
          <div className="flex flex-col items-center gap-6 text-center">
            <span className="inline-flex size-16 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-[0_18px_40px_-22px_rgba(171,22,184,0.45)]">
              <Check className="size-8" aria-hidden="true" strokeWidth={2.5} />
            </span>

            {block.eyebrow ? (
              <span className="eyebrow">{block.eyebrow}</span>
            ) : null}

            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-5xl md:leading-[1.1]">
              {block.heading ?? 'Thank you!'}
            </h1>

            {block.body ? (
              <p className="max-w-2xl text-base text-muted md:text-lg md:leading-[1.55]">
                {block.body}
              </p>
            ) : null}
          </div>
        </Reveal>

        {block.nextSteps && block.nextSteps.length ? (
          <Reveal delay={0.1}>
            <div className="mt-12 rounded-[30px] bg-white p-6 shadow-[0_18px_40px_-22px_rgba(20,20,20,0.12)] md:p-10">
              <h2 className="mb-5 font-display text-[20px] text-foreground md:text-[22px]">
                What happens next
              </h2>
              <RevealStagger className="flex flex-col gap-4">
                {block.nextSteps.map((step, i) => (
                  <RevealStaggerItem key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[13px] font-bold text-accent">
                      {i + 1}
                    </span>
                    <p className="text-[15px] leading-[1.6] text-foreground">{step.text}</p>
                  </RevealStaggerItem>
                ))}
              </RevealStagger>
            </div>
          </Reveal>
        ) : null}

        {(block.primaryCta?.href || block.secondaryCta?.href) ? (
          <Reveal delay={0.15}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              {block.primaryCta?.href ? (
                <LinkButton
                  href={block.primaryCta.href}
                  variant="primary"
                  withIcon
                  className="rounded-[40px]"
                  target={block.primaryCta.newTab ? '_blank' : undefined}
                  rel={block.primaryCta.newTab ? 'noopener noreferrer' : undefined}
                >
                  {block.primaryCta.label ?? 'Back to home'}
                </LinkButton>
              ) : null}
              {block.secondaryCta?.href ? (
                <LinkButton
                  href={block.secondaryCta.href}
                  variant="outline"
                  className="rounded-[40px]"
                  target={block.secondaryCta.newTab ? '_blank' : undefined}
                  rel={block.secondaryCta.newTab ? 'noopener noreferrer' : undefined}
                >
                  {block.secondaryCta.label ?? 'Learn more'}
                </LinkButton>
              ) : null}
            </div>
          </Reveal>
        ) : null}
      </Container>
    </Section>
  )
}
