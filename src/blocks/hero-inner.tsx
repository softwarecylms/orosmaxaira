import Image from 'next/image'
import { Section, Container } from '@/components/ui/section'
import { LinkButton } from '@/components/ui/button'
import { mediaSrc, mediaAlt } from '@/lib/utils'
import { Check } from 'lucide-react'

type Block = {
  eyebrow?: string | null
  heading: string
  body?: string | null
  cta?: { label?: string | null; href?: string | null } | null
  image?: unknown
  bullets?: { text: string }[] | null
}

export function HeroInnerRender({ block }: { block: Block }) {
  const imgSrc = mediaSrc(block.image)
  const bullets = (block.bullets ?? []).filter(Boolean)

  return (
    <Section spacing="lg">
      <Container>
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          {imgSrc ? (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.5rem] bg-card">
              <Image
                src={imgSrc}
                alt={mediaAlt(block.image, block.heading)}
                fill
                priority
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          ) : null}

          <div className="flex flex-col gap-5">
            {block.eyebrow ? <span className="eyebrow self-start">{block.eyebrow}</span> : null}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              {block.heading}
            </h1>
            {block.body ? <p className="text-base md:text-lg text-muted">{block.body}</p> : null}

            {bullets.length ? (
              <ul className="flex flex-col gap-2 mt-2">
                {bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1 inline-flex size-5 items-center justify-center rounded-full bg-foreground text-background">
                      <Check className="size-3" aria-hidden="true" />
                    </span>
                    <span className="text-sm md:text-base">{b.text}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            {block.cta?.label && block.cta?.href ? (
              <div className="mt-2">
                <LinkButton href={block.cta.href} variant="primary" withIcon>
                  {block.cta.label}
                </LinkButton>
              </div>
            ) : null}
          </div>
        </div>
      </Container>
    </Section>
  )
}
