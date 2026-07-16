import { Award, Medal } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AwardBadge as AwardBadgeType } from './awards-content'

const TIER: Record<AwardBadgeType['tier'], { wrap: string; icon: string }> = {
  gold: { wrap: 'border-accent/45 bg-accent-soft', icon: 'text-accent' },
  silver: { wrap: 'border-[#c7ccd1] bg-[#f4f5f6]', icon: 'text-[#8a9098]' },
  bronze: { wrap: 'border-[#d8b892] bg-[#f8efe5]', icon: 'text-[#b08d57]' },
  first: { wrap: 'border-accent/45 bg-accent-soft', icon: 'text-accent' },
}

/** Medal chip for an award distinction (gold / silver / bronze / 1st). */
export function AwardBadge({ badge }: { badge: AwardBadgeType }) {
  const t = TIER[badge.tier]
  const Icon = badge.tier === 'first' ? Award : Medal
  return (
    <span className={cn('inline-flex items-center gap-2 rounded-full border px-3 py-1.5', t.wrap)}>
      <Icon className={cn('size-[18px] shrink-0', t.icon)} strokeWidth={2} aria-hidden="true" />
      {/* Tier wording only — grade/category (`badge.meta`) is intentionally not shown. */}
      <span className="text-[13px] font-semibold leading-none text-foreground">{badge.label}</span>
    </span>
  )
}
