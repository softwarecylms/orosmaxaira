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
      'For those who appreciate **knowledge through experience**, we created a space where visitors learn what apitherapy is, observe the bees through glass hives (without needing to wear a beekeeper suit) and discover their roles inside the hive.\n\nThey get to know the products of the hive and their uses, learn the story of our family business through a video and play an interactive question game. At the end, they taste our varieties of honey and other products made from honey such as mead, honeycomb and the blend of honey-and-nut spreads.',
    details:
      '**Duration:** 1 hour\n**Ages:** suitable for the whole family — from young children to adults. No beekeeper suit is needed; the bees are observed safely through glass hives.',
    duration_label: '1 hour',
    age_label: 'For all ages',
    meta_title: 'Getting to Know the Bee — Tours | Oros Machaira',
    meta_description:
      'A hands-on tour at the Oros Machaira apiary: observe the bees through glass hives, get to know the products of the hive and taste our honeys. Book online.',
    price_tiers: [
      { key: 'adult', label: 'Adults (12+)', price: 8 },
      { key: 'child', label: 'Children (4–11)', price: 4 },
      { key: 'infant', label: 'Infants & Toddlers (0–3)', price: 0, note: 'Free' },
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
        text: 'Watch our story on video, play an interactive question game and taste our varieties of honey.',
      },
    ],
    policies: [
      {
        title: 'Cancellation Policy',
        body: 'Cancel up to 72 hours in advance for a full refund.',
      },
      {
        title: 'Booking Changes',
        body: 'To change the date or time, you can call [+357 99 130092](tel:+35799130092). Changes are subject to availability.',
      },
    ],
    reviews: [
      {
        name: 'Elena Georgiou',
        date: '2025-08-12',
        rating: 5,
        body: 'A wonderful experience for the whole family! We saw the bees through the glass hives and the kids loved the interactive game and the honey tasting.',
      },
      {
        name: 'Andreas Christodoulou',
        date: '2025-10-03',
        rating: 5,
        body: 'A very informative tour. We learned about apitherapy and the products of the hive, and tasted wonderful honeys and mead. Highly recommended!',
      },
    ],
    gallery: Array.from({ length: 9 }, (_, i) => ({
      url: `/images/xenagiseis/${String(i + 1).padStart(2, '0')}.webp`,
      alt: 'Moments from the “Getting to Know the Bee” tour at Oros Machaira',
    })),
  },

  'peripeteies-stis-kypseles': {
    title: 'Adventures in the Beehives',
    subtitle:
      'Dress as beekeepers and open the hive — a hands-on experience for young and old.',
    hero_image_alt: 'Visitors in beekeeper suits opening the hive',
    description:
      'A **hands-on experience**, suitable for children and adults, where the visitor dresses in a beekeeper suit and visits our hives. With the help of our experienced staff, you open the hive and observe the bee community up close.\n\nThe experience takes place only at weekends and booking in advance through the website is essential.',
    details:
      '**Duration:** 45 minutes\n**Ages:** there is no limit — the activity is suitable for the whole family. Beekeeper suits are provided for all participants and the entire experience is guided by an experienced beekeeper. We recommend wearing closed shoes and long trousers.',
    note: 'The experience is offered only in combination with the “Getting to Know the Bee” programme or one of the workshops, at weekends from July to November. It does not take place in winter, as the bees get cold and become aggressive when we open their hive.',
    duration_label: '45 minutes',
    age_label: 'No age limit',
    meta_title: 'Adventures in the Beehives — Oros Machaira',
    meta_description:
      'Adventures in the beehives: dress as beekeepers and open the hive with the help of our staff. A hands-on experience for young and old — combined with “Getting to Know the Bee” or a workshop, weekends only, July–November.',
    price_tiers: [
      { key: 'adult', label: 'Adults (12+)', price: 15 },
      { key: 'child', label: 'Children (4–11)', price: 13 },
      { key: 'infant', label: 'Infants & Toddlers (0–3)', price: 0, note: 'Free' },
    ],
    features: [
      {
        title: 'Dress as beekeepers',
        text: 'Put on the beekeeper suit and feel safe right next to the hives.',
      },
      {
        title: 'Open the hive',
        text: 'With the help of our staff, open the hive and see the bee community up close.',
      },
      {
        title: 'For young & old',
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
        body: 'To change the date or time, you can call [+357 99 130092](tel:+35799130092). Changes are subject to availability.',
      },
    ],
    reviews: [
      {
        name: 'Maria Tittoni',
        date: '2025-07-29',
        rating: 5,
        body: 'An amazing experience! The kids loved putting on the suit and opening the hive. The beekeeper explained everything patiently. We would do it again!',
      },
      {
        name: 'Valentinos Filippou',
        date: '2025-09-20',
        rating: 5,
        body: 'A unique hands-on activity for the whole family. We saw the queen, tasted fresh honey and learned how important bees are. Highly recommended.',
      },
    ],
    gallery: Array.from({ length: 11 }, (_, i) => ({
      url: `/images/activities/peripeteies/${String(i + 1).padStart(2, '0')}.webp`,
      alt: 'Adventures in the beehives at the Oros Machaira apiary',
    })),
  },

  melissotherapeia: {
    title: 'Bee Therapy',
    subtitle: 'A therapeutic practice of alternative medicine, using the precious products of the hive.',
    hero_image_alt: 'Bee therapy — inhaling the air of the hive',
    description:
      'Bee therapy was first discovered and applied by the ancient Egyptians. It is an extensive therapeutic practice that belongs to alternative medicine and uses the products of the hive (honey, royal jelly, pollen, bee venom, propolis) in a variety of therapeutic applications.\n\nIn a natural way, bee therapy helps us overcome many health problems and is excellent for children, athletes and the elderly alike.',
    details: 'Every 2nd day, for 3 weeks, 20 minutes per session.',
    note: 'The bee products and the inhalation of hive air are not medicines, nor do they replace prescribed medication. They work alongside and complement conventional treatment — never as a substitute for it.',
    duration_label: '20 min / session',
    age_label: 'For all ages',
    meta_title: 'Bee Therapy (Apitherapy) in Cyprus — Oros Machaira',
    meta_description:
      'Bee therapy at Oros Machaira: a therapeutic practice of alternative medicine using the products of the hive and the inhalation of its air. Appointments April–October.',
    features: [
      {
        title: 'Inhaling hive air',
        text: 'Through a special breathing mask you inhale the warm air of the hive, with its beneficial substances.',
      },
      {
        title: 'Products of the hive',
        text: 'Honey, propolis, pollen, royal jelly and bee venom are used for their beneficial properties.',
      },
      {
        title: 'Season & duration',
        text: 'Applied April–October: for noticeable results, three weeks, every second day for 20 minutes.',
      },
    ],
    benefits: {
      intro:
        'The ancient Egyptians, among others, used the inhalation of air from inside the hive to treat various respiratory problems. Inhaling the warm air of the hive through a special breathing mask, substances with strong therapeutic action are introduced into the body, which are extremely beneficial to the human psychosomatic state. The air inside the hive, impregnated with essential aromas, helps people deal with the following issues:',
      items: [
        'Bronchitis',
        'Asthma',
        'Chronic diseases of the lungs',
        'Susceptibility to infections',
        'Weak immune system',
        'Respiratory infections',
        'Chronic headaches, migraines',
        'Stress',
        'Depression',
      ],
    },
  },
}
