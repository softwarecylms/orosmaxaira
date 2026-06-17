import Link from 'next/link'
import { Mail, MapPin, Phone } from 'lucide-react'
import { Section, Container } from '@/components/ui/section'
import { Reveal, RevealStagger, RevealStaggerItem } from '@/components/motion/reveal'

const iconMap = { mail: Mail, phone: Phone, office: MapPin } as const

type Card = {
  icon: keyof typeof iconMap
  title: string
  description?: string | null
  value: string
  href?: string | null
}

type Block = {
  eyebrow?: string | null
  heading?: string | null
  subheading?: string | null
  cards?: Card[] | null
}

export function ContactCardsRender({ block }: { block: Block }) {
  const cards = (block.cards ?? []).filter(Boolean)
  if (!cards.length) return null

  return (
    <Section spacing="default" className="bg-background" data-testid="contact-cards-section">
      <Container className="flex flex-col gap-10 md:gap-12">
        <Reveal className="grid gap-6 lg:grid-cols-2 lg:items-start lg:gap-16">
          {block.heading ? (
            <h2 className="font-display text-[32px] leading-[1.35] text-foreground md:text-[35px] md:leading-[52.5px]">
              {block.heading}
            </h2>
          ) : null}
          {block.subheading ? (
            <p className="text-[15.9px] leading-[26.4px] text-muted lg:pt-1">{block.subheading}</p>
          ) : null}
        </Reveal>

        <RevealStagger className="grid gap-5 md:grid-cols-3">
          {cards.map((c, i) => {
            const Icon = iconMap[c.icon] ?? Mail
            const Inner = (
              <RevealStaggerItem
                hoverLift
                className="flex h-full flex-col rounded-[30px] bg-[#f9f9fb] p-[30px]"
                data-testid={`contact-card-${c.icon}`}
              >
                <span className="inline-flex size-[54px] items-center justify-center rounded-full bg-surface-dark text-white">
                  <Icon className="size-[22px]" aria-hidden="true" />
                </span>
                <h3 className="mt-[25px] font-display text-[17px] leading-[25.5px] text-foreground">
                  {c.title}
                </h3>
                {c.description ? (
                  <p className="mt-4 border-b border-[#ededf3] pb-4 text-[15px] leading-[24.75px] text-muted">
                    {c.description}
                  </p>
                ) : (
                  <div className="mt-4 border-b border-[#ededf3] pb-4" />
                )}
                <p className="mt-4 text-[15.9px] leading-[26.4px] text-foreground">{c.value}</p>
              </RevealStaggerItem>
            )
            return c.href ? (
              <Link key={i} href={c.href} className="contents">
                {Inner}
              </Link>
            ) : (
              <div key={i}>{Inner}</div>
            )
          })}
        </RevealStagger>
      </Container>
    </Section>
  )
}
