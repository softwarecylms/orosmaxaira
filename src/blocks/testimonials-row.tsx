import { Section, Container } from '@/components/ui/section'
import type { Testimonial } from '@/payload-types'
import { Reveal } from '@/components/motion/reveal'
import { TestimonialsCarousel, JourneyCtaPanel } from '@/components/home/testimonials-carousel'

type Block = {
  eyebrow?: string | null
  heading?: string | null
  testimonials?: (number | Testimonial)[] | null
  layout?: 'split' | 'full' | null
}

export function TestimonialsRowRender({ block }: { block: Block }) {
  const items = (block.testimonials ?? []).filter(
    (t): t is Testimonial => typeof t === 'object' && t !== null,
  )
  if (!items.length) return null

  const isFull = block.layout === 'full'

  return (
    <Section spacing="default" className="bg-background" data-testid="testimonials-row-section">
      <Container>
        {isFull ? (
          <Reveal delay={0}>
            <TestimonialsCarousel heading={block.heading} items={items} />
          </Reveal>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)]">
            <Reveal delay={0}>
              <TestimonialsCarousel heading={block.heading} items={items} />
            </Reveal>
            <Reveal delay={0.12}>
              <JourneyCtaPanel />
            </Reveal>
          </div>
        )}
      </Container>
    </Section>
  )
}
