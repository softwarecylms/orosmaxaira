/**
 * "Δραστηριότητες" page content. Copy from orosmaxaira.com/drastiriotites,
 * lightly tightened. Photos optimised into /public/images/activities/.
 */

export const ACTIVITIES_PAGE = {
  hero: {
    title: 'Δραστηριότητες',
    description:
      'Ζήστε τη μέλισσα από κοντά — βιωματικές εμπειρίες για όλη την οικογένεια στο μελισσοκομείο μας.',
    image: '/images/activities/hero.webp',
    imageAlt: 'Γευσιγνωσία θυμαρίσιου μελιού Όρος Μαχαιρά',
  },

  list: {
    eyebrow: 'Οι Δραστηριότητες',
    heading: 'Τι Μπορείτε να Κάνετε',
    sub: 'Επιλέξτε τις εμπειρίες που σας ταιριάζουν — ξεχωριστά ή όλες μαζί.',
    items: [
      {
        image: '/images/activities/gnorizw.webp',
        title: 'Γνωρίζω τη μέλισσα',
        text: 'Μια βιωματική ξενάγηση στον κόσμο της μέλισσας — γνωρίστε τους ρόλους της μέσα στην κυψέλη, τα προϊόντα της και γευτείτε τα μέλια μας.',
        href: '/drastiriotites/xenagiseis',
      },
      {
        image: '/images/activities/ergastiria.webp',
        title: 'Εργαστήρια',
        text: 'Συμμετέχετε σε διαδραστικά εργαστήρια και δημιουργήστε τα δικά σας προϊόντα από αγνό μελισσοκέρι.',
        href: '/drastiriotites/ergastiria',
      },
      {
        image: '/images/activities/melisotherapia.webp',
        title: 'Μελισσοθεραπεία',
        text: 'Χαλαρώστε και αναπνεύστε τον αέρα της κυψέλης σε έναν ελεγχόμενο χώρο — μια μοναδική εμπειρία ευεξίας και αναζωογόνησης.',
        href: '/drastiriotites/melissotherapeia',
      },
      {
        image: '/images/activities/episkepsi.webp',
        title: 'Περιπέτειες στις κυψέλες',
        text: 'Ντυθείτε μελισσοκόμοι, πλησιάστε τις κυψέλες και δείτε από κοντά την κοινωνία της μέλισσας, με την καθοδήγηση των έμπειρων μελισσοκόμων μας.',
        href: '/drastiriotites/peripeteies-stis-kypseles',
      },
    ] as { image: string; title: string; text: string; href: string }[],
  },

  cta: {
    eyebrow: 'Κράτηση',
    heading: 'Κλείστε τη δική σας εμπειρία',
    body: 'Συμπληρώστε τη φόρμα και επιλέξτε τις δραστηριότητες που σας ενδιαφέρουν. Η κράτηση θεωρείται έγκυρη μόνο μετά από δική μας επιβεβαίωση.',
  },
} as const
