/**
 * A link from a title, in the style the old WordPress site used for its
 * articles: Greek transliterated letter by letter («Πού να Αγοράσεις» →
 * `poy-na-agoraseis`), lower case, words joined by dashes.
 */

const GREEK: Record<string, string> = {
  α: 'a', β: 'v', γ: 'g', δ: 'd', ε: 'e', ζ: 'z', η: 'i', θ: 'th', ι: 'i', κ: 'k', λ: 'l', μ: 'm',
  ν: 'n', ξ: 'x', ο: 'o', π: 'p', ρ: 'r', σ: 's', ς: 's', τ: 't', υ: 'y', φ: 'f', χ: 'ch', ψ: 'ps', ω: 'o',
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // accents and diaeresis
    .replace(/[α-ως]/g, (c) => GREEK[c] ?? c)
    .replace(/&/g, ' kai ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
    .replace(/-+$/, '')
}
