import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { z } from 'zod'
import { WORKSHOP_EXPERIENCE_KEYS, experienceLabel } from '@/lib/data/workshop-enquiry'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// The combination rule (R1) is enforced HERE, not just in the UI: a submission
// without one of the two valid experiences is rejected.
const bodySchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(5).max(40),
  date: z.string().min(4).max(20).optional(),
  time: z.string().max(10).optional(),
  experience: z.enum(WORKSHOP_EXPERIENCE_KEYS),
  // Farm-resolved workshop for the chosen date (informational).
  workshop: z.string().max(160).optional(),
  // Honeypot — parsed loosely so a bot that fills it is dropped *silently*
  // below (a strict `.max(0)` would 400 before we can pretend success).
  website: z.string().max(200).optional(),
})

const ipBucket = new Map<string, { count: number; resetAt: number }>()
const WINDOW_MS = 60_000
const MAX_REQUESTS = 5

function rateLimit(ip: string) {
  const now = Date.now()
  // Bound memory in the long-lived runtime: purge expired buckets before they
  // accumulate (one entry per unique IP would otherwise never be reclaimed).
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

  const { name, email, phone, date, time, experience, workshop, website } = parsed.data
  if (website && website.length > 0) {
    return NextResponse.json({ ok: true }) // silently drop bots
  }

  const experienceText = experienceLabel(experience) ?? experience

  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT ?? 465)
  const user = process.env.SMTP_USER
  const password = process.env.SMTP_PASSWORD
  const to = process.env.CONTACT_TO_EMAIL ?? user
  const from = process.env.CONTACT_FROM_EMAIL ?? user

  if (!host || !user || !password || !to) {
    console.warn('[workshop-enquiry] SMTP not configured; submission discarded', {
      name,
      email,
      experience,
    })
    return NextResponse.json({ ok: true, note: 'logged' })
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465 || process.env.SMTP_SECURE === 'true',
    auth: { user, pass: password },
  })

  try {
    await transporter.sendMail({
      from,
      to,
      replyTo: email,
      subject: `Νέο αίτημα εργαστηρίου — ${name}`,
      text: [
        `Όνομα: ${name}`,
        `Email: ${email}`,
        `Τηλέφωνο: ${phone || '—'}`,
        `Εμπειρία: ${experienceText}`,
        `Εργαστήρι περιόδου: ${workshop || '—'}`,
        `Προτιμώμενη ημέρα: ${date || '—'}`,
        `Ώρα έναρξης: ${time || '—'}`,
      ].join('\n'),
    })
  } catch (err) {
    console.error('[workshop-enquiry] sendMail failed', err)
    return NextResponse.json({ error: 'Δεν ήταν δυνατή η αποστολή. Δοκιμάστε ξανά.' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
