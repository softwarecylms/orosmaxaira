import 'server-only'
import type { HttpTypes } from '@medusajs/types'
import { displaySizeLabel } from '@/components/shop/shop-content'

/**
 * Branded HTML for the order emails — the customer's confirmation and the
 * shop's "new order" notice — modelled on the old WooCommerce mail the shop
 * used to send: logo on top, a honey-gold header bar, the items and totals as
 * tables, then billing and delivery addresses.
 *
 * Email clients are not browsers: layout is nested tables, every style is
 * inline (Gmail drops most <style> rules), fonts are the system stack, and the
 * logo is a transparent 2x PNG on the public site (public/images/email/logo.png,
 * rendered from the header SVG — Gmail and Outlook block SVG). The single
 * <style> block only stacks the address columns on phones, and clients that
 * ignore it still get a readable side-by-side layout.
 *
 * Colours mirror the brand tokens in src/styles/globals.css.
 */

type Order = HttpTypes.StoreOrder

const C = {
  page: '#F7F7F8', // --color-offwhite
  card: '#FFFFFF',
  gold: '#F1AC10', // --color-gold
  goldText: '#B97F00', // --color-gold-strong, darkened for small text on white
  cream: '#FEF6E5', // --color-cream
  ink: '#231F20', // --color-ink
  body: '#4A4A52', // --color-ink-soft
  muted: '#888888', // --color-ink-muted
  rule: '#E6E1D8',
}

const FONT = "Arial, 'Helvetica Neue', Helvetica, sans-serif"

/** The public origin email clients fetch the logo from — never localhost. */
function assetOrigin(): string {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  return site?.startsWith('https://') ? site : 'https://orosmaxaira.com'
}

const esc = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

/** Medusa totals are decimal euros; format them the way the storefront does. */
export const euro = (n: number | string | null | undefined) =>
  `€${Number(n ?? 0).toFixed(2).replace('.', ',')}`

/** "Default" is Medusa's name for the only variant of a single-size product. */
export function variantLabel(item: HttpTypes.StoreOrderLineItem): string | null {
  const v = item.variant_title?.trim()
  if (!v || v === 'Default' || v === item.title || v === item.product_title) return null
  return displaySizeLabel(v)
}

export const EMAIL_COPY = {
  el: {
    customerHeading: 'Ευχαριστούμε για την παραγγελία σας',
    shopHeading: (ref: string) => `Νέα παραγγελία: ${ref}`,
    greeting: (name: string) => (name ? `Γεια σας ${name},` : 'Γεια σας,'),
    customerIntro: 'λάβαμε την παραγγελία σας και την ετοιμάζουμε. Παρακάτω θα βρείτε τα στοιχεία της.',
    shopIntro: (name: string) => `Λάβατε την ακόλουθη παραγγελία από ${name}:`,
    order: 'Παραγγελία',
    product: 'Προϊόν',
    quantity: 'Ποσότητα',
    price: 'Τιμή',
    subtotal: 'Υποσύνολο',
    discount: 'Έκπτωση',
    shipping: 'Αποστολή',
    freeShipping: 'Δωρεάν',
    payment: 'Μέθοδος πληρωμής',
    total: 'Σύνολο',
    deliveryMethod: 'Τρόπος παράδοσης',
    acsPoint: 'Σημείο παραλαβής ACS',
    notes: 'Σημειώσεις',
    billing: 'Διεύθυνση χρέωσης',
    shippingAddress: 'Διεύθυνση αποστολής',
    vat: 'ΑΦΜ',
    taxIncluded: 'περιλαμβάνει ΦΠΑ',
    countries: { CY: 'Κύπρος', GR: 'Ελλάδα' } as Record<string, string>,
    outro: 'Θα επικοινωνήσουμε μαζί σας μόλις η παραγγελία σας ετοιμαστεί για αποστολή.',
    questions: 'Για οποιαδήποτε απορία, απαντήστε σε αυτό το email ή καλέστε μας στο',
    signoff: 'Με εκτίμηση,',
    team: 'Όρος Μαχαιρά',
    viewInAdmin: 'Άνοιγμα στο Medusa',
    delivery: { acs: 'Παραλαβή από κατάστημα ACS', home: 'Παράδοση κατ’ οίκον' } as Record<string, string>,
    paymentMethods: {
      card: 'Πιστωτική / Χρεωστική κάρτα',
      cod: 'Αντικαταβολή',
      bank: 'Τραπεζική κατάθεση',
    } as Record<string, string>,
    dateLocale: 'el-GR',
  },
  en: {
    customerHeading: 'Thank you for your order',
    shopHeading: (ref: string) => `New order: ${ref}`,
    greeting: (name: string) => (name ? `Hello ${name},` : 'Hello,'),
    customerIntro: 'we have received your order and are getting it ready. Here are the details.',
    shopIntro: (name: string) => `You have received the following order from ${name}:`,
    order: 'Order',
    product: 'Product',
    quantity: 'Quantity',
    price: 'Price',
    subtotal: 'Subtotal',
    discount: 'Discount',
    shipping: 'Shipping',
    freeShipping: 'Free',
    payment: 'Payment method',
    total: 'Total',
    deliveryMethod: 'Delivery',
    acsPoint: 'ACS pickup point',
    notes: 'Notes',
    billing: 'Billing address',
    shippingAddress: 'Shipping address',
    vat: 'VAT no.',
    taxIncluded: 'includes VAT',
    countries: { CY: 'Cyprus', GR: 'Greece' } as Record<string, string>,
    outro: 'We will be in touch as soon as your order is ready to ship.',
    questions: 'Any questions? Reply to this email or call us on',
    signoff: 'Kind regards,',
    team: 'Oros Machaira',
    viewInAdmin: 'Open in Medusa',
    delivery: { acs: 'ACS store pickup', home: 'Home delivery' } as Record<string, string>,
    paymentMethods: {
      card: 'Credit / Debit card',
      cod: 'Cash on delivery',
      bank: 'Bank transfer',
    } as Record<string, string>,
    dateLocale: 'en-GB',
  },
}

export type EmailCopy = (typeof EMAIL_COPY)['el']

const PHONE = '+357 25 622 305'
const PHONE_HREF = 'tel:+35725622305'
const EMAIL = 'info@orosmaxaira.com'

/** Discount codes applied to the order, from the line-item adjustments. */
export function couponCodes(order: Order): string[] {
  const codes = (order.items ?? []).flatMap((i) =>
    (i.adjustments ?? []).map((a) => a.code).filter((c): c is string => Boolean(c)),
  )
  return [...new Set(codes)]
}

function addressBlock(
  a: HttpTypes.StoreOrderAddress | null | undefined,
  t: EmailCopy,
  extra: string[] = [],
) {
  if (!a) return ''
  const lines = [
    [a.first_name, a.last_name].filter(Boolean).join(' '),
    a.company,
    a.address_1,
    a.address_2,
    [a.postal_code, a.city].filter(Boolean).join(' '),
    a.country_code ? t.countries[a.country_code.toUpperCase()] ?? a.country_code.toUpperCase() : '',
  ]
    .filter(Boolean)
    .map((l) => esc(l))
  const phone = a.phone
    ? `<a href="tel:${esc(a.phone.replace(/\s+/g, ''))}" style="color:${C.ink};text-decoration:underline;">${esc(a.phone)}</a>`
    : ''
  return [...lines, phone, ...extra].filter(Boolean).join('<br>')
}

const cell = (content: string, style = '') =>
  `<td style="padding:12px 14px;border:1px solid ${C.rule};font-family:${FONT};font-size:14px;line-height:20px;color:${C.body};${style}">${content}</td>`

const labelCell = (content: string) =>
  cell(esc(content), `font-weight:bold;color:${C.ink};width:38%;`)

export function renderOrderEmailHtml(
  order: Order,
  t: EmailCopy,
  audience: 'customer' | 'shop',
): string {
  const ref = order.display_id ? `#${order.display_id}` : order.id
  const billing = order.billing_address ?? order.shipping_address
  const name =
    [billing?.first_name, billing?.last_name].filter(Boolean).join(' ') ||
    [order.shipping_address?.first_name, order.shipping_address?.last_name].filter(Boolean).join(' ')
  const meta = (order.metadata ?? {}) as Record<string, string | undefined>
  const date = new Intl.DateTimeFormat(t.dateLocale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Nicosia',
  }).format(new Date(order.created_at ?? Date.now()))

  const discount = Number(order.discount_total ?? 0)
  const shipping = Number(order.shipping_total ?? 0)
  const tax = Number(order.tax_total ?? 0)
  const codes = couponCodes(order)
  const shippingName = order.shipping_methods?.[0]?.name
  const deliveryLabel = meta.delivery ? t.delivery[meta.delivery] : undefined
  const paymentLabel = meta.payment_method ? t.paymentMethods[meta.payment_method] ?? meta.payment_method : undefined

  const heading = audience === 'customer' ? t.customerHeading : t.shopHeading(ref)
  const preheader =
    audience === 'customer'
      ? `${t.order} ${ref} — ${euro(order.total)}`
      : `${name || order.email || ''} — ${euro(order.total)}`

  const itemRows = (order.items ?? [])
    .map((i) => {
      const size = variantLabel(i)
      const title = `${esc(i.product_title || i.title)}${
        size ? `<br><span style="color:${C.muted};font-size:13px;">${esc(size)}</span>` : ''
      }`
      return `<tr>${cell(title)}${cell(esc(i.quantity), 'text-align:center;white-space:nowrap;')}${cell(
        esc(euro(i.subtotal ?? Number(i.unit_price) * Number(i.quantity))),
        'text-align:right;white-space:nowrap;',
      )}</tr>`
    })
    .join('')

  const totalRows = [
    `<tr>${labelCell(t.subtotal)}${cell(esc(euro(order.item_subtotal ?? order.subtotal)))}</tr>`,
    discount > 0
      ? `<tr>${labelCell(t.discount)}${cell(
          `−${esc(euro(discount))}${codes.length ? ` <span style="color:${C.muted};font-size:13px;">(${esc(codes.join(', '))})</span>` : ''}`,
        )}</tr>`
      : '',
    `<tr>${labelCell(t.shipping)}${cell(
      `${shipping > 0 ? esc(euro(shipping)) : esc(t.freeShipping)}${
        shippingName ? ` <span style="color:${C.muted};font-size:13px;">— ${esc(shippingName)}</span>` : ''
      }`,
    )}</tr>`,
    paymentLabel ? `<tr>${labelCell(t.payment)}${cell(esc(paymentLabel))}</tr>` : '',
    `<tr>${labelCell(t.total)}${cell(
      `<strong style="color:${C.ink};font-size:16px;">${esc(euro(order.total))}</strong>${
        tax > 0 ? ` <span style="color:${C.muted};font-size:13px;">(${esc(t.taxIncluded)} ${esc(euro(tax))})</span>` : ''
      }`,
      `background:${C.cream};`,
    )}</tr>`,
  ].join('')

  const detailRows = [
    deliveryLabel ? `<tr>${labelCell(t.deliveryMethod)}${cell(esc(deliveryLabel))}</tr>` : '',
    meta.acs_point ? `<tr>${labelCell(t.acsPoint)}${cell(esc(meta.acs_point))}</tr>` : '',
    meta.notes ? `<tr>${labelCell(t.notes)}${cell(esc(meta.notes).replace(/\n/g, '<br>'))}</tr>` : '',
  ].join('')

  const billingExtra = [
    meta.vat ? `${esc(t.vat)}: ${esc(meta.vat)}` : '',
    order.email
      ? `<a href="mailto:${esc(order.email)}" style="color:${C.goldText};text-decoration:underline;">${esc(order.email)}</a>`
      : '',
  ]

  const addressCol = (title: string, body: string, side: 'left' | 'right') =>
    body
      ? `<td class="col" valign="top" width="50%" style="padding:${side === 'left' ? '0 8px 16px 0' : '0 0 16px 8px'};">
          <p style="margin:0 0 10px;font-family:${FONT};font-size:17px;line-height:22px;font-weight:bold;color:${C.goldText};">${esc(title)}</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            <tr><td style="padding:14px;border:1px solid ${C.rule};font-family:${FONT};font-size:14px;line-height:22px;color:${C.body};">${body}</td></tr>
          </table>
        </td>`
      : ''

  const adminBase = process.env.MEDUSA_BACKEND_URL?.replace(/\/$/, '')
  const adminLink =
    audience === 'shop' && adminBase?.startsWith('https://')
      ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 0;">
          <tr><td bgcolor="${C.ink}" style="border-radius:4px;">
            <a href="${esc(`${adminBase}/app/orders/${order.id}`)}" style="display:inline-block;padding:13px 22px;font-family:${FONT};font-size:15px;font-weight:bold;color:#FFFFFF;text-decoration:none;border-radius:4px;">${esc(t.viewInAdmin)} →</a>
          </td></tr>
        </table>`
      : ''

  const closing =
    audience === 'customer'
      ? `<p style="margin:28px 0 0;font-family:${FONT};font-size:15px;line-height:24px;color:${C.body};">${esc(t.outro)}</p>
         <p style="margin:12px 0 0;font-family:${FONT};font-size:15px;line-height:24px;color:${C.body};">${esc(t.questions)} <a href="${PHONE_HREF}" style="color:${C.goldText};text-decoration:underline;white-space:nowrap;">${PHONE}</a>.</p>
         <p style="margin:20px 0 0;font-family:${FONT};font-size:15px;line-height:24px;color:${C.body};">${esc(t.signoff)}<br><strong style="color:${C.ink};">${esc(t.team)}</strong></p>`
      : adminLink

  const intro =
    audience === 'customer'
      ? `<p style="margin:0 0 6px;font-family:${FONT};font-size:15px;line-height:24px;color:${C.body};">${esc(t.greeting(name))}</p>
         <p style="margin:0 0 24px;font-family:${FONT};font-size:15px;line-height:24px;color:${C.body};">${esc(t.customerIntro)}</p>`
      : `<p style="margin:0 0 24px;font-family:${FONT};font-size:15px;line-height:24px;color:${C.body};">${esc(t.shopIntro(name || order.email || '—'))}</p>`

  return `<!doctype html>
<html lang="${t.dateLocale.slice(0, 2)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${esc(heading)}</title>
<style>
  @media only screen and (max-width: 620px) {
    .px { padding-left: 22px !important; padding-right: 22px !important; }
    .col { display: block !important; width: 100% !important; padding: 0 0 16px !important; }
    .h1 { font-size: 24px !important; line-height: 30px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${C.page};-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${C.page}" style="background:${C.page};">
  <tr>
    <td align="center" style="padding:32px 12px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;">
        <tr>
          <td align="center" style="padding:0 0 24px;">
            <a href="${assetOrigin()}" style="text-decoration:none;">
              <img src="${assetOrigin()}/images/email/logo.png" width="180" height="65" alt="Όρος Μαχαιρά" style="display:block;width:180px;height:auto;border:0;outline:none;font-family:${FONT};font-size:20px;color:${C.ink};">
            </a>
          </td>
        </tr>
        <tr>
          <td style="background:${C.card};border:1px solid ${C.rule};border-radius:6px;overflow:hidden;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td class="px" bgcolor="${C.gold}" style="background:${C.gold};padding:30px 44px;border-radius:6px 6px 0 0;">
                  <h1 class="h1" style="margin:0;font-family:${FONT};font-size:28px;line-height:34px;font-weight:normal;color:${C.ink};">${esc(heading)}</h1>
                </td>
              </tr>
              <tr>
                <td class="px" style="padding:36px 44px 40px;">
                  ${intro}
                  <p style="margin:0 0 14px;font-family:${FONT};font-size:18px;line-height:24px;font-weight:bold;color:${C.goldText};">${esc(t.order)} ${esc(ref)} <span style="font-weight:normal;color:${C.muted};font-size:15px;">(${esc(date)})</span></p>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                    <tr>
                      ${cell(esc(t.product), `font-weight:bold;color:${C.ink};background:${C.cream};`)}
                      ${cell(esc(t.quantity), `font-weight:bold;color:${C.ink};background:${C.cream};text-align:center;width:1%;white-space:nowrap;`)}
                      ${cell(esc(t.price), `font-weight:bold;color:${C.ink};background:${C.cream};text-align:right;width:1%;white-space:nowrap;`)}
                    </tr>
                    ${itemRows}
                  </table>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:20px;">
                    ${totalRows}
                  </table>
                  ${
                    detailRows
                      ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:20px;">${detailRows}</table>`
                      : ''
                  }
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
                    <tr>
                      ${addressCol(t.billing, addressBlock(billing, t, billingExtra), 'left')}
                      ${addressCol(t.shippingAddress, addressBlock(order.shipping_address, t), 'right')}
                    </tr>
                  </table>
                  ${closing}
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:24px 12px 0;font-family:${FONT};font-size:12px;line-height:20px;color:${C.muted};">
            <strong style="color:${C.body};">Όρος Μαχαιρά</strong> · Μελίνη, 7716 Λάρνακα, Κύπρος<br>
            <a href="${PHONE_HREF}" style="color:${C.muted};text-decoration:none;">${PHONE}</a> ·
            <a href="mailto:${EMAIL}" style="color:${C.muted};text-decoration:none;">${EMAIL}</a> ·
            <a href="${assetOrigin()}" style="color:${C.muted};text-decoration:none;">orosmaxaira.com</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`
}
