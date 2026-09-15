import type { ComponentConfig, Config } from '@measured/puck'
import type { ReactNode } from 'react'
import { getHomeContent } from '@/components/home/home-content'
import { getAboutContent } from '@/components/about/about-content'
import { getAdoptContent } from '@/components/adopt/adopt-content'
import { getContactContent } from '@/components/contact/contact-content'
import { getActivitiesContent } from '@/components/activities/activities-content'
import { getNatureContent } from '@/components/nature/nature-content'
import { getCertificatesContent } from '@/components/certificates/certificates-content'
import { getAwardsContent } from '@/components/awards/awards-content'
import { getLegalContent } from '@/components/legal/legal-content'
import { HeroPairView } from '@/components/home/hero-pair-view'
import { TrustBadgesView } from '@/components/home/trust-badges-view'
import { DealOfMonthView } from '@/components/home/deal-of-month-view'
import { TickerView } from '@/components/home/ticker-view'
import { ProductCategoriesView } from '@/components/home/product-categories-view'
import { AdoptHiveBannerView } from '@/components/home/adopt-hive-banner-view'
import { HeritageView } from '@/components/home/heritage-view'
import { FlatlayBand } from '@/components/home/flatlay-band'
import { BlogTeaserView } from '@/components/home/blog-teaser-view'
import {
  AboutBand,
  AboutFamily,
  AboutGoal,
  AboutHero,
  AboutIndoor,
  AboutOutdoor,
  AboutStats,
  AboutValues,
} from '@/components/sections/about'
import { AdoptHero } from '@/components/adopt/adopt-hero'
import { GoalBand } from '@/components/adopt/goal-band'
import { AdoptProgress } from '@/components/adopt/adopt-progress'
import {
  AdoptCta,
  AdoptFaq,
  AdoptGallery,
  AdoptIntro,
  AdoptPackage,
  AdoptPartners,
  AdoptTestimonialsSection,
  AdoptVisits,
} from '@/components/sections/adopt'
import { ContactHero } from '@/components/contact/contact-hero'
import { ContactConnect, ContactMapSection, ContactValues } from '@/components/sections/contact'
import { FactBand } from '@/components/activities/fact-band'
import { ActivitiesExperiences, ActivitiesHero, ActivitiesPrograms } from '@/components/sections/activities'
import { PageHero } from '@/components/shared/page-hero'
import { NatureMatters, NatureStats, NatureStory } from '@/components/sections/nature'
import { CertificatesList } from '@/components/sections/certificates'
import { AwardsHero } from '@/components/awards/awards-hero'
import { AwardsList } from '@/components/sections/awards'
import { LegalPage } from '@/components/legal/legal-page'
import { fillFrom, type Json } from '@/lib/content/merge'
import { deriveFields } from './fields/derive'
import { withCatalogue, type BlockMetadata, type LiveData } from './live'

/**
 * The visual editor's blocks: the site's own sections, each rendering the real
 * component with the copy stored in the page. A block's fields are generated
 * from its default copy (fields/derive.ts), so what an editor sees in the form
 * is exactly what the section shows.
 *
 * Props are the section's slice of the page copy. Sections whose copy is a
 * list or a single string get it wrapped — `{ items }` / `{ text }` — because a
 * block's props must be an object.
 */

type Props = Record<string, unknown>
type Ctx = { locale: string; live: LiveData }

type Block<P extends Props> = {
  label: string
  category: CategoryKey
  defaults: (locale: string) => P
  render: (props: P, ctx: Ctx) => ReactNode
}

const block = <P extends Props>(b: Block<P>) => b as unknown as Block<Props>

const CATEGORIES = {
  home: 'Αρχική',
  about: 'Ποιοι είμαστε',
  adopt: 'Υιοθετώ μια κυψέλη',
  contact: 'Επικοινωνία',
  activities: 'Δραστηριότητες',
  shared: 'Κοινές ενότητες',
  legal: 'Νομικά',
} as const
type CategoryKey = keyof typeof CATEGORIES

const home = getHomeContent
const about = getAboutContent
const adopt = getAdoptContent
const contact = getContactContent
const activities = getActivitiesContent
const nature = getNatureContent

export const BLOCKS: Record<string, Block<Props>> = {
  // --- Home ------------------------------------------------------------------
  HeroPair: block({
    label: 'Κεντρικές κάρτες',
    category: 'home',
    defaults: (l) => home(l).HERO,
    render: (p) => <HeroPairView content={p as never} />,
  }),
  TrustBadges: block({
    label: 'Εγγυήσεις',
    category: 'home',
    defaults: (l) => ({ items: home(l).TRUST }),
    render: (p) => <TrustBadgesView content={p.items as never} />,
  }),
  DealOfMonth: block({
    label: 'Τα Διαμάντια του Μαχαιρά',
    category: 'home',
    defaults: (l) => home(l).DEAL,
    render: (p, { live }) => {
      const deal = p as unknown as ReturnType<typeof home>['DEAL']
      return <DealOfMonthView content={deal} products={withCatalogue(deal.products.slice(0, 5), live.catalogue)} />
    },
  }),
  Ticker: block({
    label: 'Κυλιόμενη λωρίδα',
    category: 'home',
    defaults: (l) => ({ items: home(l).TICKER }),
    render: (p) => <TickerView content={p.items as never} />,
  }),
  ProductCategories: block({
    label: 'Κατηγορίες προϊόντων',
    category: 'home',
    defaults: (l) => home(l).CATEGORIES,
    render: (p) => <ProductCategoriesView content={p as never} />,
  }),
  AdoptHiveBanner: block({
    label: 'Υιοθετώ μια κυψέλη (banner)',
    category: 'shared',
    defaults: (l) => home(l).ADOPT,
    render: (p) => <AdoptHiveBannerView content={p as never} />,
  }),
  Heritage: block({
    label: 'Η ιστορία μας',
    category: 'home',
    defaults: (l) => home(l).HERITAGE,
    render: (p) => <HeritageView content={p as never} />,
  }),
  FlatlayBand: block({
    label: 'Προϊόντα στη φωτογραφία',
    category: 'home',
    defaults: (l) => home(l).FLATLAY,
    render: (p, { live }) => <FlatlayBand flatlay={p as never} variants={live.flatlay} />,
  }),
  BlogTeaser: block({
    label: 'Blog — πρόσφατα άρθρα',
    category: 'shared',
    defaults: (l) => home(l).BLOG,
    render: (p, { live }) => <BlogTeaserView content={p as never} posts={live.posts ?? []} />,
  }),

  // --- About -----------------------------------------------------------------
  AboutHero: block({ label: 'Κεντρική ενότητα', category: 'about', defaults: (l) => about(l).hero, render: (p) => <AboutHero content={p as never} /> }),
  AboutStats: block({ label: 'Αριθμοί', category: 'about', defaults: (l) => ({ items: about(l).stats }), render: (p) => <AboutStats content={p.items as never} /> }),
  AboutValues: block({ label: 'Αξίες', category: 'about', defaults: (l) => ({ items: about(l).values }), render: (p) => <AboutValues content={p.items as never} /> }),
  AboutIndoor: block({ label: 'Εσωτερικοί χώροι', category: 'about', defaults: (l) => about(l).indoor, render: (p) => <AboutIndoor content={p as never} /> }),
  AboutOutdoor: block({ label: 'Εξωτερικοί χώροι', category: 'about', defaults: (l) => about(l).outdoor, render: (p) => <AboutOutdoor content={p as never} /> }),
  AboutBand: block({ label: 'Χρυσή λωρίδα κειμένου', category: 'shared', defaults: (l) => ({ text: about(l).band }), render: (p) => <AboutBand content={p.text as never} /> }),
  AboutFamily: block({ label: 'Η οικογένεια', category: 'about', defaults: (l) => about(l).family, render: (p) => <AboutFamily content={p as never} /> }),
  AboutGoal: block({ label: 'Ο στόχος μας (banner)', category: 'about', defaults: (l) => about(l).goal, render: (p) => <AboutGoal content={p as never} /> }),

  // --- Adopt a hive ----------------------------------------------------------
  AdoptHero: block({ label: 'Κεντρική ενότητα', category: 'adopt', defaults: (l) => adopt(l).hero, render: (p) => <AdoptHero hero={p as never} /> }),
  AdoptIntro: block({ label: 'Εισαγωγή & οφέλη', category: 'adopt', defaults: (l) => adopt(l).intro, render: (p) => <AdoptIntro content={p as never} /> }),
  AdoptPartners: block({ label: 'Συνεργάτες (λογότυπα)', category: 'adopt', defaults: (l) => adopt(l).partners, render: (p) => <AdoptPartners content={p as never} /> }),
  AdoptPackage: block({ label: 'Το πακέτο (βήματα)', category: 'adopt', defaults: (l) => adopt(l).package, render: (p) => <AdoptPackage content={p as never} /> }),
  GoalBand: block({ label: 'Ο στόχος μας (βίντεο)', category: 'adopt', defaults: (l) => adopt(l).goal, render: (p) => <GoalBand goal={p as never} /> }),
  AdoptVisits: block({ label: 'Οι επισκέψεις', category: 'adopt', defaults: (l) => adopt(l).visits, render: (p) => <AdoptVisits content={p as never} /> }),
  AdoptGallery: block({ label: 'Γκαλερί', category: 'shared', defaults: (l) => adopt(l).gallery, render: (p) => <AdoptGallery content={p as never} /> }),
  AdoptProgress: block({ label: 'Πρόοδος υιοθεσιών', category: 'adopt', defaults: (l) => adopt(l).progress, render: (p) => <AdoptProgress progress={p as never} /> }),
  AdoptTestimonials: block({ label: 'Μαρτυρίες', category: 'shared', defaults: (l) => adopt(l).testimonials, render: (p) => <AdoptTestimonialsSection content={p as never} /> }),
  AdoptFaq: block({ label: 'Συχνές ερωτήσεις', category: 'shared', defaults: (l) => adopt(l).faq, render: (p) => <AdoptFaq content={p as never} /> }),
  AdoptCta: block({
    label: 'Κλείσιμο με φόρμα',
    category: 'adopt',
    defaults: (l) => ({ cta: adopt(l).cta, form: adopt(l).form }),
    render: (p) => <AdoptCta content={p as never} />,
  }),

  // --- Contact ---------------------------------------------------------------
  ContactHero: block({
    label: 'Κεντρική εικόνα',
    category: 'contact',
    defaults: (l) => {
      const { image, imageAlt, title } = contact(l).hero
      return { image, imageAlt, title }
    },
    render: (p) => <ContactHero image={p.image as string} imageAlt={p.imageAlt as string} title={p.title as string} />,
  }),
  ContactConnect: block({
    label: 'Στοιχεία & φόρμα επικοινωνίας',
    category: 'contact',
    defaults: (l) => ({ connect: contact(l).connect, form: contact(l).form }),
    render: (p, { locale, live }) => (
      <ContactConnect content={p as never} social={live.social ?? home(locale).FOOTER.social} />
    ),
  }),
  ContactMap: block({ label: 'Χάρτης', category: 'contact', defaults: (l) => contact(l).map, render: (p) => <ContactMapSection content={p as never} /> }),
  ContactValues: block({ label: 'Αξίες', category: 'contact', defaults: (l) => ({ items: contact(l).values }), render: (p) => <ContactValues content={p.items as never} /> }),

  // --- Activities overview ---------------------------------------------------
  ActivitiesHero: block({ label: 'Κεντρική ενότητα με κουμπιά', category: 'activities', defaults: (l) => activities(l).hero, render: (p) => <ActivitiesHero content={p as never} /> }),
  ActivitiesExperiences: block({ label: 'Εμπειρίες (κάρτες)', category: 'activities', defaults: (l) => activities(l).experiences, render: (p) => <ActivitiesExperiences content={p as never} /> }),
  FactBand: block({ label: 'Λωρίδα «Ήξερες ότι…»', category: 'activities', defaults: (l) => activities(l).fact, render: (p) => <FactBand fact={p as never} /> }),
  ActivitiesPrograms: block({ label: 'Προγράμματα (κάρτες)', category: 'activities', defaults: (l) => activities(l).programs, render: (p) => <ActivitiesPrograms content={p as never} /> }),

  // --- Shared ----------------------------------------------------------------
  PageHero: block({
    label: 'Κεντρική εικόνα με τίτλο',
    category: 'shared',
    defaults: (l) => nature(l).hero,
    render: (p) => (
      <PageHero
        image={p.image as string}
        imageAlt={p.imageAlt as string}
        eyebrow={p.eyebrow as string | undefined}
        title={p.title as string}
        description={p.description as string | undefined}
      />
    ),
  }),
  NatureStory: block({ label: 'Εικόνα & κείμενο', category: 'shared', defaults: (l) => nature(l).sections[0], render: (p) => <NatureStory content={p as never} /> }),
  NatureStats: block({ label: 'Αριθμοί (λωρίδα)', category: 'shared', defaults: (l) => ({ items: nature(l).stats }), render: (p) => <NatureStats content={p.items as never} /> }),
  NatureMatters: block({ label: 'Εικόνα & κείμενο με έμφαση', category: 'shared', defaults: (l) => nature(l).matters, render: (p) => <NatureMatters content={p as never} /> }),
  CertificatesList: block({
    label: 'Πιστοποιητικά',
    category: 'shared',
    defaults: (l) => ({ certificates: getCertificatesContent(l).certificates, downloadLabel: getCertificatesContent(l).downloadLabel }),
    render: (p, { locale }) => <CertificatesList content={p as never} locale={locale} />,
  }),
  AwardsHero: block({
    label: 'Κεντρική εικόνα (βραβεία)',
    category: 'shared',
    defaults: (l) => getAwardsContent(l).hero,
    render: (p) => (
      <AwardsHero
        image={p.image as string}
        imageAlt={p.imageAlt as string}
        title={p.title as string}
        description={p.description as string | undefined}
      />
    ),
  }),
  AwardsList: block({ label: 'Βραβεία', category: 'shared', defaults: (l) => ({ items: getAwardsContent(l).awards }), render: (p) => <AwardsList content={p.items as never} /> }),

  // --- Legal -----------------------------------------------------------------
  LegalDocument: block({
    label: 'Νομικό κείμενο',
    category: 'legal',
    defaults: (l) => {
      const { title, lastUpdated, intro, sections } = getLegalContent('terms', l)
      return { title, lastUpdated, intro, sections }
    },
    render: (p, { locale }) => (
      <LegalPage
        locale={locale}
        title={p.title as string}
        lastUpdated={p.lastUpdated as string}
        intro={p.intro as string}
        sections={p.sections as never}
      />
    ),
  }),
}

/**
 * The Puck config for one language: default copy (for a newly added block) and
 * labels are that language's. The same config renders the page on the site
 * (`@measured/puck/rsc`) and in the editor.
 */
export function buildPuckConfig(locale: string): Config {
  const components: Record<string, ComponentConfig> = {}
  for (const [name, b] of Object.entries(BLOCKS)) {
    const defaults = b.defaults(locale)
    components[name] = {
      label: b.label,
      fields: deriveFields([defaults], true),
      defaultProps: defaults,
      render: ({ puck, id: _id, editMode: _editMode, ...props }: Props & { puck?: { metadata?: Partial<BlockMetadata> } }) => {
        const meta = puck?.metadata ?? {}
        const filled = fillFrom(defaults as Json, props as Json) as Props
        return <>{b.render(filled, { locale: meta.locale ?? locale, live: meta.live ?? {} })}</>
      },
    } as ComponentConfig
  }
  const categories = Object.fromEntries(
    (Object.keys(CATEGORIES) as CategoryKey[]).map((key) => [
      key,
      {
        title: CATEGORIES[key],
        components: Object.entries(BLOCKS)
          .filter(([, b]) => b.category === key)
          .map(([name]) => name),
      },
    ]),
  )
  // No page-level fields: a page's title and SEO live in Payload, next to the editor.
  return { components, categories, root: { fields: {} } } as Config
}
