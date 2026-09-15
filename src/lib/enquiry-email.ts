import 'server-only'
import {
  button,
  detailsTable,
  emailShell,
  esc,
  escLines,
  mailtoLink,
  paragraph,
  quoteBox,
  telLink,
} from './email-layout'

/**
 * The shop's notice for a website enquiry (contact form, workshop enquiry,
 * school visit), in the branded shell: a heading, one line saying who wrote,
 * the details as a table, their message, and a button to reply to them.
 *
 * Rows take raw text and are escaped here; a row with no value is skipped.
 * Links (mailto:, tel:) are added for the email and phone rows by `kind`.
 */
export type EnquiryRow = [label: string, value: string | number | null | undefined, kind?: 'email' | 'phone']

export function renderEnquiryEmail({
  heading,
  intro,
  rows,
  message,
  replyTo,
  subject,
}: {
  heading: string
  intro: string
  rows: EnquiryRow[]
  /** The visitor's free text, shown in a quote box. */
  message?: string | null
  replyTo: { name: string; email: string }
  /** The notice's subject — the reply button pre-fills "Re: <subject>". */
  subject: string
}): string {
  const cells = rows.map(([label, value, kind]): [string, string | null] => {
    if (value === null || value === undefined || value === '') return [label, null]
    const text = String(value)
    if (kind === 'email') return [label, mailtoLink(text)]
    if (kind === 'phone') return [label, telLink(text)]
    return [label, escLines(text)]
  })

  const mailto = `mailto:${replyTo.email}?subject=${encodeURIComponent(`Re: ${subject}`)}`

  return emailShell({
    lang: 'el',
    heading,
    preheader: message ? message.slice(0, 120) : intro,
    body: [
      paragraph(esc(intro), 'margin:0 0 24px;'),
      detailsTable(cells),
      message ? quoteBox(escLines(message)) : '',
      button(mailto, `Απάντηση σε ${replyTo.name}`),
    ].join('\n'),
  })
}
