import fs from "node:fs"
import path from "node:path"
import PDFDocument from "pdfkit"
import type { InvoiceSnapshot } from "./snapshot"

/**
 * Renders an invoice snapshot to an A4 PDF, laid out like the WooCommerce
 * plugin's invoices: logo + seller block, title, customer + invoice details,
 * a black-headed product table, the totals column, and signature lines at the
 * foot of the page.
 *
 * Fonts are Open Sans (OFL, Greek included); they and the default logo live in
 * ./assets. `medusa build` compiles only code, so the assets are looked up both
 * next to this file (dev, `src/`) and from the project root (production runs
 * from `.medusa/server`, two levels below it).
 */

const ASSET_DIRS = [
  path.join(__dirname, "assets"),
  path.join(process.cwd(), "src/lib/invoice/assets"),
  path.join(process.cwd(), "../../src/lib/invoice/assets"),
]

function asset(name: string): string {
  for (const dir of ASSET_DIRS) {
    const file = path.join(dir, name)
    if (fs.existsSync(file)) return file
  }
  throw new Error(`Invoice asset not found: ${name}`)
}

const PAGE = { width: 595.28, height: 841.89 }
const LEFT = 60
const RIGHT = PAGE.width - 57
const MID = 347 // the right-hand column (seller block, details, totals)
const VALUE = 444 // values in the right-hand column
const FOOT = 728 // top of the signature area (kept clear of the bottom margin, or pdfkit adds a page)

const INK = "#000000"
const RULE = "#D9D9D9"
const SIZE = 9

/** €1.234,50 — the euro sign first, Greek separators, as on the old invoices. */
export function euro(amount: number) {
  const sign = amount < 0 ? "-" : ""
  const [int, dec] = Math.abs(amount).toFixed(2).split(".")
  return `${sign}€${int.replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${dec}`
}

export function greekDate(iso: string) {
  return new Intl.DateTimeFormat("el-GR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Nicosia",
  }).format(new Date(iso))
}

/** The VAT included in a VAT-inclusive total. */
export const includedVat = (total: number, rate: number) => (rate > 0 ? (total * rate) / (100 + rate) : 0)

function logoSource(logo: string | null): Buffer | string {
  const match = logo?.match(/^data:image\/(png|jpe?g);base64,(.+)$/)
  return match ? Buffer.from(match[2], "base64") : asset("logo.png")
}

export function renderInvoicePdf(inv: InvoiceSnapshot): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 34, bottom: 20, left: LEFT, right: PAGE.width - RIGHT },
      info: { Title: `${inv.title} ${inv.code}`, Author: inv.seller.name },
    })
    const chunks: Buffer[] = []
    doc.on("data", (c: Buffer) => chunks.push(c))
    doc.on("end", () => resolve(Buffer.concat(chunks)))
    doc.on("error", reject)

    doc.registerFont("regular", asset("OpenSans-Regular.ttf"))
    doc.registerFont("bold", asset("OpenSans-Bold.ttf"))
    const regular = (size = SIZE) => doc.font("regular").fontSize(size).fillColor(INK)
    const bold = (size = SIZE) => doc.font("bold").fontSize(size).fillColor(INK)
    const rule = (x1: number, x2: number, y: number, width = 0.6, color = RULE) =>
      doc.save().moveTo(x1, y).lineTo(x2, y).lineWidth(width).strokeColor(color).stroke().restore()

    // ── Header: logo left, seller block right ──────────────────────────────
    const top = 34
    try {
      doc.image(logoSource(inv.logo), LEFT, top, { fit: [150, 58] })
    } catch {
      doc.image(asset("logo.png"), LEFT, top, { fit: [150, 58] })
    }

    let y = top
    bold().text(inv.seller.name, MID, y, { width: RIGHT - MID })
    y = doc.y + 1
    regular().text(inv.seller.details, MID, y, { width: RIGHT - MID, lineGap: 2.2 })
    const headerBottom = Math.max(doc.y, top + 70)

    // ── Title ──────────────────────────────────────────────────────────────
    y = Math.max(headerBottom + 34, 140)
    bold(15).text(inv.title, LEFT, y)
    y = doc.y + 16

    // ── Customer (left) and invoice details (right) ────────────────────────
    const blockTop = y
    const c = inv.customer
    const customerLines = [
      c.name,
      c.company ? `${inv.labels.company} ${c.company}` : "",
      c.vat_number ? `${inv.labels.vat_number} ${c.vat_number}` : "",
      ...c.lines,
      c.email,
      c.phone,
    ].filter(Boolean)
    regular().text(customerLines.join("\n"), LEFT, blockTop, { width: MID - LEFT - 20, lineGap: 2.2 })
    let leftBottom = doc.y

    let ry = blockTop
    const detail = (label: string, value: string) => {
      if (!value) return
      regular().text(label, MID, ry, { width: VALUE - MID - 8, lineGap: 1 })
      const labelBottom = doc.y
      regular().text(value, VALUE, ry, { width: RIGHT - VALUE, lineGap: 1 })
      ry = Math.max(labelBottom, doc.y) + 3.5
    }
    detail(inv.labels.invoice_number, inv.code)
    detail(inv.labels.invoice_date, greekDate(inv.issued_at))
    detail(inv.labels.order_number, inv.order.display_id != null ? String(inv.order.display_id) : "")
    detail(inv.labels.order_date, greekDate(inv.order.created_at))
    detail(inv.labels.payment_method, inv.payment_method)

    y = Math.max(leftBottom, ry) + 30

    // ── Product table ──────────────────────────────────────────────────────
    const header = () => {
      doc.save().rect(LEFT, y, RIGHT - LEFT, 21).fill(INK).restore()
      doc.font("bold").fontSize(SIZE).fillColor("#FFFFFF")
      doc.text(inv.labels.product, LEFT + 4, y + 5.5, { lineBreak: false })
      doc.text(inv.labels.quantity, MID + 4, y + 5.5, { lineBreak: false })
      doc.text(inv.labels.price, VALUE + 4, y + 5.5, { lineBreak: false })
      y += 21
    }
    const newPage = () => {
      doc.addPage()
      y = 40
      header()
    }
    header()

    for (const line of inv.lines) {
      const titleHeight = doc.font("regular").fontSize(SIZE).heightOfString(line.title, { width: MID - LEFT - 16 })
      const rowHeight = 10 + titleHeight + (inv.show_sku && line.sku ? 13 : 0) + 8
      if (y + rowHeight > FOOT - 20) newPage()
      const rowTop = y + 8
      regular().text(line.title, LEFT + 4, rowTop, { width: MID - LEFT - 16 })
      if (inv.show_sku && line.sku) {
        bold(7).text(`${inv.labels.sku} `, LEFT + 4, doc.y + 4, { continued: true })
        regular(7).text(line.sku)
      }
      regular().text(String(line.quantity), MID + 4, rowTop, { lineBreak: false })
      regular().text(euro(line.total), VALUE + 4, rowTop, { lineBreak: false })
      y += rowHeight
      rule(LEFT, RIGHT, y)
    }

    // ── Totals ─────────────────────────────────────────────────────────────
    const totalRow = (label: string, value: string, opts: { strong?: boolean; note?: string } = {}) => {
      const valueWidth = RIGHT - VALUE - 4
      const valueHeight =
        doc.font(opts.strong ? "bold" : "regular").fontSize(SIZE).heightOfString(value, { width: valueWidth }) +
        (opts.note ? doc.font("bold").fontSize(7.5).heightOfString(opts.note, { width: valueWidth }) + 2 : 0)
      const rowHeight = Math.max(20, valueHeight + 12)
      if (y + rowHeight > FOOT - 10) {
        doc.addPage()
        y = 40
      }
      bold().text(label, MID + 4, y + 6, { width: VALUE - MID - 8 })
      ;(opts.strong ? bold() : regular()).text(value, VALUE + 4, y + 6, { width: valueWidth })
      if (opts.note) bold(7.5).text(opts.note, VALUE + 4, doc.y + 1, { width: valueWidth })
      y += rowHeight
      return rowHeight
    }

    totalRow(inv.labels.subtotal, euro(inv.totals.subtotal))
    rule(MID, RIGHT, y)
    if (inv.totals.discount > 0) {
      totalRow(inv.labels.discount, euro(-inv.totals.discount))
      rule(MID, RIGHT, y)
    }
    const shippingText = [
      euro(inv.totals.shipping),
      inv.shipping_method ? `${inv.labels.shipping_via} ${inv.shipping_method}` : "",
    ]
      .filter(Boolean)
      .join(" ")
    totalRow(inv.labels.shipping, c.acs_point ? `${shippingText}\n(${c.acs_point})` : shippingText)
    rule(MID, RIGHT, y, 1.6, INK)
    const vat = inv.show_vat
      ? inv.labels.vat_note
          .replace("{vat}", euro(includedVat(inv.totals.total, inv.vat_rate)))
          .replace("{rate}", String(inv.vat_rate))
      : ""
    totalRow(inv.labels.total, euro(inv.totals.total), { strong: true, note: vat || undefined })
    rule(MID, RIGHT, y, 1.6, INK)

    // ── Footer: note and signature lines, pinned to the foot of the last page ─
    let footY = FOOT
    if (inv.footer_text) {
      regular(8).text(inv.footer_text, LEFT, footY - 28, { width: RIGHT - LEFT, align: "center" })
    }
    rule(LEFT, RIGHT, footY)
    footY += 30
    const sigLeft = 185
    const sigRight = 413
    for (const label of inv.signatures) {
      rule(sigLeft, sigRight, footY, 0.8, INK)
      regular().text(label, sigLeft - 40, footY + 4, { width: sigRight - sigLeft + 80, align: "center" })
      footY += 36
    }

    doc.end()
  })
}
