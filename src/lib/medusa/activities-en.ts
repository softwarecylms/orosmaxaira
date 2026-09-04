import type { Activity } from './activities'

/**
 * English overlay for the Medusa-backed activity detail pages.
 *
 * The Medusa `activity` model has no per-locale/metadata field, so the Greek
 * record is the single source of truth and we translate on the storefront side.
 * `getActivity(slug, 'en')` spreads the matching entry here over the fetched
 * activity, replacing only the translatable text fields. Everything structural
 * (id, slug, slots, rating, review_count, prices, image urls, season months,
 * currency, video_url) is intentionally left untouched — note how each
 * `price_tiers` / `gallery` entry keeps its `price` / `url` and only swaps the
 * human-readable strings.
 */
export const ACTIVITY_EN: Record<string, Partial<Activity>> = {
  xenagiseis: {
    title: 'Getting to Know the Bee',
    subtitle:
      'A hands-on tour into the world of the bee — observe the bees through glass hives, without a beekeeper suit.',
    hero_image_alt: 'Getting to Know the Bee — a hands-on tour at Oros Machaira',
    description:
      'For anyone who likes to **learn by doing**, we have created a space where visitors discover what apitherapy is, observe the bees through glass hives (without needing to wear a beekeeper suit) and discover their roles inside the hive.\n\nThey get to know the products of the hive and their uses, learn the story of our family business through a video and take part in an interactive quiz. At the end, they taste our varieties of honey and other products from the hive, such as mead, honeycomb and our honey-and-nut spreads.',
    details:
      '**Duration:** 1 hour\n**Good to know:** no beekeeper suit is needed — the bees are observed safely through glass hives.',
    duration_label: '1 hour',
    age_label: 'For all ages',
    meta_title: 'Getting to Know the Bee — Tours | Oros Machaira',
    meta_description:
      'A hands-on tour at the Oros Machaira apiary: observe the bees through glass hives, get to know the products of the hive and taste our honeys. Book online.',
    price_tiers: [
      { key: 'adult', label: 'Ages 12+', price: 8 },
      { key: 'child', label: 'Ages 4–11', price: 4 },
      { key: 'infant', label: 'Under 4', price: 0, note: 'Free' },
    ],
    features: [
      {
        title: 'Glass hives',
        text: 'Observe the bees and their roles safely — without wearing a beekeeper suit.',
      },
      {
        title: 'Products of the hive',
        text: 'Get to know honey, mead, honeycomb and honey spreads — and what each one is used for.',
      },
      {
        title: 'Tasting & game',
        text: 'Watch our story on video, take part in an interactive quiz and taste our varieties of honey.',
      },
    ],
    policies: [
      {
        title: 'Cancellation Policy',
        body: 'Cancel up to 72 hours in advance for a full refund.',
      },
      {
        title: 'Booking Changes',
        body: 'To change the date or time, you can call [+357 99 130 092](tel:+35799130092). Changes are subject to availability.',
      },
    ],
    gallery: Array.from({ length: 9 }, (_, i) => ({
      url: `/images/xenagiseis/${String(i + 1).padStart(2, '0')}.webp`,
      alt: 'Moments from the “Getting to Know the Bee” tour at Oros Machaira',
    })),
  },

  'peripeteies-stis-kypseles': {
    title: 'Adventures at the Hives',
    subtitle:
      'Suit up and open the hive — a hands-on experience for all ages.',
    hero_image_alt: 'Visitors in beekeeper suits opening the hive',
    description:
      'A **hands-on experience**, suitable for children and adults, where the visitor dresses in a beekeeper suit and visits our hives. With the help of our experienced staff, you open the hive and observe the bee community up close.',
    details:
      '**Duration:** 45 minutes\n**Ages:** there is no limit — the activity is suitable for the whole family. Beekeeper suits are provided for all participants and the entire experience is guided by an experienced beekeeper. We recommend wearing closed shoes and long trousers.',
    note: 'The experience runs at weekends from July to November, and only in combination with the “Getting to Know the Bee” programme or one of the workshops — please book in advance through the website. It does not run in winter, as the bees get cold and become aggressive when we open the hive.',
    duration_label: '45 minutes',
    age_label: 'No age limit',
    meta_title: 'Adventures at the Hives — Oros Machaira',
    meta_description:
      'Adventures at the hives: suit up and open the hive with the help of our staff. A hands-on experience for all ages — combined with “Getting to Know the Bee” or a workshop, weekends only, July–November.',
    price_tiers: [
      { key: 'adult', label: 'Ages 12+', price: 15 },
      { key: 'child', label: 'Ages 4–11', price: 13 },
      { key: 'infant', label: 'Under 4', price: 0, note: 'Free' },
    ],
    features: [
      {
        title: 'Suit up',
        text: 'Put on the beekeeper suit and feel safe right next to the hives.',
      },
      {
        title: 'Open the hive',
        text: 'With the help of our staff, open the hive and see the bee community up close.',
      },
      {
        title: 'All ages welcome',
        text: 'A safe, guided experience, suitable for children and adults alike.',
      },
    ],
    policies: [
      {
        title: 'Cancellation Policy',
        body: 'Cancel up to 72 hours in advance for a full refund.',
      },
      {
        title: 'Booking Changes',
        body: 'To change the date or time, you can call [+357 99 130 092](tel:+35799130092). Changes are subject to availability.',
      },
    ],
    gallery: Array.from({ length: 11 }, (_, i) => ({
      url: `/images/activities/peripeteies/${String(i + 1).padStart(2, '0')}.webp`,
      alt: 'Adventures at the hives at the Oros Machaira apiary',
    })),
  },

  melissotherapeia: {
    title: 'Apitherapy (Bee Therapy)',
    subtitle: 'A traditional practice using the precious products of the hive.',
    hero_image_alt: 'Bee therapy — inhaling the air of the hive',
    description:
      'Apitherapy has been practised since antiquity — the ancient Egyptians are among the earliest known users. It is a traditional practice that draws on the products of the hive (honey, royal jelly, pollen, propolis) and on its warm air, in a relaxing experience inside the apiary.\n\nAt Oros Machaira it is offered as a calm, sensory experience in nature, suitable for adults and children alike.',
    details: 'Every other day for three weeks, 20 minutes per session.',
    note: 'Apitherapy is not a medical treatment. The products of the hive and the inhalation of hive air are not medicines: they do not prevent, treat or cure any disease, and they are not a substitute for medical advice or prescribed medication. If you have a health condition or a known allergy to bee products or bee stings, please consult your doctor first.',
    duration_label: '20 min / session',
    age_label: 'For all ages',
    meta_title: 'Apitherapy (Bee Therapy) in Cyprus — Oros Machaira',
    meta_description:
      'Apitherapy at Oros Machaira: a traditional practice with the products of the hive and the inhalation of its air. Appointments April–October.',
    features: [
      {
        title: 'Inhaling hive air',
        text: 'Through a special breathing mask you inhale the warm, aromatic air of the hive.',
      },
      {
        title: 'Products of the hive',
        text: 'Honey, propolis, pollen and royal jelly accompany the experience.',
      },
      {
        title: 'Season & duration',
        text: 'Available April–October: three weeks, every second day for 20 minutes.',
      },
    ],
    benefits: {
      intro:
        'The ancient Egyptians were among the first to sit beside a hive and breathe its air. At our apiary the experience remains just as simple: you settle into a comfortable seat, put on the special mask, and let the warm, aromatic air of the hive and the sound of the colony keep you company for twenty minutes. Each session includes:',
      items: [
        'The warm air of the hive, through a dedicated breathing mask',
        'The natural aromas of beeswax, propolis and honey',
        'The distinctive sound and pulse of the colony',
        'Twenty minutes of quiet in the nature of Machairas',
        'A safe, controlled space — with no direct contact with the bees',
        'The guidance of an experienced beekeeper throughout',
      ],
    },
  },
}
