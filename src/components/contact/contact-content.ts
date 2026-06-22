/**
 * Contact page content (Figma 146:957). All Greek copy + asset paths in one
 * place, mirroring the home page's content-module pattern.
 */

export type ContactIcon = 'hours' | 'phone' | 'location' | 'email'
export type ValueIcon = 'purity' | 'eco' | 'family'

export const CONTACT_PAGE = {
  breadcrumb: [
    { label: 'Αρχική', href: '/' },
    { label: 'Επικοινωνία' },
  ] as { label: string; href?: string }[],

  hero: {
    title: 'Επικοινωνήστε μαζί μας',
    image: '/images/contact/hero.webp',
    imageAlt: 'Μελισσοκόμοι Όρος Μαχαιρά στο μελισσοκομείο',
  },

  connect: {
    heading: 'Συνδεθείτε μαζί μας',
    body: [
      {
        text: 'Αν ενδιαφέρεστε να επισκεφτείτε το μελισσοκομείο μας και να ζήσετε τις βιωματικές δραστηριότητες που προσφέρει, μπορείτε να το κάνετε ',
      },
      { text: 'εδώ.', href: '/', accent: true },
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
      text: 'Πιστοποιημένοι με ISO 14001 & ISO 22001 - σεβασμός για τη γη και τις μέλισσες.',
    },
    {
      icon: 'family' as ValueIcon,
      title: 'Οικογένεια',
      text: 'Από το 1983, τρεις γενιές με το ίδιο πάθος για τη φύση και τις μέλισσες.',
    },
  ] as { icon: ValueIcon; title: string; text: string }[],
}
