'use client'

import { Search } from 'lucide-react'
import { SEARCH_PLACEHOLDER } from '@/components/home/home-content'
import { cn } from '@/lib/utils'

/** Header search box. Visual-only for now (non-functional per scope). */
export function HeaderSearch({ className }: { className?: string }) {
  return (
    <form
      role="search"
      onSubmit={(e) => e.preventDefault()}
      className={cn(
        'flex items-center overflow-hidden rounded-[4px] border border-cream',
        className,
      )}
    >
      <input
        type="search"
        placeholder={SEARCH_PLACEHOLDER}
        aria-label="Αναζήτηση προϊόντων"
        className="h-[46px] w-full bg-cream px-[22px] text-[17px] text-foreground outline-none placeholder:text-muted"
      />
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
