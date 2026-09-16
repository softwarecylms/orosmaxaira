import {
  BRAND,
  SHOP,
  button,
  detailsTable,
  emailShell,
  esc,
  mailtoLink,
  escLines,
  paragraph,
  quoteBox,
  signoff,
  telLink,
} from "./email-layout"

/**
 * Branded HTML for the booking emails sent by announceBooking
 * (src/lib/booking-payment.ts): the customer's confirmation — in the language
 * they booked in — and the farm's notice (always Greek), for both activities
 * and workshops. The plain-text versions stay alongside as the text part.
 */

export type BookingEmailData = {
  reference: string
  /** Activity or workshop title. */
  title: string
  kind: "activity" | "workshop"
  /** Workshop combination, e.g. "Κεριά + Σαπούνια". */
  combo?: string | null
  /** Slot date as stored, "YYYY-MM-DD". */
  date?: string | null
  /** Slot start, "HH:MM" or "HH:MM:SS". */
  startTime?: string | null
  adults: number
  children: number
  infants: number
  /** Already formatted, e.g. "€45,00". */
  total: string
  customerName: string
  email: string
  phone?: string | null
  /** Language of the customer's confirmation. */
  locale?: "el" | "en"
  /** Practical info for the customer, e.g. "please arrive 5 minutes early". */
  note?: string | null
}

const COPY = {
  el: {
    reference: "Κωδικός κράτησης",
    activity: "Δραστηριότητα",
    workshop: "Εργαστήρι",
    combo: "Πρόγραμμα",
    date: "Ημερομηνία",
    time: "Ώρα",
    people: "Άτομα",
    total: "Σύνολο",
    heading: "Η κράτησή σας επιβεβαιώθηκε",
    hello: (name: string) => (name ? `Γεια σας ${name},` : "Γεια σας,"),
    thanks: (d: BookingEmailData) =>
      `Ευχαριστούμε! Η κράτησή σας για ${d.kind === "workshop" ? "το εργαστήρι " : ""}«${esc(d.title)}» επιβεβαιώθηκε. Ανυπομονούμε να σας δούμε!`,
    findUs: (phone: string) =>
      `Θα μας βρείτε στη ${esc(SHOP.address)}. Για αλλαγές ή απορίες, απαντήστε σε αυτό το email ή καλέστε μας στο ${phone}.`,
    directions: "Οδηγίες πρόσβασης",
    adults: (n: number) => `${n} ${n === 1 ? "ενήλικας" : "ενήλικες"}`,
    children: (n: number) => `${n} ${n === 1 ? "παιδί" : "παιδιά"}`,
    infants: (n: number) => `${n} ${n === 1 ? "βρέφος" : "βρέφη"}`,
    dateLocale: "el-GR",
  },
  en: {
    reference: "Booking reference",
    activity: "Activity",
    workshop: "Workshop",
    combo: "Programme",
    date: "Date",
    time: "Time",
    people: "People",
    total: "Total",
    heading: "Your booking is confirmed",
    hello: (name: string) => (name ? `Hello ${name},` : "Hello,"),
    thanks: (d: BookingEmailData) =>
      `Thank you! Your booking for ${d.kind === "workshop" ? "the workshop " : ""}“${esc(d.title)}” is confirmed. We look forward to seeing you!`,
    findUs: (phone: string) =>
      `You will find us at Melini, 7716 Larnaca, Cyprus. For changes or questions, reply to this email or call us on ${phone}.`,
    directions: "Get directions",
    adults: (n: number) => `${n} ${n === 1 ? "adult" : "adults"}`,
    children: (n: number) => `${n} ${n === 1 ? "child" : "children"}`,
    infants: (n: number) => `${n} ${n === 1 ? "infant" : "infants"}`,
    dateLocale: "en-GB",
  },
}

const copyOf = (d: BookingEmailData) => COPY[d.locale === "en" ? "en" : "el"]

const MAPS_URL = "https://maps.app.goo.gl/EUCGrKmDcbkCV8CL7"

/** "2026-09-20" → "Κυριακή 20 Σεπτεμβρίου 2026" / "Sunday 20 September 2026".
 *  The date has no time zone. */
export function longDate(date?: string | null, dateLocale = "el-GR"): string | null {
  if (!date || !/^\d{4}-\d{2}-\d{2}/.test(date)) return date ?? null
  return new Intl.DateTimeFormat(dateLocale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date.slice(0, 10)}T00:00:00Z`))
}

const shortTime = (t?: string | null) => (t ? t.slice(0, 5) : null)

export function people(d: Pick<BookingEmailData, "adults" | "children" | "infants" | "locale">): string {
  const c = COPY[d.locale === "en" ? "en" : "el"]
  const parts = [
    d.adults ? c.adults(d.adults) : "",
    d.children ? c.children(d.children) : "",
    d.infants ? c.infants(d.infants) : "",
  ].filter(Boolean)
  return parts.join(", ") || "—"
}

function bookingRows(d: BookingEmailData): [string, string | null][] {
  const c = copyOf(d)
  return [
    [c.reference, `<strong style="color:${BRAND.ink};">${esc(d.reference)}</strong>`],
    [d.kind === "workshop" ? c.workshop : c.activity, esc(d.title)],
    [c.combo, d.combo ? esc(d.combo) : null],
    [c.date, d.date ? esc(longDate(d.date, c.dateLocale)) : null],
    [c.time, d.startTime ? esc(shortTime(d.startTime)) : null],
    [c.people, esc(people(d))],
    [c.total, `<strong style="color:${BRAND.ink};font-size:16px;">${esc(d.total)}</strong>`],
  ]
}

export function renderBookingConfirmationEmail(d: BookingEmailData): string {
  const c = copyOf(d)
  const lang = d.locale === "en" ? "en" : "el"
  return emailShell({
    lang,
    heading: c.heading,
    preheader: `${d.title} — ${longDate(d.date, c.dateLocale) ?? ""} ${shortTime(d.startTime) ?? ""}`.trim(),
    body: [
      paragraph(esc(c.hello(d.customerName)), "margin:0 0 6px;"),
      paragraph(c.thanks(d), "margin:0 0 24px;"),
      detailsTable(bookingRows(d)),
      d.note ? quoteBox(escLines(d.note)) : "",
      paragraph(
        c.findUs(
          `<a href="${SHOP.phoneHref}" style="color:${BRAND.goldText};text-decoration:underline;white-space:nowrap;">${SHOP.phone}</a>`,
        ),
        "margin:28px 0 0;",
      ),
      button(MAPS_URL, c.directions, "gold"),
      signoff(lang),
    ].join("\n"),
  })
}

export function renderBookingNoticeEmail(input: BookingEmailData): string {
  // The farm reads it in Greek whatever language the customer booked in.
  const d: BookingEmailData = { ...input, locale: "el" }
  const rows = [
    ...bookingRows(d),
    ["Γλώσσα πελάτη", input.locale === "en" ? "English" : null],
    ["Πελάτης", esc(d.customerName)],
    ["Email", mailtoLink(d.email)],
    ["Τηλέφωνο", d.phone ? telLink(d.phone) : null],
  ] as [string, string | null][]
  return emailShell({
    lang: "el",
    heading: `Νέα κράτηση: ${d.reference}`,
    preheader: `${d.title} — ${d.customerName} — ${d.total}`,
    body: [
      paragraph(
        `Νέα κράτηση ${d.kind === "workshop" ? "εργαστηρίου" : "δραστηριότητας"} από ${esc(d.customerName)}:`,
        "margin:0 0 24px;",
      ),
      detailsTable(rows),
      button(
        `mailto:${d.email}?subject=${encodeURIComponent(`Κράτηση ${d.reference} — ${d.title}`)}`,
        `Απάντηση σε ${d.customerName}`,
      ),
    ].join("\n"),
  })
}
