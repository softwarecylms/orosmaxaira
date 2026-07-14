'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, Info, Loader2 } from 'lucide-react'
import {
  MAX_STUDENTS,
  SCHOOL_WORKSHOP_OPTIONS,
  estimateCost,
  pricePerChild,
  type SchoolWorkshopKey,
} from '@/lib/data/school-visit'

// Glass fields on the gold band — same treatment as the other on-brand forms.
const inputCls =
  'w-full rounded-[4px] border border-white/30 bg-white/15 px-[15px] py-2.5 text-[16px] leading-[24px] text-white outline-none backdrop-blur transition placeholder:text-white/80 focus:border-white focus:bg-white/25'

const labelCls = 'flex flex-col gap-1.5 text-[13px] font-medium text-white/90'
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

/**
 * School-visit booking request form. Captures the school, contact, headcount,
 * preferred date and the chosen Δραστηριότητα-2 workshop, shows a live cost
 * estimate, and submits to /api/school-visit-enquiry (real email pipeline).
 * Validation runs on submit (not via a disabled button) so keyboard / screen
 * reader users get a concrete reason; the workshop + headcount are re-checked
 * server-side.
 */
export function SchoolVisitForm() {
  const [school, setSchool] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [date, setDate] = useState('')
  const [altDate, setAltDate] = useState('')
  const [students, setStudents] = useState('')
  const [grade, setGrade] = useState('')
  const [workshop, setWorkshop] = useState<SchoolWorkshopKey | ''>('')
  const [notes, setNotes] = useState('')
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

  const count = useMemo(() => {
    const n = parseInt(students, 10)
    return Number.isFinite(n) ? n : 0
  }, [students])
  const estimate = estimateCost(count)

  const validate = (): string | null => {
    if (school.trim().length < 2) return 'Συμπληρώστε το όνομα του σχολείου.'
    if (name.trim().length < 2) return 'Συμπληρώστε το όνομα του/της υπευθύνου.'
    if (!emailOk(email)) return 'Συμπληρώστε ένα έγκυρο email.'
    if (phone.trim().length < 5) return 'Συμπληρώστε έγκυρο τηλέφωνο επικοινωνίας.'
    if (!count || count < 1) return 'Συμπληρώστε τον αριθμό των μαθητών.'
    if (count > MAX_STUDENTS) return `Ο μέγιστος αριθμός συμμετεχόντων είναι ${MAX_STUDENTS} μαθητές.`
    if (!workshop) return 'Επιλέξτε ένα από τα δύο εργαστήρια (Δραστηριότητα 2).'
    if (!date) return 'Επιλέξτε προτιμώμενη ημερομηνία.'
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
      const res = await fetch('/api/school-visit-enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          school: school.trim(),
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          date,
          altDate,
          students: count,
          grade: grade.trim(),
          workshop,
          notes: notes.trim(),
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
          Λάβαμε το αίτημά σας για επίσκεψη! Θα επικοινωνήσουμε σύντομα μαζί σας για την επιβεβαίωση
          της ημερομηνίας και των λεπτομερειών. 🐝
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="flex w-full flex-col gap-4 text-left">
      <input
        type="text"
        value={school}
        onChange={(e) => setSchool(e.target.value)}
        required
        placeholder="Σχολείο"
        aria-label="Σχολείο"
        className={inputCls}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Υπεύθυνος/η επικοινωνίας"
          aria-label="Υπεύθυνος/η επικοινωνίας"
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
      </div>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="Email"
        aria-label="Email"
        className={inputCls}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className={labelCls}>
          Αριθμός μαθητών
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={MAX_STUDENTS}
            value={students}
            onChange={(e) => setStudents(e.target.value)}
            required
            placeholder={`1–${MAX_STUDENTS}`}
            aria-label="Αριθμός μαθητών"
            className={inputCls}
          />
        </label>
        <label className={labelCls}>
          Τάξη / Τάξεις (προαιρετικό)
          <input
            type="text"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            placeholder="π.χ. Γ′ & Δ′ Δημοτικού"
            aria-label="Τάξη ή τάξεις"
            className={inputCls}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className={labelCls}>
          Προτιμώμενη ημερομηνία
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            min={minDate}
            aria-label="Προτιμώμενη ημερομηνία"
            className={`${inputCls} [color-scheme:dark]`}
          />
        </label>
        <label className={labelCls}>
          Εναλλακτική ημερομηνία (προαιρετικό)
          <input
            type="date"
            value={altDate}
            onChange={(e) => setAltDate(e.target.value)}
            min={minDate}
            aria-label="Εναλλακτική ημερομηνία"
            className={`${inputCls} [color-scheme:dark]`}
          />
        </label>
      </div>

      {/* Δραστηριότητα 2 workshop choice (required) */}
      <fieldset className="flex flex-col gap-2" aria-required="true">
        <legend className="mb-1.5 text-[13px] font-semibold text-white">
          Εργαστήριο (Δραστηριότητα 2) <span aria-hidden="true">*</span>
          <span className="sr-only">(υποχρεωτικό)</span>
        </legend>
        <div className="flex flex-col gap-2">
          {SCHOOL_WORKSHOP_OPTIONS.map((opt) => {
            const active = workshop === opt.key
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
                  name="school-workshop"
                  value={opt.key}
                  checked={active}
                  onChange={() => setWorkshop(opt.key)}
                  className="mt-0.5 size-4 shrink-0 accent-white"
                />
                <span>{opt.short}</span>
              </label>
            )
          })}
        </div>
      </fieldset>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        placeholder="Σημειώσεις — ενημερώστε μας για τυχόν αλλεργίες (ξηροί καρποί, μέλι, μέλισσες) ή ιατρικές καταστάσεις."
        aria-label="Σημειώσεις και αλλεργίες"
        className={`${inputCls} resize-y`}
      />

      {/* Live cost estimate */}
      {count > 0 && count <= MAX_STUDENTS ? (
        <div className="flex items-center justify-between gap-3 rounded-[4px] bg-white/15 px-4 py-3 text-white backdrop-blur">
          <span className="text-[13px] leading-[1.4] text-white/90">
            Εκτιμώμενο κόστος&nbsp;
            <span className="text-white/70">
              ({count} × €{pricePerChild(count)} — οι συνοδοί δωρεάν)
            </span>
          </span>
          <span className="text-[20px] font-bold leading-none">€{estimate}</span>
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
