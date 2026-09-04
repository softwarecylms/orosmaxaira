/**
 * Individual activity pages, adapted from orosmaxaira.com/drastiriotites/*.
 * Rendered by <ActivityExperience> at /drastiriotites/<slug>.
 *
 * Bilingual: Greek (el) is the source of truth; the English bundle overrides
 * only the display text (slugs / images / video / season months are reused).
 * Read the active locale via next-intl and call `getExperiences(locale)`.
 */
import type { ActivityExperienceData } from './activity-experience'

export const EXPERIENCES: Record<string, ActivityExperienceData> = {
  melissotherapeia: {
    slug: 'melissotherapeia',
    metaTitle: 'Μελισσοθεραπεία στην Κύπρο — Όρος Μαχαιρά',
    metaDescription:
      'Μελισσοθεραπεία στο Όρος Μαχαιρά: μια παραδοσιακή πρακτική με τα προϊόντα της κυψέλης και την εισπνοή του αέρα της. Ραντεβού Απρίλιο–Οκτώβριο.',
    hero: {
      title: 'Μελισσοθεραπεία',
      description:
        'Μια παραδοσιακή πρακτική, με τα πολύτιμα προϊόντα της κυψέλης.',
      image: '/images/activities/melisotherapia.webp',
      imageAlt: 'Μελισσοθεραπεία — εισπνοή του αέρα της κυψέλης',
    },
    intro: {
      eyebrow: 'Παραδοσιακή Πρακτική',
      heading: 'Η Δύναμη της Κυψέλης',
      body: [
        'Πρώτοι ανακάλυψαν και εφάρμοσαν τη Μελισσοθεραπεία οι αρχαίοι Αιγύπτιοι. Η Μελισσοθεραπεία είναι μια παραδοσιακή πρακτική που αξιοποιεί τα παράγωγα της κυψέλης (μέλι, βασιλικό πολτό, γύρη, πρόπολη) και τον θερμό αέρα της, σε μια εμπειρία χαλάρωσης μέσα στο μελισσοκομείο.',
        'Στο Όρος Μαχαιρά προσφέρεται ως μια ήρεμη, αισθητηριακή εμπειρία μέσα στη φύση και είναι κατάλληλη για ενήλικες και παιδιά.',
      ],
      bold: ['παραδοσιακή πρακτική', 'παράγωγα της κυψέλης', 'εμπειρία χαλάρωσης'],
      label: 'Διαθέσιμη Απρίλιο–Οκτώβριο',
      note: 'Η μελισσοθεραπεία δεν είναι ιατρική πράξη. Τα προϊόντα της κυψέλης και η εισπνοή του αέρα της δεν είναι φάρμακα: δεν προλαμβάνουν, δεν αντιμετωπίζουν και δεν θεραπεύουν ασθένειες, ούτε υποκαθιστούν την ιατρική συμβουλή ή την αγωγή σας. Αν έχετε πρόβλημα υγείας ή γνωστή αλλεργία σε προϊόντα μέλισσας ή σε τσιμπήματα, συμβουλευτείτε πρώτα τον γιατρό σας.',
      video:
        'https://www.youtube.com/embed/oN8yOrjoJY4?autoplay=1&mute=1&loop=1&playlist=oN8yOrjoJY4&controls=0&modestbranding=1&rel=0&playsinline=1',
      book: { label: 'Κάντε κράτηση', href: '#cta' },
    },
    features: {
      eyebrow: 'Πώς Λειτουργεί',
      heading: 'Η Εμπειρία της Μελισσοθεραπείας',
      items: [
        {
          title: 'Εισπνοή αέρα κυψέλης',
          text: 'Μέσω ειδικής αναπνευστικής μάσκας εισπνέετε τον θερμό, αρωματικό αέρα της κυψέλης.',
        },
        {
          title: 'Προϊόντα της κυψέλης',
          text: 'Μέλι, πρόπολη, γύρη και βασιλικός πολτός συνοδεύουν την εμπειρία.',
        },
        {
          title: 'Περίοδος & διάρκεια',
          text: 'Εφαρμόζεται Απρίλιο–Οκτώβριο: τρεις εβδομάδες, κάθε δεύτερη ημέρα για 20 λεπτά.',
        },
      ],
    },
    benefits: {
      eyebrow: 'Η Εμπειρία',
      heading: 'Τι Θα Ζήσετε στη Μελισσοθεραπεία',
      intro:
        'Οι αρχαίοι Αιγύπτιοι ήταν από τους πρώτους που κάθισαν δίπλα στην κυψέλη για να αναπνεύσουν τον αέρα της. Σήμερα, στο δικό μας μελισσοκομείο, η εμπειρία παραμένει το ίδιο απλή: κάθεστε αναπαυτικά, φοράτε την ειδική μάσκα και αφήνετε τον θερμό, αρωματικό αέρα της κυψέλης και τον ήχο του μελισσιού να σας συνοδεύσουν για είκοσι λεπτά. Να τι περιλαμβάνει κάθε συνεδρία:',
      items: [
        'Ο θερμός αέρας της κυψέλης, μέσω ειδικής αναπνευστικής μάσκας',
        'Τα φυσικά αρώματα του κεριού, της πρόπολης και του μελιού',
        'Ο χαρακτηριστικός ήχος και ο παλμός του μελισσιού',
        'Είκοσι λεπτά ησυχίας μέσα στη φύση του Μαχαιρά',
        'Ασφαλής, ελεγχόμενος χώρος — χωρίς άμεση επαφή με τις μέλισσες',
        'Καθοδήγηση από έμπειρο μελισσοκόμο σε όλη τη διάρκεια',
      ],
    },
    gallery: {
      eyebrow: 'Στιγμές',
      heading: 'Στιγμές από τη Μελισσοθεραπεία',
      images: Array.from({ length: 10 }, (_, i) => ({
        src: `/images/activities/melissotherapeia/${String(i + 1).padStart(2, '0')}.webp`,
        alt: 'Μελισσοθεραπεία στο μελισσοκομείο του Όρους Μαχαιρά',
      })),
    },
    booking: {
      activityName: 'Μελισσοθεραπεία',
      eyebrow: 'Κράτηση',
      heading: 'Κλείστε το ραντεβού σας',
      body: 'Η μελισσοθεραπεία εφαρμόζεται από τον Απρίλιο έως τον Οκτώβριο. Συμπληρώστε τη φόρμα ή καλέστε στο +357 25 622 305 για να κλείσετε ραντεβού. Θα λάβετε σχετική ενημέρωση εντός 24 ωρών.',
      bold: ['φόρμα', '+357 25 622 305'],
      seasonStartMonth: 4,
      seasonEndMonth: 10,
      seasonLabel: 'Διαθέσιμη μόνο Απρίλιο–Οκτώβριο',
    },
  },

  'peripeteies-stis-kypseles': {
    slug: 'peripeteies-stis-kypseles',
    metaTitle: 'Περιπέτειες στις Κυψέλες — Όρος Μαχαιρά',
    metaDescription:
      'Περιπέτειες στις κυψέλες: ντυθείτε μελισσοκόμοι και ανοίξτε την κυψέλη με τη βοήθεια του προσωπικού μας. Μια βιωματική εμπειρία για παιδιά από 2 ετών και ενήλικες, διαθέσιμη Μάρτιο–Οκτώβριο.',
    hero: {
      title: 'Περιπέτειες στις Κυψέλες',
      description:
        'Ντυθείτε μελισσοκόμοι και ανοίξτε την κυψέλη — μια βιωματική εμπειρία για παιδιά από 2 ετών και ενήλικες.',
      image: '/images/activities/episkepsi.webp',
      imageAlt: 'Επισκέπτες με στολή μελισσοκόμου ανοίγουν την κυψέλη',
    },
    intro: {
      eyebrow: 'Βιωματική Εμπειρία',
      heading: 'Μέσα στην Κυψέλη',
      body: [
        'Μια βιωματική εμπειρία, κατάλληλη για παιδιά και ενήλικες, όπου ο επισκέπτης ντύνεται με τη στολή του μελισσοκόμου και επισκέπτεται τις κυψέλες μας. Με τη βοήθεια του έμπειρου προσωπικού μας, ανοίγετε την κυψέλη και παρατηρείτε από κοντά την κοινωνία της μέλισσας. Η συμμετοχή επιτρέπεται από 2 ετών και άνω, με υποχρεωτική συνοδεία γονέα ή κηδεμόνα για τους ανηλίκους.',
        'Η εμπειρία πραγματοποιείται μόνο συγκεκριμένες ώρες και ημέρες — ως επί το πλείστον τα Σάββατα. Γι’ αυτό είναι απαραίτητη η εκδήλωση ενδιαφέροντος μέσω της φόρμας.',
      ],
      bold: ['στολή του μελισσοκόμου', 'κοινωνία της μέλισσας', 'εκδήλωση ενδιαφέροντος'],
      label: 'Διαθέσιμη μόνο Μάρτιο–Οκτώβριο',
      note: 'Η εμπειρία πραγματοποιείται μόνο από τον Μάρτιο έως τον Οκτώβριο, καθώς τον χειμώνα οι μέλισσες κρυώνουν και γίνονται επιθετικές όταν ανοίγουμε την κυψέλη τους.',
      video:
        'https://www.youtube.com/embed/ezF47H1_5-0?autoplay=1&mute=1&loop=1&playlist=ezF47H1_5-0&controls=0&modestbranding=1&rel=0&playsinline=1',
      book: { label: 'Κάντε κράτηση', href: '#cta' },
    },
    features: {
      eyebrow: 'Η Εμπειρία',
      heading: 'Τι Θα Ζήσετε',
      items: [
        {
          title: 'Ντυθείτε μελισσοκόμοι',
          text: 'Φορέστε τη στολή του μελισσοκόμου και νιώστε ασφαλείς δίπλα στις κυψέλες.',
        },
        {
          title: 'Ανοίξτε την κυψέλη',
          text: 'Με τη βοήθεια του προσωπικού μας, ανοίξτε την κυψέλη και δείτε από κοντά την κοινωνία της μέλισσας.',
        },
        {
          title: 'Από 2 ετών & άνω',
          text: 'Μια ασφαλής, καθοδηγούμενη εμπειρία για παιδιά από 2 ετών και ενήλικες — οι ανήλικοι πάντα με συνοδεία γονέα ή κηδεμόνα.',
        },
      ],
    },
    gallery: {
      eyebrow: 'Στιγμές',
      heading: 'Στιγμές από τις Περιπέτειες',
      images: Array.from({ length: 11 }, (_, i) => ({
        src: `/images/activities/peripeteies/${String(i + 1).padStart(2, '0')}.webp`,
        alt: 'Περιπέτειες στις κυψέλες στο μελισσοκομείο του Όρους Μαχαιρά',
      })),
    },
    booking: {
      activityName: 'Περιπέτειες στις κυψέλες',
      eyebrow: 'Κράτηση',
      heading: 'Εκδηλώστε ενδιαφέρον',
      body: 'Η εμπειρία γίνεται συγκεκριμένες ημέρες, κυρίως Σάββατα, από τον Μάρτιο έως τον Οκτώβριο. Συμπληρώστε τη φόρμα ή καλέστε στο +357 25 622 305. Θα λάβετε σχετική ενημέρωση εντός 24 ωρών.',
      bold: ['φόρμα', '+357 25 622 305'],
      seasonStartMonth: 3,
      seasonEndMonth: 10,
      seasonLabel: 'Διαθέσιμη μόνο Μάρτιο–Οκτώβριο',
    },
  },

  xenagiseis: {
    slug: 'xenagiseis',
    metaTitle: 'Γνωρίζω τη Μέλισσα — Ξεναγήσεις στο μελισσοκομείο Όρος Μαχαιρά',
    metaDescription:
      'Ξεναγήσεις στο μελισσοκομείο του Όρους Μαχαιρά: μια βιωματική «μελένια εμπειρία» περίπου 45 λεπτών με γνωριμία με τη μέλισσα, ζωντανή εμφιάλωση μελιού και γευσιγνωσία. Κατάλληλη για οικογένειες, σχολεία και ομάδες.',
    hero: {
      title: 'Γνωρίζω τη Μέλισσα',
      description:
        'Μια «μελένια εμπειρία» γνωριμίας με τη μέλισσα και την κυψέλη, με ζωντανή εμφιάλωση και γευσιγνωσία μελιού.',
      image: '/images/activities/gnorizw.webp',
      imageAlt: 'Ξενάγηση στο μελισσοκομείο του Όρους Μαχαιρά',
    },
    intro: {
      eyebrow: 'Ξεναγήσεις',
      heading: 'Η Μελένια Εμπειρία',
      body: [
        'Για όσους εκτιμούν τη γνώση μέσα από εμπειρίες, δημιουργήσαμε έναν ειδικά διαμορφωμένο χώρο όπου ο επισκέπτης μαθαίνει για τη μελισσοθεραπεία μέσα από ένα ξύλινο σπιτάκι, βλέπει τις μέλισσες και ανακαλύπτει τους ρόλους τους μέσα στην κυψέλη. Ταυτόχρονα γνωρίζει τα υπόλοιπα προϊόντα της κυψέλης και το πού χρησιμεύει το καθένα.',
        'Στη συνέχεια ο επισκέπτης μαθαίνει εν συντομία την ιστορία της οικογενειακής μας επιχείρησης μέσα από βίντεο, παίζει ένα διαδραστικό παιχνίδι ερωτήσεων για το μέλι και τις μέλισσες και μεταφέρεται στο δωμάτιο εμφιάλωσης, όπου παρακολουθεί ζωντανά την εμφιάλωση μελιού απευθείας από τα βαρέλια ηρεμίας.',
        'Μετά από αυτή την ξενάγηση των περίπου 45 λεπτών, μπορεί να γευτεί τα διάφορα είδη μελιού και να εκπαιδευτεί στο να αναγνωρίζει σωστά τι δοκιμάζει.',
      ],
      bold: ['μελισσοθεραπεία', 'ζωντανά την εμφιάλωση μελιού', 'γευτεί τα διάφορα είδη μελιού'],
      label: 'Διάρκεια ~45 λεπτά',
      book: { label: 'Κάντε κράτηση', href: '#cta' },
    },
    features: {
      eyebrow: 'Η Εμπειρία',
      heading: 'Τι Θα Ζήσετε',
      items: [
        {
          title: 'Γνωριμία με τη μέλισσα',
          text: 'Δείτε από κοντά τις μέλισσες, ανακαλύψτε τους ρόλους τους μέσα στην κυψέλη και τα προϊόντα της.',
        },
        {
          title: 'Ζωντανή εμφιάλωση & παιχνίδι',
          text: 'Μάθετε την ιστορία μας μέσα από βίντεο, παίξτε ένα διαδραστικό παιχνίδι και δείτε ζωντανά την εμφιάλωση μελιού.',
        },
        {
          title: 'Γευσιγνωσία μελιού',
          text: 'Δοκιμάστε διαφορετικά είδη μελιού και εκπαιδευτείτε να αναγνωρίζετε σωστά το καθένα.',
        },
      ],
    },
    gallery: {
      eyebrow: 'Στιγμές',
      heading: 'Στιγμές από τις Ξεναγήσεις',
      images: Array.from({ length: 11 }, (_, i) => ({
        src: `/images/activities/peripeteies/${String(i + 1).padStart(2, '0')}.webp`,
        alt: 'Ξενάγηση στο μελισσοκομείο του Όρους Μαχαιρά',
      })),
    },
    booking: {
      activityName: 'Γνωρίζω τη μέλισσα',
      eyebrow: 'Κράτηση',
      heading: 'Κλείστε την ξενάγησή σας',
      body: 'Κόστος: ενήλικοι €10, παιδιά 6–18 ετών €5, κάτω των 6 ετών δωρεάν. Καλέστε στο 99130092 (Μαρία) ή συμπληρώστε τη φόρμα για να κλείσετε ραντεβού. Θα λάβετε επιβεβαίωση εντός 24 ωρών.',
      bold: ['99130092', 'φόρμα'],
    },
  },
}

const EXPERIENCES_EN: Record<string, ActivityExperienceData> = {
  melissotherapeia: {
    ...EXPERIENCES.melissotherapeia,
    metaTitle: 'Apitherapy (Bee Therapy) in Cyprus — Oros Machaira',
    metaDescription:
      'Apitherapy at Oros Machaira: a traditional practice with the products of the hive and the inhalation of its air. Appointments April–October.',
    hero: {
      ...EXPERIENCES.melissotherapeia.hero,
      title: 'Apitherapy (Bee Therapy)',
      description:
        'A traditional practice using the precious products of the hive.',
      imageAlt: 'Bee therapy — inhaling the air of the hive',
    },
    intro: {
      ...EXPERIENCES.melissotherapeia.intro,
      eyebrow: 'A Traditional Practice',
      heading: 'The Power of the Hive',
      body: [
        'Apitherapy has been practised since antiquity — the ancient Egyptians are among the earliest known users. It is a traditional practice that draws on the products of the hive (honey, royal jelly, pollen, propolis) and on its warm air, in a relaxing experience inside the apiary.',
        'At Oros Machaira it is offered as a calm, sensory experience in nature, suitable for adults and children alike.',
      ],
      bold: ['traditional practice', 'products of the hive', 'relaxing experience'],
      label: 'Available April–October',
      note: 'Apitherapy is not a medical treatment. The products of the hive and the inhalation of hive air are not medicines: they do not prevent, treat or cure any disease, and they are not a substitute for medical advice or prescribed medication. If you have a health condition or a known allergy to bee products or bee stings, please consult your doctor first.',
      book: { label: 'Book now', href: '#cta' },
    },
    features: {
      eyebrow: 'How It Works',
      heading: 'The Bee Therapy Experience',
      items: [
        {
          title: 'Inhaling hive air',
          text: 'Through a special breathing mask you inhale the warm, aromatic air of the hive.',
        },
        {
          title: 'Products of the hive',
          text: 'Honey, propolis, pollen and royal jelly accompany the experience.',
        },
        {
          title: 'Season & duration',
          text: 'Available April–October: three weeks, every second day for 20 minutes.',
        },
      ],
    },
    benefits: {
      eyebrow: 'The Experience',
      heading: 'What a Session Involves',
      intro:
        'The ancient Egyptians were among the first to sit beside a hive and breathe its air. At our apiary the experience remains just as simple: you settle into a comfortable seat, put on the special mask, and let the warm, aromatic air of the hive and the sound of the colony keep you company for twenty minutes. Each session includes:',
      items: [
        'The warm air of the hive, through a dedicated breathing mask',
        'The natural aromas of beeswax, propolis and honey',
        'The distinctive sound and pulse of the colony',
        'Twenty minutes of quiet in the nature of Machairas',
        'A safe, controlled space — with no direct contact with the bees',
        'The guidance of an experienced beekeeper throughout',
      ],
    },
    gallery: {
      ...EXPERIENCES.melissotherapeia.gallery!,
      eyebrow: 'Moments',
      heading: 'Moments from Bee Therapy',
      images: EXPERIENCES.melissotherapeia.gallery!.images.map((g) => ({
        ...g,
        alt: 'Bee therapy at the Oros Machaira apiary',
      })),
    },
    booking: {
      ...EXPERIENCES.melissotherapeia.booking,
      activityName: 'Bee Therapy',
      eyebrow: 'Booking',
      heading: 'Book your appointment',
      body: 'Bee therapy is applied from April to October. Fill in the form or call +357 25 622 305 to book an appointment. You will receive confirmation within 24 hours.',
      bold: ['form', '+357 25 622 305'],
      seasonLabel: 'Available only April–October',
    },
  },

  'peripeteies-stis-kypseles': {
    ...EXPERIENCES['peripeteies-stis-kypseles'],
    metaTitle: 'Adventures at the Hives — Oros Machaira',
    metaDescription:
      'Adventures at the hives: suit up and open the hive with the help of our staff. A hands-on experience for ages 2 and up, available March–October.',
    hero: {
      ...EXPERIENCES['peripeteies-stis-kypseles'].hero,
      title: 'Adventures at the Hives',
      description:
        'Suit up and open the hive — a hands-on experience for ages 2 and up.',
      imageAlt: 'Visitors in beekeeper suits opening the hive',
    },
    intro: {
      ...EXPERIENCES['peripeteies-stis-kypseles'].intro,
      eyebrow: 'Hands-on Experience',
      heading: 'Inside the Hive',
      body: [
        'A hands-on experience, suitable for children and adults, where the visitor dresses in a beekeeper suit and visits our hives. With the help of our experienced staff, you open the hive and observe the bee community up close. Participation is open from age 2 and up, and under-18s must be accompanied by a parent or guardian.',
        'The experience takes place only on specific hours and days — mostly on Saturdays. That is why registering your interest through the form is essential.',
      ],
      bold: ['beekeeper suit', 'bee community', 'registering your interest'],
      label: 'Available only March–October',
      note: 'The experience takes place only from March to October, as in winter the bees get cold and become aggressive when we open the hive.',
      book: { label: 'Book now', href: '#cta' },
    },
    features: {
      eyebrow: 'The Experience',
      heading: 'What You Will Live',
      items: [
        {
          title: 'Suit up',
          text: 'Put on the beekeeper suit and feel safe right next to the hives.',
        },
        {
          title: 'Open the hive',
          text: 'With the help of our staff, open the hive and see the bee community up close.',
        },
        {
          title: 'Ages 2 and up',
          text: 'A safe, guided experience for children from age 2 and adults — under-18s always accompanied by a parent or guardian.',
        },
      ],
    },
    gallery: {
      ...EXPERIENCES['peripeteies-stis-kypseles'].gallery!,
      eyebrow: 'Moments',
      heading: 'Moments from the Adventures',
      images: EXPERIENCES['peripeteies-stis-kypseles'].gallery!.images.map((g) => ({
        ...g,
        alt: 'Adventures at the hives at the Oros Machaira apiary',
      })),
    },
    booking: {
      ...EXPERIENCES['peripeteies-stis-kypseles'].booking,
      activityName: 'Adventures at the hives',
      eyebrow: 'Booking',
      heading: 'Register your interest',
      body: 'The experience takes place on specific days, mostly Saturdays, from March to October. Fill in the form or call +357 25 622 305. You will receive confirmation within 24 hours.',
      bold: ['form', '+357 25 622 305'],
      seasonLabel: 'Available only March–October',
    },
  },

  xenagiseis: {
    ...EXPERIENCES.xenagiseis,
    metaTitle: 'Getting to Know the Bee — Tours at the Oros Machaira apiary',
    metaDescription:
      'Tours at the Oros Machaira apiary: a hands-on ~45-minute “honey experience” — getting to know the bee, live honey bottling and honey tasting. Perfect for families, schools and groups.',
    hero: {
      ...EXPERIENCES.xenagiseis.hero,
      title: 'Getting to Know the Bee',
      description:
        'A “honey experience” that introduces you to the bee and the hive, with live honey bottling and honey tasting.',
      imageAlt: 'Guided tour at the Oros Machaira apiary',
    },
    intro: {
      ...EXPERIENCES.xenagiseis.intro,
      eyebrow: 'Tours',
      heading: 'The Honey Experience',
      body: [
        'For anyone who likes to learn by doing, we have created a specially designed space where visitors discover apitherapy through a wooden house, see the bees and discover their roles within the hive. At the same time they get to know the other products of the hive and what each one is used for.',
        'Next, the visitor briefly learns the history of our family business through a video, takes part in an interactive quiz about honey and bees, and is taken to the bottling room to watch live honey bottling directly from the calm barrels.',
        'After this roughly 45-minute tour, they can taste the different types of honey and be trained to correctly identify what they are tasting.',
      ],
      bold: ['apitherapy', 'live honey bottling', 'taste the different types of honey'],
      label: 'Duration ~45 minutes',
      book: { label: 'Book now', href: '#cta' },
    },
    features: {
      eyebrow: 'The Experience',
      heading: 'What You Will Live',
      items: [
        {
          title: 'Meet the bee',
          text: 'See the bees up close and discover their roles within the hive, along with the products of the hive.',
        },
        {
          title: 'Live bottling & game',
          text: 'Learn our story through a video, play an interactive game and watch live honey bottling.',
        },
        {
          title: 'Honey tasting',
          text: 'Taste different types of honey and learn to recognise each one.',
        },
      ],
    },
    gallery: {
      ...EXPERIENCES.xenagiseis.gallery!,
      eyebrow: 'Moments',
      heading: 'Moments from the Tours',
      images: EXPERIENCES.xenagiseis.gallery!.images.map((g) => ({
        ...g,
        alt: 'Guided tour at the Oros Machaira apiary',
      })),
    },
    booking: {
      ...EXPERIENCES.xenagiseis.booking,
      activityName: 'Getting to know the bee',
      eyebrow: 'Booking',
      heading: 'Book your tour',
      body: 'Prices: adults €10, children 6–18 €5, under 6 free. Call 99130092 (Maria) or fill in the form to make an appointment. You will receive confirmation within 24 hours.',
      bold: ['99130092', 'form'],
    },
  },
}

/** Locale-aware activity pages. el = the Greek source of truth, en = English. */
export function getExperiences(locale: string): Record<string, ActivityExperienceData> {
  return locale === 'en' ? EXPERIENCES_EN : EXPERIENCES
}
