'use client'

import { useState } from 'react'
import type { ShopSection, ShopNutritionRow } from '../shop-content'
import { cn } from '@/lib/utils'

type Nutrition = { unit: string; rows: ShopNutritionRow[] }

/** Description / nutrition tabs below the product (Figma 237:1214). */
export function ProductTabs({
  sections,
  nutrition,
}: {
  sections: ShopSection[]
  nutrition?: Nutrition
}) {
  const tabs = [
    sections.length ? ('desc' as const) : null,
    nutrition ? ('nutrition' as const) : null,
  ].filter(Boolean) as ('desc' | 'nutrition')[]

  const [active, setActive] = useState<'desc' | 'nutrition'>(tabs[0] ?? 'desc')
  if (!tabs.length) return null

  return (
    <div className="flex flex-col gap-8">
      <div className="flex gap-8 border-b border-border">
        {tabs.includes('desc') ? (
          <TabButton active={active === 'desc'} onClick={() => setActive('desc')}>
            Περιγραφή
          </TabButton>
        ) : null}
        {tabs.includes('nutrition') ? (
          <TabButton active={active === 'nutrition'} onClick={() => setActive('nutrition')}>
            Διατροφική Αξία
          </TabButton>
        ) : null}
      </div>

      {active === 'desc' ? (
        <div className="flex flex-col gap-4 text-[15px] leading-[24px] text-muted">
          {sections.map((s, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              {s.heading ? (
                <h3 className="text-[17px] font-semibold text-foreground">{s.heading}</h3>
              ) : null}
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      ) : null}

      {active === 'nutrition' && nutrition ? (
        <div className="overflow-hidden rounded-[4px] border border-border bg-white">
          {/* Header */}
          <div className="flex bg-offwhite">
            <div className="flex-1 px-3 py-2.5">
              <p className="text-[17px] font-bold leading-[24px] text-foreground">
                Διατροφική πληροφορία
              </p>
            </div>
            <div className="flex-1 border-l border-border px-3 py-2.5">
              <p className="text-[17px] font-bold leading-[24px] text-foreground">{nutrition.unit}</p>
            </div>
          </div>
          {/* Rows: label (bold, dark) | value (regular, gray) */}
          {nutrition.rows.map((r) => (
            <div key={r.label} className="flex border-t border-border">
              <div className="flex-1 px-3 py-2.5">
                <p className="text-[17px] font-bold leading-[24px] text-foreground">{r.label}</p>
              </div>
              <div className="flex-1 border-l border-border px-3 py-2.5">
                <p className="text-[17px] font-normal leading-[24px] text-muted">{r.value}</p>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        '-mb-px border-b-2 pb-3 text-[17px] leading-[24px] transition-colors',
        active
          ? 'border-accent font-medium text-accent'
          : 'border-transparent text-muted hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}
