import type { ExecArgs } from "@medusajs/framework/types"
import { BOOKINGS_MODULE } from "../modules/bookings"
import type BookingsModuleService from "../modules/bookings/service"

/**
 * One-off backfill: copy the storefront's code-side English overlays into the new
 * `translations.en` column on each bookings record, so the Medusa admin shows the
 * existing English and the storefront can read it from the DB.
 *
 *   npx medusa exec ./src/scripts/backfill-translations.ts
 *
 * Idempotent + additive: it merges over any `translations.en` already set (only
 * filling keys), so re-running is safe and admin edits are never clobbered.
 * Sources mirror (keep in sync with):
 *   - src/lib/medusa/activities-en.ts        (ACTIVITY_EN)
 *   - src/lib/data/workshops.ts              (WORKSHOPS_EN_TEXT)
 *   - src/lib/data/school-visit.ts + the scholeia page FALLBACK_EN
 */

// ─── Activities ────────────────────────────────────────────────────────────
const ACTIVITY_EN: Record<string, any> = {
  xenagiseis: {
    title: "Getting to Know the Bee",
    subtitle:
      "A hands-on tour into the world of the bee — observe the bees through glass hives, without a beekeeper suit.",
    hero_image_alt: "Getting to Know the Bee — a hands-on tour at Oros Machaira",
    description:
      "For anyone who likes to **learn by doing**, we have created a space where visitors discover what apitherapy is, observe the bees through glass hives (without needing to wear a beekeeper suit) and discover their roles inside the hive.\n\nThey get to know the products of the hive and their uses, learn the story of our family business through a video and take part in an interactive quiz. At the end, they taste our varieties of honey and other products from the hive, such as mead, honeycomb and our honey-and-nut spreads.",
    details:
      "**Duration:** 1 hour\n**Good to know:** no beekeeper suit is needed — the bees are observed safely through glass hives.",
    duration_label: "1 hour",
    age_label: "For all ages",
    meta_title: "Getting to Know the Bee — Tours | Oros Machaira",
    meta_description:
      "A hands-on tour at the Oros Machaira apiary: observe the bees through glass hives, get to know the products of the hive and taste our honeys. Book online.",
    price_tiers: [
      { key: "adult", label: "Ages 12+", price: 8 },
      { key: "child", label: "Ages 4–11", price: 4 },
      { key: "infant", label: "Under 4", price: 0, note: "Free" },
    ],
    features: [
      { title: "Glass hives", text: "Observe the bees and their roles safely — without wearing a beekeeper suit." },
      { title: "Products of the hive", text: "Get to know honey, mead, honeycomb and honey spreads — and what each one is used for." },
      { title: "Tasting & game", text: "Watch our story on video, take part in an interactive quiz and taste our varieties of honey." },
    ],
    policies: [
      { title: "Cancellation Policy", body: "Cancel up to 72 hours in advance for a full refund." },
      { title: "Booking Changes", body: "To change the date or time, you can call [+357 99 130 092](tel:+35799130092). Changes are subject to availability." },
    ],
    gallery: Array.from({ length: 9 }, (_, i) => ({
      url: `/images/xenagiseis/${String(i + 1).padStart(2, "0")}.webp`,
      alt: "Moments from the “Getting to Know the Bee” tour at Oros Machaira",
    })),
  },

  "peripeteies-stis-kypseles": {
    title: "Adventures at the Hives",
    subtitle: "Suit up and open the hive — a hands-on experience for all ages.",
    hero_image_alt: "Visitors in beekeeper suits opening the hive",
    description:
      "A **hands-on experience**, suitable for children and adults, where the visitor dresses in a beekeeper suit and visits our hives. With the help of our experienced staff, you open the hive and observe the bee community up close.",
    details:
      "**Duration:** 45 minutes\n**Ages:** there is no limit — the activity is suitable for the whole family. Beekeeper suits are provided for all participants and the entire experience is guided by an experienced beekeeper. We recommend wearing closed shoes and long trousers.",
    note: "The experience runs at weekends from July to November, and only in combination with the “Getting to Know the Bee” programme or one of the workshops — please book in advance through the website. It does not run in winter, as the bees get cold and become aggressive when we open the hive.",
    duration_label: "45 minutes",
    age_label: "No age limit",
    meta_title: "Adventures at the Hives — Oros Machaira",
    meta_description:
      "Adventures at the hives: suit up and open the hive with the help of our staff. A hands-on experience for all ages — combined with “Getting to Know the Bee” or a workshop, weekends only, July–November.",
    price_tiers: [
      { key: "adult", label: "Ages 12+", price: 15 },
      { key: "child", label: "Ages 4–11", price: 13 },
      { key: "infant", label: "Under 4", price: 0, note: "Free" },
    ],
    features: [
      { title: "Suit up", text: "Put on the beekeeper suit and feel safe right next to the hives." },
      { title: "Open the hive", text: "With the help of our staff, open the hive and see the bee community up close." },
      { title: "All ages welcome", text: "A safe, guided experience, suitable for children and adults alike." },
    ],
    policies: [
      { title: "Cancellation Policy", body: "Cancel up to 72 hours in advance for a full refund." },
      { title: "Booking Changes", body: "To change the date or time, you can call [+357 99 130 092](tel:+35799130092). Changes are subject to availability." },
    ],
    gallery: Array.from({ length: 11 }, (_, i) => ({
      url: `/images/activities/peripeteies/${String(i + 1).padStart(2, "0")}.webp`,
      alt: "Adventures at the hives at the Oros Machaira apiary",
    })),
  },

  melissotherapeia: {
    title: "Apitherapy (Bee Therapy)",
    subtitle: "A complementary therapy using the precious products of the hive.",
    hero_image_alt: "Bee therapy — inhaling the air of the hive",
    description:
      "Apitherapy has been practised since antiquity — the ancient Egyptians are among the earliest known users. It is a wide-ranging complementary therapy that uses the products of the hive (honey, royal jelly, pollen, bee venom, propolis) in a variety of applications.\n\nApitherapy is used as a natural complement to conventional care and is suitable for children, athletes and older adults alike.",
    details: "Every other day for three weeks, 20 minutes per session.",
    note: "The bee products and the inhalation of hive air are not medicines, nor do they replace prescribed medication. They work alongside and complement conventional treatment — never as a substitute for it.",
    duration_label: "20 min / session",
    age_label: "For all ages",
    meta_title: "Apitherapy (Bee Therapy) in Cyprus — Oros Machaira",
    meta_description:
      "Apitherapy at Oros Machaira: a complementary therapy using the products of the hive and the inhalation of its air. Appointments April–October.",
    // Bug fix: EN counterpart of the Greek "Ανά συνεδρία" tier.
    price_tiers: [{ key: "session", label: "Per session", price: 7 }],
    features: [
      { title: "Inhaling hive air", text: "Through a special breathing mask you inhale the warm air of the hive, with its beneficial substances." },
      { title: "Products of the hive", text: "Honey, propolis, pollen, royal jelly and bee venom are used for their beneficial properties." },
      { title: "Season & duration", text: "Applied April–October: for noticeable results, three weeks, every second day for 20 minutes." },
    ],
    benefits: {
      intro:
        "The ancient Egyptians, among others, used the inhalation of air from inside the hive to treat various respiratory problems. When you inhale the warm hive air through a special mask, you take in compounds that are beneficial for overall physical and mental wellbeing. The air inside the hive, rich in natural aromatic compounds, helps people deal with the following issues:",
      items: [
        "Bronchitis",
        "Asthma",
        "Chronic diseases of the lungs",
        "Susceptibility to infections",
        "Weak immune system",
        "Respiratory infections",
        "Chronic headaches, migraines",
        "Stress",
        "Depression",
      ],
    },
  },
}

// ─── Workshops ─────────────────────────────────────────────────────────────
const WORKSHOP_EN_TEXT: Record<
  string,
  { title: string; excerpt: string; description: string; season_label: string }
> = {
  melissolampades: {
    title: "Beeswax Easter Candles",
    excerpt:
      "Just before Easter, make your own beeswax Easter candle from sheets of beeswax foundation and take it home for free.",
    season_label: "Easter",
    description:
      "Just before **Easter**, we welcome you and the little ones to our apiary for a creative and fun workshop dedicated to the bee and its wax!\n\nYoung and old alike will have the chance to learn about the bee and natural wax, while creating their very own Easter beeswax candle.\n\nUsing sheets of beeswax honeycomb, you will wrap the wick and build your own candle. Then, with a variety of Easter decorations, you will decorate it just as you like, creating a truly unique Easter candle.\n\nAt the end of the workshop, every participant takes home the Easter candle they made, **free of charge** — ready for Easter!",
  },
  "fytefsi-sporon": {
    title: "Planting Seeds in Pots & Decorating",
    excerpt:
      "Plant your seeds in little pots, paint them and learn how we help the bees — take your pot home for free.",
    season_label: "Summer",
    description:
      "We welcome you, your family and the little ones to our apiary for a **summer** workshop dedicated to the joy of planting, creativity and the protection of bees!\n\nYoung and old alike will have the chance to plant their own seeds in little pots and paint the outside, adding colour and giving their imagination free rein.\n\nThrough this creative activity, we will learn how planting plants and flowers can help the bees by offering them precious sources of food. At the same time, we will get to know better the importance of **pollination** and the decisive role of bees in nature and the environment.\n\nAt the end of the workshop, every participant takes home the little pot they planted and decorated, **free of charge**, to care for it and watch it grow!",
  },
  "ergastiria-mageirikis": {
    title: "Cooking Workshop for Honey Truffles",
    excerpt:
      "Make homemade truffles with Oros Machaira honey and spreads, cook with products of the hive and taste what you create.",
    season_label: "Autumn",
    description:
      "We welcome you to our apiary for a tasty and creative workshop, dedicated to **honey** and the products of the hive and their use in cooking!\n\nYoung and old alike will have the chance to make homemade **honey truffles** and **Oros Machaira spreads**, discovering new ways of using honey and the products of the hive through simple and delicious recipes.\n\nDuring the workshop, you will prepare your own creations, while learning how honey and bee products can be creatively woven into our everyday diet and used in different sweet and savoury recipes.\n\nAnd of course, at the end of the workshop we will have the chance to taste together everything we made, rounding off an experience full of flavours, aromas and… honey!",
  },
  keraloifes: {
    title: "Making Natural Beeswax Salves",
    excerpt: "Make your own natural beeswax salve step by step and take it home for free.",
    season_label: "Winter",
    description:
      "We welcome you to our apiary for a creative workshop dedicated to **beeswax** and making natural beeswax salves!\n\nYoung and old alike will have the chance to get to know beeswax better and discover how it can be used, combined with other natural ingredients, to make a salve.\n\nDuring the workshop, we will follow the preparation process together step by step and each participant makes their own **natural beeswax salve**, while learning more about the ingredients we use and their role in the final product.\n\nAt the end of the workshop, every participant takes home the salve they made, **free of charge**, as a special keepsake from their experience in the world of the bee!",
  },
  "melissokeria-vazakia": {
    title: "Beeswax Candles in Jars",
    excerpt:
      "Make your own natural beeswax candle in a jar and take it home for free — a warm light for winter.",
    season_label: "November",
    description:
      "We welcome you, your family and the little ones to our apiary for a warm, creative workshop dedicated to **beeswax** and light!\n\nYoung and old alike will have the chance to get to know natural beeswax better and create their very own candle inside a little jar.\n\nDuring the workshop, we will follow the preparation process together and each participant will make their own **beeswax candle in a jar**, while learning about beeswax and its many uses.\n\nAt the end of the workshop, every participant takes home **for free** the beeswax candle they made — a warm light for the winter days!",
  },
  "peritiligma-fagitou": {
    title: "Beeswax Food Wraps",
    excerpt: "Make your own reusable beeswax food wrap — an eco-friendly choice for every day.",
    season_label: "By appointment",
    description:
      "We welcome you, your family and the little ones to our apiary for a creative and **eco-friendly** workshop dedicated to beeswax and sustainable everyday living!\n\nYoung and old alike will have the chance to get to know natural beeswax better and learn how we can reduce the use of plastic film in the everyday storage and transport of our food.\n\nDuring the workshop, you will create your own **reusable food wrap** from beeswax, which can be used for the children’s school sandwiches, fruit and all sorts of food.\n\nThrough a pleasant and creative experience, we will discover together how a product of the bee can become a more eco-friendly choice in our daily lives, helping to reduce the use of plastic.\n\nAt the end of the workshop, every participant takes home the beeswax wrap they made, **free of charge** — ready to use!",
  },
  "kerines-dimiourgies": {
    title: "Handmade Plaster Figures",
    excerpt: "Paint handmade plaster figures inspired by the bee and take your creation home for free.",
    season_label: "By appointment",
    description:
      "We welcome you, your family and your friends to our apiary for a creative and fun workshop full of colour, imagination and… bees!\n\nYoung and old alike will have the chance to get to know the wonderful world of the bee better, painting handmade **plaster figures** in the shapes of bees, honeycombs and other designs inspired by life in the hive.\n\nWith colours and plenty of imagination, each participant will paint their own unique figure, in a pleasant and relaxing workshop that leaves room for creativity and fun.\n\nAt the end of the workshop, every participant takes home the plaster creation they painted, **free of charge**, as a lovely keepsake from their experience in the world of the bees!",
  },
}

// Greek → English phrases for translating combo labels / long labels. Longest
// first so composite phrases win before their parts.
const COMBO_PHRASES: [string, string][] = [
  ["Εργαστήρι Μαγειρικής για Τρουφάκια με μέλι και αλοιφές Όρος Μαχαιρά", "Cooking Workshop for Truffles with Oros Machaira honey and spreads"],
  ["Εργαστήρι Φύτευσης Μελισσοκομικών Σπόρων σε Γλαστράκια", "Workshop for Planting Bee-Friendly Seeds in Pots"],
  ["Εργαστήρι Παρασκευής Μελισσοκεριών μέσα σε βαζάκια", "Workshop for Making Beeswax Candles in Jars"],
  ["Εργαστήρι Παρασκευής Σπιτικής Κεραλοιφής", "Workshop for Making Homemade Beeswax Salve"],
  ["Γνωρίζω τη Μέλισσα + Περιπέτειες στις Κυψέλες", "Getting to Know the Bee + Adventures at the Hives"],
  ["Περιπέτειες στις Κυψέλες", "Adventures at the Hives"],
  ["Γνωρίζω τη Μέλισσα", "Getting to Know the Bee"],
  ["Μισό πρόγραμμα", "Half programme"],
  ["Πλήρες πρόγραμμα", "Full programme"],
]

function translateCombo(s?: string | null): string | undefined {
  if (!s) return undefined
  let out = s
  for (const [el, en] of COMBO_PHRASES) out = out.split(el).join(en)
  return out
}

// English gallery alt text per activity (base gallery keeps its urls; only the
// alt is translated). Used when the activity overlay above provides no gallery.
const GALLERY_ALT_EN: Record<string, string> = {
  melissotherapeia: "Bee therapy at the Oros Machaira apiary",
}

// Standardized Greek → English for workshop scalar labels + tier note/age labels.
const WORKSHOP_SCALAR_EN: Record<string, string> = {
  "Για όλες τις ηλικίες": "For all ages",
  "1¾–3 ώρες (ανά πρόγραμμα)": "1 hr 45 min – 3 hrs, depending on the programme",
  "45 λεπτά": "45 minutes",
}
const TIER_NOTE_EN: Record<string, string> = {
  "ανά άτομο · ενδεικτική τιμή": "per person · indicative price",
  "ανά άτομο": "per person",
}
const AGE_LABELS_EN = {
  adult: "Ages 12+",
  child: "Ages 4–11",
  infant: "Under 4",
}

// ─── School program (mirror of scholeia FALLBACK_EN) ───────────────────────
const SCHOOL_EN: Record<string, any> = {
  title: "School Educational Visits",
  hero_image_alt: "Students on an educational visit to the Oros Machaira apiary",
  intro:
    "Our apiary is open to primary school groups. We have designed a programme that meets pupils’ educational needs, combining information, creativity and contact with nature.",
  closing:
    "We look forward to welcoming you and the children for a beautiful, educational day full of knowledge and fun.",
  program_note:
    "The children are split into two or three groups, depending on the number of pupils, and rotate through the three activities below, changing every 45 minutes.",
  tour_title: "Educational Tour",
  tour_intro: "An organised tour of our indoor and outdoor educational spaces, which includes:",
  tour_stops: [
    { text: "A visit to our apitherapy room to get to know the products of the bee and their uses, and to learn about the roles of the bees within the hive." },
    { text: "A screening of an educational video showing a queen bee laying eggs, along with interesting facts about the anatomy and communication of bees." },
    { text: "A knowledge quiz with small gifts from our shop for the participants." },
    { text: "A honey tasting and important information about honey." },
  ],
  workshop_intro: "You choose one of the two hands-on workshops:",
  workshop_options: [
    {
      key: "keria",
      label: "Candle-making workshop & creating a poster for the protection of bees",
      short: "Candle-making & poster",
      description: "The children make their own candle from a sheet of honeycomb and decorate it with ribbons and beads, adding their personal touch.",
    },
    {
      key: "fytefsi",
      label: "Workshop planting bee-friendly seeds in ceramic pots & painting",
      short: "Seed planting & painting",
      description: "The children plant bee-friendly seeds in little ceramic pots — a way of protecting the bees — and then paint them with brushes.",
    },
  ],
  workshop_note: "In both workshops, the children take their creation home with them.",
  play_title: "Free Play in the Playground",
  play_text:
    "The children will enjoy free play in the playground area, with time to rest and have a snack.",
  duration_text:
    "The programme lasts approximately 2 hours and 30 minutes, between 09:30–12:00 (including the time the children will need to eat the breakfast they bring with them). The schedule is flexible, depending on your arrival time, with all groups rotating every 45 minutes.",
  pricing: [
    { range: "Up to 25 children", price: 8, note: "per child, incl. VAT" },
    { range: "From 26 to 50 children", price: 7, note: "per child, incl. VAT" },
    { range: "Teachers & accompanying adults", price: null, note: "everyone accompanying the class" },
  ],
  notes: [
    { title: "Snacks & Drinks", body: "The children should bring their own snacks. The only food and drink available on site are our honey and bee products." },
    { title: "Supervision", body: "During free play, supervision remains solely the responsibility of the accompanying adults." },
  ],
  allergy_title: "Allergies & Medical Conditions",
  allergy_body: [
    "Please inform us in advance of any medical conditions or allergies (mainly to nuts, honey, bees).",
    "As bees are naturally present in our environment, children or staff with a bee allergy must not take part in the visit.",
  ],
  meta_title: "School Educational Visits",
  meta_description:
    "An organised educational programme for primary schools at the Oros Machaira apiary: a tour, a creative workshop and free play.",
}

/** Merge `add` over any existing `translations.en`, only filling missing keys so
 *  admin-entered English is never overwritten. */
function mergeEn(existing: any, add: Record<string, any>): { en: Record<string, any> } {
  const en = { ...(existing?.en ?? {}) }
  for (const [k, v] of Object.entries(add)) {
    if (en[k] === undefined || en[k] === null || en[k] === "") en[k] = v
  }
  return { ...(existing ?? {}), en }
}

export default async function backfillTranslations({ container }: ExecArgs) {
  const logger = container.resolve("logger")
  const bookings = container.resolve<BookingsModuleService>(BOOKINGS_MODULE)

  // Activities
  for (const [slug, en] of Object.entries(ACTIVITY_EN)) {
    const [a] = await bookings.listActivities({ slug })
    if (!a) {
      logger.info(`activity ${slug}: not found, skipped`)
      continue
    }
    const add = { ...en }
    // Translate gallery alts (keep the base urls) when the overlay has none.
    const baseGallery = (a as any).gallery
    if (!add.gallery && Array.isArray(baseGallery) && GALLERY_ALT_EN[slug]) {
      add.gallery = baseGallery.map((g: any) => ({ ...g, alt: GALLERY_ALT_EN[slug] }))
    }
    await bookings.updateActivities({
      id: (a as any).id,
      translations: mergeEn((a as any).translations, add),
    })
    logger.info(`activity ${slug}: translations.en backfilled`)
  }

  // Workshops (text + translated combo labels)
  const workshops = await bookings.listWorkshops({}, { take: 100 })
  for (const w of workshops as any[]) {
    const text = WORKSHOP_EN_TEXT[w.slug]
    const add: Record<string, any> = { ...(text ?? {}) }
    // SEO title/description in English (base has a Greek meta_title).
    if (text) {
      add.meta_title = `${text.title} — Hands-on Workshop | Oros Machaira`
      add.meta_description = text.excerpt
    }
    // Scalar labels shown in the booking widget (age/duration).
    if (w.age_label && WORKSHOP_SCALAR_EN[w.age_label]) add.age_label = WORKSHOP_SCALAR_EN[w.age_label]
    if (w.duration_label && WORKSHOP_SCALAR_EN[w.duration_label])
      add.duration_label = WORKSHOP_SCALAR_EN[w.duration_label]
    const combo_labels: Record<string, any> = {}
    for (const t of (w.price_tiers ?? []) as any[]) {
      if (!t?.key) continue
      const entry: Record<string, any> = {}
      const label = translateCombo(t.label)
      const long_label = translateCombo(t.long_label)
      if (label && label !== t.label) entry.label = label
      if (long_label && long_label !== t.long_label) entry.long_label = long_label
      // Tier "per person" note + per-age labels shown in the seat-booking widget.
      if (t.note && TIER_NOTE_EN[t.note]) entry.note = TIER_NOTE_EN[t.note]
      if (t.age_labels) entry.age_labels = AGE_LABELS_EN
      if (Object.keys(entry).length) combo_labels[t.key] = entry
    }
    if (Object.keys(combo_labels).length) add.combo_labels = combo_labels
    if (!Object.keys(add).length) continue
    await bookings.updateWorkshops({
      id: w.id,
      translations: mergeEn(w.translations, add),
    })
    logger.info(`workshop ${w.slug}: translations.en backfilled`)
  }

  // School program (singleton)
  const [sp] = await bookings.listSchoolPrograms({}, { take: 1 })
  if (sp) {
    await bookings.updateSchoolPrograms({
      id: (sp as any).id,
      translations: mergeEn((sp as any).translations, SCHOOL_EN),
    })
    logger.info("school program: translations.en backfilled")
  }

  logger.info("Backfill complete.")
}
