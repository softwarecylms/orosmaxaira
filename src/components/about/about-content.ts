/**
 * About ("Ποιοί είμαστε") page content (Figma 393:1992). All Greek copy + asset
 * paths in one place, mirroring the home/contact content modules.
 *
 * Bilingual: the Greek `ABOUT_PAGE` below is the source of truth (EL). `ABOUT_EN`
 * overrides only the user-facing text; locale-invariant fields (images, hrefs,
 * value icons, member photos) are reused from the Greek source. English copy is
 * the live site's own wording (orosmaxaira.com/en/poioi-eimaste) where present,
 * and faithful translations elsewhere. Read the active locale via next-intl's
 * `getLocale()` (server) / `useLocale()` (client) and call `getAboutContent()`.
 */

export type AboutValueIcon = 'purity' | 'eco' | 'family'

export const ABOUT_PAGE = {
  meta: {
    title: 'Ποιοί είμαστε',
    description:
      'Είμαστε μία μελισσοκομική οικογένεια. Ασχολούμαστε επαγγελματικά με τη μελισσοκομία από το 1983 — αγνό κυπριακό μέλι από τα άνθη και τα βότανα του Μαχαιρά.',
  },

  breadcrumb: [
    { label: 'Αρχική', href: '/' },
    { label: 'Ποιοί είμαστε' },
  ] as { label: string; href?: string }[],

  hero: {
    eyebrow: 'Η ΙΣΤΟΡΙΑ ΜΑΣ',
    title: 'Ποιοι Είμαστε',
    body: [
      'Είμαστε μία μελισσοκομική οικογένεια. Ασχολούμαστε επαγγελματικά με τη μελισσοκομία από το 1983. Όλα αυτά τα χρόνια, με σκληρή δουλειά και αγάπη για τις μέλισσες καταφέραμε να δημιουργήσουμε μια σχέση εμπιστοσύνης με τους πελάτες μας.',
      'Έχοντας την ευθύνη όλης της διαδικασίας παραγωγής του μελιού από την κυψέλη στον καταναλωτή, μπορούμε να διασφαλίσουμε την υψηλή ποιότητα και γνησιότητά του μελιού μας.',
    ],
    image: '/images/about/about-hero.png',
    imageAlt: 'Η οικογένεια Όρος Μαχαιρά στο μελισσοκομείο',
    author: {
      name: 'Μέλιος Φιλίππου',
      role: 'Διευθυντής',
      avatar: '/images/about/family-melios.webp',
    },
    awardsCta: 'Βραβεία & Διακρίσεις',
  },

  stats: [
    { icon: 'experience', value: '40+', label: 'Χρόνια εμπειρίας' },
    { icon: 'clients', value: '10K', label: 'Έμπιστους πελάτες' },
    { icon: 'honey', value: '120', label: 'Τόνοι μέλι τον χρόνο' },
    { icon: 'award', value: '7', label: 'Βραβεία Ποιότητας' },
    { icon: 'points', value: '600+', label: 'Σημεία Πώλησης' },
  ] as { icon: string; value: string; label: string }[],

  values: [
    {
      icon: 'purity' as AboutValueIcon,
      title: 'Αγνότητα',
      text: 'Το μέλι μας φτάνει στο τραπέζι σας ακριβώς όπως το φτιάχνει η μέλισσα.',
    },
    {
      icon: 'eco' as AboutValueIcon,
      title: 'Περιβάλλον',
      text: 'Πιστοποιημένοι με **ISO 14001** & **ISO 22000** - σεβασμός για τη γη και τις μέλισσες.',
    },
    {
      icon: 'family' as AboutValueIcon,
      title: 'Οικογένεια',
      text: 'Από το 1983, τρεις γενιές με το ίδιο πάθος για τη φύση και τις μέλισσες.',
    },
  ],

  indoor: {
    heading: 'Τι θα βρείτε στους εσωτερικούς μας χώρους',
    cards: [
      {
        title: 'Προεργασία & Εμφιάλωση',
        text: 'Αίθουσα για την προεργασία και εμφιάλωση των μελιών μας.',
        image: '/images/about/indoor-1.webp',
      },
      {
        title: 'Η ιστορία μας',
        text: 'Αίθουσα προβολών με την ιστορία μας και τον μαγικό κόσμο της μέλισσας.',
        image: '/images/about/indoor-2.webp',
      },
      {
        title: 'Υποδοχή & Γευσιγνωσία',
        text: 'Φιλόξενο χώρο υποδοχής και γευσιγνωσίας των προϊόντων μας.',
        image: '/images/about/indoor-3.webp',
      },
    ] as { title: string; text: string; image?: string }[],
  },

  outdoor: {
    heading: 'Και τι θα βρείτε στους εξωτερικούς μας χώρους',
    cta: { label: 'Δείτε περισσότερα', href: '/drastiriotites' },
    arrows: { prev: 'Προηγούμενο', next: 'Επόμενο' },
    slides: [
      {
        title: 'Εργαστήρια & Δραστηριότητες',
        href: '/drastiriotites',
        text: 'Ειδικά διαμορφωμένο χώρο για τη διεξαγωγή εργαστηρίων και εκπαιδευτικών δραστηριοτήτων.',
        image: '/images/about/outdoor-workshops.png',
      },
      {
        title: 'Πλούσιους Κήπους',
        href: '/drastiriotites/xenagiseis',
        text: 'Πλούσιους κήπους, που αποτελούν τροφή για τις μέλισσές μας και ένα όμορφο περιβάλλον για τους επισκέπτες.',
        image: '/images/about/outdoor-gardens.png',
      },
      {
        title: 'Εκπαιδευτικά Παιχνίδια',
        text: 'Διαδραστικά εκπαιδευτικά παιχνίδια για μικρούς και μεγάλους, με θέμα τη μέλισσα και τα προϊόντα της.',
        image: '/images/about/outdoor-games.png',
      },
      {
        title: 'Επίσκεψη στις Κυψέλες',
        href: '/drastiriotites/peripeteies-stis-kypseles',
        text: 'Δυνατότητα για επίσκεψη στις κυψέλες (με την κατάλληλη προστασία), βιώνοντας από κοντά τον κόσμο του μελισσιού.',
        image: '/images/about/outdoor-hives.png',
      },
      {
        title: 'Μελισσοθεραπεία',
        href: '/drastiriotites/melissotherapeia',
        text: 'Έναν ειδικό χώρο για μελισσοθεραπεία, για όσους αναζητούν τις ευεργετικές ιδιότητες του περιβάλλοντος της κυψέλης.',
        image: '/images/about/outdoor-therapy.png',
      },
    ],
  },

  band: 'Η λειτουργία όλων αυτών των χώρων και δραστηριοτήτων διέπεται από τη δέσμευσή μας για βιώσιμη ανάπτυξη και περιβαλλοντική ευθύνη, η οποία αποδεικνύεται έμπρακτα με την εφαρμογή του διεθνούς προτύπου **ISO 14001**: Σύστημα Περιβαλλοντικής Διαχείρισης. Παράλληλα, αναγνωρίζοντας την υψίστη σημασία της ασφάλειας των τροφίμων, πήραμε την πιστοποίηση **ISO 22000**: Σύστημα Διαχείρισης Ασφάλειας Τροφίμων, ενισχύοντας περαιτέρω την εμπιστοσύνη των καταναλωτών στα προϊόντα μας.',

  family: {
    heading: 'Η Οικογένειά μας',
    members: [
      { name: 'Μέλιος Φιλίππου', role: 'Διευθυντής', photo: '/images/about/family-melios.webp' },
      { name: 'Βαλεντίνος Φιλίππου', role: 'Υποδιευθυντής', photo: '/images/about/family-valentinos.webp' },
      { name: 'Μαρία Σολομωνίδου', role: 'Υπεύθυνη εργοστασίου', photo: '/images/about/family-maria.webp' },
      { name: 'Νίκος Φιλίππου', role: 'Υπεύθυνος παραγωγής (Μελισσοκόμος)', photo: '/images/about/family-nikos.webp' },
      { name: 'Μιχάλης Φιλίππου', role: 'Υπεύθυνος παραγωγής (Μελισσοκόμος)', photo: '/images/about/family-michalis.webp' },
    ] as { name: string; role: string; photo?: string }[],
  },

  goal: {
    eyebrow: 'ΟΡΟΣ ΜΑΧΑΙΡΑ',
    title: 'Στόχος μας',
    body: 'Στόχος μας είναι να παράγουμε και να διαθέτουμε στην αγορά όλα τα προϊόντα της μέλισσας διατηρώντας τα αγνά και θρεπτικά όπως η μέλισσα τα φτιάχνει.',
    image: '/images/about/goal-bg-v3.webp',
    imageAlt: 'Κερί μέλισσας σε ξύλινη επιφάνεια — Όρος Μαχαιρά',
  },
}

// --- Bilingual bundle -----------------------------------------------------

const ABOUT_EL = ABOUT_PAGE
export type AboutContent = typeof ABOUT_EL

const ABOUT_EN: AboutContent = {
  meta: {
    title: 'About Us',
    description:
      'We are a bee-keeping family, working professionally in the bee-keeping sector since 1983 — pure Cypriot honey from the flowers and herbs of Machaira.',
  },

  breadcrumb: [
    { label: 'Home', href: '/' },
    { label: 'About Us' },
  ],

  hero: {
    eyebrow: 'OUR STORY',
    title: 'About Us',
    body: [
      'We are a bee-keeping family. Since 1983, we have been working professionally in the bee-keeping sector. Over all these years, thanks to our hard work and a love of bees, we have managed to build strong relationships with our customers, founded on trust.',
      'We take a responsible approach to the entire process of making honey — from the hive to the consumer — meaning we can ensure the high quality and authenticity of our honey.',
    ],
    image: ABOUT_EL.hero.image,
    imageAlt: 'The Oros Machaira family at the apiary',
    author: {
      name: 'Melios Filippou',
      role: 'Director',
      avatar: ABOUT_EL.hero.author.avatar,
    },
    awardsCta: 'Awards & Distinctions',
  },

  stats: [
    { ...ABOUT_EL.stats[0], label: 'Years of experience' },
    { ...ABOUT_EL.stats[1], label: 'Trusted customers' },
    { ...ABOUT_EL.stats[2], label: 'Tonnes of honey per year' },
    { ...ABOUT_EL.stats[3], label: 'Quality Awards' },
    { ...ABOUT_EL.stats[4], label: 'Points of sale' },
  ],

  values: [
    { ...ABOUT_EL.values[0], title: 'Purity', text: 'Our honey reaches your table exactly as the bee makes it.' },
    { ...ABOUT_EL.values[1], title: 'Environment', text: 'Certified to **ISO 14001** & **ISO 22000** — respect for the land and the bees.' },
    { ...ABOUT_EL.values[2], title: 'Family', text: 'Since 1983, three generations with the same passion for nature and bees.' },
  ],

  indoor: {
    heading: 'In our indoor spaces you will find',
    cards: [
      { ...ABOUT_EL.indoor.cards[0], title: 'Processing & Bottling', text: 'A room for the processing and bottling of our honeys.' },
      { ...ABOUT_EL.indoor.cards[1], title: 'Our History', text: 'A viewing room with our history and the magical world of the bee.' },
      { ...ABOUT_EL.indoor.cards[2], title: 'Reception & Tasting', text: 'A welcoming reception and tasting area to try out our products.' },
    ],
  },

  outdoor: {
    heading: 'And what you will find in our outdoor spaces',
    cta: { label: 'Learn More', href: ABOUT_EL.outdoor.cta.href },
    arrows: { prev: 'Previous', next: 'Next' },
    slides: [
      { ...ABOUT_EL.outdoor.slides[0], title: 'Workshops & Activities', text: 'A specially designed area for conducting workshops and educational activities.' },
      { ...ABOUT_EL.outdoor.slides[1], title: 'Lush Gardens', text: 'Lush gardens featuring apiary plants, providing food for our bees and a beautiful environment for visitors.' },
      { ...ABOUT_EL.outdoor.slides[2], title: 'Educational Games', text: 'Interactive educational games for young and old alike, themed around the bee and its products.' },
      { ...ABOUT_EL.outdoor.slides[3], title: 'Visiting the Hives', text: 'The unique opportunity to visit the hives (with appropriate protection), experiencing the world of the beehive up close.' },
      { ...ABOUT_EL.outdoor.slides[4], title: 'Apitherapy', text: 'A special area dedicated to apitherapy, for those seeking the beneficial properties of the hive environment.' },
    ],
  },

  band: 'The operation of all these spaces and activities is governed by our commitment to sustainable development and environmental responsibility, demonstrated in practice through the implementation of the international standard **ISO 14001**: Environmental Management System. At the same time, recognising the paramount importance of food safety, we obtained **ISO 22000**: Food Safety Management System certification, further strengthening consumer confidence in our products.',

  family: {
    heading: 'Our Family',
    members: [
      { ...ABOUT_EL.family.members[0], name: 'Melios Filippou', role: 'Director' },
      { ...ABOUT_EL.family.members[1], name: 'Valentinos Filippou', role: 'Deputy Director' },
      { ...ABOUT_EL.family.members[2], name: 'Maria Solomonidou', role: 'Plant Manager' },
      { ...ABOUT_EL.family.members[3], name: 'Nikos Filippou', role: 'Production Manager (bee-keeper)' },
      { ...ABOUT_EL.family.members[4], name: 'Michalis Filippou', role: 'Production Manager (bee-keeper)' },
    ],
  },

  goal: {
    eyebrow: 'OROS MACHAIRA',
    title: 'Our Goal',
    body: 'Our goal is to produce and market all bee products while keeping them pure and nutritious, just as the bee makes them.',
    image: ABOUT_EL.goal.image,
    imageAlt: 'Beeswax on a wooden surface — Oros Machaira',
  },
}

/** Locale-aware About content. el = the Greek source of truth, en = the English
 *  bundle above. Read the active locale via next-intl's `getLocale()` (server)
 *  / `useLocale()` (client) at the call site. */
export function getAboutContent(locale: string): AboutContent {
  return locale === 'en' ? ABOUT_EN : ABOUT_EL
}
