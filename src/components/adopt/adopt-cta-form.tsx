'use client'

import { useState } from 'react'
import { CONTACT_PAGE } from '@/components/contact/contact-content'

// Glass fields on the gold band — same treatment as the visit pills.
const inputCls =
  'w-full rounded-[4px] border border-white/30 bg-white/15 px-[15px] py-2.5 text-[16px] leading-[24px] text-white outline-none backdrop-blur transition placeholder:text-white focus:border-white focus:bg-white/25'

/** Contact form on the adopt CTA band — same fields/labels as the contact page
 *  form (front-end only; a thank-you state on submit). Sits directly on the gold. */
export function AdoptCtaForm() {
  const f = CONTACT_PAGE.form
  const [sent, setSent] = useState(false)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        setSent(true)
      }}
      className="flex w-full flex-col gap-4 text-left"
    >
      {sent ? (
        <p className="rounded-[8px] border border-white/30 bg-white/15 px-5 py-10 text-center text-[16px] leading-[24px] text-white backdrop-blur">
          Σας ευχαριστούμε! Το μήνυμά σας στάλθηκε — θα επικοινωνήσουμε σύντομα μαζί σας. 🐝
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-4 sm:flex-row">
            <input type="text" required placeholder={f.firstName} aria-label={f.firstName} className={inputCls} />
            <input type="text" required placeholder={f.lastName} aria-label={f.lastName} className={inputCls} />
          </div>
          <input type="email" required placeholder={f.email} aria-label={f.email} className={inputCls} />
          <input type="tel" placeholder={f.phone} aria-label={f.phone} className={inputCls} />
          <textarea
            required
            rows={4}
            placeholder={f.message}
            aria-label={f.message}
            className={`${inputCls} resize-none`}
          />
          <button
            type="submit"
            className="rounded-[4px] bg-white p-[14px] text-[16px] font-medium text-foreground transition-colors hover:bg-foreground hover:text-white"
          >
            {f.submit}
          </button>
        </>
      )}
    </form>
  )
}
