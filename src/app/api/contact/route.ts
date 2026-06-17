import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { z } from 'zod'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  firstName: z.string().min(1).max(60),
  lastName: z.string().min(1).max(60),
  email: z.string().email(),
  phone: z.string().min(5).max(40),
  website: z.string().max(0).optional(),
  // Legacy single-name field (older forms)
  name: z.string().min(2).max(120).optional(),
  message: z.string().min(10).max(5000).optional(),
})

const ipBucket = new Map<string, { count: number; resetAt: number }>()
const WINDOW_MS = 60_000
const MAX_REQUESTS = 5

function rateLimit(ip: string) {
  const now = Date.now()
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
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const { firstName, lastName, email, phone, website, name, message } = parsed.data
  if (website && website.length > 0) {
    return NextResponse.json({ ok: true })
  }

  const fullName =
    firstName && lastName
      ? `${firstName} ${lastName}`.trim()
      : (name ?? `${firstName ?? ''} ${lastName ?? ''}`.trim())
  const bodyText =
    message ??
    `New contact form submission from ${fullName}.\nPhone: ${phone}\nEmail: ${email}`

  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT ?? 465)
  const user = process.env.SMTP_USER
  const password = process.env.SMTP_PASSWORD
  const to = process.env.CONTACT_TO_EMAIL ?? user
  const from = process.env.CONTACT_FROM_EMAIL ?? user

  if (!host || !user || !password || !to) {
    console.warn('[contact] SMTP not configured; submission discarded', { name: fullName, email })
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
      subject: `New website enquiry — ${fullName}`,
      text: [
        `Name: ${fullName}`,
        `Email: ${email}`,
        `Phone: ${phone || '—'}`,
        '',
        bodyText,
      ].join('\n'),
    })
  } catch (err) {
    console.error('[contact] sendMail failed', err)
    return NextResponse.json({ error: 'Could not send message' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
