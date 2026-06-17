import { Check } from 'lucide-react'
import { Container } from '@/components/ui/section'
import { Reveal } from '@/components/motion/reveal'

type Item = { text: string }

type Block = {
  label?: string | null
  heading?: string | null
  items?: Item[] | null
}

/**
 * A scannable "Key takeaways" card for the top of articles / definitive guides.
 * Doubles as AEO citation bait — answer engines (ChatGPT / Claude / Perplexity)
 * preferentially ingest short, list-shaped, fact-dense passages near the top of
 * a page. Rendered as a semantic <aside> so it reads as an at-a-glance summary.
 */
export function KeyTakeawaysRender({ block }: { block: Block }) {
  const items = (block.items ?? []).filter((i) => i?.text?.trim())
  if (!items.length) return null

  return (
    <section className="py-8 md:py-12" data-testid="key-takeaways">
      <Container>
        <Reveal
          as="div"
          className="mx-auto max-w-3xl rounded-[22px] border-l-4 border-accent bg-accent-soft p-6 shadow-card md:p-8"
        >
          <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-accent">
            {block.label ?? 'Key takeaways'}
          </p>
          {block.heading ? (
            <h2 className="mt-2 font-display text-[22px] leading-[1.3] text-foreground md:text-[26px]">
              {block.heading}
            </h2>
          ) : null}
          <ul className="mt-4 flex flex-col gap-3">
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-[15px] leading-[24px] text-foreground">
                <span
                  className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-white"
                  aria-hidden="true"
                >
                  <Check className="size-3" strokeWidth={3} />
                </span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  )
}
