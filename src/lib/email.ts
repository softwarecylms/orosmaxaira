import nodemailer from 'nodemailer'

/**
 * The site's one SMTP transport.
 *
 * The contact form, the workshop and school enquiries, and the order
 * confirmation all send through here. Each of those routes used to carry its
 * own byte-identical copy of the env read and the transport.
 *
 * **Unconfigured SMTP is not an error.** `SMTP_*` is set locally but not on
 * Vercel, so on the live site `getMailer()` returns null and callers log and
 * carry on. That is deliberate and long-standing: a missing mail server must
 * never fail a contact form — or an order that has already been paid for.
 */

export type Mailer = {
  transporter: nodemailer.Transporter
  /** Envelope sender — CONTACT_FROM_EMAIL, else the SMTP user. */
  from: string
  /** Where site notifications go — CONTACT_TO_EMAIL, else the SMTP user. */
  to: string
}

/** The configured transport, or null when SMTP is not set up in this env. */
export function getMailer(): Mailer | null {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT ?? 465)
  const user = process.env.SMTP_USER
  const password = process.env.SMTP_PASSWORD
  const to = process.env.CONTACT_TO_EMAIL ?? user
  const from = process.env.CONTACT_FROM_EMAIL ?? user

  if (!host || !user || !password || !to || !from) return null

  return {
    transporter: nodemailer.createTransport({
      host,
      port,
      secure: port === 465 || process.env.SMTP_SECURE === 'true',
      auth: { user, pass: password },
    }),
    from,
    to,
  }
}

/**
 * Send one message. Returns false when SMTP is unconfigured (logged, not
 * thrown); throws only when a configured server actually rejects it, so the
 * enquiry routes can still answer 502 on a real failure.
 *
 * Omit `to` to reach the shop itself (CONTACT_TO_EMAIL) — that is the default
 * for every notification the site sends to its owner.
 */
export async function sendMail(
  scope: string,
  message: Omit<nodemailer.SendMailOptions, 'from'> & { from?: string },
): Promise<boolean> {
  const mailer = getMailer()
  if (!mailer) {
    console.warn(`[${scope}] SMTP not configured; message discarded`, {
      to: message.to,
      subject: message.subject,
    })
    return false
  }
  await mailer.transporter.sendMail({
    from: mailer.from,
    ...message,
    to: message.to ?? mailer.to,
  })
  return true
}
