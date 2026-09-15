import 'server-only'

/**
 * The branded shell every email the storefront sends is wrapped in: the logo
 * on top, a honey-gold header bar with the heading, a white card for the body,
 * and the shop's contact line underneath. Order emails, and the contact,
 * workshop and school-visit enquiries, all go through `emailShell`.
 *
 * Email clients are not browsers: layout is nested tables, every style is
 * inline (Gmail drops most <style> rules), fonts are the system stack, and the
 * logo is a transparent 2x PNG on the public site (public/images/email/logo.png,
 * rendered from the header SVG — Gmail and Outlook block SVG). The one <style>
 * block only tightens padding and stacks `.col` columns on phones; clients that
 * ignore it still get a readable layout.
 *
 * The Medusa backend sends the booking emails with a copy of this shell
 * (medusa/apps/backend/src/lib/email-layout.ts) — the two apps share no code,
 * so keep them looking the same.
 *
 * Colours mirror the brand tokens in src/styles/globals.css.
 */

export const BRAND = {
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

export const FONT = "Arial, 'Helvetica Neue', Helvetica, sans-serif"

export const SHOP = {
  name: 'Όρος Μαχαιρά',
  address: 'Μελίνη, 7716 Λάρνακα, Κύπρος',
  phone: '+357 25 622 305',
  phoneHref: 'tel:+35725622305',
  email: 'info@orosmaxaira.com',
}

/** The public origin email clients fetch the logo from — never localhost. */
export function assetOrigin(): string {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  return site?.startsWith('https://') ? site : 'https://orosmaxaira.com'
}

/** Escape text for HTML. Everything a visitor typed must go through this. */
export const esc = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

/** Escaped multi-line text, line breaks kept. */
export const escLines = (value: unknown) => esc(value).replace(/\r?\n/g, '<br>')

/** A body paragraph. `html` must already be escaped. */
export const paragraph = (html: string, style = '') =>
  `<p style="margin:0 0 16px;font-family:${FONT};font-size:15px;line-height:24px;color:${BRAND.body};${style}">${html}</p>`

/** An underlined gold link. `label` is escaped here. */
export const link = (href: string, label: string) =>
  `<a href="${esc(href)}" style="color:${BRAND.goldText};text-decoration:underline;">${esc(label)}</a>`

export const mailtoLink = (email: string) => link(`mailto:${email}`, email)
export const telLink = (phone: string) => link(`tel:${phone.replace(/[^\d+]/g, '')}`, phone)

/** One bordered table cell. `content` must already be escaped. */
export const cell = (content: string, style = '') =>
  `<td style="padding:12px 14px;border:1px solid ${BRAND.rule};font-family:${FONT};font-size:14px;line-height:20px;color:${BRAND.body};${style}">${content}</td>`

export const labelCell = (label: string) =>
  cell(esc(label), `font-weight:bold;color:${BRAND.ink};width:38%;`)

/**
 * A two-column label/value table. Rows with an empty value are skipped, so
 * optional fields can be passed unconditionally. Values must already be escaped.
 */
export function detailsTable(rows: [label: string, valueHtml: string | null | undefined][], style = '') {
  const body = rows
    .filter(([, value]) => value)
    .map(([label, value]) => `<tr>${labelCell(label)}${cell(value!)}</tr>`)
    .join('')
  return body
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;${style}">${body}</table>`
    : ''
}

/** A cream box for free text (a visitor's message, order notes). */
export const quoteBox = (html: string) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:20px 0 0;">
    <tr><td style="padding:16px 18px;background:${BRAND.cream};border-left:3px solid ${BRAND.gold};font-family:${FONT};font-size:15px;line-height:24px;color:${BRAND.ink};">${html}</td></tr>
  </table>`

/** A button: dark ink for staff actions, gold for customer ones. */
export function button(href: string, label: string, tone: 'ink' | 'gold' = 'ink') {
  const bg = tone === 'ink' ? BRAND.ink : BRAND.gold
  const fg = tone === 'ink' ? '#FFFFFF' : BRAND.ink
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 0;">
    <tr><td bgcolor="${bg}" style="border-radius:4px;">
      <a href="${esc(href)}" style="display:inline-block;padding:13px 22px;font-family:${FONT};font-size:15px;font-weight:bold;color:${fg};text-decoration:none;border-radius:4px;">${esc(label)} →</a>
    </td></tr>
  </table>`
}

/** "Με εκτίμηση, Όρος Μαχαιρά" — the customer emails' sign-off. */
export const signoff = (lang: 'el' | 'en') =>
  paragraph(
    `${lang === 'en' ? 'Kind regards,' : 'Με εκτίμηση,'}<br><strong style="color:${BRAND.ink};">${
      lang === 'en' ? 'Oros Machaira' : SHOP.name
    }</strong>`,
    'margin:24px 0 0;',
  )

export function emailShell({
  lang,
  heading,
  preheader,
  body,
}: {
  lang: 'el' | 'en'
  heading: string
  /** The grey preview line inboxes show under the subject. */
  preheader: string
  /** Card content — already-escaped HTML. */
  body: string
}): string {
  const origin = assetOrigin()
  return `<!doctype html>
<html lang="${lang}">
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
<body style="margin:0;padding:0;background:${BRAND.page};-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${BRAND.page}" style="background:${BRAND.page};">
  <tr>
    <td align="center" style="padding:32px 12px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;">
        <tr>
          <td align="center" style="padding:0 0 24px;">
            <a href="${origin}" style="text-decoration:none;">
              <img src="${origin}/images/email/logo.png" width="180" height="65" alt="${SHOP.name}" style="display:block;width:180px;height:auto;border:0;outline:none;font-family:${FONT};font-size:20px;color:${BRAND.ink};">
            </a>
          </td>
        </tr>
        <tr>
          <td style="background:${BRAND.card};border:1px solid ${BRAND.rule};border-radius:6px;overflow:hidden;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td class="px" bgcolor="${BRAND.gold}" style="background:${BRAND.gold};padding:30px 44px;border-radius:6px 6px 0 0;">
                  <h1 class="h1" style="margin:0;font-family:${FONT};font-size:28px;line-height:34px;font-weight:normal;color:${BRAND.ink};">${esc(heading)}</h1>
                </td>
              </tr>
              <tr>
                <td class="px" style="padding:36px 44px 40px;">
                  ${body}
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:24px 12px 0;font-family:${FONT};font-size:12px;line-height:20px;color:${BRAND.muted};">
            <strong style="color:${BRAND.body};">${SHOP.name}</strong> · ${SHOP.address}<br>
            <a href="${SHOP.phoneHref}" style="color:${BRAND.muted};text-decoration:none;">${SHOP.phone}</a> ·
            <a href="mailto:${SHOP.email}" style="color:${BRAND.muted};text-decoration:none;">${SHOP.email}</a> ·
            <a href="${origin}" style="color:${BRAND.muted};text-decoration:none;">orosmaxaira.com</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`
}
