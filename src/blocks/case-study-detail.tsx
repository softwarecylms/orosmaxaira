import Image from 'next/image'
import Link from 'next/link'
import type { CaseStudy, PortfolioCategory } from '@/payload-types'
import { Section, Container } from '@/components/ui/section'
import { Reveal } from '@/components/motion/reveal'
import { LinkButton } from '@/components/ui/button'
import { mediaSrc, mediaAlt } from '@/lib/utils'
import { LegacyHtml } from '@/components/content/legacy-html'

type Props = {
  caseStudy: CaseStudy
}

const coverBySlug: Record<string, string> = {}

function relDocs<T extends { slug?: string | null; name?: string | null }>(values: unknown): T[] {
  if (!Array.isArray(values)) return []
  return values.filter(
    (v): v is T => typeof v === 'object' && v !== null && 'slug' in v,
  ) as T[]
}

export function CaseStudyDetailRender({ caseStudy }: Props) {
  const cover = mediaSrc(caseStudy.cover) ?? coverBySlug[caseStudy.slug ?? ''] ?? null
  const categories = relDocs<PortfolioCategory>(caseStudy.portfolioCategories)

  return (
    <article data-testid="case-study">
      <Section spacing="default" className="bg-background pb-10 md:pb-14">
        <Container className="max-w-[1100px]">
          <Reveal>
            <div className="flex flex-col gap-6">
              <Link
                href="/portfolio"
                className="inline-flex items-center gap-1 self-start text-sm text-muted hover:text-foreground"
              >
                ← All projects
              </Link>

              {categories.length ? (
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/portfolio-category/${c.slug}`}
                      className="rounded-full bg-accent-soft px-3 py-1 text-[12px] font-semibold uppercase tracking-wider text-accent"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-[2fr_1fr] md:items-end">
                <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground md:text-5xl md:leading-[1.1]">
                  {caseStudy.title}
                </h1>
                {caseStudy.client ? (
                  <p className="text-base text-muted md:text-right">
                    <span className="block text-[12px] font-semibold uppercase tracking-wider text-foreground/60">
                      Client
                    </span>
                    <span className="text-[18px] text-foreground">{caseStudy.client}</span>
                  </p>
                ) : null}
              </div>

              {caseStudy.summary ? (
                <p className="max-w-3xl text-lg text-muted md:text-[19px] md:leading-[1.55]">
                  {caseStudy.summary}
                </p>
              ) : null}

              {caseStudy.liveUrl ? (
                <div>
                  <LinkButton
                    href={caseStudy.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="primary"
                    withIcon
                    className="rounded-[40px]"
                  >
                    Visit Live Site
                  </LinkButton>
                </div>
              ) : null}
            </div>
          </Reveal>
        </Container>
      </Section>

      {cover ? (
        <Section spacing="none" className="bg-background pb-10 md:pb-14">
          <Container className="max-w-[1100px]">
            <Reveal>
              <div className="relative aspect-[16/10] overflow-hidden rounded-[30px] bg-pink">
                <Image
                  src={cover}
                  alt={mediaAlt(caseStudy.cover, caseStudy.title)}
                  fill
                  sizes="(min-width: 1100px) 1100px, 100vw"
                  priority
                  className="object-cover"
                />
              </div>
            </Reveal>
          </Container>
        </Section>
      ) : null}

      <Section spacing="default" className="bg-background pt-0">
        <Container className="max-w-[760px]">
          <Reveal>
            <div className="flex flex-col gap-6 text-[17px] leading-[1.7] text-foreground">
              <LegacyHtml
                html={caseStudy.legacyContent ?? null}
                richText={caseStudy.content ?? null}
                fallback={
                  caseStudy.summary ? <p>{caseStudy.summary}</p> : null
                }
              />
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-[30px] bg-surface-dark px-6 py-6 text-white md:px-10 md:py-8">
              <p className="font-display text-[20px] leading-[1.4] md:text-[24px]">
                Want a similar result for your business?
              </p>
              <LinkButton
                href="/contact"
                variant="light"
                withIcon
                className="rounded-[40px]"
              >
                Request a callback
              </LinkButton>
            </div>
          </Reveal>
        </Container>
      </Section>
    </article>
  )
}
