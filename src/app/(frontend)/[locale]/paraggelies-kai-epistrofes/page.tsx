import type { Metadata } from 'next'
import { LegalPage, type LegalSection } from '@/components/legal/legal-page'
import { hreflangAlternates } from '@/lib/seo'

const TITLE = 'Παραγγελίες & Επιστροφές'
const LAST_UPDATED = 'Τελευταία ενημέρωση: Ιούλιος 2026'
const INTRO = 'Οι όροι αυτοί ισχύουν μόνο για προϊόντα που αγοράστηκαν από αυτόν τον ιστότοπο.'

const SECTIONS: LegalSection[] = [
  {
    heading: 'Επιστροφές προϊόντων',
    body: [
      'Είμαστε σίγουροι ότι οι αγορές που κάνετε από αυτή την ιστοσελίδα θα σας ικανοποιήσουν απόλυτα. Εάν όμως δεν είστε απόλυτα ικανοποιημένοι με την αγορά σας, μπορείτε να ακυρώσετε την παραγγελία σας απλώς ειδοποιώντας μας μέσω email εντός 3 ημερών από την ημερομηνία που λάβατε τα προϊόντα, και να τα επιστρέψετε εντός 14 ημερών από την ημερομηνία ακύρωσης. Θα γίνει επιστροφή χρημάτων ή έκδοση κουπονιού για να πάρετε άλλα προϊόντα από την εταιρεία μας.',
      'Λάβετε υπόψη ότι θα είστε υπεύθυνοι για τα έξοδα επιστροφής των αγαθών σε εμάς, εκτός εάν σας παραδώσαμε το προϊόν κατά λάθος ή εάν το προϊόν είναι ελαττωματικό. Συσκευάστε το σχετικό προϊόν με ασφάλεια, τουλάχιστον στη συσκευασία που παραλήφθηκε, και στείλτε το σε εμάς μαζί με ένα αντίγραφο του τιμολογίου σας, ώστε να το παραλάβουμε εντός επτά εργάσιμων ημερών από την ημέρα που το προϊόν παραδόθηκε σε εσάς.',
    ],
  },
  {
    heading: 'Όροι παραγγελιών',
    body: [
      [
        'Οι τιμές υπόκεινται σε αλλαγές χωρίς προειδοποίηση. Μικρές παραλλαγές προδιαγραφών δεν δίνουν το δικαίωμα στον αγοραστή να κάνει οποιοδήποτε παράπονο.',
        'Αν τα προϊόντα είναι προβληματικά, παρακαλούμε όπως μας ενημερώσετε μέσα σε 24 ώρες.',
        'Οι παραγγελίες που παραδίδονται ενδέχεται να υπόκεινται σε χρέωση αποστολής — ελέγξτε την πολιτική αποστολής των προϊόντων.',
        'Το όνομα και η διεύθυνση του κατόχου της κάρτας και η διεύθυνση παράδοσης πρέπει να είναι ίδια για την 1η παραγγελία.',
        'Δεν παραδίδουμε σε αριθμούς P.O. Box.',
        'Η πολιτική της εταιρείας είναι να αποστέλλονται τα προϊόντα εντός 4 εργάσιμων ημερών από την παραλαβή της παραγγελίας σας· ωστόσο αυτό μπορεί να διαφέρει ανάλογα με τα αποθέματα. Οι χρόνοι που αναφέρονται δίνονται με καλή πίστη, αλλά δεν είναι δεσμευτικοί.',
        'Η εταιρεία Μ.Φ. Όρος Μαχαιρά Ltd δεν φέρει ευθύνη για καθυστερήσεις στην παράδοση από τη μεταφορική εταιρεία.',
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

const TITLE_EN = 'Orders & Returns'
const LAST_UPDATED_EN = 'Last updated: July 2026'
const INTRO_EN = 'This applies to items purchased from this site only.'

const SECTIONS_EN: LegalSection[] = [
  {
    heading: 'Product returns',
    body: [
      'We hope you’ll love every purchase you make from our website, but if you are not completely satisfied with your purchase, you can cancel your order by simply notifying us by email within 3 days from the date you received the items and return them to us within 14 days from the cancellation date. We will issue a full refund or credit note for the price you paid for the item.',
      'Please note that you will be responsible for the costs of returning the goods to us unless we delivered the item to you in error, or if the item is faulty. Please package the relevant item securely in at least the packaging it was received and send it to us with a copy of your invoice so that we receive it within seven working days of the day after the date that the item was delivered to you.',
    ],
  },
  {
    heading: 'Order terms',
    body: [
      [
        'Prices are subject to change without notice. Minor specification variations do not entitle the purchaser to rescind the contract.',
        'Claims for damaged goods must notify within 24 hours of receipt, please inspect goods immediately.',
        'Orders delivered may be subject to a delivery charge, check our Shipping Policy.',
        'The cardholder’s name and address and delivery address must be the same for the 1st order.',
        'We do not deliver to P.O. Box numbers.',
        'The company policy is to dispatch goods within 4 working days of receiving your order, however this can vary subject to availability of stock. Times quoted are made in good faith, but shall not be binding.',
        'M.F. Oros Maxaira Ltd cannot accept responsibility for transport delays causing late delivery.',
        'Late delivery does not entitle you to refuse or cancel the order.',
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
    title: 'Παραγγελίες & Επιστροφές',
    description:
      'Παραγγελίες και επιστροφές στο ηλεκτρονικό κατάστημα Όρος Μαχαιρά — ακυρώσεις, επιστροφές προϊόντων και όροι παραγγελιών.',
  },
  en: {
    title: 'Orders & Returns',
    description:
      'Orders and returns at the Oros Maxaira online store — cancellations, product returns and order terms.',
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
    alternates: hreflangAlternates(locale, '/paraggelies-kai-epistrofes'),
  }
}

export default async function OrdersReturnsPage({
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
