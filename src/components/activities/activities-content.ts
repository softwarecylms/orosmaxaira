/**
 * "Δραστηριότητες" (Όρος Μαχαιρά Academy) landing-page content.
 * Copy adapted from the Bee Academy sample, tightened to our design system.
 */

export type ExperienceCard = {
  image: string
  title: string
  text: string
  href: string
  badge?: string
  rating?: number
  reviews?: number
}

export type ProgramCard = {
  image: string
  title: string
  text: string
  href: string
  cta: string
  /** When true, the card renders as non-clickable (link temporarily disabled). */
  disabled?: boolean
}

export const ACTIVITIES_PAGE = {
  hero: {
    eyebrow: 'Όρος Μαχαιρά Academy',
    title: 'Μάθε, εξερεύνησε, δημιούργησε',
    description:
      'Ο κόσμος της μέλισσας σε περιμένει — βιωματικές ξεναγήσεις, εργαστήρια και εκπαιδευτικά προγράμματα για μικρούς και μεγάλους.',
    image: '/images/activities/hero.webp',
    imageAlt: 'Βιωματική εμπειρία στο μελισσοκομείο του Όρους Μαχαιρά',
  },

  experiences: {
    eyebrow: 'Οι Εμπειρίες μας',
    heading: 'Ανακαλύψτε τις Εμπειρίες μας',
    sub: 'Βιωματικές ξεναγήσεις, εργαστήρια και εκπαιδευτικά προγράμματα.',
    items: [
      {
        image: '/images/activities/gnorizw.webp',
        title: 'Γνωρίζω τη Μέλισσα',
        text: 'Εκπαιδευτική ξενάγηση στον κόσμο της μέλισσας και του μελιού, με γευσιγνωσία των προϊόντων μας.',
        href: '/drastiriotites/xenagiseis',
        badge: 'Best Seller',
        rating: 4.9,
        reviews: 300,
      },
      {
        image: '/images/activities/episkepsi.webp',
        title: 'Περιπέτειες στις Κυψέλες',
        text: 'Οι επισκέπτες φορούν στολή μελισσοκόμου και γνωρίζουν από κοντά τη ζωή των μελισσών.',
        href: '/drastiriotites/peripeteies-stis-kypseles',
        badge: 'Σχεδόν Sold Out',
        rating: 4.9,
        reviews: 300,
      },
      {
        image: '/images/activities/ergastiria.webp',
        title: 'Ξενάγηση & Εργαστήρι Ζωγραφικής',
        text: 'Εκπαιδευτική ξενάγηση και εργαστήρι ζωγραφικής γύψινων φιγούρων, εμπνευσμένο από τη μέλισσα.',
        href: '/drastiriotites/ergastiria',
        rating: 4.9,
        reviews: 300,
      },
      {
        image: '/images/activities/melisotherapia.webp',
        title: 'Μελισσοθεραπεία',
        text: 'Αναπνεύστε τον αέρα της κυψέλης σε έναν ελεγχόμενο χώρο — μια μοναδική εμπειρία ευεξίας.',
        href: '/drastiriotites/melissotherapeia',
        rating: 4.9,
        reviews: 300,
      },
    ] as ExperienceCard[],
  },

  programs: {
    eyebrow: 'Για Σχολεία & Οργανισμούς',
    heading: 'Εκπαιδευτικά Προγράμματα με Περιβαλλοντικό Αντίκτυπο',
    sub: 'Προγράμματα με εκπαιδευτικό, περιβαλλοντικό και κοινωνικό αντίκτυπο,\nειδικά σχεδιασμένα για σχολεία, εταιρείες και οργανισμούς.',
    items: [
      {
        image: '/images/adopt/visit-2.webp',
        title: 'Εκπαιδευτικές Επισκέψεις Σχολείων',
        text: 'Ένα οργανωμένο εκπαιδευτικό πρόγραμμα για σχολεία, αφιερωμένο στη μέλισσα, το περιβάλλον και τη βιωματική μάθηση.',
        href: '/contact',
        cta: 'Επικοινωνήστε μαζί μας',
        disabled: true,
      },
      {
        image: '/images/adopt/hero.webp',
        title: 'Πρόγραμμα Adopt a Hive',
        text: 'Το καινοτόμο και βραβευμένο πρόγραμμα ΕΚΕ που μετατρέπει την περιβαλλοντική προσφορά σε μια ουσιαστική συλλογική εμπειρία team building.',
        href: '/adopt-a-hive',
        cta: 'Μάθετε περισσότερα',
      },
    ] as ProgramCard[],
  },

  fact: {
    eyebrow: 'Ήξερες ότι…',
    heading: 'Οι μέλισσες τρέφουν τον κόσμο.',
    body: 'Το ένα τρίτο περίπου των τροφίμων που καταναλώνουμε καθημερινά εξαρτάται από την επικονίαση — κυρίως των μελισσών.',
    stat: {
      value: '1/3',
      label: 'των τροφίμων μας εξαρτάται από την επικονίαση των μελισσών.',
    },
    closing:
      'Προστατεύοντας τις μέλισσες, προστατεύουμε την τροφή και τη βιοποικιλότητα ολόκληρου του πλανήτη.',
    cta: { label: 'Αφανείς Ήρωες της Φύσης', href: '/afaneis-iroes-tis-fysis' },
    image: '/images/nature/pollinators-3.webp',
    imageAlt: 'Μέλισσα επικονιάζει λουλούδι',
  },

  cta: {
    eyebrow: 'Κράτηση',
    heading: 'Κλείστε τη δική σας εμπειρία',
    body: 'Επιλέξτε τη δραστηριότητα που σας ενδιαφέρει και κλείστε online, ή επικοινωνήστε μαζί μας για ομαδικές και σχολικές κρατήσεις.',
    primary: { label: 'Δείτε τις εμπειρίες', href: '#experiences' },
    secondary: { label: 'Επικοινωνία', href: '/contact' },
  },
} as const
