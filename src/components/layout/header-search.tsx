'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { SEARCH_PLACEHOLDERS } from '@/components/home/home-content'
import { EASE } from '@/lib/motion'
import { cn } from '@/lib/utils'

/** Header search box. Visual-only for now (non-functional per scope). The
 *  placeholder gently cycles through product hints every few seconds. */
export function HeaderSearch({ className }: { className?: string }) {
  const [i, setI] = useState(0)
  // Show the rotating hint only while the field is empty + unfocused.
  const [showHint, setShowHint] = useState(true)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setI((p) => (p + 1) % SEARCH_PLACEHOLDERS.length), 3200)
    return () => clearInterval(id)
  }, [])

  return (
    <form
      role="search"
      onSubmit={(e) => e.preventDefault()}
      className={cn(
        'relative flex items-center overflow-hidden rounded-[4px] border border-cream',
        className,
      )}
    >
      <input
        type="search"
        aria-label="Αναζήτηση προϊόντων"
        onFocus={() => setShowHint(false)}
        onBlur={(e) => setShowHint(e.target.value === '')}
        onInput={(e) => setShowHint(e.currentTarget.value === '')}
        className="h-[46px] w-full bg-cream px-[22px] text-[17px] text-foreground outline-none placeholder:text-muted"
      />
      {showHint ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[22px] top-1/2 -translate-y-1/2 overflow-hidden"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.32, ease: EASE.soft }}
              className="block whitespace-nowrap text-[17px] leading-none text-muted"
            >
              {SEARCH_PLACEHOLDERS[i]}
            </motion.span>
          </AnimatePresence>
        </div>
      ) : null}
      <button
        type="submit"
        aria-label="Αναζήτηση"
        className="flex size-[46px] shrink-0 items-center justify-center bg-cream text-foreground transition-colors hover:text-accent"
      >
        <Search className="size-5" />
      </button>
    </form>
  )
}
