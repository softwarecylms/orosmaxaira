/**
 * The invoice layout and texts editable from the admin (Τιμολόγια → Ρυθμίσεις),
 * and their defaults — taken from the last invoice the WooCommerce plugin
 * issued (OMW001583), so the new ones look the same.
 *
 * Placeholders in the email texts: {number} (OMW001584), {order} (#12),
 * {name} (the customer's name).
 */

export type InvoiceLabels = {
  invoice_number: string
  invoice_date: string
  order_number: string
  order_date: string
  payment_method: string
  product: string
  quantity: string
  price: string
  subtotal: string
  discount: string
  shipping: string
  shipping_via: string
  total: string
  /** "(περιλαμβάνει {vat} VAT {rate}%)" */
  vat_note: string
  sku: string
  company: string
  vat_number: string
}

export type InvoiceConfig = {
  title: string
  prefix: string
  digits: number
  shop_name: string
  shop_details: string
  vat_rate: number
  show_vat: boolean
  show_sku: boolean
  show_email: boolean
  show_phone: boolean
  show_acs_point: boolean
  labels: InvoiceLabels
  payment_labels: Record<string, string>
  footer_text: string
  /** One signature line per row; empty for none. */
  signatures: string
  send_on_fulfillment: boolean
  /** Extra addresses (comma-separated) that get a copy of every invoice email. */
  copy_to: string
  email_subject_el: string
  email_body_el: string
  email_subject_en: string
  email_body_en: string
}

export const FIRST_INVOICE_NUMBER = 1584

export const DEFAULT_CONFIG: InvoiceConfig = {
  title: "ΤΙΜΟΛΟΓΙΟ",
  prefix: "OMW",
  digits: 6,
  shop_name: "Μ.Φ. (ΟΡΟΣ ΜΑΧΑΙΡΑ) ΛΤΔ",
  shop_details: [
    "Οδού – Λάρνακα | Τ.Κ: 7718",
    "Αρ. ΦΠΑ: 10290017W",
    "Τηλ.: 25622305",
    "info@orosmaxaira.com",
    "www.orosmaxaira.com",
  ].join("\n"),
  vat_rate: 19,
  show_vat: true,
  show_sku: true,
  show_email: true,
  show_phone: true,
  show_acs_point: true,
  labels: {
    invoice_number: "Αριθμός παραστατικού:",
    invoice_date: "Ημερομηνία Τιμολογίου:",
    order_number: "Αρ. Παραγγελίας:",
    order_date: "Ημερομηνία παραγγελίας:",
    payment_method: "Τρόπος Πληρωμής:",
    product: "Προϊόν",
    quantity: "Ποσότητα",
    price: "Τιμή",
    subtotal: "Υποσύνολο",
    discount: "Έκπτωση",
    shipping: "Αποστολή",
    shipping_via: "μέσω",
    total: "Σύνολο",
    vat_note: "(περιλαμβάνει {vat} VAT {rate}%)",
    sku: "SKU:",
    company: "Εταιρεία:",
    vat_number: "ΑΦΜ:",
  },
  payment_labels: {
    card: "Credit Card",
    cod: "Αντικαταβολή",
    bank: "Τραπεζική κατάθεση",
  },
  footer_text: "",
  signatures: "Όνομα και Υπογραφή Πωλητή\nΌνομα και Υπογραφή Παραλήπτη",
  send_on_fulfillment: true,
  copy_to: "",
  email_subject_el: "Τιμολόγιο {number} για την παραγγελία σας {order}",
  email_body_el:
    "Γεια σας {name},\n\nη παραγγελία σας {order} ετοιμάστηκε για αποστολή. Επισυνάπτουμε το τιμολόγιο {number}.\n\nΣας ευχαριστούμε που επιλέξατε το Όρος Μαχαιρά.",
  email_subject_en: "Invoice {number} for your order {order}",
  email_body_en:
    "Hello {name},\n\nyour order {order} is ready to ship. Please find invoice {number} attached.\n\nThank you for choosing Oros Machaira.",
}

/** Stored config over the defaults, so fields added later always have a value. */
export function withDefaults(stored: unknown): InvoiceConfig {
  const s = (stored && typeof stored === "object" ? stored : {}) as Partial<InvoiceConfig>
  return {
    ...DEFAULT_CONFIG,
    ...s,
    labels: { ...DEFAULT_CONFIG.labels, ...(s.labels ?? {}) },
    payment_labels: { ...DEFAULT_CONFIG.payment_labels, ...(s.payment_labels ?? {}) },
  }
}

export function formatCode(number: number, config: Pick<InvoiceConfig, "prefix" | "digits">) {
  const digits = Math.max(1, Math.min(12, Math.floor(config.digits || 1)))
  return `${config.prefix}${String(number).padStart(digits, "0")}`
}
