/**
 * "Μέλισσες, οι Αφανείς Ήρωες της Φύσης" page content. Greek copy from
 * orosmaxaira.com/afaneis-iroes-tis-fysis (verbatim); the English bundle mirrors
 * orosmaxaira.com/en/afaneis-iroes-tis-fysis. Educational page.
 *
 * The Greek constants are the source of truth. `NATURE_EN` overrides only the
 * user-facing text; images/hrefs are locale-invariant and reused from EL.
 * `getNatureContent(locale)` returns the right bundle — read the active locale
 * via next-intl's `getLocale()` (server) / `useLocale()` (client) at the call site.
 */

export type NatureSection = {
  eyebrow: string
  heading: string
  body: string[]
  bold?: string[]
  image: string
  imageAlt: string
  reversed: boolean
  link?: { label: string; href: string }
}

export type NatureContent = {
  hero: { eyebrow: string; title: string; description: string; image: string; imageAlt: string }
  sections: NatureSection[]
  stats: { value: string; label: string }[]
  matters: {
    eyebrow: string
    heading: string
    image: string
    imageAlt: string
    body: string[]
    emphasis: string[]
  }
  /** Copy passed to the shared <AdoptHiveBanner body=… /> on this page. */
  adoptBody: string
}

const NATURE_EL: NatureContent = {
  hero: {
    eyebrow: 'Γνωρίστε τη μέλισσα',
    title: 'Μέλισσες, οι Αφανείς Ήρωες της Φύσης',
    description:
      'Πολύ περισσότερο από παραγωγοί μελιού — οι μέλισσες κρατούν σε ισορροπία το οικοσύστημα και τη ζωή στον πλανήτη μας.',
    image: '/videos/adopt-hive-poster.jpg',
    imageAlt: 'Μέλισσες σε κηρήθρα',
  },

  sections: [
    {
      eyebrow: 'Επικονίαση',
      heading: 'Οι Μέλισσες είναι οι καλύτεροι επικονιαστές',
      body: [
        'Δεν είναι απλώς παραγωγοί μελισσοκομικών προϊόντων. Είναι απαραίτητες για την ισορροπία του περιβάλλοντός μας και αποτελούν σημαντικό κομμάτι στη διατήρηση της βιοποικιλότητας στον πλανήτη μας.',
        'Το ένα τρίτο περίπου των τροφίμων που καταναλώνουμε καθημερινά εξαρτάται από την επικονίαση, κυρίως των μελισσών. Αυτά τα εργατικά πλάσματα είναι οι επικονιαστές μιας τεράστιας ποικιλίας φυτών, συμπεριλαμβανομένων φρούτων, λαχανικών, ξηρών καρπών και σπόρων.',
        'Με αυτόν τον τρόπο συμβάλλουν σημαντικά στην παγκόσμια διατροφική αλυσίδα, υποστηρίζοντας την αγροτική βιομηχανία και διασφαλίζοντας την ποικιλομορφία της διατροφής μας.',
      ],
      bold: ['απαραίτητες', 'ισορροπία', 'διατροφική αλυσίδα'],
      image: '/images/nature/pollinator.webp',
      imageAlt: 'Μέλισσα επικονιάζει άνθος εχινάκειας',
      reversed: false,
    },
    {
      eyebrow: 'Οικοσύστημα',
      heading: 'Ο απαραίτητος ρόλος των μελισσών στο οικοσύστημά μας',
      body: [
        'Οι μέλισσες υποβοηθούν τη βιοποικιλότητα λόγω του είδους της επικονίασης που κάνουν. Καθώς μετακινούνται από το ένα φυτό στο άλλο, μεταφέρουν τη γύρη, διευκολύνοντας την αναπαραγωγή τους.',
        'Έτσι προωθούν την υγιή ανάπτυξη ποικίλων ειδών φυτών και υποστηρίζουν ένα ευρύτερο φάσμα ζώων και άλλων επικονιαστών.',
        'Αυτό εξασφαλίζει ένα πιο ανθεκτικό και ισορροπημένο οικοσύστημα, και κατ’ επέκταση έναν υγιέστερο πλανήτη.',
      ],
      bold: ['υγιή ανάπτυξη', 'φυτών', 'υγιέστερο πλανήτη'],
      image: '/images/nature/ecosystem.webp',
      imageAlt: 'Μέλισσες πάνω στα πλαίσια της κυψέλης',
      reversed: true,
      link: { label: 'Υιοθετήστε μια κυψέλη', href: '/adopt-a-hive' },
    },
  ],

  stats: [
    { value: '1/3', label: 'της τροφής μας εξαρτάται από την επικονίαση' },
    { value: '80%', label: 'της επικονίασης παγκοσμίως γίνεται από τις μέλισσες' },
    { value: '75%', label: 'των καλλιεργειών τροφίμων εξαρτώνται από επικονιαστές' },
  ],

  matters: {
    eyebrow: 'Προστασία',
    heading: 'Γιατί Κάθε Μέλισσα Μετράει;',
    image: '/images/nature/pollinators-3.webp',
    imageAlt: 'Δύο μέλισσες επικονιάζουν πορτοκαλί λουλούδι',
    body: [
      'Σε όλον τον πλανήτη, οι πληθυσμοί των μελισσών μειώνονται λόγω απώλειας των οικοτόπων, της κλιματικής αλλαγής, των χημικών και των φυτοφαρμάκων, των ασθενειών, και διαφόρων άλλων παραγόντων.',
      'Η μείωση του πληθυσμού των μελισσών αποτελεί κίνδυνο για τη διατροφική αλυσίδα.',
      'Η διατήρηση υγιών πληθυσμών μελισσών δεν αφορά απλώς τη διάσωση ενός μεμονωμένου είδους. Αφορά τη διατήρηση του ιστού της ζωής που συντηρεί τον πλανήτη μας.',
      'Κατανοώντας και εκτιμώντας τη σημαντική αξία των μελισσών, μπορούμε όλοι να λάβουμε ενεργά μέτρα για την προστασία τους και να διασφαλίσουμε ένα υγιές, βιώσιμο μέλλον.',
    ],
    emphasis: ['απώλειας των οικοτόπων', 'κλιματικής αλλαγής', 'χημικών και των φυτοφαρμάκων', 'ασθενειών'],
  },

  adoptBody:
    'Το πρόγραμμα «Υιοθετώ μια κυψέλη» είναι ένα σημαντικό βήμα προς αυτήν την κατεύθυνση, προσφέροντας έναν τρόπο στους ανθρώπους να συνεισφέρουν άμεσα στη διατήρηση αυτών των ζωτικής σημασίας πλασμάτων.',
}

const NATURE_EN: NatureContent = {
  hero: {
    eyebrow: 'Get to know the bee',
    title: 'Bees, Nature’s Unsung Heroes',
    description:
      'Far more than honey producers — bees keep our ecosystem, and life on our planet, in balance.',
    image: NATURE_EL.hero.image,
    imageAlt: 'Bees on a honeycomb',
  },

  sections: [
    {
      eyebrow: 'Pollination',
      heading: 'Bees are the Best Pollinators',
      body: [
        'Bees do more than just produce honey. They are crucial to the balance of our environment and an integral part of preserving the biodiversity of our planet.',
        'Approximately one-third of the food we consume daily depends mainly on pollination by bees. These hard-working creatures pollinate a vast variety of plants, including fruits, vegetables, nuts and seeds.',
        'In doing so, they make a significant contribution to the global food chain, supporting the agricultural industry and ensuring the diversity of our diet.',
      ],
      bold: ['crucial', 'balance', 'global food chain'],
      image: NATURE_EL.sections[0].image,
      imageAlt: 'A bee pollinating an echinacea flower',
      reversed: false,
    },
    {
      eyebrow: 'Ecosystem',
      heading: 'The Indispensable Role of Bees in Our Ecosystem',
      body: [
        'Bees are pivotal in supporting biodiversity thanks to their unique pollination methods. As they move from one plant to another, they distribute pollen, enabling those plants to reproduce.',
        'In this way they promote the healthy growth of a wide variety of plant species and support a broader range of animals and other pollinators.',
        'This ensures a more resilient and balanced ecosystem, and therefore a healthier planet.',
      ],
      bold: ['healthy growth', 'plant species', 'healthier planet'],
      image: NATURE_EL.sections[1].image,
      imageAlt: 'Bees on the frames of a hive',
      reversed: true,
      link: { label: 'Adopt a Hive', href: NATURE_EL.sections[1].link!.href },
    },
  ],

  stats: [
    { value: '1/3', label: 'of our food depends on pollination' },
    { value: '80%', label: 'of pollination worldwide is carried out by bees' },
    { value: '75%', label: 'of food crops depend on pollinators' },
  ],

  matters: {
    eyebrow: 'Protection',
    heading: 'Why Does Every Single Bee Matter?',
    image: NATURE_EL.matters.image,
    imageAlt: 'Two bees pollinating an orange flower',
    body: [
      'Across the planet, bee populations are in decline due to habitat loss, climate change, chemicals and pesticides, diseases and various other factors.',
      'This decline in the bee population poses a risk to the food chain.',
      'Maintaining healthy bee populations is more than just saving a single species; it is about preserving the web of life that sustains our planet.',
      'By understanding and appreciating the critical value bees provide, we can all take active steps to protect them and ensure a healthy, sustainable future.',
    ],
    emphasis: ['habitat loss', 'climate change', 'chemicals and pesticides', 'diseases'],
  },

  adoptBody:
    'The “Adopt a Hive” programme is an important step in this direction, offering a way for people to directly contribute to the conservation of these vital creatures.',
}

/** Locale-aware content for the "Nature’s Unsung Heroes" page. el = Greek source,
 *  en = the bundle above. */
export function getNatureContent(locale: string): NatureContent {
  return locale === 'en' ? NATURE_EN : NATURE_EL
}
