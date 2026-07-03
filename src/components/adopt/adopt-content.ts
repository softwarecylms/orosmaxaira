/**
 * "Υιοθετώ μια Κυψέλη" (Adopt a Hive) — B2B programme page content.
 * Copy sourced from orosmaxaira.com/yiotheto-mia-kypseli (lightly tightened).
 * Assets optimised into /public/images/adopt/ (hero, 14 gallery photos, 11 logos).
 * Data-only module mirroring the site's *-content.ts convention.
 */

export type AdoptBenefitIcon = 'Sprout' | 'Users' | 'GraduationCap'

export const ADOPT_PAGE = {
  hero: {
    wordmark: '/images/adopt/adopt-logo.webp',
    image: '/images/adopt/hero.webp',
    imageAlt:
      'Ομάδα εργαζομένων με στολές μελισσοκόμου γύρω από μια κηρήθρα στο μελισσοκομείο του Όρους Μαχαιρά',
    // Tagline renders with «Bee-come a Hero» in accent gold.
    taglinePre:
      'Γίνε και εσύ με την ομάδα σου μέρος του προγράμματος «Υιοθετώ μια κυψέλη» και…',
    taglineAccent: '«Bee-come a Hero»',
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
        pills: ['Απρίλιος – Αύγουστος', 'έως 25 άτομα'],
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
        pills: ['Ιούνιος – Οκτώβριος', 'έως 25 άτομα'],
        activities: [
          {
            text:
              'Το δεύτερο γκρουπ της ομάδας σας ζει όλες τις δραστηριότητες της πρώτης επίσκεψης — εκτός από το βάψιμο της κυψέλης.',
          },
          {
            text:
              '≈20 κιλά μέλι ανά κυψέλη, σε φιάλες των 250g — αποκλειστικά εταιρικά δώρα για τους εργαζομένους ή τους πελάτες σας.',
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
    impactHeading: 'Γιατί Έχει Σημασία;',
    impact: [
      { value: '75%', text: 'των παγκόσμιων καλλιεργειών τροφίμων εξαρτώνται από επικονιαστές.' },
      { value: '80%', text: 'της επικονίασης παγκοσμίως γίνεται από τις μέλισσες.' },
    ],
    closing:
      'Υιοθετώντας μια κυψέλη, η εταιρεία σας προστατεύει αυτά τα ανεκτίμητα έντομα — και μαζί, τον πλανήτη μας.',
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
        q: 'Μπορώ να συμμετέχω αν δεν έχω επιχείρηση;',
        a: 'Ναι, υπάρχουν επιλογές και για μεμονωμένα άτομα.',
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

  cta: {
    eyebrow: 'Υιοθετώ μια κυψέλη',
    heading:
      'Επικοινωνήστε μαζί μας σήμερα και γίνετε κι εσείς μέρος αυτής της προσπάθειας.',
    body:
      'Η ομάδα μας θα σχεδιάσει μαζί σας την εμπειρία που ταιριάζει στην εταιρεία σας.',
    primary: { label: 'Επικοινωνήστε μαζί μας', href: '/contact' },
    tel: { label: '25622305', href: 'tel:+35725622305' },
    contact: {
      company: 'M.F. (OROS MAXAIRA) LTD',
      phone: '25622305',
      phoneHref: 'tel:+35725622305',
      address: 'Melini, Larnaca 7716 · P.O. BOX 7718',
      hours: 'Δευτ – Παρ 08:00–16:00 · Σαβ – Κυρ κατόπιν ραντεβού',
    },
  },
} as const
