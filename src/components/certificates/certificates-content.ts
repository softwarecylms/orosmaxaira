/**
 * Content for the /certificates page. Editable copy lives here (mirrors the
 * about/awards content-file pattern). Demo/indicative copy for now.
 *
 * PDFs live under /public/images/certificates. The ISO 14001 download currently
 * reuses the ISO 22000 PDF as a placeholder — swap `pdfGr`/`pdfEn` on the 14001
 * entry once the real 14001 certificate files are supplied.
 */

export type Certificate = {
  code: string // e.g. "ISO 22000"
  title: string // full standard name (GR)
  image: string
  imageAlt: string
  body: string[] // paragraphs
  highlights: string[] // bullet list
  pdfGr: string // Greek certificate (primary download)
  pdfEn?: string // English certificate (optional)
}

export const CERTIFICATES_PAGE = {
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
      // Placeholder: reuses the ISO 22000 PDF until the real 14001 files arrive.
      pdfGr: '/images/certificates/iso-22000-gr.pdf',
      pdfEn: '/images/certificates/iso-22000-en.pdf',
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
  ] satisfies Certificate[],
}
