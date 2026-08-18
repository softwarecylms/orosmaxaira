/**
 * Content for the /certificates page. Editable copy lives here (mirrors the
 * about/awards content-file pattern).
 *
 * The Greek constants are the source of truth; `CERTIFICATES_EN` overrides only
 * the user-facing text. Image/PDF paths are locale-invariant and reused from EL.
 * `getCertificatesContent(locale)` returns the right bundle — read the active
 * locale via next-intl's `getLocale()` (server) / `useLocale()` (client).
 *
 * PDFs live under /public/images/certificates. The preview images are the PDFs'
 * first page rendered to PNG. ISO 14001 has only a Greek certificate for now.
 */

export type Certificate = {
  code: string // e.g. "ISO 22000"
  title: string // full standard name
  image: string
  imageAlt: string
  body: string[] // paragraphs
  highlights: string[] // bullet list
  pdfGr: string // Greek certificate (primary download)
  pdfEn?: string // English certificate (optional)
}

export type CertificatesContent = {
  hero: { eyebrow: string; title: string; description: string; image: string; imageAlt: string }
  intro: string[]
  certificates: Certificate[]
}

const CERTIFICATES_EL: CertificatesContent = {
  hero: {
    eyebrow: 'Ποιότητα & Ασφάλεια',
    title: 'Πιστοποιήσεις',
    description:
      'Η δέσμευσή μας για ποιότητα, ασφάλεια τροφίμων και σεβασμό στο περιβάλλον — πιστοποιημένη με διεθνώς αναγνωρισμένα πρότυπα.',
    image: '/images/certificates/certificates-hero.jpg',
    imageAlt: 'Η οικογένεια και η ομάδα του Όρους Μαχαιρά',
  },
  intro: [
    'Στο Όρος Μαχαιρά, η ποιότητα δεν είναι απλώς μια υπόσχεση — είναι μια δέσμευση που αποδεικνύεται έμπρακτα. Οι διαδικασίες και τα προϊόντα μας πιστοποιούνται σύμφωνα με διεθνή πρότυπα, ώστε κάθε βαζάκι μέλι που φτάνει στο τραπέζι σας να πληροί τις υψηλότερες προδιαγραφές ασφάλειας και υπευθυνότητας.',
    'Παρακάτω θα βρείτε τις πιστοποιήσεις μας, μαζί με τα επίσημα έγγραφα προς λήψη.',
  ],
  certificates: [
    {
      code: 'ISO 14001',
      title: 'Σύστημα Περιβαλλοντικής Διαχείρισης',
      image: '/images/certificates/14001-preview.png',
      imageAlt: 'Πιστοποιητικό ISO 14001 — Σύστημα Περιβαλλοντικής Διαχείρισης',
      body: [
        'Το **ISO 14001** είναι το διεθνές πρότυπο για τα Συστήματα Περιβαλλοντικής Διαχείρισης. Αποδεικνύει τη δέσμευσή μας για βιώσιμη ανάπτυξη και σεβασμό προς τη φύση και τις μέλισσες.',
        'Μέσα από υπεύθυνες πρακτικές, μειώνουμε το περιβαλλοντικό μας αποτύπωμα και προστατεύουμε το οικοσύστημα του Μαχαιρά — το ίδιο οικοσύστημα στο οποίο στηρίζεται η μελισσοκομία μας.',
      ],
      highlights: [
        'Μείωση του περιβαλλοντικού αποτυπώματος',
        'Υπεύθυνη διαχείριση πόρων & αποβλήτων',
        'Προστασία των μελισσών & της βιοποικιλότητας',
        'Συνεχής βελτίωση των περιβαλλοντικών επιδόσεων',
      ],
      // Real ISO 14001 (GR) certificate; no separate EN file supplied yet.
      pdfGr: '/images/certificates/ISO_14001_GR.pdf',
    },
    {
      code: 'ISO 22000',
      title: 'Σύστημα Διαχείρισης Ασφάλειας Τροφίμων',
      image: '/images/certificates/22000-preview.png',
      imageAlt: 'Πιστοποιητικό ISO 22000 — Σύστημα Διαχείρισης Ασφάλειας Τροφίμων',
      body: [
        'Το **ISO 22000** είναι το διεθνές πρότυπο για τα Συστήματα Διαχείρισης της Ασφάλειας Τροφίμων. Πιστοποιεί ότι κάθε στάδιο της παραγωγής μας — από την κυψέλη μέχρι τη συσκευασία — ακολουθεί αυστηρές διαδικασίες υγιεινής και ελέγχου.',
        'Η πιστοποίηση αυτή διασφαλίζει την πλήρη ιχνηλασιμότητα των προϊόντων μας και την τήρηση των αρχών HACCP σε ολόκληρη την αλυσίδα παραγωγής, ώστε να απολαμβάνετε με απόλυτη ασφάλεια το μέλι και τα προϊόντα της κυψέλης.',
      ],
      highlights: [
        'Ανάλυση κινδύνων & κρίσιμα σημεία ελέγχου (HACCP)',
        'Πλήρης ιχνηλασιμότητα από την κυψέλη στο ράφι',
        'Αυστηροί έλεγχοι υγιεινής σε κάθε στάδιο',
        'Ετήσιες επιθεωρήσεις από διαπιστευμένο φορέα',
      ],
      pdfGr: '/images/certificates/iso-22000-gr.pdf',
      pdfEn: '/images/certificates/iso-22000-en.pdf',
    },
  ],
}

const CERTIFICATES_EN: CertificatesContent = {
  hero: {
    eyebrow: 'Quality & Safety',
    title: 'Certifications',
    description:
      'Our commitment to quality, food safety and respect for the environment — certified to internationally recognised standards.',
    image: CERTIFICATES_EL.hero.image,
    imageAlt: 'The family and team of Oros Machaira',
  },
  intro: [
    'At Oros Machaira, quality is not merely a promise — it is a commitment proven in practice. Our processes and products are certified to international standards, so that every jar of honey that reaches your table meets the highest specifications for safety and responsibility.',
    'Below you will find our certifications, together with the official documents to download.',
  ],
  certificates: [
    {
      code: 'ISO 14001',
      title: 'Environmental Management System',
      image: CERTIFICATES_EL.certificates[0].image,
      imageAlt: 'ISO 14001 certificate — Environmental Management System',
      body: [
        '**ISO 14001** is the international standard for Environmental Management Systems. It demonstrates our commitment to sustainable development and respect for nature and bees.',
        'Through responsible practices, we reduce our environmental footprint and protect the ecosystem of Machaira — the very ecosystem on which our beekeeping depends.',
      ],
      highlights: [
        'Reducing our environmental footprint',
        'Responsible management of resources & waste',
        'Protecting bees & biodiversity',
        'Continual improvement of environmental performance',
      ],
      pdfGr: CERTIFICATES_EL.certificates[0].pdfGr,
      pdfEn: '/images/certificates/ISO_14001_EN.pdf',
    },
    {
      code: 'ISO 22000',
      title: 'Food Safety Management System',
      image: CERTIFICATES_EL.certificates[1].image,
      imageAlt: 'ISO 22000 certificate — Food Safety Management System',
      body: [
        '**ISO 22000** is the international standard for Food Safety Management Systems. It certifies that every stage of our production — from the hive to packaging — follows strict hygiene and control procedures.',
        'This certification ensures full traceability of our products and adherence to HACCP principles across the entire production chain, so you can enjoy our honey and hive products with complete confidence.',
      ],
      highlights: [
        'Hazard analysis & critical control points (HACCP)',
        'Full traceability from hive to shelf',
        'Strict hygiene controls at every stage',
        'Annual audits by an accredited body',
      ],
      pdfGr: CERTIFICATES_EL.certificates[1].pdfGr,
      pdfEn: CERTIFICATES_EL.certificates[1].pdfEn,
    },
  ],
}

/** Locale-aware content for the /certificates page. el = Greek source, en = the
 *  bundle above. */
export function getCertificatesContent(locale: string): CertificatesContent {
  return locale === 'en' ? CERTIFICATES_EN : CERTIFICATES_EL
}
