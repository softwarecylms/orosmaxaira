import Link from 'next/link'
import { ArrowUpRight, Palette, Search, ShoppingBag, Gauge, Sparkles, LifeBuoy } from 'lucide-react'
import { Section, Container } from '@/components/ui/section'
import { Reveal, RevealStagger, RevealStaggerItem } from '@/components/motion/reveal'
import { cn } from '@/lib/utils'

const iconMap = {
  design: Palette,
  seo: Search,
  shop: ShoppingBag,
  performance: Gauge,
  branding: Sparkles,
  support: LifeBuoy,
} as const

type Item = {
  icon: keyof typeof iconMap
  title: string
  description: string
  cta?: { label?: string | null; href?: string | null } | null
}

type Block = {
  eyebrow?: string | null
  heading: string
  subheading?: string | null
  items?: Item[] | null
}

export function ServicesGridRender({ block }: { block: Block }) {
  const items = (block.items ?? []).filter(Boolean)

  return (
    <Section spacing="default" className="bg-white">
      <Container className="flex flex-col gap-12">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-foreground md:text-[35px] md:leading-[1.35]">
            {block.heading}
          </h2>
        </Reveal>

        <RevealStagger className="grid overflow-hidden rounded-[1.25rem] border border-background md:grid-cols-3">
          {items.map((item, i) => {
            const Icon = iconMap[item.icon] ?? Sparkles
            const href = item.cta?.href
            const Content = (
              <RevealStaggerItem
                hoverLift
                className={cn(
                  'group flex h-full flex-col items-center px-6 py-10 text-center md:px-8 md:py-12',
                  i < items.length - 1 && 'md:border-r md:border-background',
                  i === 1 && 'bg-gradient-to-t from-background/50 to-transparent',
                )}
              >
                <span className="inline-flex size-14 items-center justify-center rounded-full bg-accent text-white transition-transform duration-300 group-hover:scale-110">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <h3 className="mt-6 font-display text-[17px] leading-[25.5px] text-foreground">
                  {item.title}
                </h3>
                <p className="mt-4 text-[15px] leading-[24.75px] text-muted">{item.description}</p>
                {item.cta?.label ? (
                  <span className="mt-6 inline-flex items-center gap-1.5 text-[13.8px] leading-[23.1px] text-muted transition-colors group-hover:text-foreground">
                    {item.cta.label}
                    <ArrowUpRight className="size-2.5" />
                  </span>
                ) : null}
              </RevealStaggerItem>
            )
            return href ? (
              <Link key={i} href={href} className="contents">
                {Content}
              </Link>
            ) : (
              <div key={i}>{Content}</div>
            )
          })}
        </RevealStagger>
      </Container>
    </Section>
  )
}
