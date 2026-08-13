import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { RevealUp } from '@/components/home/reveal-up'
import { getAwardsContent } from '@/components/awards/awards-content'
import { AwardsHero } from '@/components/awards/awards-hero'
import { AwardSection } from '@/components/awards/award-section'
import { hreflangAlternates } from '@/lib/seo'
import { cn } from '@/lib/utils'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const en = locale === 'en'
  return {
    title: en ? 'Awards' : 'Βραβεία',
    description: en
      ? 'The distinctions and awards of Oros Machaira — Cyprus Tourism Awards, Excellent Taste Awards, Cyprus Hospitality Awards, Specialist Awards and more.'
      : 'Οι διακρίσεις και τα βραβεία του Όρος Μαχαιρά — Cyprus Tourism Awards, Excellent Taste Awards, Cyprus Hospitality Awards, Specialist Awards και άλλα.',
    alternates: hreflangAlternates(locale, '/awards'),
  }
}

/** Awards whose section gets the soft offwhite band (alternating with white). */
const SHADED_SLUGS = new Set([
  'cyprus-tourism-2025',
  'ge-neo-epicheirein-2025',
  'cyprus-hospitality',
])

/** Awards / Διακρίσεις showcase — title banner + one full-width section per award
 *  (alternating 50/50 layout, medal badges, image carousel with lightbox). */
export default async function AwardsPage() {
  const { hero, awards } = getAwardsContent(await getLocale())
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
