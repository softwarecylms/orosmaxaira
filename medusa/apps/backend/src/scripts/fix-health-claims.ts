import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { BOOKINGS_MODULE } from "../modules/bookings"
import type BookingsModuleService from "../modules/bookings/service"

/**
 * Removes health claims that are not permitted for foods under Reg. (EC)
 * 1924/2006 (and Art. 7(3) of Reg. (EU) 1169/2011, which forbids attributing to
 * a food the property of preventing, treating or curing a disease).
 *
 * Covers the product descriptions held in Medusa — the Greek `description` and
 * the English `metadata.description_en` — plus the Μελισσοθεραπεία activity
 * record, whose "benefits" list named bronchitis, asthma and depression.
 *
 * The matching storefront copy (product `sections`, the static activity
 * fallback) lives in the repo and is fixed there.
 *
 * Idempotent — plain string replacement, so re-running is a no-op.
 *   npx medusa exec ./src/scripts/fix-health-claims.ts
 */

/** [find, replace] applied to Greek and English product descriptions alike. */
const PAIRS: [string, string][] = [
  // ── Greek ──
  [
    "Συνδυάζει την εκλεκτή γεύση και τις ευεργετικές ιδιότητες του αυθεντικού Κυπριακού μελιού «Όρος Μαχαιρά» με τα θρεπτικά οφέλη του χαρουπιού και των φουντουκιών. Πρόκειται για έναν μοναδικό συνδυασμό γεμάτο φυσικά αντιοξειδωτικά και θρεπτικά συστατικά.",
    "Συνδυάζει την εκλεκτή γεύση του αυθεντικού Κυπριακού μελιού «Όρος Μαχαιρά» με το χαρούπι και τα φουντούκια. Πρόκειται για έναν μοναδικό συνδυασμό με βαθιά, καραμελωμένη γεύση.",
  ],
  [
    "Φτιαγμένο για διπλή δράση, αυτή η κηραλοιφή είναι ο σύμμαχος σας για κρυολογήματα και ενοχλήσεις στους μύες. Το μείγμα των συστατικών που περιέχει τονώνει και αναζωογονεί τους πνεύμονες και βοηθά στην ανακούφιση της συμφόρησης, αλλά και του πόνου των μυών και των αρθρώσεων.",
    "Μια κηραλοιφή με έντονο, αναζωογονητικό άρωμα από αιθέρια έλαια, ιδανική για μασάζ σε αυχένα, ώμους και στήθος. Το βιολογικό κερί μέλισσας αφήνει στην επιδερμίδα ένα απαλό, προστατευτικό στρώμα.",
  ],
  [
    "Αυτό είναι ένα μείγμα με όλους τους θησαυρούς της κυψέλης για να γίνει μία σούπερ τροφή υγείας και ευεξίας. Περιλαμβάνει μέλι, βασιλικό πολτό και γύρη. Σε αυτό το προϊόν βρίσκουμε σε συνδυασμό, τις θρεπτικές ουσίες αυτών των τροφών με μεγάλη παράδοση προσφοράς στην ανθρωπότητα ενός μεγάλου αριθμού διατροφικών οφέλων. Στο μείγμα είναι αναμεμειγμένες οι αντιοξειδωτικές ιδιότητες του μελιού του βασιλικού πολτού- της σούπερ τροφής της βασίλισσας και της γύρης ενός εξαιρετικού συμπληρώματος διατροφής για ενίσχυση του ανοσοποιητικού, ενισχύοντας φυσικά και την ενέργεια του σώματος.",
    "Αυτό είναι ένα μείγμα με τους θησαυρούς της κυψέλης: μέλι, βασιλικό πολτό και γύρη — τρεις τροφές με μεγάλη παράδοση στη διατροφή του ανθρώπου. Ο βασιλικός πολτός, η τροφή της βασίλισσας, και η φρέσκια γύρη μας συνδυάζονται με το αγνό μας μέλι σε ένα μείγμα με πλούσια γεύση και βελούδινη υφή.",
  ],
  ["Αγνή, θεραπευτική κηραλοιφή με βιολογικό κερί μέλισσας", "Αγνή, καταπραϋντική κηραλοιφή με βιολογικό κερί μέλισσας"],
  ["Αναπλαστική, θεραπευτική κηραλοιφή με αγνό, βιολογικό κερί μέλισσας", "Πλούσια, θρεπτική κηραλοιφή με αγνό, βιολογικό κερί μέλισσας"],
  [
    "Ιδανική για σκασμένο δέρμα, χέρια, πόδια και αγκώνες Ανακουφίζει από ελαφριά εγκαύματα και ερεθισμούς",
    "Ιδανική για σκασμένο δέρμα, χέρια, πόδια και αγκώνες.",
  ],
  [
    "Οι άνθρωποι απο την αρχαιότητα χρησιμοποιούν τη γύρη κυρίως για τις αντιοξειδωτικές της ιδιότητες και την αντιμικροβιακή και αντιγηραντική της δράση. Η γύρη «Όρος Μαχαιρά» συλλέγεται από τα δικά μας μελίσσια, διατίθεται στην αγορά φρέσκα",
    "Η γύρη συνοδεύει τη διατροφή του ανθρώπου από την αρχαιότητα. Η γύρη «Όρος Μαχαιρά» συλλέγεται από τα δικά μας μελίσσια, διατίθεται στην αγορά φρέσκια",
  ],
  [
    "Ο βασιλικός πολτός χρησιμοποιείται από την αρχαιότητα αφού δίνει ενέργεια, τονώνει τη λίμπιντο και είναι βασικός παράγοντας μακροζωίας. Είναι εξαιρετικά αποτελεσματικός στην καταπολέμηση πάρα πολλών εξωτερικών απειλών για την υγεία και την ευημερία του ανθρώπου. ",
    "Ο βασιλικός πολτός είναι η τροφή της βασίλισσας και χρησιμοποιείται από τον άνθρωπο από την αρχαιότητα. ",
  ],
  [
    "Το βάμμα πρόπολης είναι ένα αλκοολούχο διάλυμα από αλκόολ και πρόπολη, και ένα φυσικό αντισηπτικό θαύμα. Η λήψη βάμματος πρόπολης καθημερινά σε μικρές δόσεις μπορεί να βοηθήσει στην ενίσχυση του ανοσοποιητικού συστήματος έναντι βακτηρίων, μυκήτων και ιών, συμπεριλαμβανομένης της γρίπης. Σε αντίθεση με τα φάρμακα που προσβάλλουν τόσο τα ευεργετικά βακτήρια όσο και τα επιβλαβή, το βάμμα πρόπολης προσβάλλει μόνο τα επιβλαβή για την υγεία μας βακτήρια και γενικά δεν επηρεάζεται από τις διάφορες βακτηριακές μεταλλάξεις τους. ",
    "Το βάμμα πρόπολης είναι ένα αλκοολούχο διάλυμα από αλκοόλ και πρόπολη. Η πρόπολη είναι η ρητινώδης ουσία με την οποία οι μέλισσες σφραγίζουν και προστατεύουν την κυψέλη τους, και χρησιμοποιείται από τον άνθρωπο από την αρχαιότητα. ",
  ],

  // ── English ──
  [
    'It combines the fine taste and beneficial properties of authentic Cypriot "Oros Machaira" honey with the nutritional benefits of carob and hazelnuts. It is a unique combination full of natural antioxidants and nutrients.',
    'It combines the fine taste of authentic Cypriot "Oros Machaira" honey with carob and hazelnuts. It is a unique combination with a deep, caramelised flavour.',
  ],
  [
    "Made for double action, this beeswax salve is your ally for colds and muscle discomfort. The blend of ingredients it contains stimulates and revitalises the lungs and helps relieve congestion, as well as muscle and joint pain.",
    "A beeswax salve with a bright, invigorating aroma of essential oils, ideal for massaging into the neck, shoulders and chest. The organic beeswax leaves a soft, protective layer on the skin.",
  ],
  [
    "This is a blend of all the treasures of the hive, made into a super food for health and well-being. It includes honey, royal jelly and pollen. In this product we find combined the nutrients of these foods, which have a long tradition of offering humanity a great number of nutritional benefits. The blend brings together the antioxidant properties of honey, of royal jelly — the queen's super food — and of pollen, an excellent dietary supplement for boosting the immune system while naturally enhancing the body's energy.",
    "This is a blend of the treasures of the hive: honey, royal jelly and pollen — three foods with a long tradition in the human diet. Royal jelly, the food of the queen, and our fresh pollen are combined with our pure honey in a blend with a rich taste and a velvety texture.",
  ],
  ["A pure, therapeutic beeswax salve with organic beeswax", "A pure, soothing beeswax salve with organic beeswax"],
  ["A regenerating, therapeutic beeswax salve with pure organic beeswax", "A rich, nourishing beeswax salve with pure organic beeswax"],
  [
    "Ideal for cracked skin, hands, feet and elbows. Relieves minor burns and irritation.",
    "Ideal for cracked skin, hands, feet and elbows.",
  ],
  [
    'Since antiquity, people have used pollen mainly for its antioxidant properties and its antimicrobial and anti-ageing action. "Oros Machaira" pollen',
    'Pollen has been part of the human diet since antiquity. "Oros Machaira" pollen',
  ],
  [
    "Royal jelly has been used since antiquity, as it provides energy, stimulates the libido and is a key factor in longevity. It is exceptionally effective in combating a great many external threats to human health and well-being. ",
    "Royal jelly is the food of the queen bee and has been used by people since antiquity. ",
  ],
  [
    "Propolis tincture is an alcohol-based solution of alcohol and propolis, and a natural antiseptic miracle. Taking propolis tincture daily in small doses can help strengthen the immune system against bacteria, fungi and viruses, including the flu. Unlike medicines that affect both beneficial and harmful bacteria, propolis tincture affects only the bacteria that are harmful to our health and is generally not affected by their various bacterial mutations. ",
    "Propolis tincture is an alcohol-based solution of alcohol and propolis. Propolis is the resinous substance bees use to seal and protect their hive, and people have used it since antiquity. ",
  ],
  [
    "it effectively reduces wrinkles, soothes puffiness and eliminates dark circles",
    "it helps smooth the look of fine lines, soothes puffiness and reduces the appearance of dark circles",
  ],
]

function scrub(value: string): string {
  return PAIRS.reduce((out, [from, to]) => out.split(from).join(to), value)
}

// ─────────────────────────── Μελισσοθεραπεία ───────────────────────────
const EL_ACTIVITY = {
  subtitle: "Μια παραδοσιακή πρακτική, με τα πολύτιμα προϊόντα της κυψέλης.",
  description:
    "Πρώτοι ανακάλυψαν και εφάρμοσαν τη Μελισσοθεραπεία οι αρχαίοι Αιγύπτιοι. Η Μελισσοθεραπεία είναι μια **παραδοσιακή πρακτική** που αξιοποιεί τα **παράγωγα της κυψέλης** (μέλι, βασιλικό πολτό, γύρη, πρόπολη) και τον θερμό αέρα της, σε μια εμπειρία χαλάρωσης μέσα στο μελισσοκομείο.\n\nΣτο Όρος Μαχαιρά προσφέρεται ως μια ήρεμη, αισθητηριακή εμπειρία μέσα στη φύση και είναι κατάλληλη για ενήλικες και παιδιά.",
  note: "Η μελισσοθεραπεία δεν είναι ιατρική πράξη. Τα προϊόντα της κυψέλης και η εισπνοή του αέρα της δεν είναι φάρμακα: δεν προλαμβάνουν, δεν αντιμετωπίζουν και δεν θεραπεύουν ασθένειες, ούτε υποκαθιστούν την ιατρική συμβουλή ή την αγωγή σας. Αν έχετε πρόβλημα υγείας ή γνωστή αλλεργία σε προϊόντα μέλισσας ή σε τσιμπήματα, συμβουλευτείτε πρώτα τον γιατρό σας.",
  meta_description:
    "Μελισσοθεραπεία στο Όρος Μαχαιρά: μια παραδοσιακή πρακτική με τα προϊόντα της κυψέλης και την εισπνοή του αέρα της. Ραντεβού Απρίλιο–Οκτώβριο.",
  features: [
    { title: "Εισπνοή αέρα κυψέλης", text: "Μέσω ειδικής αναπνευστικής μάσκας εισπνέετε τον θερμό, αρωματικό αέρα της κυψέλης." },
    { title: "Προϊόντα της κυψέλης", text: "Μέλι, πρόπολη, γύρη και βασιλικός πολτός συνοδεύουν την εμπειρία." },
    { title: "Περίοδος & διάρκεια", text: "Εφαρμόζεται Απρίλιο–Οκτώβριο: τρεις εβδομάδες, κάθε δεύτερη ημέρα για 20 λεπτά." },
  ],
  benefits: {
    intro:
      "Οι αρχαίοι Αιγύπτιοι ήταν από τους πρώτους που κάθισαν δίπλα στην κυψέλη για να αναπνεύσουν τον αέρα της. Σήμερα, στο δικό μας μελισσοκομείο, η εμπειρία παραμένει το ίδιο απλή: κάθεστε αναπαυτικά, φοράτε την ειδική μάσκα και αφήνετε τον θερμό, αρωματικό αέρα της κυψέλης και τον ήχο του μελισσιού να σας συνοδεύσουν για είκοσι λεπτά. Να τι περιλαμβάνει κάθε συνεδρία:",
    items: [
      "Ο θερμός αέρας της κυψέλης, μέσω ειδικής αναπνευστικής μάσκας",
      "Τα φυσικά αρώματα του κεριού, της πρόπολης και του μελιού",
      "Ο χαρακτηριστικός ήχος και ο παλμός του μελισσιού",
      "Είκοσι λεπτά ησυχίας μέσα στη φύση του Μαχαιρά",
      "Ασφαλής, ελεγχόμενος χώρος — χωρίς άμεση επαφή με τις μέλισσες",
      "Καθοδήγηση από έμπειρο μελισσοκόμο σε όλη τη διάρκεια",
    ],
  },
}

const EN_ACTIVITY = {
  subtitle: "A traditional practice using the precious products of the hive.",
  description:
    "Apitherapy has been practised since antiquity — the ancient Egyptians are among the earliest known users. It is a traditional practice that draws on the products of the hive (honey, royal jelly, pollen, propolis) and on its warm air, in a relaxing experience inside the apiary.\n\nAt Oros Machaira it is offered as a calm, sensory experience in nature, suitable for adults and children alike.",
  note: "Apitherapy is not a medical treatment. The products of the hive and the inhalation of hive air are not medicines: they do not prevent, treat or cure any disease, and they are not a substitute for medical advice or prescribed medication. If you have a health condition or a known allergy to bee products or bee stings, please consult your doctor first.",
  meta_description:
    "Apitherapy at Oros Machaira: a traditional practice with the products of the hive and the inhalation of its air. Appointments April–October.",
  features: [
    { title: "Inhaling hive air", text: "Through a special breathing mask you inhale the warm, aromatic air of the hive." },
    { title: "Products of the hive", text: "Honey, propolis, pollen and royal jelly accompany the experience." },
    { title: "Season & duration", text: "Available April–October: three weeks, every second day for 20 minutes." },
  ],
  benefits: {
    intro:
      "The ancient Egyptians were among the first to sit beside a hive and breathe its air. At our apiary the experience remains just as simple: you settle into a comfortable seat, put on the special mask, and let the warm, aromatic air of the hive and the sound of the colony keep you company for twenty minutes. Each session includes:",
    items: [
      "The warm air of the hive, through a dedicated breathing mask",
      "The natural aromas of beeswax, propolis and honey",
      "The distinctive sound and pulse of the colony",
      "Twenty minutes of quiet in the nature of Machairas",
      "A safe, controlled space — with no direct contact with the bees",
      "The guidance of an experienced beekeeper throughout",
    ],
  },
}

export default async function fixHealthClaims({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productService = container.resolve(Modules.PRODUCT)

  // ── 1. product descriptions ──
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "description", "metadata"],
  })

  let changed = 0
  for (const p of products) {
    const metadata = (p.metadata ?? {}) as Record<string, unknown>
    const update: Record<string, unknown> = {}

    if (typeof p.description === "string") {
      const next = scrub(p.description)
      if (next !== p.description) update.description = next
    }
    if (typeof metadata.description_en === "string") {
      const next = scrub(metadata.description_en)
      if (next !== metadata.description_en) {
        update.metadata = { ...metadata, description_en: next }
      }
    }
    if (!Object.keys(update).length) continue

    await productService.updateProducts(p.id, update)
    changed++
    logger.info(`  health claims removed → ${p.handle}`)
  }
  logger.info(`✓ Products updated: ${changed}`)

  // ── 2. Μελισσοθεραπεία activity ──
  const bookings = container.resolve(BOOKINGS_MODULE) as BookingsModuleService
  const [activity] = await bookings.listActivities({ slug: "melissotherapeia" })
  if (!activity) {
    logger.warn("No 'melissotherapeia' activity found — skipping.")
    return
  }

  const translations = ((activity as any).translations ?? {}) as Record<string, unknown>
  const patch: Record<string, unknown> = { id: activity.id, ...EL_ACTIVITY }
  if (translations.en) {
    patch.translations = { ...translations, en: { ...(translations.en as object), ...EN_ACTIVITY } }
  }

  await bookings.updateActivities(patch as any)
  logger.info("✓ Μελισσοθεραπεία: condition list replaced with an experience list; disclaimer strengthened.")
}
