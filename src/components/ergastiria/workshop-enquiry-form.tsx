'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Check, Info, Loader2 } from 'lucide-react'
import { workshopForMonth } from '@/lib/data/workshops'
import { WORKSHOP_EXPERIENCES, type WorkshopExperienceKey } from '@/lib/data/workshop-enquiry'

// Glass fields on the gold band — same treatment as the other on-brand forms.
const inputCls =
  'w-full rounded-[4px] border border-white/30 bg-white/15 px-[15px] py-2.5 text-[16px] leading-[24px] text-white outline-none backdrop-blur transition placeholder:text-white focus:border-white focus:bg-white/25'

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

/**
 * Workshop enquiry form (R6). A required experience selector (the combination
 * rule) sits above the contact fields; picking a date reveals which workshop
 * the farm runs that period. Submits to /api/workshop-enquiry (real email
 * pipeline). The experience is validated again server-side.
 */
export function WorkshopEnquiryForm({
  startHour = 8,
  endHour = 16,
  stepMinutes = 30,
}: {
  startHour?: number
  endHour?: number
  stepMinutes?: number
}) {
  const [experience, setExperience] = useState<WorkshopExperienceKey | ''>('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [website, setWebsite] = useState('') // honeypot

  const [minDate, setMinDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const now = new Date()
    setMinDate(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
    )
  }, [])

  const slots = useMemo(() => {
    const out: string[] = []
    for (let m = startHour * 60; m <= endHour * 60; m += stepMinutes) {
      out.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`)
    }
    return out
  }, [startHour, endHour, stepMinutes])

  // Which workshop the farm runs for the chosen date's month (R2 — the visitor
  // doesn't choose it; it's derived).
  const periodWorkshop = useMemo(() => {
    if (!date) return null
    const month = Number(date.split('-')[1])
    return month ? workshopForMonth(month) : null
  }, [date])

  // Validate on submit (rather than disabling the button) so keyboard / screen
  // reader users get a concrete reason instead of a dead, disabled control.
  const validate = (): string | null => {
    if (!experience) return 'Επιλέξτε τον συνδυασμό εμπειρίας.'
    if (name.trim().length < 2) return 'Συμπληρώστε το ονοματεπώνυμό σας.'
    if (!emailOk(email)) return 'Συμπληρώστε ένα έγκυρο email.'
    if (phone.trim().length < 5) return 'Συμπληρώστε έγκυρο τηλέφωνο επικοινωνίας.'
    if (!date) return 'Επιλέξτε προτιμώμενη ημέρα.'
    if (!time) return 'Επιλέξτε ώρα έναρξης.'
    return null
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    const err = validate()
    if (err) {
      setError(err)
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/workshop-enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          date,
          time,
          experience,
          workshop: periodWorkshop?.title ?? '',
          website,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error ?? 'Κάτι πήγε στραβά. Δοκιμάστε ξανά.')
      }
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Κάτι πήγε στραβά. Δοκιμάστε ξανά.')
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[8px] border border-white/30 bg-white/15 px-5 py-10 text-center text-white backdrop-blur">
        <span className="flex size-12 items-center justify-center rounded-full bg-white/25">
          <Check className="size-6" strokeWidth={2.5} aria-hidden="true" />
        </span>
        <p className="text-[16px] leading-[24px]">
          Λάβαμε το αίτημά σας! Πρόκειται για αίτημα κράτησης — θα επικοινωνήσουμε σύντομα μαζί σας
          για την επιβεβαίωση της διαθεσιμότητας. 🐝
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="flex w-full flex-col gap-4 text-left">
      {/* Experience selector (required — the combination rule) */}
      <fieldset className="flex flex-col gap-2" aria-required="true">
        <legend className="mb-1.5 text-[13px] font-semibold text-white">
          Επιλέξτε συνδυασμό <span aria-hidden="true">*</span>
          <span className="sr-only">(υποχρεωτικό)</span>
        </legend>
        <div className="flex flex-col gap-2">
          {WORKSHOP_EXPERIENCES.map((opt) => {
            const active = experience === opt.key
            return (
              <label
                key={opt.key}
                className={`flex cursor-pointer items-start gap-3 rounded-[4px] border px-4 py-3 text-[14.5px] leading-[1.4] backdrop-blur transition ${
                  active
                    ? 'border-white bg-white/25 text-white'
                    : 'border-white/30 bg-white/10 text-white/90 hover:border-white/60'
                }`}
              >
                <input
                  type="radio"
                  name="experience"
                  value={opt.key}
                  checked={active}
                  onChange={() => setExperience(opt.key)}
                  className="mt-0.5 size-4 shrink-0 accent-white"
                />
                <span>{opt.label}</span>
              </label>
            )
          })}
        </div>
      </fieldset>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        placeholder="Ονοματεπώνυμο"
        aria-label="Ονοματεπώνυμο"
        className={inputCls}
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="Email"
        aria-label="Email"
        className={inputCls}
      />
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
        placeholder="Τηλέφωνο"
        aria-label="Τηλέφωνο"
        className={inputCls}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-[13px] font-medium text-white/90">
          Προτιμώμενη ημέρα
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            min={minDate}
            aria-label="Προτιμώμενη ημέρα"
            className={`${inputCls} [color-scheme:dark]`}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-[13px] font-medium text-white/90">
          Ώρα έναρξης
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            aria-label="Ώρα έναρξης"
            className={inputCls}
          >
            <option value="" disabled>
              Επιλέξτε ώρα
            </option>
            {slots.map((t) => (
              <option key={t} value={t} className="text-foreground">
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Farm-decided workshop for the chosen date (read-only) */}
      {date ? (
        <div className="flex items-start gap-2 rounded-[4px] bg-white/15 px-3 py-2.5 text-[13px] leading-[1.5] text-white backdrop-blur">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {periodWorkshop ? (
            <span>
              Το εργαστήρι αυτής της περιόδου:{' '}
              <Link
                href={`/drastiriotites/ergastiria/${periodWorkshop.slug}`}
                className="font-semibold underline underline-offset-2"
              >
                {periodWorkshop.title}
              </Link>
            </span>
          ) : (
            <span>
              Για την ημερομηνία που επιλέξατε δεν υπάρχει προγραμματισμένο εργαστήρι — στείλτε το
              αίτημά σας και θα βρούμε μαζί την καλύτερη επιλογή.
            </span>
          )}
        </div>
      ) : null}

      {/* Honeypot */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="hidden"
        aria-hidden="true"
      />

      <p className="flex items-start gap-2 text-[13px] font-semibold leading-[1.5] text-white">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        Το παρόν αποτελεί αίτημα κράτησης. Θα επικοινωνήσουμε μαζί σας για την επιβεβαίωση της
        διαθεσιμότητας.
      </p>

      {error ? (
        <p className="rounded-[4px] bg-white px-4 py-2.5 text-[14px] font-medium text-red-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="flex items-center justify-center gap-2 rounded-[4px] bg-white p-[14px] text-[16px] font-medium text-foreground transition-colors hover:bg-foreground hover:text-white disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-white disabled:hover:text-foreground"
      >
        {submitting ? (
          <>
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
            Αποστολή…
          </>
        ) : (
          'Αποστολή αιτήματος'
        )}
      </button>
    </form>
  )
}
