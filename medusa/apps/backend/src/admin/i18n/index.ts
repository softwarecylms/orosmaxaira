/**
 * Overrides of the admin's own labels — deep-merged over Medusa's translations.
 * The sidebar's single "Extensions" section opens with the shop's sales tools
 * (Αναλύσεις, Τιμολόγια), so it is named after them; the bookings group under
 * it gets its «Κρατήσεις» heading from the sidebar CSS in medusa-config.ts.
 */
const nav = { app: { nav: { common: { extensions: "Πωλήσεις" } } } }

export default {
  en: { translation: nav },
  el: { translation: nav },
}
