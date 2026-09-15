import { model } from "@medusajs/framework/utils"

/**
 * Invoices module — the shop's sales invoices (ΤΙΜΟΛΟΓΙΟ), modelled on the
 * WordPress "PDF Invoices & Packing Slips for WooCommerce" plugin the old site
 * used, whose numbering (OMW001583, …) this continues.
 *
 * - `invoice` is one issued invoice per order. `data` is a frozen snapshot of
 *   everything printed on it (seller block, labels, customer, lines, totals), so
 *   a later change to the settings or the order never rewrites an issued invoice
 *   — the PDF is rendered from the snapshot on demand, nothing is stored on disk
 *   (Railway's filesystem is wiped by every deploy).
 * - `invoice_settings` is a single row ("default"): the editable layout and
 *   texts in `config`, the logo as a data URL, and the next number to hand out.
 *
 * This file lives in `models/` (not `models/index.ts`) because Medusa's module
 * loader skips any `index.*` file there.
 */

export const Invoice = model.define("invoice", {
  id: model.id({ prefix: "inv" }).primaryKey(),
  order_id: model.text().unique(),
  order_display_id: model.number().nullable(),
  number: model.number().unique(),
  code: model.text(),
  issued_at: model.dateTime(),
  data: model.json(),
  sent_at: model.dateTime().nullable(),
  sent_to: model.text().nullable(),
})

export const InvoiceSettings = model.define("invoice_settings", {
  id: model.id({ prefix: "invset" }).primaryKey(),
  key: model.text().unique(),
  next_number: model.number(),
  config: model.json(),
  logo: model.text().nullable(),
})
