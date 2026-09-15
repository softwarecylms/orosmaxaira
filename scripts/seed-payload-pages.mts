// Load every content page into Payload's Pages collection — title, link, SEO
// and visual-editor content, in Greek and English — built from the site's
// built-in copy, so the pages look exactly as they do today. Run with:
//
//   npx tsx scripts/seed-payload-pages.mts
//
// Pages that already exist are left alone (an editor may have changed them);
// FORCE=1 rewrites them from the built-in copy (earlier versions stay in the
// page's version history). ONLY=<slug>[,<slug>] limits the run. Point
// DATABASE_URI at the database to seed (local by default, from .env).
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config.ts'
import { getHomeContent } from '../src/components/home/home-content.ts'
import { getAboutContent } from '../src/components/about/about-content.ts'
import { getAdoptContent } from '../src/components/adopt/adopt-content.ts'
import { getContactContent } from '../src/components/contact/contact-content.ts'
import { getActivitiesContent } from '../src/components/activities/activities-content.ts'
import { getNatureContent } from '../src/components/nature/nature-content.ts'
import { getCertificatesContent } from '../src/components/certificates/certificates-content.ts'
import { getAwardsContent } from '../src/components/awards/awards-content.ts'
import { getLegalContent, type LegalKey } from '../src/components/legal/legal-content.ts'
import el from '../messages/el.json' with { type: 'json' }
import en from '../messages/en.json' with { type: 'json' }

type Locale = 'el' | 'en'
type Block = { type: string; props: Record<string, unknown> }
type PageSeed = {
  slug: string
  title: Record<Locale, string>
  seo: (l: Locale) => { title: string; description: string }
  blocks: (l: Locale) => Block[]
}

const b = (type: string, props: object): Block => ({ type, props: props as Record<string, unknown> })

const legal = (slug: string, key: LegalKey): PageSeed => ({
  slug,
  title: { el: getLegalContent(key, 'el').title, en: getLegalContent(key, 'en').title },
  seo: (l) => getLegalContent(key, l).seo,
  blocks: (l) => {
    const { title, lastUpdated, intro, sections } = getLegalContent(key, l)
    return [b('LegalDocument', { title, lastUpdated, intro, sections })]
  },
})

const PAGES: PageSeed[] = [
  {
    slug: 'home',
    title: { el: 'Αρχική', en: 'Home' },
    seo: (l) => {
      const m = (l === 'en' ? en : el).layout
      return { title: m.defaultTitle, description: m.description }
    },
    blocks: (l) => {
      const h = getHomeContent(l)
      return [
        b('HeroPair', h.HERO),
        b('TrustBadges', { items: h.TRUST }),
        b('DealOfMonth', h.DEAL),
        b('Ticker', { items: h.TICKER }),
        b('ProductCategories', h.CATEGORIES),
        b('AdoptHiveBanner', h.ADOPT),
        b('Heritage', h.HERITAGE),
        b('FlatlayBand', h.FLATLAY),
        b('BlogTeaser', h.BLOG),
      ]
    },
  },
  {
    slug: 'poioi-eimaste',
    title: { el: 'Ποιοι είμαστε', en: 'About us' },
    seo: (l) => getAboutContent(l).meta,
    blocks: (l) => {
      const a = getAboutContent(l)
      return [
        b('AboutHero', a.hero),
        b('AboutStats', { items: a.stats }),
        b('AboutValues', { items: a.values }),
        b('AboutIndoor', a.indoor),
        b('AboutOutdoor', a.outdoor),
        b('AboutBand', { text: a.band }),
        b('AboutFamily', a.family),
        b('AboutGoal', a.goal),
      ]
    },
  },
  {
    slug: 'epikoinonia',
    title: { el: 'Επικοινωνία', en: 'Contact' },
    seo: (l) => getContactContent(l).meta,
    blocks: (l) => {
      const c = getContactContent(l)
      return [
        b('ContactHero', { image: c.hero.image, imageAlt: c.hero.imageAlt, title: c.hero.title }),
        b('ContactConnect', { connect: c.connect, form: c.form }),
        b('ContactMap', c.map),
        b('ContactValues', { items: c.values }),
      ]
    },
  },
  {
    slug: 'yiotheto-mia-kypseli',
    title: { el: 'Υιοθετώ μια κυψέλη', en: 'Adopt a hive' },
    seo: (l) => getAdoptContent(l).meta,
    blocks: (l) => {
      const a = getAdoptContent(l)
      return [
        b('AdoptHero', a.hero),
        b('AdoptIntro', a.intro),
        b('AdoptPartners', a.partners),
        b('AdoptPackage', a.package),
        b('GoalBand', a.goal),
        b('AdoptVisits', a.visits),
        b('AdoptGallery', a.gallery),
        b('AdoptProgress', a.progress),
        b('AdoptTestimonials', a.testimonials),
        b('AdoptFaq', a.faq),
        b('AdoptCta', { cta: a.cta, form: a.form }),
      ]
    },
  },
  {
    slug: 'drastiriotites',
    title: { el: 'Δραστηριότητες', en: 'Activities' },
    seo: (l) => getActivitiesContent(l).meta,
    blocks: (l) => {
      const a = getActivitiesContent(l)
      return [
        b('ActivitiesHero', a.hero),
        b('ActivitiesExperiences', a.experiences),
        b('FactBand', a.fact),
        b('ActivitiesPrograms', a.programs),
      ]
    },
  },
  {
    slug: 'pistopioiseis',
    title: { el: 'Πιστοποιήσεις', en: 'Certifications' },
    seo: (l) => getCertificatesContent(l).meta,
    blocks: (l) => {
      const c = getCertificatesContent(l)
      // The certificates hero has no eyebrow line (the copy has one, unused).
      const { title, description, image, imageAlt } = c.hero
      return [
        b('PageHero', { eyebrow: '', title, description, image, imageAlt }),
        b('CertificatesList', { certificates: c.certificates, downloadLabel: c.downloadLabel }),
      ]
    },
  },
  {
    slug: 'vraveia',
    title: { el: 'Βραβεία', en: 'Awards' },
    seo: (l) => getAwardsContent(l).meta,
    blocks: (l) => {
      const a = getAwardsContent(l)
      return [b('AwardsHero', a.hero), b('AwardsList', { items: a.awards })]
    },
  },
  {
    slug: 'afaneis-iroes-tis-fysis',
    title: { el: 'Αφανείς ήρωες της φύσης', en: 'Nature’s unsung heroes' },
    seo: (l) => getNatureContent(l).meta,
    blocks: (l) => {
      const n = getNatureContent(l)
      const [first, ...rest] = n.sections
      return [
        b('PageHero', n.hero),
        b('NatureStory', first),
        b('NatureStats', { items: n.stats }),
        ...rest.map((s) => b('NatureStory', s)),
        b('AdoptHiveBanner', { ...getHomeContent(l).ADOPT, body: n.adoptBody }),
        b('NatureMatters', n.matters),
      ]
    },
  },
  legal('terms', 'terms'),
  legal('privacy-amp-cookie-policy', 'privacy'),
  legal('paraggelies-kai-epistrofes', 'orders'),
  legal('politiki-apostolis-proionton', 'shipping'),
]

/** A Puck tree with block ids that are the same in both languages. */
function puckData(slug: string, blocks: Block[]) {
  const seen: Record<string, number> = {}
  return {
    root: { props: {} },
    zones: {},
    content: blocks.map((blk) => {
      const n = (seen[blk.type] = (seen[blk.type] ?? 0) + 1)
      return { type: blk.type, props: { ...JSON.parse(JSON.stringify(blk.props)), id: `${slug}-${blk.type}-${n}` } }
    }),
  }
}

const force = process.env.FORCE === '1'
const only = process.env.ONLY?.split(',').map((s) => s.trim()).filter(Boolean)
const payload = await getPayload({ config })
let created = 0
let replaced = 0
let kept = 0

for (const page of PAGES) {
  if (only && !only.includes(page.slug)) continue
  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: page.slug } },
    locale: 'el',
    draft: true,
    limit: 1,
    depth: 0,
  })
  const doc = existing.docs[0] as { id: number; content?: { content?: unknown[] } } | undefined
  if (doc?.content?.content?.length && !force) {
    kept++
    console.log(`kept      ${page.slug}`)
    continue
  }

  const dataFor = (l: Locale) => ({
    title: page.title[l],
    content: puckData(page.slug, page.blocks(l)),
    seo: { ...page.seo(l), noindex: false },
    _status: 'published' as const,
  })

  let id = doc?.id
  if (id) {
    await payload.update({ collection: 'pages', id, locale: 'el', data: { slug: page.slug, ...dataFor('el') } as never })
  } else {
    const createdDoc = await payload.create({ collection: 'pages', locale: 'el', data: { slug: page.slug, ...dataFor('el') } as never })
    id = createdDoc.id as number
  }
  await payload.update({ collection: 'pages', id: id!, locale: 'en', data: dataFor('en') as never })
  if (doc) replaced++
  else created++
  console.log(`${doc ? 'replaced' : 'created '}  ${page.slug}`)
}

console.log(`done: ${created} created, ${replaced} replaced, ${kept} kept`)
process.exit(0)
