'use client'

import { useActionState, useId } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { subscribeNewsletter, type NewsletterState } from '@/lib/newsletter-actions'
import { cn } from '@/lib/utils'

const POLICY_PATH = '/privacy-amp-cookie-policy'

/**
 * The footer's newsletter signup → Klaviyo (Newsletter EL / EN by language).
 * Double opt-in: after submitting, the visitor confirms from their inbox.
 */
export function NewsletterSignup() {
  const t = useTranslations('newsletter')
  const id = useId()
  const [state, action, pending] = useActionState<NewsletterState, FormData>(subscribeNewsletter, {
    status: 'idle',
  })

  return (
    <div
      data-testid="newsletter-signup"
      className="flex flex-col gap-5 rounded-[4px] bg-cream p-6 md:flex-row md:items-start md:justify-between md:gap-10 md:p-8"
    >
      <div className="flex max-w-[420px] flex-col gap-1.5">
        <h3 className="text-[22px] font-medium leading-[26.4px] text-foreground">{t('title')}</h3>
        <p className="text-[15px] leading-[23px] text-muted">{t('text')}</p>
      </div>

      {state.status === 'done' ? (
        <p role="status" className="max-w-[520px] text-[15px] font-medium leading-[23px] text-foreground md:pt-1">
          {t('done')}
        </p>
      ) : (
        <form action={action} className="flex w-full max-w-[520px] flex-col gap-3" noValidate>
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <label htmlFor={`${id}-email`} className="sr-only">
              {t('emailLabel')}
            </label>
            <input
              id={`${id}-email`}
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder={t('emailPlaceholder')}
              className="h-12 min-w-0 flex-1 rounded-[4px] border border-border bg-white px-4 text-[16px] text-foreground outline-none transition-colors placeholder:text-muted focus:border-accent"
            />
            {/* Honeypot, hidden from people and screen readers. */}
            <input
              name="company_website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute left-[-9999px] size-px opacity-0"
            />
            <Button type="submit" variant="accent" size="lg" disabled={pending} className="h-12 rounded-[4px]">
              {pending ? t('sending') : t('submit')}
            </Button>
          </div>
          <label className="flex cursor-pointer items-start gap-2.5 text-[13px] leading-[19px] text-muted">
            <input
              name="consent"
              type="checkbox"
              required
              className="mt-0.5 size-[16px] shrink-0 [accent-color:var(--color-accent)]"
            />
            <span>
              {t.rich('consent', {
                policy: (chunks) => (
                  <Link href={POLICY_PATH} className="text-accent underline underline-offset-2">
                    {chunks}
                  </Link>
                ),
              })}
            </span>
          </label>
          {state.status === 'invalid' || state.status === 'error' ? (
            <p role="alert" className={cn('text-[13px] leading-[19px] text-red-700')}>
              {t(state.status)}
            </p>
          ) : null}
        </form>
      )}
    </div>
  )
}
