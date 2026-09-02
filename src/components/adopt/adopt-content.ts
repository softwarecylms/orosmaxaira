/**
 * "Υιοθετώ μια Κυψέλη" (Adopt a Hive) — B2B programme page content.
 * Copy sourced from orosmaxaira.com/yiotheto-mia-kypseli (lightly tightened).
 * Assets optimised into /public/images/adopt/ (hero, 14 gallery photos, 11 logos).
 * Data-only module mirroring the site's *-content.ts convention.
 *
 * Bilingual: the Greek object (ADOPT_EL) is the source of truth and stays the
 * default. ADOPT_EN overrides only user-facing text — images, hrefs, video,
 * logos, gallery, icons and stat values are locale-invariant and reused from EL.
 * English copy is the live site's own English where it exists
 * (orosmaxaira.com/en/yiotheto-mia-kypseli) and faithful translations for the
 * bespoke sections the live EN site lays out differently. Read the active locale
 * via next-intl's `getLocale()` (server) / `useLocale()` (client) and pass it to
 * `getAdoptContent()` at the call site.
 */

export type AdoptBenefitIcon = 'Sprout' | 'Users' | 'GraduationCap'

const ADOPT_EL = {
  meta: {
    title: 'Υιοθετώ μια Κυψέλη',
    description:
      'Εταιρικό πρόγραμμα «Υιοθετώ μια Κυψέλη» του Όρους Μαχαιρά: υιοθετήστε μια κυψέλη, ζήστε μια μοναδική βιωματική εμπειρία με την ομάδα σας και στηρίξτε τις μέλισσες και το περιβάλλον.',
  },

  hero: {
    wordmark: '/images/adopt/adopt-logo.webp',
    wordmarkAlt: 'Adopt a Hive — Όρος Μαχαιρά',
    image: '/images/adopt/hero.webp',
    imageAlt:
      'Ομάδα εργαζομένων με στολές μελισσοκόμου γύρω από μια κηρήθρα στο μελισσοκομείο του Όρους Μαχαιρά',
    // Tagline renders with Bee-come a Hero in accent gold.
    taglinePre:
      'Γίνε και εσύ με την ομάδα σου μέρος του προγράμματος «Υιοθετώ μια κυψέλη» και…',
    taglineAccent: 'Bee-come a Hero',
    taglinePost: 'για τις μέλισσες και το περιβάλλον.',
    ctaPrimary: { label: 'Υιοθετήστε μια κυψέλη', href: '#cta' },
    ctaSecondary: { label: 'Δείτε το πακέτο', href: '#package' },
  },

  stats: [
    { value: '200', label: 'κυψέλες — ο στόχος μας' },
    { value: '6,000,000', label: 'μέλισσες' },
    { value: '11', label: 'εταιρείες-μέλη' },
    { value: '1', label: 'έτος, ανανεώσιμο' },
  ] as { value: string; label: string }[],

  intro: {
    eyebrow: 'Η Πρωτοβουλία',
    hook:
      'Τι θα γινόταν άραγε αν κάθε εταιρεία δεν περιοριζόταν μόνο σε επιχειρηματικούς στόχους, αλλά διεύρυνε τις δράσεις της και σε περιβαλλοντικά θέματα;',
    body:
      'Το πρόγραμμα “Υιοθετώ μια κυψέλη” είναι μια πρωτοποριακή πρωτοβουλία από το «Όρος Μαχαιρά» η οποία προσφέρει μια μοναδική ευκαιρία σε κάθε εταιρεία να συνεισφέρει άμεσα στην ευημερία του πλανήτη μας ενισχύοντας παράλληλα το πνεύμα της ομαδικότητας και συνεργασίας μεταξύ των εργαζομένων.',
    ctaLabel: 'Υιοθετήστε μια κυψέλη',
    whyHeading: 'Γιατί να Υιοθετήσετε μια Κυψέλη;',
    benefits: [
      {
        icon: 'Sprout',
        title: 'Σώζετε τους επικονιαστές',
        text: 'Κάθε κυψέλη ενισχύει τον πληθυσμό των μελισσών και τον πολλαπλασιασμό των φυτών.',
      },
      {
        icon: 'Users',
        title: 'Δένετε την ομάδα σας',
        text: 'Μια μοναδική ομαδική εμπειρία μακριά από το γραφείο, μέσα στη φύση.',
      },
      {
        icon: 'GraduationCap',
        title: 'Αποκτάτε γνώση & εμπειρία',
        text: 'Πρακτική επαφή με τον κόσμο της μελισσοκομίας και του οικοσυστήματος.',
      },
    ] as { icon: AdoptBenefitIcon; title: string; text: string }[],
  },

  package: {
    eyebrow: 'Το Πρόγραμμα',
    heading: 'Τι Περιλαμβάνει το Πακέτο;',
    steps: [
      {
        num: '01',
        title: 'Υιοθεσία Κυψέλης',
        text: 'Μια κυψέλη υιοθετείται και συντηρείται από εμάς στο όνομα της εταιρείας σας.',
      },
      {
        num: '02',
        title: 'Επισκέψεις στο Μελισσοκομείο',
        text: 'Δύο βιωματικές επισκέψεις της ομάδας σας — έως 25 άτομα ανά επίσκεψη.',
        link: { label: 'Δείτε τις δύο επισκέψεις', href: '#visits' },
      },
      {
        num: '03',
        title: 'Πιστοποιητικό Υιοθεσίας',
        text: 'Επίσημο πιστοποιητικό που αναγνωρίζει τη συνεισφορά σας στη διατήρηση των μελισσών.',
      },
    ],
  },

  visits: {
    eyebrow: 'Η Εμπειρία',
    heading: 'Οι Δύο Επισκέψεις',
    sub: 'Δύο ξεχωριστές ημέρες βιωματικής εμπειρίας για τις ομάδες σας.',
    items: [
      {
        title: 'Πρώτη Επίσκεψη',
        image: '/images/adopt/gallery/03.webp',
        imageClass: 'object-[center_80%]',
        pills: ['Απρίλιος–Αύγουστος', 'έως 25 άτομα'],
        activities: [
          {
            text:
              'Εκπαιδευτική περιήγηση & γνωριμία με τις μέλισσες — η ομάδα ντύνεται μελισσοκόμοι και επισκέπτεται τις κυψέλες με την καθοδήγηση των έμπειρων μελισσοκόμων μας.',
          },
          {
            text:
              'Παρακολούθηση εκπαιδευτικού σεμιναρίου για τον ρόλο των μελισσών στο οικοσύστημα και τη σημασία τους για το περιβάλλον.',
          },
          { text: 'Γευσιγνωσία & εμφιάλωση φρέσκου μελιού κατευθείαν από την κυψέλη.' },
          { text: 'Βάψιμο της κυψέλης στα χρώματα της εταιρείας σας — μια δημιουργική ομαδική δραστηριότητα.' },
        ],
      },
      {
        title: 'Δεύτερη Επίσκεψη',
        image: '/images/adopt/visit-2.webp',
        imageClass: 'object-[center_82%]',
        pills: ['Ιούνιος–Οκτώβριος', 'έως 25 άτομα'],
        activities: [
          {
            text:
              'Το δεύτερο γκρουπ της ομάδας σας ζει όλες τις δραστηριότητες της πρώτης επίσκεψης — εκτός από το βάψιμο της κυψέλης.',
          },
          {
            text:
              'Περίπου 20 kg μέλι ανά κυψέλη, σε βάζα των 250 g — αποκλειστικά εταιρικά δώρα για τους εργαζομένους ή τους πελάτες σας.',
          },
          {
            text:
              'Η κυψέλη συντηρείται από έμπειρους μελισσοκόμους στο όνομα της εταιρείας σας, καθ’ όλη τη διάρκεια της υιοθεσίας.',
          },
          { text: 'Λαμβάνετε τακτικά reports & videos με την πραγματική κατάσταση του μελισσιού σας.' },
        ],
      },
    ],
  },

  gallery: {
    eyebrow: 'Στιγμές',
    heading: 'Η Εμπειρία σε Εικόνες',
    // Decorative grid tiles — the section heading labels them, so empty alt
    // keeps screen readers from announcing 14 near-identical numbered strings.
    images: Array.from({ length: 14 }, (_, i) => ({
      src: `/images/adopt/gallery/${String(i + 1).padStart(2, '0')}.webp`,
      alt: '',
    })),
  },

  goal: {
    eyebrow: 'Ο Στόχος μας',
    headingLines: ['200 κυψέλες.', '6.000.000 μέλισσες.'],
    body:
      'Δεν πρόκειται μόνο για τη διάσωση των μελισσών. Πρόκειται για τη διάσωση του πλανήτη μας και της βιοποικιλότητας που τον συντηρεί.',
    linkLabel: 'Αφανείς Ήρωες της Φύσης',
    linkHref: '/afaneis-iroes-tis-fysis',
    impactHeading: 'Γιατί Έχει Σημασία;',
    impact: [
      { value: '75%', text: 'των παγκόσμιων καλλιεργειών τροφίμων εξαρτώνται από επικονιαστές.' },
      { value: '80%', text: 'της επικονίασης παγκοσμίως γίνεται από τις μέλισσες.' },
    ],
    closing:
      'Υιοθετώντας μια κυψέλη, η εταιρεία σας προστατεύει αυτά τα ανεκτίμητα έντομα — και μαζί, τον πλανήτη μας.',
  },

  progress: {
    eyebrow: 'Η Πρόοδός μας',
    heading: 'Μαζί, προς τις 200 κυψέλες',
    unit: 'κυψέλες',
    adopted: 'υιοθετήθηκαν μέχρι σήμερα',
    ofGoal: 'του στόχου',
    remainingPre: 'Απομένουν',
    remainingPost: 'για να πετύχουμε τον στόχο μας.',
    cta: 'Υιοθετήστε μια κυψέλη',
  },

  faq: {
    eyebrow: 'Απορίες',
    heading: 'Συχνές Ερωτήσεις',
    intro: 'Ό,τι χρειάζεται να ξέρετε πριν γίνετε μέρος του προγράμματος.',
    cta: { label: 'Έχετε άλλη ερώτηση;', href: '#cta' },
    items: [
      {
        q: 'Χρειάζεται να έχω γνώσεις μελισσοκομίας για να συμμετέχω;',
        a: 'Όχι. Η φροντίδα της κυψέλης γίνεται εξ ολοκλήρου από την ομάδα μας και τους έμπειρους μελισσοκόμους της.',
      },
      {
        q: 'Πού βρίσκονται οι κυψέλες;',
        a: 'Οι κυψέλες φιλοξενούνται σε ελεγχόμενους φυσικούς χώρους, στις εγκαταστάσεις του Όρους Μαχαιρά.',
      },
      {
        q: 'Πόσο διαρκεί η υιοθεσία μιας κυψέλης;',
        a: 'Κάθε υιοθεσία διαρκεί ένα έτος, με δυνατότητα ανανέωσης.',
      },
    ],
  },

  partners: {
    eyebrow: 'Εταιρείες-μέλη',
    heading: 'Οι Εταιρείες που μας Εμπιστεύτηκαν',
    logos: [
      { src: '/images/adopt/logos/ecombare.webp', alt: 'ecombare' },
      { src: '/images/adopt/logos/smt-shipping.webp', alt: 'SMT Shipping' },
      { src: '/images/adopt/logos/gac.webp', alt: 'GAC' },
      { src: '/images/adopt/logos/uniteam-marine.webp', alt: 'Uniteam Marine' },
      { src: '/images/adopt/logos/sassy-events.webp', alt: 'Sassy Events' },
      { src: '/images/adopt/logos/gymnasio-agiou-vasileiou.webp', alt: 'Γυμνάσιο Αγίου Βασιλείου Στροβόλου' },
      { src: '/images/adopt/logos/goldman-solutions.webp', alt: 'Goldman Solutions' },
      { src: '/images/adopt/logos/cyprus-duty-free.webp', alt: 'Cyprus Duty Free' },
      { src: '/images/adopt/logos/amdocs.webp', alt: 'Amdocs' },
      { src: '/images/adopt/logos/playrix.webp', alt: 'Playrix' },
      { src: '/images/adopt/logos/genpro.webp', alt: 'GENPRO' },
    ] as { src: string; alt: string }[],
  },

  testimonials: {
    eyebrow: 'Μαρτυρίες',
    heading: 'Τι Λένε οι Ομάδες που μας Επισκέφθηκαν',
    items: [
      {
        quote:
          'Σε ευχαριστώ πολύ για την εξαιρετική συνεργασία στην πρώτη μας επίσκεψη. Όλοι επιστρέψαμε γεμάτοι ενθουσιασμό και καινούριες γνώσεις! Νομίζω ότι ο στόχος της επιμόρφωσης μέσω εμπειριών επιτεύχθηκε, και εκτιμώ πολύ το ζεστό καλωσόρισμα και την ξενάγηση. Είμαι πολύ χαρούμενη που θα συνεργαστούμε φέτος!',
        name: 'Antigoni Pafiti',
        role: 'Sustainability Officer',
      },
      {
        quote:
          'Our guests and we absolutely loved the event on Saturday and we will definitely be offering this kind of experience again!',
        name: 'Abi Thatcher Heitmann',
        role: 'Business Development Director',
      },
      {
        quote:
          'I wanted to extend my heartfelt appreciation for the wonderful experience we had last Friday. It was indeed a great learning opportunity for all of us, and we’re eagerly looking forward to our next trip after the summer.',
        name: 'Chloe Timmis',
        role: 'Crewing Administration Manager',
      },
      {
        quote:
          'Σε ευχαριστούμε πολύ. Περάσαμε πολύ όμορφα και τα παιδιά συζητούσαν πως ήταν από τις καλύτερες επισκέψεις που έχουν πάει.',
        name: 'Κατερίνα Τορτούρη',
        role: 'Καθηγήτρια Σχεδιασμού & Τεχνολογίας',
      },
    ] as { quote: string; name: string; role: string }[],
  },

  form: {
    firstName: 'Όνομα*',
    lastName: 'Επίθετο*',
    email: 'Email*',
    phone: 'Τηλέφωνο',
    message: 'Μήνυμα*',
    submit: 'Αποστολή',
    thankYou:
      'Σας ευχαριστούμε! Το μήνυμά σας στάλθηκε — θα επικοινωνήσουμε σύντομα μαζί σας. 🐝',
  },

  cta: {
    eyebrow: 'Υιοθετώ μια κυψέλη',
    heading:
      'Επικοινωνήστε μαζί μας σήμερα και γίνετε κι εσείς μέρος αυτής της προσπάθειας.',
    body:
      'Η ομάδα μας θα σχεδιάσει μαζί σας την εμπειρία που ταιριάζει στην εταιρεία σας.',
    primary: { label: 'Επικοινωνήστε μαζί μας', href: '/epikoinonia' },
    tel: { label: '+357 25 622 305', href: 'tel:+35725622305' },
    contact: {
      company: 'M.F. (OROS MAXAIRA) LTD',
      phone: '+357 25 622 305',
      phoneHref: 'tel:+35725622305',
      address: 'Melini, Larnaca 7716 · P.O. BOX 7718',
      hours: 'Δευ–Παρ 08:00–16:00 · Σαβ–Κυρ κατόπιν ραντεβού',
    },
  },
}

export type AdoptContent = typeof ADOPT_EL

// English bundle. Live-site English (orosmaxaira.com/en/yiotheto-mia-kypseli)
// where it exists; faithful translations for the bespoke sections. Images,
// hrefs, video, logos, gallery, icons and stat values are reused from EL.
const ADOPT_EN: AdoptContent = {
  meta: {
    title: 'Adopt a Hive',
    description:
      'The “Adopt a Hive” corporate programme by Oros Machaira: adopt a hive, share a unique hands-on experience with your team and support the bees and the environment.',
  },

  hero: {
    wordmark: ADOPT_EL.hero.wordmark,
    wordmarkAlt: 'Adopt a Hive — Oros Machaira',
    image: ADOPT_EL.hero.image,
    imageAlt:
      'A team of employees in beekeeper suits gathered around a honeycomb at the Oros Machaira apiary',
    taglinePre:
      'Join our “Adopt a Hive” programme with your team and…',
    taglineAccent: 'Bee-come a Hero',
    taglinePost: 'for the bees and the environment.',
    ctaPrimary: { label: 'Adopt a Hive', href: ADOPT_EL.hero.ctaPrimary.href },
    ctaSecondary: { label: 'See the package', href: ADOPT_EL.hero.ctaSecondary.href },
  },

  stats: [
    { value: '200', label: 'hives — our goal' },
    { value: '6,000,000', label: 'bees' },
    { value: '11', label: 'member companies' },
    { value: '1', label: 'year, renewable' },
  ],

  intro: {
    eyebrow: 'The Initiative',
    hook:
      'What if a company looked beyond its commercial goals, to the needs of the environment as well?',
    body:
      'The “Adopt a Hive” programme is a pioneering initiative by Oros Machaira that gives your company a direct way to support pollinators and the environment, while bringing your team closer together.',
    ctaLabel: 'Adopt a Hive',
    whyHeading: 'Why Adopt a Hive?',
    benefits: [
      {
        icon: 'Sprout',
        title: 'You help protect pollinators',
        text: 'Every hive supports bee populations and the pollination of plants.',
      },
      {
        icon: 'Users',
        title: 'You connect your team',
        text: 'A unique team experience away from the office, out in nature.',
      },
      {
        icon: 'GraduationCap',
        title: 'You gain knowledge and experience',
        text: 'Hands-on insight into beekeeping and the ecosystem it depends on.',
      },
    ],
  },

  package: {
    eyebrow: 'The Programme',
    heading: 'What Does the Package Include?',
    steps: [
      {
        num: '01',
        title: 'Hive Adoption',
        text: 'We set up and maintain a hive in your company’s name.',
      },
      {
        num: '02',
        title: 'Visits to the Apiary',
        text: 'Two hands-on visits for your team — up to 25 people per visit.',
        link: { label: 'See the two visits', href: '#visits' },
      },
      {
        num: '03',
        title: 'Certificate of Adoption',
        text: 'An official certificate recognising your contribution to bee conservation.',
      },
    ],
  },

  visits: {
    eyebrow: 'The Experience',
    heading: 'The Two Visits',
    sub: 'Two distinct days of hands-on experience for your teams.',
    items: [
      {
        title: 'First Visit',
        image: ADOPT_EL.visits.items[0].image,
        imageClass: ADOPT_EL.visits.items[0].imageClass,
        pills: ['April–August', 'up to 25 people'],
        activities: [
          {
            text:
              'Educational tour & introduction to the bees — the team dresses as beekeepers and visits the hives under the guidance of our experienced beekeepers.',
          },
          {
            text:
              'An educational seminar on the role of bees in the ecosystem and their importance to the environment.',
          },
          { text: 'Honey tasting & bottling of fresh honey straight from the hive.' },
          { text: 'Painting the hive in your company’s colours — a creative team-building activity.' },
        ],
      },
      {
        title: 'Second Visit',
        image: ADOPT_EL.visits.items[1].image,
        imageClass: ADOPT_EL.visits.items[1].imageClass,
        pills: ['June–October', 'up to 25 people'],
        activities: [
          {
            text:
              'The second group takes part in the same activities as the first visit, apart from painting the hive.',
          },
          {
            text:
              'Approx. 20 kg of honey per hive, in 250 g jars — exclusive corporate gifts for your employees or clients.',
          },
          {
            text:
              'The hive is maintained by experienced beekeepers in the name of your company throughout the adoption.',
          },
          { text: 'You receive regular updates and video reports on how your hive is doing.' },
        ],
      },
    ],
  },

  gallery: {
    eyebrow: 'Moments',
    heading: 'The Experience in Pictures',
    images: ADOPT_EL.gallery.images,
  },

  goal: {
    eyebrow: 'Our Goal',
    headingLines: ['200 hives.', '6,000,000 bees.'],
    body:
      'This is not only about saving the bees. It is about saving our planet and the biodiversity that sustains it.',
    linkLabel: 'The Unsung Heroes of Nature',
    linkHref: ADOPT_EL.goal.linkHref,
    impactHeading: 'Why Does It Matter?',
    impact: [
      { value: '75%', text: 'of the world’s food crops depend on pollinators.' },
      { value: '80%', text: 'of all pollination worldwide is carried out by bees.' },
    ],
    closing:
      'By adopting a hive, your company protects these invaluable insects — and, with them, our planet.',
  },

  progress: {
    eyebrow: 'Our Progress',
    heading: 'Together, toward 200 hives',
    unit: 'hives',
    adopted: 'adopted so far',
    ofGoal: 'of the goal',
    remainingPre: '',
    remainingPost: 'remaining to reach our goal.',
    cta: 'Adopt a Hive',
  },

  faq: {
    eyebrow: 'Questions',
    heading: 'Frequently Asked Questions',
    intro: 'Everything you need to know before joining the programme.',
    cta: { label: 'Have another question?', href: ADOPT_EL.faq.cta.href },
    items: [
      {
        q: 'Do I need any beekeeping knowledge to take part?',
        a: 'No. The hive is fully managed by our team and its expert beekeepers.',
      },
      {
        q: 'Where are the hives located?',
        a: 'The hives are hosted in controlled natural areas within the premises of Oros Machaira.',
      },
      {
        q: 'How long does a hive adoption last?',
        a: 'Each adoption lasts one year, with the option to renew.',
      },
    ],
  },

  partners: {
    eyebrow: 'Member companies',
    heading: 'The companies who trust us',
    logos: ADOPT_EL.partners.logos,
  },

  testimonials: {
    eyebrow: 'Testimonials',
    heading: 'What the Teams Who Visited Us Say',
    // Two of the four testimonials were given in Greek; translated here so the
    // English page never shows Greek quotes (the other two were written in English).
    items: [
      {
        quote:
          'Thank you so much for the excellent collaboration on our first visit. We all came back full of enthusiasm and new knowledge! I think the goal of learning through experience was achieved, and I really appreciate the warm welcome and the tour. I am delighted that we will be working together again this year!',
        name: 'Antigoni Pafiti',
        role: 'Sustainability Officer',
      },
      {
        quote:
          'Our guests and we absolutely loved the event on Saturday and we will definitely be offering this kind of experience again!',
        name: 'Abi Thatcher Heitmann',
        role: 'Business Development Director',
      },
      {
        quote:
          'I wanted to extend my heartfelt appreciation for the wonderful experience we had last Friday. It was indeed a great learning opportunity for all of us, and we’re eagerly looking forward to our next trip after the summer.',
        name: 'Chloe Timmis',
        role: 'Crewing Administration Manager',
      },
      {
        quote:
          'Thank you so much. We had a wonderful time, and the children were saying it was one of the best visits they have ever been on.',
        name: 'Katerina Tortouri',
        role: 'Design & Technology Teacher',
      },
    ],
  },

  form: {
    firstName: 'Name*',
    lastName: 'Surname*',
    email: 'Email*',
    phone: 'Telephone',
    message: 'Message*',
    submit: 'Send',
    thankYou:
      'Thank you! Your message has been sent — we will get in touch with you soon. 🐝',
  },

  cta: {
    eyebrow: 'Adopt a Hive',
    heading:
      'Get in touch with us today and become part of this effort too.',
    body:
      'Our team will design, together with you, the experience that best suits your company.',
    primary: { label: 'Contact us', href: ADOPT_EL.cta.primary.href },
    tel: ADOPT_EL.cta.tel,
    contact: {
      company: ADOPT_EL.cta.contact.company,
      phone: ADOPT_EL.cta.contact.phone,
      phoneHref: ADOPT_EL.cta.contact.phoneHref,
      address: ADOPT_EL.cta.contact.address,
      hours: 'Mon–Fri 08:00–16:00 · Sat–Sun by appointment',
    },
  },
}

/** Locale-aware Adopt-a-Hive content. el = the Greek source of truth, en = the
 *  English bundle above. Read the active locale via next-intl's `getLocale()`
 *  (server) / `useLocale()` (client) at the call site. */
export function getAdoptContent(locale: string): AdoptContent {
  return locale === 'en' ? ADOPT_EN : ADOPT_EL
}
