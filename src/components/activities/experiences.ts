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
      'Μελισσοθεραπεία στο Όρος Μαχαιρά: μια θεραπευτική πρακτική της εναλλακτικής ιατρικής με τα προϊόντα της κυψέλης και την εισπνοή του αέρα της. Ραντεβού Απρίλιο–Οκτώβριο.',
    hero: {
      title: 'Μελισσοθεραπεία',
      description:
        'Μια θεραπευτική πρακτική της εναλλακτικής ιατρικής, με τα πολύτιμα προϊόντα της κυψέλης.',
      image: '/images/activities/melisotherapia.webp',
      imageAlt: 'Μελισσοθεραπεία — εισπνοή του αέρα της κυψέλης',
    },
    intro: {
      eyebrow: 'Εναλλακτική Ιατρική',
      heading: 'Η Δύναμη της Κυψέλης',
      body: [
        'Πρώτοι ανακάλυψαν και εφάρμοσαν τη Μελισσοθεραπεία οι αρχαίοι Αιγύπτιοι. Η Μελισσοθεραπεία είναι μία εκτενής θεραπευτική πρακτική η οποία ανήκει στην εναλλακτική ιατρική και χρησιμοποιεί τα παράγωγα της κυψέλης (μέλι, βασιλικό πολτό, γύρη, δηλητήριο μέλισσας, πρόπολη) σε διάφορες θεραπευτικές εφαρμογές.',
        'Η Μελισσοθεραπεία, με φυσικό τρόπο, μας βοηθά να ξεπεράσουμε πολλά προβλήματα υγείας και είναι εξαιρετική για παιδιά, αθλητές αλλά και ηλικιωμένους.',
      ],
      bold: ['εναλλακτική ιατρική', 'παράγωγα της κυψέλης', 'προβλήματα υγείας'],
      label: 'Διαθέσιμη Απρίλιο–Οκτώβριο',
      note: 'Τα παράγωγα της μέλισσας και η εισπνοή του αέρα της κυψέλης δεν είναι φάρμακα ούτε υποκαθιστούν τα ειδικά φάρμακα. Λειτουργούν παράλληλα και συμπληρωματικά με την κανονική θεραπεία — όχι ως αντικατάστασή της.',
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
          text: 'Μέσω ειδικής αναπνευστικής μάσκας εισπνέετε τον θερμό αέρα της κυψέλης, με τις ευεργετικές του ουσίες.',
        },
        {
          title: 'Προϊόντα της κυψέλης',
          text: 'Μέλι, πρόπολη, γύρη, βασιλικός πολτός και δηλητήριο μέλισσας αξιοποιούνται για τις ευεργετικές τους ιδιότητες.',
        },
        {
          title: 'Περίοδος & διάρκεια',
          text: 'Εφαρμόζεται Απρίλιο–Οκτώβριο: για αισθητά αποτελέσματα, τρεις εβδομάδες, κάθε δεύτερη ημέρα για 20 λεπτά.',
        },
      ],
    },
    benefits: {
      eyebrow: 'Οφέλη',
      heading: 'Σε Τι Βοηθά η Μελισσοθεραπεία',
      intro:
        'Οι αρχαίοι Αιγύπτιοι, εκτός των άλλων, χρησιμοποιούσαν την εισπνοή αέρα από το εσωτερικό της κυψέλης στη θεραπεία διάφορων αναπνευστικών προβλημάτων. Εισπνέοντας τον θερμό αέρα της κυψέλης, μέσω μιας ειδικής αναπνευστικής μάσκας εισάγονται στον οργανισμό ουσίες με ισχυρή θεραπευτική δράση, οι οποίες είναι εξαιρετικά ευεργετικές στην ανθρώπινη ψυχοσωματική κατάσταση. Ο αέρας του εσωτερικού της κυψέλης, διαποτισμένος με ουσιώδη αρώματα, βοηθά τους ανθρώπους στην αντιμετώπιση των πιο κάτω καταστάσεων:',
      items: [
        'Βρογχίτιδα',
        'Άσθμα',
        'Χρόνιες παθήσεις των πνευμόνων',
        'Ευαισθησία στις λοιμώξεις',
        'Αδύνατο ανοσοποιητικό σύστημα',
        'Λοιμώξεις του αναπνευστικού συστήματος',
        'Χρόνιοι πονοκέφαλοι, ημικρανίες',
        'Στρες',
        'Κατάθλιψη',
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
      body: 'Η μελισσοθεραπεία εφαρμόζεται από τον Απρίλιο έως τον Οκτώβριο. Συμπληρώστε τη φόρμα ή καλέστε στο 25622305 για να κλείσετε ραντεβού. Θα λάβετε σχετική ενημέρωση εντός 24 ωρών.',
      bold: ['φόρμα', '25622305'],
      seasonStartMonth: 4,
      seasonEndMonth: 10,
      seasonLabel: 'Διαθέσιμη μόνο Απρίλιο–Οκτώβριο',
    },
  },

  'peripeteies-stis-kypseles': {
    slug: 'peripeteies-stis-kypseles',
    metaTitle: 'Περιπέτειες στις Κυψέλες — Όρος Μαχαιρά',
    metaDescription:
      'Περιπέτειες στις κυψέλες: ντυθείτε μελισσοκόμοι και ανοίξτε την κυψέλη με τη βοήθεια του προσωπικού μας. Μια βιωματική εμπειρία για μικρούς και μεγάλους, διαθέσιμη Μάρτιο–Οκτώβριο.',
    hero: {
      title: 'Περιπέτειες στις Κυψέλες',
      description:
        'Ντυθείτε μελισσοκόμοι και ανοίξτε την κυψέλη — μια βιωματική εμπειρία για μικρούς και μεγάλους.',
      image: '/images/activities/episkepsi.webp',
      imageAlt: 'Επισκέπτες με στολή μελισσοκόμου ανοίγουν την κυψέλη',
    },
    intro: {
      eyebrow: 'Βιωματική Εμπειρία',
      heading: 'Μέσα στην Κυψέλη',
      body: [
        'Μια βιωματική εμπειρία, κατάλληλη για παιδιά και ενήλικες, όπου ο επισκέπτης ντύνεται με τη στολή του μελισσοκόμου και επισκέπτεται τις κυψέλες μας. Με τη βοήθεια του έμπειρου προσωπικού μας, ανοίγετε την κυψέλη και παρατηρείτε από κοντά την κοινωνία της μέλισσας.',
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
          title: 'Για μικρούς & μεγάλους',
          text: 'Μια ασφαλής, καθοδηγούμενη εμπειρία, κατάλληλη τόσο για παιδιά όσο και για ενήλικες.',
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
      body: 'Η εμπειρία γίνεται συγκεκριμένες ημέρες, κυρίως Σάββατα, από τον Μάρτιο έως τον Οκτώβριο. Συμπληρώστε τη φόρμα ή καλέστε στο 25622305. Θα λάβετε σχετική ενημέρωση εντός 24 ωρών.',
      bold: ['φόρμα', '25622305'],
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
    metaTitle: 'Bee Therapy (Apitherapy) in Cyprus — Oros Machaira',
    metaDescription:
      'Bee therapy at Oros Machaira: a therapeutic practice of alternative medicine using the products of the hive and the inhalation of its air. Appointments April–October.',
    hero: {
      ...EXPERIENCES.melissotherapeia.hero,
      title: 'Bee Therapy',
      description:
        'A therapeutic practice of alternative medicine, using the precious products of the hive.',
      imageAlt: 'Bee therapy — inhaling the air of the hive',
    },
    intro: {
      ...EXPERIENCES.melissotherapeia.intro,
      eyebrow: 'Alternative Medicine',
      heading: 'The Power of the Hive',
      body: [
        'Bee therapy was first discovered and applied by the ancient Egyptians. It is an extensive therapeutic practice that belongs to alternative medicine and uses the products of the hive (honey, royal jelly, pollen, bee venom, propolis) in a variety of therapeutic applications.',
        'In a natural way, bee therapy helps us overcome many health problems and is excellent for children, athletes and the elderly alike.',
      ],
      bold: ['alternative medicine', 'products of the hive', 'health problems'],
      label: 'Available April–October',
      note: 'The bee products and the inhalation of hive air are not medicines, nor do they replace prescribed medication. They work alongside and complement conventional treatment — never as a substitute for it.',
      book: { label: 'Book now', href: '#cta' },
    },
    features: {
      eyebrow: 'How It Works',
      heading: 'The Bee Therapy Experience',
      items: [
        {
          title: 'Inhaling hive air',
          text: 'Through a special breathing mask you inhale the warm air of the hive, with its beneficial substances.',
        },
        {
          title: 'Products of the hive',
          text: 'Honey, propolis, pollen, royal jelly and bee venom are used for their beneficial properties.',
        },
        {
          title: 'Season & duration',
          text: 'Applied April–October: for noticeable results, three weeks, every second day for 20 minutes.',
        },
      ],
    },
    benefits: {
      eyebrow: 'Benefits',
      heading: 'What Bee Therapy Helps With',
      intro:
        'The ancient Egyptians, among others, used the inhalation of air from inside the hive to treat various respiratory problems. Inhaling the warm air of the hive through a special breathing mask, substances with strong therapeutic action are introduced into the body, which are extremely beneficial to the human psychosomatic state. The air inside the hive, impregnated with essential aromas, helps people deal with the following issues:',
      items: [
        'Bronchitis',
        'Asthma',
        'Chronic diseases of the lungs',
        'Susceptibility to infections',
        'Weak immune system',
        'Respiratory infections',
        'Chronic headaches, migraines',
        'Stress',
        'Depression',
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
      body: 'Bee therapy is applied from April to October. Fill in the form or call 25622305 to book an appointment. You will receive confirmation within 24 hours.',
      bold: ['form', '25622305'],
      seasonLabel: 'Available only April–October',
    },
  },

  'peripeteies-stis-kypseles': {
    ...EXPERIENCES['peripeteies-stis-kypseles'],
    metaTitle: 'Adventures in the Beehives — Oros Machaira',
    metaDescription:
      'Adventures in the beehives: dress as beekeepers and open the hive with the help of our staff. A hands-on experience for young and old, available March–October.',
    hero: {
      ...EXPERIENCES['peripeteies-stis-kypseles'].hero,
      title: 'Adventures in the Beehives',
      description:
        'Dress as beekeepers and open the hive — a hands-on experience for young and old.',
      imageAlt: 'Visitors in beekeeper suits opening the hive',
    },
    intro: {
      ...EXPERIENCES['peripeteies-stis-kypseles'].intro,
      eyebrow: 'Hands-on Experience',
      heading: 'Inside the Hive',
      body: [
        'A hands-on experience, suitable for children and adults, where the visitor dresses in a beekeeper suit and visits our hives. With the help of our experienced staff, you open the hive and observe the bee community up close.',
        'The experience takes place only on specific hours and days — mostly on Saturdays. That is why registering your interest through the form is essential.',
      ],
      bold: ['beekeeper suit', 'bee community', 'registering your interest'],
      label: 'Available only March–October',
      note: 'The experience takes place only from March to October, as in winter the bees get cold and become aggressive when we open their hive.',
      book: { label: 'Book now', href: '#cta' },
    },
    features: {
      eyebrow: 'The Experience',
      heading: 'What You Will Live',
      items: [
        {
          title: 'Dress as beekeepers',
          text: 'Put on the beekeeper suit and feel safe right next to the hives.',
        },
        {
          title: 'Open the hive',
          text: 'With the help of our staff, open the hive and see the bee community up close.',
        },
        {
          title: 'For young & old',
          text: 'A safe, guided experience, suitable for children and adults alike.',
        },
      ],
    },
    gallery: {
      ...EXPERIENCES['peripeteies-stis-kypseles'].gallery!,
      eyebrow: 'Moments',
      heading: 'Moments from the Adventures',
      images: EXPERIENCES['peripeteies-stis-kypseles'].gallery!.images.map((g) => ({
        ...g,
        alt: 'Adventures in the beehives at the Oros Machaira apiary',
      })),
    },
    booking: {
      ...EXPERIENCES['peripeteies-stis-kypseles'].booking,
      activityName: 'Adventures in the beehives',
      eyebrow: 'Booking',
      heading: 'Register your interest',
      body: 'The experience takes place on specific days, mostly Saturdays, from March to October. Fill in the form or call 25622305. You will receive confirmation within 24 hours.',
      bold: ['form', '25622305'],
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
        'For those who appreciate knowledge through experiences, we have created a specially designed space where visitors learn about apitherapy through a wooden house, see the bees and discover their roles within the hive. At the same time they get to know the other products of the hive and what each one is used for.',
        'Next, the visitor briefly learns the history of our family business through a video, plays an interactive question game about honey and bees, and is taken to the bottling room to watch live honey bottling directly from the calm barrels.',
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
