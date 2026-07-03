'use client'

import { useState } from 'react'
import type { ShopSection, ShopNutritionRow } from '../shop-content'
import { cn } from '@/lib/utils'

type Nutrition = { unit: string; rows: ShopNutritionRow[] }

// ── Auto-bold key benefit terms in the Περιγραφή (up to MAX_BOLD per product) ──
// Accent-insensitive Greek matching, applied at render time — no data edits, so
// it survives regeneration of the descriptions.
const MAX_BOLD = 4
const GW = 'Α-Ωα-ωΆΈΉΊΌΎΏϊϋΐΰάέήίόύώ' // greek word characters
const VOWELS: Record<string, string> = {
  α: 'αά', ε: 'εέ', η: 'ηή', ι: 'ιίϊΐ', ο: 'οό', υ: 'υύϋΰ', ω: 'ωώ',
}
/** term → accent-insensitive regex source (each vowel becomes a char class). */
const ai = (s: string) =>
  [...s]
    .map((c) => {
      const l = c.toLowerCase()
      return VOWELS[l] ? `[${VOWELS[l]}]` : c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    })
    .join('')

/** Exact benefit phrases (written unaccented; matched accent-insensitively). */
const BOLD_PHRASES = ['διατροφικη αξια', 'χωρις γλουτενη', 'χωρις προσθετη ζαχαρη', 'χωρις φοινικελαιο', '100% φυσικη']
/** Word stems (unaccented) — the whole word is bolded. */
const BOLD_STEMS = [
  'υπερτροφ', 'αντιοξειδωτικ', 'ανοσοποιητικ', 'αντιβακτηριακ', 'αντιμικροβιακ', 'αντιμυκητιακ',
  'βιταμιν', 'μεταλλ', 'αμινοξ', 'πρωτειν', 'μονοακορεστ', 'πολυακορεστ', 'ενζυμ', 'θρεπτικ', 'θρεψ',
  'ενυδατωσ', 'ενυδατικ', 'ενυδατωμεν', 'επιδερμιδ', 'αγνο', 'αντισηπτικ', 'φυσικ', 'φροντιδ', 'απαλοτητ',
]
const boldRe = () =>
  new RegExp(
    `(?<![${GW}])(${[...BOLD_PHRASES.map(ai), ...BOLD_STEMS.map((s) => ai(s) + `[${GW}]*`)].join('|')})`,
    'gi',
  )
const deaccent = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

/** Bold up to `budget.left` distinct key terms in `text`; mutates the budget. */
function highlightImportant(text: string, budget: { left: number; seen: Set<string> }): React.ReactNode {
  if (budget.left <= 0) return text
  const re = boldRe()
  const out: React.ReactNode[] = []
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    if (budget.left <= 0) break
    const term = m[0]
    const key = deaccent(term)
    if (budget.seen.has(key)) continue // don't bold the same word twice
    out.push(text.slice(last, m.index))
    out.push(
      <strong key={m.index} className="font-semibold text-foreground">
        {term}
      </strong>,
    )
    last = m.index + term.length
    budget.seen.add(key)
    budget.left--
  }
  out.push(text.slice(last))
  return out
}

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

  // render-scoped budget: bold at most MAX_BOLD terms across the whole description
  const bold = { left: MAX_BOLD, seen: new Set<string>() }

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
              <p>{highlightImportant(s.body, bold)}</p>
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
