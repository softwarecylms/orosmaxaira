import type { Metadata } from 'next'
import { LegalPage, type LegalSection } from '@/components/legal/legal-page'
import { hreflangAlternates } from '@/lib/seo'

const TITLE = 'Πολιτική Αποστολής Προϊόντων'
const LAST_UPDATED = 'Τελευταία ενημέρωση: Ιούλιος 2026'
const INTRO = 'Παρακάτω θα βρείτε τους όρους αποστολής και παράδοσης των προϊόντων μας.'

const SECTIONS: LegalSection[] = [
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

const TITLE_EN = 'Shipping Policy'
const LAST_UPDATED_EN = 'Last updated: July 2026'
const INTRO_EN = 'Below you will find the terms for the shipping and delivery of our products.'

const SECTIONS_EN: LegalSection[] = [
  {
    heading: 'Destinations & shipping cost',
    body: [
      [
        'We take orders and deliver our products only in Cyprus and Greece.',
        'Your order is delivered to the nearest ACS Point store corresponding to the address you state at checkout.',
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
        'We aim to deliver your items to you within 4 working days. Whilst we make every effort to ensure all deliveries are complete within the said time, we shall not be liable if we fail to do so in part or in full due to circumstances beyond our control. We shall contact you to let you know if we are unable to deliver an item within the delivery time given.',
        'A signature is required at delivery for all orders. By placing an order, you are authorizing us to accept a signature from another person on your behalf if you are not present at the time of delivery.',
        'We do not deliver to P.O. Box numbers.',
        'Late delivery does not entitle you to refuse or cancel the order.',
        'We reserve the right to choose any method of shipping.',
      ],
    ],
  },
  {
    heading: 'Limitation of liability',
    body: [
      'The user will indemnify M.F. Oros Maxaira Ltd against all claims, liabilities, damages, costs and expenses, including legal fees which may or may not arise out of the use of information of any kind contained within this website.',
      'Whilst all reasonable endeavors have been made to check the accuracy of the information contained within this site, M.F. Oros Maxaira Ltd does not warrant the accuracy of the information contained herein. Further, M.F. Oros Maxaira Ltd or any other associated company or companies will not be liable for any direct, indirect or consequential loss arising from the use of the information and material contained within this website or any other site which the user may access through this website.',
    ],
  },
]

const META = {
  el: {
    title: 'Πολιτική Αποστολής Προϊόντων',
    description:
      'Πολιτική αποστολής προϊόντων του Όρος Μαχαιρά — προορισμοί, κόστος αποστολής, δωρεάν αποστολή στην Κύπρο άνω των €70, χρόνοι και όροι παράδοσης.',
  },
  en: {
    title: 'Shipping Policy',
    description:
      'Oros Maxaira shipping policy — destinations, shipping cost, free delivery in Cyprus over €70, delivery times and terms.',
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
    alternates: hreflangAlternates(locale, '/politiki-apostolis-proionton'),
  }
}

export default async function ShippingPolicyPage({
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
