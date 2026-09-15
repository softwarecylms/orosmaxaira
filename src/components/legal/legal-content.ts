import type { LegalSection } from './legal-page'

/**
 * Copy for the legal pages (Όροι, Απόρρητο, Παραγγελίες & Επιστροφές, Αποστολές),
 * both languages. Kept apart from the page routes so it is plain data — the
 * shape the Medusa content admin edits (content keys `legal.<key>`).
 */

export type LegalDoc = {
  title: string
  lastUpdated: string
  intro: string
  sections: LegalSection[]
  seo: { title: string; description: string }
}

export type LegalKey = 'terms' | 'privacy' | 'orders' | 'shipping'

// --- terms -----------------------------------------------------------------

const TERMS_TITLE = 'Όροι & Προϋποθέσεις'
const TERMS_LAST_UPDATED = 'Τελευταία ενημέρωση: Ιούνιος 2026'
const TERMS_INTRO =
  'Παρακαλούμε διαβάστε προσεκτικά τους παρακάτω όρους πριν χρησιμοποιήσετε τον ιστότοπο και πραγματοποιήσετε παραγγελία.'

const TERMS_SECTIONS: LegalSection[] = [
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

const TERMS_TITLE_EN = 'Terms & Conditions'
const TERMS_LAST_UPDATED_EN = 'Last updated: June 2026'
const TERMS_INTRO_EN =
  'Please read the following terms carefully before using the website and placing an order.'

const TERMS_SECTIONS_EN: LegalSection[] = [
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

const TERMS_META = {
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

// --- privacy-amp-cookie-policy ---------------------------------------------

const PRIVACY_TITLE = 'Πολιτική Απορρήτου & Cookies'
const PRIVACY_LAST_UPDATED = 'Τελευταία ενημέρωση: Ιούνιος 2026'
const PRIVACY_INTRO =
  'Η προστασία των προσωπικών σας δεδομένων είναι σημαντική για εμάς. Παρακάτω εξηγούμε ποια δεδομένα συλλέγουμε και πώς τα χρησιμοποιούμε.'

const PRIVACY_SECTIONS: LegalSection[] = [
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

const PRIVACY_TITLE_EN = 'Privacy & Cookie Policy'
const PRIVACY_LAST_UPDATED_EN = 'Last updated: June 2026'
const PRIVACY_INTRO_EN =
  'Protecting your personal data is important to us. Below we explain what data we collect and how we use it.'

const PRIVACY_SECTIONS_EN: LegalSection[] = [
  {
    heading: 'Introduction',
    body: [
      'Oros Machaira respects your privacy and is committed to protecting your personal data. This policy describes how we collect, use and protect your data, in accordance with the General Data Protection Regulation (EU) 2016/679 (GDPR).',
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
      'We apply appropriate technical and organisational measures to protect your data against unauthorised access, loss or misuse.',
    ],
  },
]

const PRIVACY_META = {
  el: {
    title: 'Πολιτική Απορρήτου & Cookies',
    description:
      'Πώς η Όρος Μαχαιρά συλλέγει, χρησιμοποιεί και προστατεύει τα προσωπικά σας δεδομένα, σύμφωνα με τον Γενικό Κανονισμό Προστασίας Δεδομένων (GDPR).',
  },
  en: {
    title: 'Privacy & Cookie Policy',
    description:
      'How Oros Machaira collects, uses and protects your personal data, in accordance with the General Data Protection Regulation (GDPR).',
  },
}

// --- paraggelies-kai-epistrofes --------------------------------------------

const ORDERS_TITLE = 'Παραγγελίες & Επιστροφές'
const ORDERS_LAST_UPDATED = 'Τελευταία ενημέρωση: Ιούλιος 2026'
const ORDERS_INTRO = 'Οι όροι αυτοί ισχύουν μόνο για προϊόντα που αγοράστηκαν από αυτόν τον ιστότοπο.'

const ORDERS_SECTIONS: LegalSection[] = [
  {
    heading: 'Επιστροφές προϊόντων',
    body: [
      'Είμαστε σίγουροι ότι οι αγορές που κάνετε από αυτή την ιστοσελίδα θα σας ικανοποιήσουν απόλυτα. Εάν όμως δεν είστε απόλυτα ικανοποιημένοι με την αγορά σας, μπορείτε να ακυρώσετε την παραγγελία σας απλώς ειδοποιώντας μας μέσω email εντός 14 ημερών από την ημερομηνία που λάβατε τα προϊόντα, και να τα επιστρέψετε εντός 14 ημερών από την ημερομηνία ακύρωσης. Θα γίνει επιστροφή χρημάτων ή έκδοση κουπονιού για να πάρετε άλλα προϊόντα από την εταιρεία μας.',
      'Λάβετε υπόψη ότι θα είστε υπεύθυνοι για τα έξοδα επιστροφής των αγαθών σε εμάς, εκτός εάν σας παραδώσαμε το προϊόν κατά λάθος ή εάν το προϊόν είναι ελαττωματικό. Συσκευάστε το σχετικό προϊόν με ασφάλεια, τουλάχιστον στη συσκευασία που παραλήφθηκε, και στείλτε το σε εμάς μαζί με ένα αντίγραφο του τιμολογίου σας, ώστε να το παραλάβουμε εντός 14 ημερών από την ημέρα που μας δηλώσατε την ακύρωση.',
    ],
  },
  {
    heading: 'Όροι παραγγελιών',
    body: [
      [
        'Οι τιμές υπόκεινται σε αλλαγές χωρίς προειδοποίηση. Μικρές παραλλαγές προδιαγραφών δεν δίνουν το δικαίωμα στον αγοραστή να κάνει οποιοδήποτε παράπονο.',
        'Πρέπει να μας ενημερώσετε για οποιαδήποτε ζημιά εντός 24 ωρών από την παραλαβή, γι’ αυτό παρακαλούμε ελέγξτε τα προϊόντα σας κατά την παράδοση.',
        'Οι παραγγελίες που παραδίδονται ενδέχεται να υπόκεινται σε χρέωση αποστολής — ελέγξτε την πολιτική αποστολής των προϊόντων.',
        'Το όνομα και η διεύθυνση του κατόχου της κάρτας και η διεύθυνση παράδοσης πρέπει να είναι ίδια για την πρώτη παραγγελία.',
        'Δεν παραδίδουμε σε αριθμούς P.O. Box.',
        'Η πολιτική της εταιρείας είναι να αποστέλλονται τα προϊόντα εντός 4 εργάσιμων ημερών από την παραλαβή της παραγγελίας σας· ωστόσο αυτό μπορεί να διαφέρει ανάλογα με τα αποθέματα. Οι χρόνοι που αναφέρονται δίνονται με καλή πίστη, αλλά δεν είναι δεσμευτικοί.',
        'Η εταιρεία Μ.Φ. Όρος Μαχαιρά Λτδ δεν φέρει ευθύνη για καθυστερήσεις στην παράδοση από τη μεταφορική εταιρεία.',
        'Η καθυστερημένη παράδοση δεν σας δίνει το δικαίωμα να αρνηθείτε ή να ακυρώσετε την παραγγελία.',
      ],
    ],
  },
  {
    heading: 'Περιορισμός ευθύνης',
    body: [
      'Ο χρήστης θα αποζημιώσει την εταιρεία Μ.Φ. Όρος Μαχαιρά Λτδ έναντι όλων των αξιώσεων, υποχρεώσεων, ζημιών και εξόδων, συμπεριλαμβανομένων των νομικών εξόδων, που μπορεί να προκύψουν ή να μην προκύψουν από τη χρήση οποιουδήποτε είδους πληροφοριών που περιέχονται σε αυτόν τον ιστότοπο.',
      'Ενώ έχουν καταβληθεί όλες οι εύλογες προσπάθειες για να ελεγχθεί η ακρίβεια των πληροφοριών που περιέχονται σε αυτόν τον ιστότοπο, η εταιρεία Μ.Φ. Όρος Μαχαιρά Λτδ δεν εγγυάται την ακρίβειά τους και δεν φέρει ευθύνη για οποιαδήποτε άμεση ή έμμεση ζημία που προκύπτει από τη χρήση των πληροφοριών και του υλικού που περιέχονται σε αυτόν τον ιστότοπο ή σε οποιονδήποτε άλλο ιστότοπο στον οποίο μπορεί να έχει πρόσβαση ο χρήστης μέσω αυτού.',
    ],
  },
]

const ORDERS_TITLE_EN = 'Orders & Returns'
const ORDERS_LAST_UPDATED_EN = 'Last updated: July 2026'
const ORDERS_INTRO_EN = 'This applies to items purchased from this site only.'

const ORDERS_SECTIONS_EN: LegalSection[] = [
  {
    heading: 'Product returns',
    body: [
      'We hope you’ll love every purchase you make from our website, but if you are not completely satisfied with your purchase, you can cancel your order by simply notifying us by email within 14 days from the date you received the items and return them to us within 14 days from the cancellation date. We will issue a full refund or credit note for the price you paid for the item.',
      'Please note that you will be responsible for the costs of returning the goods to us unless we delivered the item to you in error, or if the item is faulty. Please package the relevant item securely in at least the packaging it was received and send it to us with a copy of your invoice so that we receive it within 14 days of the day you told us you were cancelling.',
    ],
  },
  {
    heading: 'Order terms',
    body: [
      [
        'Prices are subject to change without notice. Minor variations in specification do not entitle you to cancel the order.',
        'You must notify us of any damage within 24 hours of receipt, so please inspect your goods on delivery.',
        'Orders delivered may be subject to a delivery charge; see our Shipping Policy.',
        'The cardholder’s name and address and delivery address must be the same for the first order.',
        'We do not deliver to P.O. Box numbers.',
        'The company policy is to dispatch goods within 4 working days of receiving your order, although this can vary depending on stock availability. Times quoted are given in good faith and are not binding.',
        'M.F. Oros Maxaira Ltd cannot accept responsibility for transport delays causing late delivery.',
        'Late delivery does not entitle you to refuse or cancel the order.',
      ],
    ],
  },
  {
    heading: 'Limitation of liability',
    body: [
      'The user will indemnify M.F. Oros Maxaira Ltd against all claims, liabilities, damages, costs and expenses, including legal fees, arising out of the use of information of any kind contained within this website.',
      'While all reasonable endeavours have been made to check the accuracy of the information contained within this site, M.F. Oros Maxaira Ltd does not warrant the accuracy of the information contained herein. Further, M.F. Oros Maxaira Ltd or any other associated company or companies will not be liable for any direct, indirect or consequential loss arising from the use of the information and material contained within this website or any other site which the user may access through this website.',
    ],
  },
]

const ORDERS_META = {
  el: {
    title: 'Παραγγελίες & Επιστροφές',
    description:
      'Παραγγελίες και επιστροφές στο ηλεκτρονικό κατάστημα Όρος Μαχαιρά — ακυρώσεις, επιστροφές προϊόντων και όροι παραγγελιών.',
  },
  en: {
    title: 'Orders & Returns',
    description:
      'Orders and returns at the Oros Machaira online store — cancellations, product returns and order terms.',
  },
}

// --- politiki-apostolis-proionton ------------------------------------------

const SHIPPING_TITLE = 'Πολιτική Αποστολής Προϊόντων'
const SHIPPING_LAST_UPDATED = 'Τελευταία ενημέρωση: Ιούλιος 2026'
const SHIPPING_INTRO = 'Παρακάτω θα βρείτε τους όρους αποστολής και παράδοσης των προϊόντων μας.'

const SHIPPING_SECTIONS: LegalSection[] = [
  {
    heading: 'Προορισμοί & κόστος αποστολής',
    body: [
      [
        'Δεχόμαστε παραγγελίες και παραδίδουμε τα προϊόντα μας μόνο στην Κύπρο και στην Ελλάδα.',
        'Η παραγγελία σας παραδίδεται στο πλησιέστερο κατάστημα ACS Point που αντιστοιχεί στη διεύθυνση που δηλώνετε κατά την πληρωμή.',
        'Κατ’ οίκον παράδοση πραγματοποιείται μόνο για προϊόντα που απαιτούν ψυγείο (βασιλικός πολτός και γύρη). Τα προϊόντα αυτά δεν αποστέλλονται στις επαρχίες Πάφου και Αμμοχώστου, ούτε στην Ελλάδα.',
      ],
      'Το κόστος αποστολής για παραγγελίες κάτω των €70 διαμορφώνεται ως εξής:',
      [
        'Κύπρος — Παραλαβή από κατάστημα ACS Point: €2,50',
        'Κύπρος — Κατ’ οίκον παράδοση (προϊόντα ψυγείου): €5,00',
        'Ελλάδα: €7,00',
      ],
      'Για παραγγελίες ίσες ή άνω των €70 με προορισμό την Κύπρο η αποστολή είναι δωρεάν (ACS ή κατ’ οίκον). Για παραγγελίες προς Ελλάδα ισχύει πάντα το κόστος αποστολής των €7,00, ανεξαρτήτως αξίας.',
    ],
  },
  {
    heading: 'Χρόνοι & όροι παράδοσης',
    body: [
      [
        'Στόχος μας είναι να σας παραδώσουμε τα προϊόντα εντός 4 εργάσιμων ημερών. Αν και καταβάλλουμε κάθε δυνατή προσπάθεια ώστε όλες οι παραδόσεις να ολοκληρώνονται εντός του εν λόγω χρονικού περιθωρίου, δεν φέρουμε ευθύνη εάν δεν το κάνουμε εν μέρει ή πλήρως λόγω περιστάσεων που δεν ελέγχουμε. Θα επικοινωνήσουμε μαζί σας εάν δεν μπορούμε να παραδώσουμε ένα προϊόν εντός του καθορισμένου χρόνου παράδοσης.',
        'Απαιτείται υπογραφή κατά την παράδοση για όλες τις παραγγελίες. Κάνοντας μια παραγγελία, μας εξουσιοδοτείτε να δεχτούμε υπογραφή από άλλο άτομο για λογαριασμό σας, εάν δεν είστε παρόντες κατά τη στιγμή της παράδοσης.',
        'Δεν παραδίδουμε σε κουτιά P.O. Box.',
        'Η καθυστερημένη παράδοση δεν σας δίνει το δικαίωμα να αρνηθείτε ή να ακυρώσετε την παραγγελία.',
        'Διατηρούμε το δικαίωμα να επιλέξουμε οποιαδήποτε μέθοδο αποστολής.',
      ],
    ],
  },
  {
    heading: 'Περιορισμός ευθύνης',
    body: [
      'Ο χρήστης θα αποζημιώσει την εταιρεία Μ.Φ. Όρος Μαχαιρά Λτδ έναντι όλων των αξιώσεων, υποχρεώσεων, ζημιών και εξόδων, συμπεριλαμβανομένων των νομικών εξόδων, που μπορεί να προκύψουν ή να μην προκύψουν από τη χρήση οποιουδήποτε είδους πληροφοριών που περιέχονται σε αυτόν τον ιστότοπο.',
      'Ενώ έχουν καταβληθεί όλες οι εύλογες προσπάθειες για να ελεγχθεί η ακρίβεια των πληροφοριών που περιέχονται σε αυτόν τον ιστότοπο, η εταιρεία Μ.Φ. Όρος Μαχαιρά Λτδ δεν εγγυάται την ακρίβειά τους και δεν φέρει ευθύνη για οποιαδήποτε άμεση ή έμμεση ζημία που προκύπτει από τη χρήση των πληροφοριών και του υλικού που περιέχονται σε αυτόν τον ιστότοπο ή σε οποιονδήποτε άλλο ιστότοπο στον οποίο μπορεί να έχει πρόσβαση ο χρήστης μέσω αυτού.',
    ],
  },
]

const SHIPPING_TITLE_EN = 'Shipping Policy'
const SHIPPING_LAST_UPDATED_EN = 'Last updated: July 2026'
const SHIPPING_INTRO_EN = 'Below you will find the terms for the shipping and delivery of our products.'

const SHIPPING_SECTIONS_EN: LegalSection[] = [
  {
    heading: 'Destinations & shipping cost',
    body: [
      [
        'We take orders and deliver our products only in Cyprus and Greece.',
        'Your order is delivered to the ACS Point pick-up store nearest the address you give at checkout.',
        'Home delivery is available only for products that require refrigeration (royal jelly and pollen). These products are not shipped to the Paphos and Famagusta districts, nor to Greece.',
      ],
      'The shipping cost for orders under €70 is as follows:',
      [
        'Cyprus — Pick-up from an ACS Point store: €2.50',
        'Cyprus — Home delivery (refrigerated products): €5.00',
        'Greece: €7.00',
      ],
      'For orders equal to or above €70 shipped to Cyprus, delivery is free (ACS or home delivery). For orders to Greece the €7.00 shipping cost always applies, regardless of value.',
    ],
  },
  {
    heading: 'Delivery times & terms',
    body: [
      [
        'We aim to deliver your items to you within 4 working days. While we make every effort to ensure all deliveries are complete within the said time, we shall not be liable if we fail to do so in part or in full due to circumstances beyond our control. We shall contact you to let you know if we are unable to deliver an item within the delivery time given.',
        'A signature is required at delivery for all orders. By placing an order, you are authorising us to accept a signature from another person on your behalf if you are not present at the time of delivery.',
        'We do not deliver to P.O. Box numbers.',
        'Late delivery does not entitle you to refuse or cancel the order.',
        'We reserve the right to choose any method of shipping.',
      ],
    ],
  },
  {
    heading: 'Limitation of liability',
    body: [
      'The user will indemnify M.F. Oros Maxaira Ltd against all claims, liabilities, damages, costs and expenses, including legal fees, arising out of the use of information of any kind contained within this website.',
      'While all reasonable endeavours have been made to check the accuracy of the information contained within this site, M.F. Oros Maxaira Ltd does not warrant the accuracy of the information contained herein. Further, M.F. Oros Maxaira Ltd or any other associated company or companies will not be liable for any direct, indirect or consequential loss arising from the use of the information and material contained within this website or any other site which the user may access through this website.',
    ],
  },
]

const SHIPPING_META = {
  el: {
    title: 'Πολιτική Αποστολής Προϊόντων',
    description:
      'Πολιτική αποστολής προϊόντων του Όρος Μαχαιρά — προορισμοί, κόστος αποστολής, δωρεάν αποστολή στην Κύπρο άνω των €70, χρόνοι και όροι παράδοσης.',
  },
  en: {
    title: 'Shipping Policy',
    description:
      'Oros Machaira shipping policy — destinations, shipping cost, free delivery in Cyprus over €70, delivery times and terms.',
  },
}

export const LEGAL: Record<LegalKey, { el: LegalDoc; en: LegalDoc }> = {
  terms: {
    el: { title: TERMS_TITLE, lastUpdated: TERMS_LAST_UPDATED, intro: TERMS_INTRO, sections: TERMS_SECTIONS, seo: TERMS_META.el },
    en: { title: TERMS_TITLE_EN, lastUpdated: TERMS_LAST_UPDATED_EN, intro: TERMS_INTRO_EN, sections: TERMS_SECTIONS_EN, seo: TERMS_META.en },
  },
  privacy: {
    el: { title: PRIVACY_TITLE, lastUpdated: PRIVACY_LAST_UPDATED, intro: PRIVACY_INTRO, sections: PRIVACY_SECTIONS, seo: PRIVACY_META.el },
    en: { title: PRIVACY_TITLE_EN, lastUpdated: PRIVACY_LAST_UPDATED_EN, intro: PRIVACY_INTRO_EN, sections: PRIVACY_SECTIONS_EN, seo: PRIVACY_META.en },
  },
  orders: {
    el: { title: ORDERS_TITLE, lastUpdated: ORDERS_LAST_UPDATED, intro: ORDERS_INTRO, sections: ORDERS_SECTIONS, seo: ORDERS_META.el },
    en: { title: ORDERS_TITLE_EN, lastUpdated: ORDERS_LAST_UPDATED_EN, intro: ORDERS_INTRO_EN, sections: ORDERS_SECTIONS_EN, seo: ORDERS_META.en },
  },
  shipping: {
    el: { title: SHIPPING_TITLE, lastUpdated: SHIPPING_LAST_UPDATED, intro: SHIPPING_INTRO, sections: SHIPPING_SECTIONS, seo: SHIPPING_META.el },
    en: { title: SHIPPING_TITLE_EN, lastUpdated: SHIPPING_LAST_UPDATED_EN, intro: SHIPPING_INTRO_EN, sections: SHIPPING_SECTIONS_EN, seo: SHIPPING_META.en },
  },
}

export function getLegalContent(key: LegalKey, locale: string): LegalDoc {
  return locale === 'en' ? LEGAL[key].en : LEGAL[key].el
}
