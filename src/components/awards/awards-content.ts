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

const AWARDS_EL = {
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

export type AwardsContent = typeof AWARDS_EL

// --- English bundle -------------------------------------------------------
// Awards has no live English page yet, so the copy below is a faithful
// translation of the Greek source above. Image paths, years, slugs, product
// hrefs and medal tiers are locale-invariant and reused via pics()/constants.

const AWARDS_EN: AwardsContent = {
  breadcrumb: [
    { label: 'Home', href: '/' },
    { label: 'Awards' },
  ],
  hero: {
    title: 'Awards & Distinctions',
    description:
      'Every award is a confirmation of our work, our tradition and our love for the bee and for nature. Explore the distinctions entrusted to us by leading institutions in Cyprus and abroad.',
    image: AWARDS_EL.hero.image,
    imageAlt: 'Gold Award, Cyprus Tourism Awards 2025 — Oros Machaira',
  },
  awards: [
    {
      slug: 'specialist-awards-2026',
      event: 'Specialist Awards 2026',
      year: '2026',
      subject: 'Raw Flower Honey',
      badges: [{ tier: 'bronze', label: 'Bronze Award', meta: 'Score 65' }],
      lead: [
        { text: 'With great pride, we announce that our ' },
        { text: 'Raw Flower Honey', href: AVRASTO },
        { text: ' was distinguished with the ' },
        { text: 'Bronze Award', bold: true },
        { text: ' at the Specialist Awards 2026, achieving a score of 65!' },
      ],
      body: [[{ text: 'The judges singled out our honey for:', bold: true }]],
      highlights: [
        'Its rich and balanced flavour, free of defects.',
        'Its correct, firm crystallisation — a hallmark of its purity.',
        'Its distinctive aromas from a range of natural varieties, with gentle notes of thyme.',
      ],
      images: pics('specialist-awards-2026'),
    },
    {
      slug: 'cyprus-tourism-2025',
      event: 'Cyprus Tourism Awards 2025',
      org: 'Boussias Cyprus',
      year: '2025',
      subject: 'MELITE Mead',
      badges: [{ tier: 'gold', label: 'Gold Award', meta: 'Cypriot Beverage · Score 8.2' }],
      lead: [
        { text: 'With special pride and emotion, we announce that ' },
        { text: 'MELITE Mead', href: YDROMELO },
        { text: ' by Oros Machaira won the ' },
        { text: 'Gold Award', bold: true },
        { text: ' at the celebrated Cyprus Tourism Awards, the leading institution organised by Boussias Cyprus.' },
      ],
      body: [
        [
          { text: 'In the ' },
          { text: 'Cypriot Beverage', bold: true },
          {
            text: ' category, our traditional mead stood out with an impressive score of 8.2, confirming its superior quality and its contribution to showcasing Cyprus’s gastronomic heritage.',
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
      subject: 'Raw honey',
      badges: [{ tier: 'gold', label: 'Gold Award' }],
      lead: [
        { text: 'With pride and great joy, we share with you that our ' },
        { text: 'raw honey', href: AVRASTO },
        { text: ' received a ' },
        { text: 'Gold Award', bold: true },
        { text: ' at the Excellent Taste Awards 2025 – London.' },
      ],
      body: [
        'A significant distinction that confirms everything we have stood for over decades.',
        'This award is dedicated to all of you who support us, trust us and choose our honey to accompany your sweetest moments, year after year.',
        [{ text: 'Thank you from the bottom of our hearts!', bold: true }],
      ],
      images: pics('excellent-taste-2025'),
    },
    {
      slug: 'ge-neo-epicheirein-2025',
      event: 'Ge’ Neo Epicheirein Young Entrepreneurship Awards 2025',
      org: 'CCCI',
      year: '2025',
      subject: 'Menelaos Filippou',
      badges: [{ tier: 'first', label: 'Award', meta: 'Category: Industrial Enterprises' }],
      lead: [
        {
          text: 'The Selection Committee of the CCCI for the “Ge’ Neo Epicheirein” young entrepreneurs awards chose ',
        },
        { text: 'Menelaos Filippou', bold: true },
        { text: ' to be honoured in the Industrial Enterprises category for 2025.' },
      ],
      body: [
        [
          { text: 'The awards presented by the CCCI aim to promote and highlight ' },
          { text: 'youth entrepreneurship', bold: true },
          {
            text: ' and participation in a global network of young entrepreneurs, selected on merit-based criteria.',
          },
        ],
      ],
      note: 'This award was accepted by Maria Solomonidou on Menelaos’s behalf, as he was abroad at the time.',
      images: pics('ge-neo-epicheirein-2025'),
    },
    {
      slug: 'cyprus-tourism-2024',
      event: 'Cyprus Tourism Awards 2024',
      org: 'City of Dreams',
      year: '2024',
      badges: [
        { tier: 'gold', label: 'Gold Award', meta: 'Score 7.3' },
        { tier: 'silver', label: 'Silver Award', meta: 'Score 4.5' },
      ],
      lead: 'With immense joy, we announce that Oros Machaira received two very important distinctions at the Cyprus Tourism Awards ceremony, held at City of Dreams.',
      body: [
        'The institution’s judging panel honoured us with two distinctions, rewarding our vision for nature and people:',
        [
          { text: '🥇 ' },
          { text: 'Gold Award', bold: true },
          {
            text: ' — Score 7.3, in the “Initiatives to protect the environment / Raising awareness” category, for the pioneering Adopt a Hive programme.',
          },
        ],
        [
          { text: '🥈 ' },
          { text: 'Silver Award', bold: true },
          {
            text: ' — Score 4.5, in the “Rural/Mountain tourism, ecotourism, wine tourism & agro tourism” category, for our experiential Adventures in the Beehives.',
          },
        ],
      ],
      images: pics('cyprus-tourism-2024'),
    },
    {
      slug: 'cyprus-hospitality',
      event: 'Cyprus Hospitality Awards',
      org: 'Deputy Ministry of Tourism',
      subject: 'Maria Solomonidou — “Getting to Know the Bee”',
      badges: [{ tier: 'first', label: '1st Prize' }],
      lead: 'Authentic Cypriot hospitality and hands-on education are at the heart of everything we do every day at Oros Machaira. We feel doubly proud, as this effort was recognised by our country’s national tourism authority.',
      body: [
        [
          { text: 'At the Cyprus Hospitality Awards ceremony, the Deputy Ministry of Tourism presented the ' },
          { text: '1st Prize', bold: true },
          { text: ' in the “Enrichment Activity Experience” category to ' },
          { text: 'Maria Solomonidou', bold: true },
          { text: ', for the educational and experiential programme “Getting to Know the Bee”.' },
        ],
        'This award does not belong merely to an activity, but to the person behind it. With her ever-present smile and her respect for nature, Maria has managed to turn a visit to our apiary into an unforgettable life experience that enriches Cyprus’s tourism offering.',
      ],
      images: pics('cyprus-hospitality'),
    },
  ] satisfies Award[],
}

/** Locale-aware content for the /awards page. el = Greek source, en = the bundle
 *  above. */
export function getAwardsContent(locale: string): AwardsContent {
  return locale === 'en' ? AWARDS_EN : AWARDS_EL
}
