import { NextResponse } from 'next/server'
import { z } from 'zod'
import { sendMail } from '@/lib/email'
import { renderEnquiryEmail } from '@/lib/enquiry-email'
import {
  BRAND,
  SHOP,
  detailsTable,
  emailShell,
  esc,
  escLines,
  paragraph,
  quoteBox,
  signoff,
} from '@/lib/email-layout'
import { getActivity } from '@/lib/medusa/activities'
import { getBookingUi } from '@/components/booking/booking-ui'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/booking-enquiry — an appointment request for an enquiry-type
 * activity (Μελισσοθεραπεία). The farm gets the request; the customer gets an
 * acknowledgement in their language with the activity's confirmation note
 * ("please arrive 5 minutes early"), both edited in the Medusa admin.
 *
 * The title and note are read from Medusa here, never taken from the browser,
 * so the acknowledgement cannot be used to send arbitrary text.
 */
const bodySchema = z.object({
  slug: z.string().min(1).max(80),
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(5).max(40),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  locale: z.enum(['el', 'en']).optional(),
  // Honeypot — a bot that fills it is dropped silently below.
  website: z.string().max(200).optional(),
})

const ipBucket = new Map<string, { count: number; resetAt: number }>()
const WINDOW_MS = 60_000
const MAX_REQUESTS = 5

function rateLimit(ip: string) {
  const now = Date.now()
  if (ipBucket.size > 5000) {
    for (const [k, v] of ipBucket) if (v.resetAt < now) ipBucket.delete(k)
  }
  const entry = ipBucket.get(ip)
  if (!entry || entry.resetAt < now) {
    ipBucket.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }
  if (entry.count >= MAX_REQUESTS) return false
  entry.count++
  return true
}

const COPY = {
  el: {
    subject: (title: string) => `Λάβαμε το αίτημά σας — ${title}`,
    heading: 'Λάβαμε το αίτημά σας',
    hello: (name: string) => `Γεια σας ${name},`,
    intro: (title: string) =>
      `Ευχαριστούμε! Λάβαμε το αίτημα κράτησης για «${title}». Θα επικοινωνήσουμε σύντομα μαζί σας για να επιβεβαιώσουμε την ημέρα και την ώρα.`,
    activity: 'Δραστηριότητα',
    date: 'Προτιμώμενη ημέρα',
    time: 'Ώρα έναρξης',
    questions: `Για απορίες, απαντήστε σε αυτό το email ή καλέστε μας στο ${SHOP.phone}.`,
  },
  en: {
    subject: (title: string) => `We received your request — ${title}`,
    heading: 'We received your request',
    hello: (name: string) => `Hello ${name},`,
    intro: (title: string) =>
      `Thank you! We received your booking request for “${title}”. We will contact you shortly to confirm the day and time.`,
    activity: 'Activity',
    date: 'Preferred day',
    time: 'Start time',
    questions: `For any questions, reply to this email or call us on ${SHOP.phone}.`,
  },
}

export async function POST(req: Request) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: 'Πολλά αιτήματα. Δοκιμάστε ξανά σε λίγο.' }, { status: 429 })
  }

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = bodySchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ελέγξτε τα στοιχεία της φόρμας.' }, { status: 400 })
  }
  const { slug, name, email, phone, date, time, website } = parsed.data
  if (website) return NextResponse.json({ ok: true })
  const locale = parsed.data.locale === 'en' ? 'en' : 'el'

  const [activity, localized] = await Promise.all([
    getActivity(slug, 'el'),
    locale === 'en' ? getActivity(slug, 'en') : null,
  ])
  if (!activity || activity.booking_type !== 'enquiry') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const customerView = localized ?? activity
  const c = COPY[locale]
  const niceDate = getBookingUi(locale).formatDate(date)

  const subject = `Νέο αίτημα κράτησης — ${activity.title} — ${name}`
  try {
    const sent = await sendMail('booking-enquiry', {
      replyTo: email,
      subject,
      html: renderEnquiryEmail({
        heading: 'Νέο αίτημα κράτησης',
        intro: `Λάβατε νέο αίτημα κράτησης για «${activity.title}» από ${name}.`,
        rows: [
          ['Όνομα', name],
          ['Email', email, 'email'],
          ['Τηλέφωνο', phone, 'phone'],
          ['Δραστηριότητα', activity.title],
          ['Προτιμώμενη ημέρα', getBookingUi('el').formatDate(date)],
          ['Ώρα έναρξης', time],
          ['Γλώσσα πελάτη', locale === 'en' ? 'English' : null],
        ],
        replyTo: { name, email },
        subject,
      }),
      text: [
        `Όνομα: ${name}`,
        `Email: ${email}`,
        `Τηλέφωνο: ${phone}`,
        `Δραστηριότητα: ${activity.title}`,
        `Προτιμώμενη ημέρα: ${date}`,
        `Ώρα έναρξης: ${time}`,
      ].join('\n'),
    })
    if (!sent) return NextResponse.json({ ok: true, note: 'logged' })
  } catch (err) {
    console.error('[booking-enquiry] farm notice failed', err)
    return NextResponse.json({ error: 'Δεν ήταν δυνατή η αποστολή. Δοκιμάστε ξανά.' }, { status: 502 })
  }

  // The farm has the request; a failed acknowledgement must not fail the form.
  const title = customerView.title
  const note = customerView.confirmation_note?.trim() || null
  try {
    await sendMail('booking-enquiry', {
      to: email,
      subject: c.subject(title),
      html: emailShell({
        lang: locale,
        heading: c.heading,
        preheader: c.intro(title),
        body: [
          paragraph(esc(c.hello(name)), 'margin:0 0 6px;'),
          paragraph(esc(c.intro(title)), 'margin:0 0 24px;'),
          detailsTable([
            [c.activity, esc(title)],
            [c.date, `<strong style="color:${BRAND.ink};">${esc(niceDate)}</strong>`],
            [c.time, esc(time)],
          ]),
          note ? quoteBox(escLines(note)) : '',
          paragraph(esc(c.questions), 'margin:28px 0 0;'),
          signoff(locale),
        ].join('\n'),
      }),
      text: [c.hello(name), '', c.intro(title), '', `${c.date}: ${niceDate}`, `${c.time}: ${time}`, note ? `\n${note}` : '', '', c.questions]
        .join('\n'),
    })
  } catch (err) {
    console.error('[booking-enquiry] customer acknowledgement failed', err)
  }

  return NextResponse.json({ ok: true })
}
