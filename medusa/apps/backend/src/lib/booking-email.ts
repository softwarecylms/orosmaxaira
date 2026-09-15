import {
  BRAND,
  SHOP,
  button,
  detailsTable,
  emailShell,
  esc,
  mailtoLink,
  paragraph,
  signoff,
  telLink,
} from "./email-layout"

/**
 * Branded HTML for the booking emails sent by announceBooking
 * (src/lib/booking-payment.ts): the customer's confirmation and the farm's
 * notice, for both activities and workshops. The plain-text versions stay
 * alongside as the text part.
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
}

const MAPS_URL = "https://maps.app.goo.gl/EUCGrKmDcbkCV8CL7"

/** "2026-09-20" → "Κυριακή 20 Σεπτεμβρίου 2026". The date has no time zone. */
function longDate(date?: string | null): string | null {
  if (!date || !/^\d{4}-\d{2}-\d{2}/.test(date)) return date ?? null
  return new Intl.DateTimeFormat("el-GR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date.slice(0, 10)}T00:00:00Z`))
}

const shortTime = (t?: string | null) => (t ? t.slice(0, 5) : null)

function people(d: BookingEmailData): string {
  const parts = [
    d.adults ? `${d.adults} ${d.adults === 1 ? "ενήλικας" : "ενήλικες"}` : "",
    d.children ? `${d.children} ${d.children === 1 ? "παιδί" : "παιδιά"}` : "",
    d.infants ? `${d.infants} ${d.infants === 1 ? "βρέφος" : "βρέφη"}` : "",
  ].filter(Boolean)
  return parts.join(", ") || "—"
}

function bookingRows(d: BookingEmailData): [string, string | null][] {
  return [
    ["Κωδικός κράτησης", `<strong style="color:${BRAND.ink};">${esc(d.reference)}</strong>`],
    [d.kind === "workshop" ? "Εργαστήρι" : "Δραστηριότητα", esc(d.title)],
    ["Συνδυασμός", d.combo ? esc(d.combo) : null],
    ["Ημερομηνία", d.date ? esc(longDate(d.date)) : null],
    ["Ώρα", d.startTime ? esc(shortTime(d.startTime)) : null],
    ["Άτομα", esc(people(d))],
    ["Σύνολο", `<strong style="color:${BRAND.ink};font-size:16px;">${esc(d.total)}</strong>`],
  ]
}

export function renderBookingConfirmationEmail(d: BookingEmailData): string {
  return emailShell({
    lang: "el",
    heading: "Η κράτησή σας επιβεβαιώθηκε",
    preheader: `${d.title} — ${longDate(d.date) ?? ""} ${shortTime(d.startTime) ?? ""}`.trim(),
    body: [
      paragraph(esc(d.customerName ? `Γεια σας ${d.customerName},` : "Γεια σας,"), "margin:0 0 6px;"),
      paragraph(
        `Ευχαριστούμε! Η κράτησή σας για ${d.kind === "workshop" ? "το εργαστήρι " : ""}«${esc(d.title)}» επιβεβαιώθηκε. Ανυπομονούμε να σας δούμε!`,
        "margin:0 0 24px;",
      ),
      detailsTable(bookingRows(d)),
      paragraph(
        `Θα μας βρείτε στη ${esc(SHOP.address)}. Για αλλαγές ή απορίες, απαντήστε σε αυτό το email ή καλέστε μας στο <a href="${SHOP.phoneHref}" style="color:${BRAND.goldText};text-decoration:underline;white-space:nowrap;">${SHOP.phone}</a>.`,
        "margin:28px 0 0;",
      ),
      button(MAPS_URL, "Οδηγίες πρόσβασης", "gold"),
      signoff("el"),
    ].join("\n"),
  })
}

export function renderBookingNoticeEmail(d: BookingEmailData): string {
  const rows = [
    ...bookingRows(d),
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
