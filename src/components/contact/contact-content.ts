/**
 * Contact page content (Figma 146:957). All Greek copy + asset paths in one
 * place, mirroring the home page's content-module pattern.
 *
 * The Greek `CONTACT_PAGE` below is the source of truth and stays byte-stable.
 * `CONTACT_PAGE_EN` overrides only the user-facing text; hrefs, images, phone,
 * email, map coords/embeds and icon keys are locale-invariant and reused.
 * Read the active locale via next-intl's `getLocale()` (server) /
 * `useLocale()` (client) and call `getContactContent(locale)`.
 */

export type ContactIcon = 'hours' | 'phone' | 'location' | 'email'
export type ValueIcon = 'purity' | 'eco' | 'family'

export const CONTACT_PAGE = {
  meta: {
    title: 'Επικοινωνία',
  },

  breadcrumb: [
    { label: 'Αρχική', href: '/' },
    { label: 'Επικοινωνία' },
  ] as { label: string; href?: string }[],

  hero: {
    title: 'Επικοινωνήστε μαζί μας',
    image: '/images/contact/hero.webp',
    imageAlt: 'Μελισσοκόμοι Όρος Μαχαιρά στο μελισσοκομείο',
  },

  // Pinned apiary location. `embedSrc` is Google Maps' keyless embed (the pin
  // coords resolved from the shared maps.app.goo.gl link); `link` opens the
  // full interactive map in a new tab.
  map: {
    title: 'Πού θα μας βρείτε',
    embedSrc:
      'https://www.google.com/maps?q=34.8649955,33.1669842&z=16&hl=el&output=embed',
    link: 'https://maps.app.goo.gl/EUCGrKmDcbkCV8CL7',
    label: 'Όρος Μαχαιρά — τοποθεσία στον χάρτη',
    openLabel: 'Άνοιγμα στο Google Maps',
  },

  connect: {
    heading: 'Συνδεθείτε μαζί μας',
    body: [
      {
        text: 'Αν ενδιαφέρεστε να επισκεφτείτε το μελισσοκομείο μας και να ζήσετε τις βιωματικές δραστηριότητες που προσφέρει, μπορείτε να το κάνετε ',
      },
      { text: 'εδώ', href: '/drastiriotites', accent: true },
      { text: '.' },
    ] as { text: string; href?: string; accent?: boolean }[],
    items: [
      {
        icon: 'hours' as ContactIcon,
        title: 'Ώρες Λειτουργίας',
        lines: ['Δευτέρα - Παρασκευή: 8πμ - 4μμ'],
      },
      {
        icon: 'phone' as ContactIcon,
        title: 'Τηλέφωνο',
        lines: ['25 622 305'],
        href: 'tel:+35725622305',
      },
      {
        icon: 'location' as ContactIcon,
        title: 'Επισκεφθείτε μας',
        lines: ['Μελίνη, Λάρνακα 7716', 'P.O.BOX: 7718'],
        href: 'https://maps.app.goo.gl/EUCGrKmDcbkCV8CL7',
      },
      {
        icon: 'email' as ContactIcon,
        title: 'Email',
        lines: ['info@orosmaxaira.com'],
        href: 'mailto:info@orosmaxaira.com',
      },
    ] as { icon: ContactIcon; title: string; lines: string[]; href?: string }[],
  },

  form: {
    heading: 'Στείλτε μας ένα μήνυμα',
    firstName: 'Όνομα*',
    lastName: 'Επίθετο*',
    email: 'Email*',
    phone: 'Τηλέφωνο',
    message: 'Μήνυμα*',
    submit: 'Αποστολή',
    thankYou:
      'Σας ευχαριστούμε! Το μήνυμά σας στάλθηκε — θα επικοινωνήσουμε σύντομα μαζί σας. 🐝',
  },

  values: [
    {
      icon: 'purity' as ValueIcon,
      title: 'Αγνότητα',
      text: 'Το μέλι μας φτάνει στο τραπέζι σας ακριβώς όπως το φτιάχνει η μέλισσα.',
    },
    {
      icon: 'eco' as ValueIcon,
      title: 'Περιβάλλον',
      text: 'Πιστοποιημένοι με **ISO 14001** & **ISO 22000** - σεβασμός για τη γη και τις μέλισσες.',
    },
    {
      icon: 'family' as ValueIcon,
      title: 'Οικογένεια',
      text: 'Από το 1983, τρεις γενιές με το ίδιο πάθος για τη φύση και τις μέλισσες.',
    },
  ] as { icon: ValueIcon; title: string; text: string }[],
}

export type ContactContent = typeof CONTACT_PAGE

// --- English bundle -------------------------------------------------------
// EN labels use the live site's own English wording where it exists (hero
// "Contact Us", the "Connect with us" heading + body, and the form fields);
// the bespoke info cards and values band — which the live EN site lays out
// differently — are faithful translations. Locale-invariant fields are reused
// from the Greek object above.

const CONTACT_PAGE_EN: ContactContent = {
  meta: {
    title: 'Contact',
  },

  breadcrumb: [
    { label: 'Home', href: '/' },
    { label: 'Contact' },
  ],

  hero: {
    title: 'Contact Us',
    image: CONTACT_PAGE.hero.image,
    imageAlt: 'Oros Machaira beekeepers at the apiary',
  },

  map: {
    ...CONTACT_PAGE.map,
    title: 'Where to Find Us',
    label: 'Oros Machaira — location on the map',
    openLabel: 'Open in Google Maps',
  },

  connect: {
    heading: 'Connect With Us',
    body: [
      {
        text: 'If you are interested in visiting our apiary and experiencing the hands-on activities it offers, you can do it ',
      },
      { text: 'here', href: '/drastiriotites', accent: true },
      { text: '.' },
    ],
    items: [
      {
        ...CONTACT_PAGE.connect.items[0],
        title: 'Opening Hours',
        lines: ['Monday - Friday: 8am - 4pm'],
      },
      {
        ...CONTACT_PAGE.connect.items[1],
        title: 'Telephone',
      },
      {
        ...CONTACT_PAGE.connect.items[2],
        title: 'Visit Us',
        lines: ['Melini, Larnaca 7716', 'P.O.BOX: 7718'],
      },
      {
        ...CONTACT_PAGE.connect.items[3],
        title: 'Email',
      },
    ],
  },

  form: {
    heading: 'Send Us a Message',
    firstName: 'Name*',
    lastName: 'Surname*',
    email: 'Email*',
    phone: 'Telephone',
    message: 'Message*',
    submit: 'Send',
    thankYou:
      'Thank you! Your message has been sent — we’ll be in touch soon. 🐝',
  },

  values: [
    {
      icon: 'purity',
      title: 'Purity',
      text: 'Our honey reaches your table exactly as the bee makes it.',
    },
    {
      icon: 'eco',
      title: 'Environment',
      text: 'Certified to **ISO 14001** & **ISO 22000** — respect for the land and the bees.',
    },
    {
      icon: 'family',
      title: 'Family',
      text: 'Since 1983, three generations with the same passion for nature and the bees.',
    },
  ],
}

/** Locale-aware contact-page content. el = the Greek source of truth above,
 *  en = the English bundle. Read the active locale via next-intl's
 *  `getLocale()` (server) / `useLocale()` (client) at the call site. */
export function getContactContent(locale: string): ContactContent {
  return locale === 'en' ? CONTACT_PAGE_EN : CONTACT_PAGE
}
