// One-off: turn the live WooCommerce catalogue (orosmaxaira.com) into the static
// data module + optimized images the new /shop page renders from.
//
//   node scripts/scrape-shop.mjs            # reads /tmp/oros-products.json
//
// Writes public/images/shop/<slug>.webp and prints the PRODUCTS array (TS) to
// stdout so it can be pasted into src/components/shop/shop-content.ts.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(root, 'public/images/shop')
mkdirSync(outDir, { recursive: true })

const data = JSON.parse(readFileSync('/tmp/oros-products.json', 'utf8'))

const decode = (s) =>
  s
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8220;/g, '«')
    .replace(/&#8221;/g, '»')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8217;/g, '’')
    .replace(/&#8230;/g, '…')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()

// cents (minor units, comma decimal) → "€3,50"
const euro = (cents) => '€' + (Number(cents) / 100).toFixed(2).replace('.', ',')

const priceLabel = (prices) => {
  const r = prices.price_range
  if (r && r.min_amount !== r.max_amount) return `${euro(r.min_amount)} – ${euro(r.max_amount)}`
  return euro(prices.price)
}

// Collapse WooCommerce's messy taxonomy into the 4 Figma filter buckets.
const CATEGORIES = ['Μέλι', 'Προϊόντα Μέλισσας', 'Καλλυντικά', 'Πακέτα Δώρων']
function bucket(name, cats) {
  if (
    cats.includes('Πακέτα Δώρων') ||
    cats.includes("Valentine's Gift Box") ||
    /Gift (Set|Box)/i.test(name) ||
    /Μελισσολαμπάδας/.test(name)
  )
    return 'Πακέτα Δώρων'
  if (cats.includes('Καλλυντικά')) return 'Καλλυντικά'
  if (/Μέλι Ανθέων|Θυμαρίσιο|Άβραστο|Μέλι με|Κηρήθρα/.test(name)) return 'Μέλι'
  return 'Προϊόντα Μέλισσας'
}

// pick the ~600px variant from the srcset when present (smaller download, plenty
// for a 296px card at 2x), else fall back to the full src.
function bestImage(img) {
  if (!img) return null
  const set = img.srcset || ''
  const m = [...set.matchAll(/(https:\S+?)\s+(\d+)w/g)].map((x) => ({ url: x[1], w: +x[2] }))
  const six = m.find((x) => x.w === 600) || m.find((x) => x.w >= 600) || null
  return six?.url || img.src
}

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124.0 Safari/537.36'

const out = []
for (const p of data) {
  const name = decode(p.name)
  const cats = p.categories.map((c) => c.name)
  const category = bucket(name, cats)
  const slug = p.slug
  const imgUrl = bestImage(p.images?.[0])
  const alt = decode(p.images?.[0]?.alt || name)

  let image = ''
  const file = path.join(outDir, `${slug}.webp`)
  if (imgUrl && existsSync(file)) {
    image = `/images/shop/${slug}.webp`
  } else if (imgUrl) {
    try {
      const res = await fetch(imgUrl, { headers: { 'User-Agent': UA } })
      const buf = Buffer.from(await res.arrayBuffer())
      await sharp(buf)
        .resize(600, 600, { fit: 'cover', position: 'centre' })
        .webp({ quality: 82 })
        .toFile(file)
      image = `/images/shop/${slug}.webp`
    } catch (e) {
      console.error('IMG FAIL', slug, e.message)
    }
  }

  out.push({
    slug,
    category,
    title: name,
    price: priceLabel(p.prices),
    image,
    imageAlt: alt,
    href: p.permalink,
    inStock: p.is_in_stock,
    sortPrice: Number(p.prices.price_range?.min_amount ?? p.prices.price),
  })
}

// tally
const tally = {}
for (const o of out) tally[o.category] = (tally[o.category] || 0) + 1
console.error('\nBucket tally:', JSON.stringify(tally))
console.error('Total:', out.length, '| categories order:', CATEGORIES.join(', '))

writeFileSync('/tmp/shop-products.json', JSON.stringify(out, null, 2))
console.error('\nWrote /tmp/shop-products.json + ' + out.length + ' images to public/images/shop/')
