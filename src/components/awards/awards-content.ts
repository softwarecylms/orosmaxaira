/**
 * Awards / Διακρίσεις page content. Copy transcribed from the supplied document
 * (public/awards.docx → _raw). Photos optimized into slug folders by
 * scripts/optimize-awards.mjs. Newest-first order.
 */

import { AWARD_IMAGES, type AwardImage } from './awards-manifest'

export type MedalTier = 'gold' | 'silver' | 'bronze' | 'first'
export type AwardBadge = { tier: MedalTier; label: string; meta?: string }

/** Inline rich text: a paragraph is a plain string, or an array of spans that
 *  can be bold and/or a link (e.g. a product name → its page). */
export type RichSpan = { text: string; bold?: boolean; href?: string }
export type RichLine = string | RichSpan[]

export type Award = {
  slug: string
  event: string
  org?: string
  year?: string
  /** product or person the distinction is for */
  subject?: string
  badges: AwardBadge[]
  lead: RichLine
  body?: RichLine[]
  highlights?: string[]
  note?: string
  images: AwardImage[]
}

const pics = (slug: string): AwardImage[] => AWARD_IMAGES[slug] ?? []

const AVRASTO = '/shop/avrasto-meli-antheon-oros-machaira'
const YDROMELO = '/shop/ydromelo'

export const AWARDS_PAGE = {
  breadcrumb: [
    { label: 'Αρχική', href: '/' },
    { label: 'Βραβεία' },
  ] as { label: string; href?: string }[],
  hero: {
    title: 'Βραβεία & Διακρίσεις',
    description:
      'Κάθε βραβείο είναι μια επιβεβαίωση της δουλειάς, της παράδοσης και της αγάπης μας για τη μέλισσα και τη φύση. Δείτε τις διακρίσεις που μας εμπιστεύτηκαν κορυφαίοι θεσμοί στην Κύπρο και το εξωτερικό.',
    image: '/images/awards/hero-award.webp',
    imageAlt: 'Χρυσό Βραβείο Cyprus Tourism Awards 2025 — Όρος Μαχαιρά',
  },
  awards: [
    {
      slug: 'specialist-awards-2026',
      event: 'Specialist Awards 2026',
      year: '2026',
      subject: 'Άβραστο Μέλι Ανθέων',
      badges: [{ tier: 'bronze', label: 'Χάλκινο Βραβείο', meta: 'Βαθμολογία 65' }],
      lead: [
        { text: 'Με μεγάλη περηφάνια σας ανακοινώνουμε ότι το ' },
        { text: 'Άβραστο Μέλι Ανθέων', href: AVRASTO },
        { text: ' μας διακρίθηκε με το ' },
        { text: 'Χάλκινο Βραβείο', bold: true },
        { text: ' στα Specialist Awards 2026, συγκεντρώνοντας βαθμολογία 65!' },
      ],
      body: [[{ text: 'Οι κριτές ξεχώρισαν το μέλι μας για:', bold: true }]],
      highlights: [
        'Την πλούσια και ισορροπημένη γεύση του, χωρίς ελαττώματα.',
        'Τη σωστή και συμπαγή κρυστάλλωσή του, σήμα κατατεθέν της αγνότητάς του.',
        'Τα ιδιαίτερα αρώματα από διάφορες ποικιλίες της φύσης, με απαλές νότες θυμαριού.',
      ],
      images: pics('specialist-awards-2026'),
    },
    {
      slug: 'cyprus-tourism-2025',
      event: 'Cyprus Tourism Awards 2025',
      org: 'Boussias Cyprus',
      year: '2025',
      subject: 'Υδρόμελο ΜΕLΙΤΕ',
      badges: [{ tier: 'gold', label: 'Χρυσό Βραβείο', meta: 'Cypriot Beverage · Βαθμολογία 8.2' }],
      lead: [
        { text: 'Με ιδιαίτερη περηφάνια και συγκίνηση σας ανακοινώνουμε ότι το ' },
        { text: 'Υδρόμελο ΜΕLΙΤΕ', href: YDROMELO },
        { text: ' του Όρος Μαχαιρά κατέκτησε το ' },
        { text: 'Χρυσό Βραβείο', bold: true },
        { text: ' στα περίφημα Cyprus Tourism Awards, τον κορυφαίο θεσμό που διοργανώνει η Boussias Cyprus.' },
      ],
      body: [
        [
          { text: 'Στην κατηγορία ' },
          { text: 'Cypriot Beverage', bold: true },
          {
            text: ', το παραδοσιακό μας υδρόμελο ξεχώρισε συγκεντρώνοντας την εντυπωσιακή βαθμολογία 8.2, επιβεβαιώνοντας την ανώτερη ποιότητά του και τη συμβολή του στην ανάδειξη της κυπριακής γαστρονομικής κληρονομιάς.',
          },
        ],
      ],
      images: pics('cyprus-tourism-2025'),
    },
    {
      slug: 'excellent-taste-2025',
      event: 'Excellent Taste Awards 2025',
      org: 'London',
      year: '2025',
      subject: 'Άβραστο μέλι',
      badges: [{ tier: 'gold', label: 'Χρυσό Βραβείο' }],
      lead: [
        { text: 'Με περηφάνια και μεγάλη μας χαρά μοιραζόμαστε μαζί σας ότι το ' },
        { text: 'άβραστο μέλι', href: AVRASTO },
        { text: ' μας απέσπασε ' },
        { text: 'Χρυσό Βραβείο', bold: true },
        { text: ' στα Excellent Taste Awards 2025 – London.' },
      ],
      body: [
        'Μια σημαντική διάκριση που επιβεβαιώνει όλα όσα πρεσβεύουμε εδώ και δεκαετίες.',
        'Αυτό το βραβείο είναι αφιερωμένο σε όλους εσάς που μας στηρίζετε, μας εμπιστεύεστε και επιλέγετε το μέλι μας να συνοδεύει τις πιο γλυκές σας στιγμές όλα αυτά τα χρόνια.',
        [{ text: 'Σας ευχαριστούμε από καρδιάς!', bold: true }],
      ],
      images: pics('excellent-taste-2025'),
    },
    {
      slug: 'ge-neo-epicheirein-2025',
      event: 'Βραβεία «Γε’ Νέο Επιχειρείν» 2025',
      org: 'ΚΕΒΕ',
      year: '2025',
      subject: 'Μενέλαος Φιλίππου',
      badges: [{ tier: 'first', label: 'Βραβείο', meta: 'Κατηγορία: Βιομηχανικές Επιχειρήσεις' }],
      lead: [
        {
          text: 'Η Επιτροπή Επιλογής του ΚΕΒΕ για τα βραβεία νέων επιχειρηματιών «Γε’ Νέο Επιχειρείν» επέλεξε τον ',
        },
        { text: 'Μενέλαο Φιλίππου', bold: true },
        { text: ' να βραβευθεί στην κατηγορία Βιομηχανικές Επιχειρήσεις για το έτος 2025.' },
      ],
      body: [
        [
          { text: 'Τα βραβεία που απονέμονται από το ΚΕΒΕ στοχεύουν στην προβολή και ανάδειξη της ' },
          { text: 'νεανικής επιχειρηματικότητας', bold: true },
          {
            text: ' και στη συμμετοχή σε ένα παγκόσμιο δίκτυο νέων επιχειρηματιών, επιλεγμένων με αξιοκρατικά κριτήρια.',
          },
        ],
      ],
      note: 'Το συγκεκριμένο βραβείο το παρέλαβε η Μαρία Σολομωνίδου στη θέση του Μέλιου, καθώς εκείνος έλειπε στο εξωτερικό.',
      images: pics('ge-neo-epicheirein-2025'),
    },
    {
      slug: 'cyprus-tourism-2024',
      event: 'Cyprus Tourism Awards 2024',
      org: 'City of Dreams',
      year: '2024',
      badges: [
        { tier: 'gold', label: 'Χρυσό Βραβείο', meta: 'Βαθμολογία 7.3' },
        { tier: 'silver', label: 'Αργυρό Βραβείο', meta: 'Βαθμολογία 4.5' },
      ],
      lead: 'Με τεράστια χαρά σας ανακοινώνουμε ότι το Όρος Μαχαιρά απέσπασε δύο πολύ σημαντικές διακρίσεις στην τελετή απονομής των Cyprus Tourism Awards, που πραγματοποιήθηκε στο City of Dreams.',
      body: [
        'Η κριτική επιτροπή του θεσμού μάς τίμησε με δύο διακρίσεις, επιβραβεύοντας το όραμά μας για τη φύση και τον άνθρωπο:',
        [
          { text: '🥇 ' },
          { text: 'Χρυσό Βραβείο (Gold)', bold: true },
          {
            text: ' — Βαθμολογία 7.3, στην κατηγορία «Initiatives to protect the environment / Raising awareness», για το πρωτοποριακό πρόγραμμα Adopt a Hive (Υιοθέτησε ένα Μελίσσι).',
          },
        ],
        [
          { text: '🥈 ' },
          { text: 'Αργυρό Βραβείο (Silver)', bold: true },
          {
            text: ' — Βαθμολογία 4.5, στην κατηγορία «Rural/Mountain tourism, ecotourism, wine tourism & agro tourism», για τις βιωματικές μας εμπειρίες Adventures in the beehives (Περιπέτειες στις Μελισσοφωλιές).',
          },
        ],
      ],
      images: pics('cyprus-tourism-2024'),
    },
    {
      slug: 'cyprus-hospitality',
      event: 'Cyprus Hospitality Awards',
      org: 'Υφυπουργείο Τουρισμού',
      subject: 'Μαρία Σολομωνίδου — «Γνωρίζω τη Μέλισσα»',
      badges: [{ tier: 'first', label: '1ο Βραβείο' }],
      lead: 'Η αυθεντική κυπριακή φιλοξενία και η βιωματική εκπαίδευση βρίσκονται στον πυρήνα όσων κάνουμε καθημερινά στο Όρος Μαχαιρά. Νιώθουμε διπλή περηφάνια, καθώς η προσπάθεια αυτή αναγνωρίστηκε από τον εθνικό φορέα του τουρισμού του τόπου μας.',
      body: [
        [
          { text: 'Στην τελετή των Cyprus Hospitality Awards, το Υφυπουργείο Τουρισμού απένειμε το ' },
          { text: '1ο Βραβείο', bold: true },
          { text: ' στην κατηγορία «Εμπειρία Εμπλουτιστικής Δραστηριότητας» στη ' },
          { text: 'Μαρία Σολομωνίδου', bold: true },
          { text: ', για το εκπαιδευτικό και βιωματικό πρόγραμμα «Γνωρίζω τη Μέλισσα».' },
        ],
        'Το βραβείο αυτό δεν ανήκει απλώς σε μια δραστηριότητα, αλλά στον άνθρωπο που κρύβεται πίσω από αυτήν. Η Μαρία, με το μόνιμο χαμόγελό της και τον σεβασμό της προς τη φύση, έχει καταφέρει να μετατρέψει μια επίσκεψη στο μελισσοκομείο μας σε μια αξέχαστη εμπειρία ζωής, που εμπλουτίζει το τουριστικό προϊόν της Κύπρου.',
      ],
      images: pics('cyprus-hospitality'),
    },
  ] satisfies Award[],
}
