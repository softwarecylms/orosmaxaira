import type { Metadata } from 'next'
import { LegalPage, type LegalSection } from '@/components/legal/legal-page'
import { hreflangAlternates } from '@/lib/seo'

const TITLE = 'Πολιτική Απορρήτου & Cookies'
const LAST_UPDATED = 'Τελευταία ενημέρωση: Ιούνιος 2026'
const INTRO =
  'Η προστασία των προσωπικών σας δεδομένων είναι σημαντική για εμάς. Παρακάτω εξηγούμε ποια δεδομένα συλλέγουμε και πώς τα χρησιμοποιούμε.'

const SECTIONS: LegalSection[] = [
  {
    heading: 'Εισαγωγή',
    body: [
      'Η Όρος Μαχαιρά σέβεται την ιδιωτικότητά σας και δεσμεύεται για την προστασία των προσωπικών σας δεδομένων. Η παρούσα πολιτική περιγράφει πώς συλλέγουμε, χρησιμοποιούμε και προστατεύουμε τα δεδομένα σας, σύμφωνα με τον Γενικό Κανονισμό Προστασίας Δεδομένων (ΕΕ) 2016/679 (GDPR).',
    ],
  },
  {
    heading: 'Δεδομένα που συλλέγουμε',
    body: [
      'Κατά την υποβολή μιας παραγγελίας ή την επικοινωνία μαζί μας ενδέχεται να συλλέξουμε:',
      [
        'Στοιχεία ταυτότητας & επικοινωνίας: όνομα, επώνυμο, email, τηλέφωνο',
        'Στοιχεία διεύθυνσης: διεύθυνση χρέωσης και αποστολής, πόλη, ταχ. κώδικας, χώρα',
        'Στοιχεία παραγγελίας: προϊόντα, αξία, τρόπος αποστολής και πληρωμής',
        'Τεχνικά δεδομένα: διεύθυνση IP και δεδομένα περιήγησης μέσω cookies',
      ],
    ],
  },
  {
    heading: 'Σκοποί & νομική βάση επεξεργασίας',
    body: [
      'Επεξεργαζόμαστε τα δεδομένα σας για την εκτέλεση και αποστολή της παραγγελίας σας (εκτέλεση σύμβασης), την εξυπηρέτηση πελατών, τη συμμόρφωση με νομικές υποχρεώσεις (π.χ. φορολογικές) και, εφόσον συναινέσετε, για ενημερωτικές επικοινωνίες.',
    ],
  },
  {
    heading: 'Κοινοποίηση σε τρίτους',
    body: [
      'Μοιραζόμαστε δεδομένα μόνο στο μέτρο που είναι απαραίτητο:',
      [
        'Εταιρείες ταχυμεταφορών (ACS) για την παράδοση της παραγγελίας',
        'Πάροχοι υπηρεσιών πληρωμών για την ασφαλή ολοκλήρωση της συναλλαγής',
      ],
      'Δεν πωλούμε και δεν ενοικιάζουμε τα προσωπικά σας δεδομένα σε τρίτους.',
    ],
  },
  {
    heading: 'Cookies',
    body: [
      'Ο ιστότοπος χρησιμοποιεί cookies για τη σωστή λειτουργία του (π.χ. διατήρηση του καλαθιού), για στατιστικά χρήσης και για τη βελτίωση της εμπειρίας σας. Μπορείτε να διαχειριστείτε ή να απενεργοποιήσετε τα cookies μέσω των ρυθμίσεων του προγράμματος περιήγησής σας.',
    ],
  },
  {
    heading: 'Διατήρηση δεδομένων',
    body: [
      'Διατηρούμε τα προσωπικά σας δεδομένα μόνο για όσο διάστημα απαιτείται για την εκπλήρωση των σκοπών που περιγράφονται ή όπως επιβάλλει η νομοθεσία (π.χ. φορολογικά παραστατικά).',
    ],
  },
  {
    heading: 'Τα δικαιώματά σας',
    body: [
      'Σύμφωνα με τον GDPR έχετε δικαίωμα πρόσβασης, διόρθωσης, διαγραφής, περιορισμού και φορητότητας των δεδομένων σας, καθώς και δικαίωμα εναντίωσης στην επεξεργασία και ανάκλησης της συγκατάθεσής σας ανά πάσα στιγμή.',
    ],
  },
  {
    heading: 'Ασφάλεια',
    body: [
      'Εφαρμόζουμε κατάλληλα τεχνικά και οργανωτικά μέτρα για την προστασία των δεδομένων σας από μη εξουσιοδοτημένη πρόσβαση, απώλεια ή κακή χρήση.',
    ],
  },
]

const TITLE_EN = 'Privacy & Cookie Policy'
const LAST_UPDATED_EN = 'Last updated: June 2026'
const INTRO_EN =
  'Protecting your personal data is important to us. Below we explain what data we collect and how we use it.'

const SECTIONS_EN: LegalSection[] = [
  {
    heading: 'Introduction',
    body: [
      'Oros Maxaira respects your privacy and is committed to protecting your personal data. This policy describes how we collect, use and protect your data, in accordance with the General Data Protection Regulation (EU) 2016/679 (GDPR).',
    ],
  },
  {
    heading: 'Data we collect',
    body: [
      'When you place an order or contact us, we may collect:',
      [
        'Identity & contact details: first name, last name, email, phone',
        'Address details: billing and shipping address, city, postal code, country',
        'Order details: products, value, shipping and payment method',
        'Technical data: IP address and browsing data via cookies',
      ],
    ],
  },
  {
    heading: 'Purposes & legal basis of processing',
    body: [
      'We process your data to fulfil and ship your order (performance of a contract), for customer service, to comply with legal obligations (e.g. tax) and, where you have consented, for marketing communications.',
    ],
  },
  {
    heading: 'Sharing with third parties',
    body: [
      'We share data only to the extent necessary:',
      [
        'Courier companies (ACS) for the delivery of your order',
        'Payment service providers for the secure completion of the transaction',
      ],
      'We do not sell or rent your personal data to third parties.',
    ],
  },
  {
    heading: 'Cookies',
    body: [
      'The website uses cookies for its proper operation (e.g. keeping your cart), for usage statistics and to improve your experience. You can manage or disable cookies through your browser settings.',
    ],
  },
  {
    heading: 'Data retention',
    body: [
      'We keep your personal data only for as long as required to fulfil the purposes described or as required by law (e.g. tax records).',
    ],
  },
  {
    heading: 'Your rights',
    body: [
      'Under the GDPR you have the right to access, rectify, erase, restrict and port your data, as well as the right to object to processing and to withdraw your consent at any time.',
    ],
  },
  {
    heading: 'Security',
    body: [
      'We apply appropriate technical and organizational measures to protect your data against unauthorized access, loss or misuse.',
    ],
  },
]

const META = {
  el: {
    title: 'Πολιτική Απορρήτου & Cookies',
    description:
      'Πώς η Όρος Μαχαιρά συλλέγει, χρησιμοποιεί και προστατεύει τα προσωπικά σας δεδομένα, σύμφωνα με τον Γενικό Κανονισμό Προστασίας Δεδομένων (GDPR).',
  },
  en: {
    title: 'Privacy & Cookie Policy',
    description:
      'How Oros Maxaira collects, uses and protects your personal data, in accordance with the General Data Protection Regulation (GDPR).',
  },
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const m = locale === 'en' ? META.en : META.el
  return {
    title: m.title,
    description: m.description,
    alternates: hreflangAlternates(locale, '/privacy-amp-cookie-policy'),
  }
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const isEn = locale === 'en'
  return (
    <LegalPage
      locale={locale}
      title={isEn ? TITLE_EN : TITLE}
      lastUpdated={isEn ? LAST_UPDATED_EN : LAST_UPDATED}
      intro={isEn ? INTRO_EN : INTRO}
      sections={isEn ? SECTIONS_EN : SECTIONS}
    />
  )
}
