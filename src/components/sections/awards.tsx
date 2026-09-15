import type { AwardsContent } from '@/components/awards/awards-content'
import { RevealUp } from '@/components/home/reveal-up'
import { AwardSection } from '@/components/awards/award-section'
import { cn } from '@/lib/utils'

/**
 * «Βραβεία» sections. They take the page copy as `content` and fetch nothing,
 * so the same component renders the live page and the visual editor. (The hero
 * is AwardsHero.)
 */

/** One full-width section per award (alternating 50/50 layout, medal badges,
 *  image carousel with lightbox); `shaded` awards sit on the soft band. */
export function AwardsList({ content }: { content: AwardsContent['awards'] }) {
  return (
    <>
      {content.map((a, i) => (
        <section
          data-edit="awards"
          key={a.slug}
          className={cn('py-14 md:py-20', 'shaded' in a && a.shaded && 'bg-offwhite')}
        >
          <RevealUp className="container-wide">
            <AwardSection award={a} reversed={i % 2 === 1} />
          </RevealUp>
        </section>
      ))}
    </>
  )
}
