import type { Metadata } from 'next'
import { LegalPage, type LegalSection } from '@/components/legal/legal-page'
import { hreflangAlternates } from '@/lib/seo'

const TITLE = 'Όροι & Προϋποθέσεις'
const LAST_UPDATED = 'Τελευταία ενημέρωση: Ιούνιος 2026'
const INTRO =
  'Παρακαλούμε διαβάστε προσεκτικά τους παρακάτω όρους πριν χρησιμοποιήσετε τον ιστότοπο και πραγματοποιήσετε παραγγελία.'

const SECTIONS: LegalSection[] = [
  {
    heading: 'Γενικοί όροι',
    body: [
      'Το παρόν ηλεκτρονικό κατάστημα ανήκει και λειτουργεί από την Όρος Μαχαιρά. Η περιήγηση και η χρήση του ιστοτόπου, καθώς και η πραγματοποίηση παραγγελιών, συνεπάγονται την ανεπιφύλακτη αποδοχή των παρόντων όρων.',
      'Διατηρούμε το δικαίωμα να τροποποιούμε τους όρους οποιαδήποτε στιγμή. Οι ισχύοντες όροι είναι αυτοί που εμφανίζονται στον ιστότοπο κατά τη στιγμή της παραγγελίας σας.',
    ],
  },
  {
    heading: 'Προϊόντα & τιμές',
    body: [
      'Τα προϊόντα μας είναι φυσικά μέλι και προϊόντα μέλισσας. Καταβάλλουμε κάθε προσπάθεια ώστε οι περιγραφές, οι εικόνες και οι τιμές να είναι ακριβείς και επικαιροποιημένες.',
      'Όλες οι τιμές αναγράφονται σε ευρώ (€) και περιλαμβάνουν τον αναλογούντα Φ.Π.Α. Η διαθεσιμότητα των προϊόντων ενδέχεται να μεταβάλλεται· σε περίπτωση εξάντλησης θα ενημερωθείτε άμεσα.',
    ],
  },
  {
    heading: 'Παραγγελίες',
    body: [
      'Η παραγγελία σας ολοκληρώνεται μόλις λάβετε επιβεβαίωση μέσω email. Η επιβεβαίωση παραλαβής της παραγγελίας δεν συνιστά αποδοχή πρότασης για πώληση, αλλά επιβεβαίωση ότι λάβαμε το αίτημά σας.',
      'Διατηρούμε το δικαίωμα να αρνηθούμε ή να ακυρώσουμε μια παραγγελία σε περίπτωση λάθους στην τιμή ή στη διαθεσιμότητα, ή για λόγους που αφορούν την ασφάλεια των συναλλαγών.',
    ],
  },
  {
    id: 'apostoles',
    heading: 'Αποστολές & παράδοση',
    body: [
      'Οι αποστολές πραγματοποιούνται μέσω του δικτύου ACS, με παραλαβή από το κατάστημα ACS της επιλογής σας. Κατ’ οίκον παράδοση πραγματοποιείται μόνο για προϊόντα που απαιτούν ψυγείο (βασιλικός πολτός και γύρη), τα οποία δεν αποστέλλονται στις επαρχίες Πάφου και Αμμοχώστου, ούτε στην Ελλάδα.',
      'Το κόστος αποστολής για παραγγελίες κάτω των €70 διαμορφώνεται ως εξής:',
      [
        'Κύπρος — Παραλαβή από κατάστημα ACS Point: €2,50',
        'Κύπρος — Κατ’ οίκον παράδοση (προϊόντα ψυγείου): €5,00',
        'Ελλάδα: €7,00',
      ],
      'Για παραγγελίες ίσες ή άνω των €70 με προορισμό την Κύπρο η αποστολή είναι δωρεάν (ACS ή κατ’ οίκον). Για παραγγελίες προς Ελλάδα ισχύει πάντα το κόστος αποστολής των €7,00, ανεξαρτήτως αξίας. Οι χρόνοι παράδοσης εξαρτώνται από τον προορισμό και κυμαίνονται συνήθως σε 2–6 εργάσιμες ημέρες.',
    ],
  },
  {
    id: 'epistrofes',
    heading: 'Επιστροφές & ακυρώσεις',
    body: [
      'Επειδή τα προϊόντα μας είναι τρόφιμα, για λόγους υγιεινής δεν γίνονται δεκτές επιστροφές προϊόντων που έχουν ανοιχτεί, εκτός εάν υπάρχει ελάττωμα ή σφάλμα στην παραγγελία.',
      'Σε περίπτωση που παραλάβετε ελαττωματικό, κατεστραμμένο ή λανθασμένο προϊόν, επικοινωνήστε μαζί μας εντός 14 ημερών από την παραλαβή και θα φροντίσουμε για την αντικατάσταση ή την επιστροφή χρημάτων.',
    ],
  },
  {
    heading: 'Πληρωμές',
    body: [
      'Οι πληρωμές πραγματοποιούνται με πιστωτική ή χρεωστική κάρτα μέσω ασφαλούς περιβάλλοντος. Δεν αποθηκεύουμε στοιχεία καρτών στους διακομιστές μας.',
    ],
  },
  {
    heading: 'Περιορισμός ευθύνης',
    body: [
      'Η Όρος Μαχαιρά δεν ευθύνεται για καθυστερήσεις ή αδυναμία εκπλήρωσης που οφείλονται σε γεγονότα ανωτέρας βίας ή σε παράγοντες εκτός του εύλογου ελέγχου μας.',
    ],
  },
  {
    heading: 'Εφαρμοστέο δίκαιο',
    body: [
      'Οι παρόντες όροι διέπονται από το δίκαιο της Κυπριακής Δημοκρατίας. Για κάθε διαφορά αρμόδια ορίζονται τα δικαστήρια της Κύπρου.',
    ],
  },
]

const TITLE_EN = 'Terms & Conditions'
const LAST_UPDATED_EN = 'Last updated: June 2026'
const INTRO_EN =
  'Please read the following terms carefully before using the website and placing an order.'

const SECTIONS_EN: LegalSection[] = [
  {
    heading: 'General terms',
    body: [
      'This online store is owned and operated by M.F. Oros Maxaira Ltd. Browsing and using the website, as well as placing orders, imply the unconditional acceptance of these terms.',
      'We reserve the right to amend these terms at any time. The terms in force are those displayed on the website at the time of your order.',
    ],
  },
  {
    heading: 'Products & prices',
    body: [
      'Our products are natural honey and bee products. We make every effort to ensure that descriptions, images and prices are accurate and up to date.',
      'All prices are shown in euro (€) and include the applicable VAT. Product availability may change; if an item is out of stock we will inform you promptly.',
    ],
  },
  {
    heading: 'Orders',
    body: [
      'Your order is completed once you receive a confirmation by email. The order acknowledgement does not constitute acceptance of an offer to sell, but confirmation that we have received your request.',
      'We reserve the right to refuse or cancel an order in the event of an error in the price or availability, or for reasons relating to the security of transactions.',
    ],
  },
  {
    id: 'apostoles',
    heading: 'Shipping & delivery',
    body: [
      'Shipments are made through the ACS network, with pick-up from the ACS store of your choice. Home delivery is available only for products that require refrigeration (royal jelly and pollen), which are not shipped to the Paphos and Famagusta districts, nor to Greece.',
      'The shipping cost for orders under €70 is as follows:',
      [
        'Cyprus — Pick-up from an ACS Point store: €2.50',
        'Cyprus — Home delivery (refrigerated products): €5.00',
        'Greece: €7.00',
      ],
      'For orders equal to or above €70 shipped to Cyprus, delivery is free (ACS or home delivery). For orders to Greece the €7.00 shipping cost always applies, regardless of value. Delivery times depend on the destination and are usually 2–6 working days.',
    ],
  },
  {
    id: 'epistrofes',
    heading: 'Returns & cancellations',
    body: [
      'Because our products are food items, for hygiene reasons we cannot accept returns of products that have been opened, unless there is a defect or an error in the order.',
      'If you receive a defective, damaged or incorrect product, please contact us within 14 days of receipt and we will arrange a replacement or refund.',
    ],
  },
  {
    heading: 'Payments',
    body: [
      'Payments are made by credit or debit card through a secure environment. We do not store card details on our servers.',
    ],
  },
  {
    heading: 'Limitation of liability',
    body: [
      'M.F. Oros Maxaira Ltd is not liable for delays or failure to perform caused by events of force majeure or by factors beyond our reasonable control.',
    ],
  },
  {
    heading: 'Governing law',
    body: [
      'These terms are governed by the law of the Republic of Cyprus. Any dispute shall be subject to the jurisdiction of the courts of Cyprus.',
    ],
  },
]

const META = {
  el: {
    title: 'Όροι & Προϋποθέσεις',
    description:
      'Οι όροι και προϋποθέσεις χρήσης του ηλεκτρονικού καταστήματος Όρος Μαχαιρά — παραγγελίες, αποστολές, επιστροφές και πληρωμές.',
  },
  en: {
    title: 'Terms & Conditions',
    description:
      'The terms and conditions of use of the Oros Machaira online store — orders, shipping, returns and payments.',
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
    alternates: hreflangAlternates(locale, '/terms'),
  }
}

export default async function TermsPage({
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
