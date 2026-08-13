'use client'

import { Fragment } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { cn } from '@/lib/utils'

/**
 * EL / EN toggle. Switches to the SAME page in the other locale — next-intl's
 * `usePathname` returns the locale-agnostic path, so `router.replace(pathname,
 * {locale})` re-applies the correct prefix (none for el, `/en` for en).
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const active = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations('languageSwitcher')

  return (
    <div className={cn('flex items-center gap-1.5 text-[15px]', className)} aria-label={t('label')}>
      {routing.locales.map((locale, i) => (
        <Fragment key={locale}>
          {i > 0 ? <span className="text-border" aria-hidden="true">|</span> : null}
          <button
            type="button"
            onClick={() => router.replace(pathname, { locale })}
            aria-current={locale === active ? 'true' : undefined}
            className={cn(
              'transition-colors',
              locale === active
                ? 'font-semibold text-accent'
                : 'text-foreground hover:text-accent',
            )}
          >
            {t(locale)}
          </button>
        </Fragment>
      ))}
    </div>
  )
}
