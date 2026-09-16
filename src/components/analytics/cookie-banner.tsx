'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { X } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { DURATION, EASE } from '@/lib/motion'
import { cn } from '@/lib/utils'
import {
  CONSENT_COOKIE,
  CONSENT_MAX_AGE,
  NO_CONSENT,
  type ConsentState,
  consentSignals,
  serializeConsent,
} from './consent'

/** The footer link fires this to reopen the choices. */
export const COOKIE_SETTINGS_EVENT = 'oros:cookie-settings'

const POLICY_PATH = '/privacy-amp-cookie-policy'

/** Store the answer and tell Google about it. Tag Manager only runs on the live
 *  domain, so everywhere else the update is a no-op. */
function remember(state: ConsentState) {
  const secure = location.protocol === 'https:' ? '; secure' : ''
  document.cookie = `${CONSENT_COOKIE}=${serializeConsent(state)}; path=/; max-age=${CONSENT_MAX_AGE}; samesite=lax${secure}`
  const w = window as Window & { gtag?: (...args: unknown[]) => void; dataLayer?: unknown[] }
  w.gtag?.('consent', 'update', consentSignals(state))
  w.dataLayer = w.dataLayer ?? []
  w.dataLayer.push({
    event: 'cookie_consent_update',
    consent_analytics: state.analytics,
    consent_marketing: state.marketing,
  })
}

function Toggle({
  checked,
  onChange,
  label,
  locked = false,
}: {
  checked: boolean
  onChange?: (next: boolean) => void
  label: string
  locked?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={locked}
      onClick={() => onChange?.(!checked)}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2',
        checked ? 'bg-accent' : 'bg-foreground/20',
        locked && 'opacity-50',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 size-5 rounded-full bg-white shadow transition-[left]',
          checked ? 'left-[22px]' : 'left-0.5',
        )}
      />
    </button>
  )
}

/**
 * Cookie banner. Statistics and advertising stay switched off until the visitor
 * turns them on — nothing is pre-ticked, and refusing takes the same one click
 * as accepting. `initial` is the answer already stored in the cookie, so the bar
 * never flashes up for someone who has answered before.
 */
export function CookieBanner({ initial }: { initial: ConsentState | null }) {
  const t = useTranslations('cookies')
  const reduce = useReducedMotion()
  const [saved, setSaved] = useState<ConsentState | null>(initial)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [draft, setDraft] = useState<ConsentState>(initial ?? NO_CONSENT)
  const dialogRef = useRef<HTMLDivElement>(null)

  const openSettings = useCallback(() => {
    setDraft(saved ?? NO_CONSENT)
    setSettingsOpen(true)
  }, [saved])

  const save = useCallback((state: ConsentState) => {
    remember(state)
    setSaved(state)
    setSettingsOpen(false)
  }, [])

  useEffect(() => {
    window.addEventListener(COOKIE_SETTINGS_EVENT, openSettings)
    return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, openSettings)
  }, [openSettings])

  useEffect(() => {
    if (!settingsOpen) return
    dialogRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSettingsOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [settingsOpen])

  const groups = [
    { key: 'necessary' as const, checked: true, locked: true },
    { key: 'analytics' as const, checked: draft.analytics, locked: false },
    { key: 'marketing' as const, checked: draft.marketing, locked: false },
  ]

  return (
    <>
      <AnimatePresence>
        {saved === null && !settingsOpen ? (
          <motion.div
            className="fixed inset-x-0 bottom-0 z-[90] px-3 pb-3 md:px-5 md:pb-5"
            role="region"
            aria-label={t('title')}
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: DURATION.ui, ease: EASE.snap }}
          >
            <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-4 rounded-[6px] border border-border bg-white px-5 py-4 shadow-[0_20px_60px_-25px_rgba(20,20,20,0.5)] md:flex-row md:items-center md:gap-8 md:px-6">
              <p className="text-[14px] leading-[20px] text-muted">
                {t.rich('text', {
                  strong: (chunks) => (
                    <strong className="font-semibold text-foreground">{chunks}</strong>
                  ),
                  policy: (chunks) => (
                    <Link href={POLICY_PATH} className="text-accent underline underline-offset-2">
                      {chunks}
                    </Link>
                  ),
                })}
              </p>
              {/* Narrow screens: refuse and accept share a row, settings wraps
                  under them. Wide screens: all three sit on one line. */}
              <div className="flex flex-wrap items-center gap-2 md:ml-auto md:shrink-0 md:flex-nowrap">
                <Button
                  variant="ghost"
                  size="sm"
                  className="order-3 w-full md:order-none md:w-auto"
                  onClick={openSettings}
                >
                  {t('settings')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="order-1 flex-1 md:flex-none"
                  onClick={() => save(NO_CONSENT)}
                >
                  {t('reject')}
                </Button>
                <Button
                  variant="accent"
                  size="sm"
                  className="order-2 flex-1 md:flex-none"
                  onClick={() => save({ analytics: true, marketing: true })}
                >
                  {t('accept')}
                </Button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {settingsOpen ? (
          <motion.div
            className="fixed inset-0 z-[95] flex items-end justify-center p-3 md:items-center md:p-6"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.ui, ease: EASE.snap }}
          >
            <button
              type="button"
              aria-label={t('close')}
              className="absolute inset-0 bg-foreground/40"
              onClick={() => setSettingsOpen(false)}
            />
            <motion.div
              ref={dialogRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-labelledby="cookie-settings-title"
              className="relative flex w-full max-w-[520px] flex-col gap-5 rounded-[6px] border border-border bg-white p-6 shadow-[0_30px_80px_-30px_rgba(20,20,20,0.6)] focus-visible:outline-none"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
              transition={{ duration: DURATION.ui, ease: EASE.snap }}
            >
              <div className="flex items-start justify-between gap-4">
                <h2
                  id="cookie-settings-title"
                  className="font-display text-[22px] font-bold text-foreground"
                >
                  {t('settingsTitle')}
                </h2>
                <button
                  type="button"
                  aria-label={t('close')}
                  onClick={() => setSettingsOpen(false)}
                  className="-mr-1 -mt-1 rounded-full p-1 text-muted transition-colors hover:text-foreground"
                >
                  <X className="size-5" aria-hidden="true" />
                </button>
              </div>

              <div className="flex flex-col divide-y divide-border">
                {groups.map((group) => (
                  <div key={group.key} className="flex items-start gap-4 py-4 first:pt-0">
                    <div className="flex flex-1 flex-col gap-1">
                      <span className="text-[15px] font-semibold text-foreground">
                        {t(`${group.key}Title`)}
                      </span>
                      <span className="text-[13px] leading-[18px] text-muted">
                        {t(`${group.key}Text`)}
                      </span>
                    </div>
                    <Toggle
                      checked={group.checked}
                      locked={group.locked}
                      label={t(`${group.key}Title`)}
                      onChange={
                        group.locked
                          ? undefined
                          : (next) => setDraft((prev) => ({ ...prev, [group.key]: next }))
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button variant="outline" size="sm" onClick={() => save(NO_CONSENT)}>
                  {t('reject')}
                </Button>
                <Button variant="accent" size="sm" onClick={() => save(draft)}>
                  {t('save')}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
