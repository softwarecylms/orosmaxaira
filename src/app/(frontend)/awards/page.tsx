import type { Metadata } from 'next'
import { RevealUp } from '@/components/home/reveal-up'
import { AWARDS_PAGE } from '@/components/awards/awards-content'
import { AwardsHero } from '@/components/awards/awards-hero'
import { AwardSection } from '@/components/awards/award-section'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Βραβεία',
  description:
    'Οι διακρίσεις και τα βραβεία του Όρος Μαχαιρά — Cyprus Tourism Awards, Excellent Taste Awards, Cyprus Hospitality Awards, Specialist Awards και άλλα.',
}

/** Awards whose section gets the soft offwhite band (alternating with white). */
const SHADED_SLUGS = new Set([
  'cyprus-tourism-2025',
  'ge-neo-epicheirein-2025',
  'cyprus-hospitality',
])

/** Awards / Διακρίσεις showcase — title banner + one full-width section per award
 *  (alternating 50/50 layout, medal badges, image carousel with lightbox). */
export default function AwardsPage() {
  const { hero, awards } = AWARDS_PAGE
  return (
    <>
      <AwardsHero
        image={hero.image}
        imageAlt={hero.imageAlt}
        title={hero.title}
        description={hero.description}
      />

      {awards.map((a, i) => (
        <section
          key={a.slug}
          className={cn('py-14 md:py-20', SHADED_SLUGS.has(a.slug) && 'bg-offwhite')}
        >
          <RevealUp className="container-wide">
            <AwardSection award={a} reversed={i % 2 === 1} />
          </RevealUp>
        </section>
      ))}
    </>
  )
}
