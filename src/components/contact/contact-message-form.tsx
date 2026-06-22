'use client'

import { useState } from 'react'
import { CONTACT_PAGE } from './contact-content'
import { RevealUp } from '@/components/home/reveal-up'

const inputCls =
  'w-full rounded-[4px] border border-border bg-white px-[15px] py-2.5 text-[17px] leading-[24px] text-foreground outline-none transition-colors placeholder:text-muted focus:border-accent'

/**
 * "Στείλτε μας ένα μήνυμα" form (Figma 146:1244). Front-end only for now —
 * submitting shows a thank-you state. A /api/contact (nodemailer) endpoint
 * exists and can be wired in later.
 */
export function ContactMessageForm() {
  const f = CONTACT_PAGE.form
  const [sent, setSent] = useState(false)

  return (
    <RevealUp delay={0.1} className="w-full lg:w-[672px]">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setSent(true)
        }}
        className="flex w-full flex-col gap-[30px] rounded-[4px] bg-offwhite p-6 sm:p-8"
      >
        <h2 className="font-display text-[28px] font-bold leading-[1.05] text-foreground md:text-[34px] md:leading-[34px]">
          {f.heading}
        </h2>

        {sent ? (
          <p className="rounded-[4px] bg-white px-5 py-10 text-center text-[17px] leading-[24px] text-foreground">
            Σας ευχαριστούμε! Το μήνυμά σας στάλθηκε — θα επικοινωνήσουμε σύντομα μαζί σας. 🐝
          </p>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-5 sm:flex-row">
              <input type="text" required placeholder={f.firstName} aria-label={f.firstName} className={inputCls} />
              <input type="text" required placeholder={f.lastName} aria-label={f.lastName} className={inputCls} />
            </div>
            <input type="email" required placeholder={f.email} aria-label={f.email} className={inputCls} />
            <input type="tel" placeholder={f.phone} aria-label={f.phone} className={inputCls} />
            <textarea
              required
              rows={5}
              placeholder={f.message}
              aria-label={f.message}
              className={`${inputCls} h-[150px] resize-none`}
            />
            <button
              type="submit"
              className="flex items-center justify-center rounded-[4px] bg-accent p-[15px] text-[17px] leading-[24px] text-white transition-colors hover:bg-foreground"
            >
              {f.submit}
            </button>
          </div>
        )}
      </form>
    </RevealUp>
  )
}
