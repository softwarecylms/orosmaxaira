// Convert any raw JPG/PNG dropped directly into an award slug folder into an
// optimized .webp (same NN base name, overwriting the previous webp), then tuck
// the source original into _raw/_updated/<slug>/. Run after adding/replacing
// award photos, then regenerate the manifest:
//   node scripts/reoptimize-awards.mjs && node scripts/awards-manifest.mjs
import sharp from 'sharp'
import { readdirSync, mkdirSync, renameSync, statSync } from 'node:fs'
import { join, parse } from 'node:path'

const ROOT = 'public/images/awards'
const RAWUP = join(ROOT, '_raw', '_updated')
const MAX_DIM = 1600
const QUALITY = 82

const slugs = readdirSync(ROOT, { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name !== '_raw')
  .map((d) => d.name)
  .sort()

let total = 0
for (const slug of slugs) {
  const dir = join(ROOT, slug)
  const sources = readdirSync(dir)
    .filter((f) => /\.(jpe?g|png)$/i.test(f))
    .sort()
  if (!sources.length) continue

  const keep = join(RAWUP, slug)
  mkdirSync(keep, { recursive: true })
  console.log(`\n${slug}  (${sources.length} new source${sources.length > 1 ? 's' : ''})`)

  for (const f of sources) {
    const { name } = parse(f) // "01"
    const src = join(dir, f)
    const out = join(dir, `${name}.webp`)
    const img = sharp(src)
    const m = await img.metadata()
    const longest = Math.max(m.width ?? 0, m.height ?? 0)
    const pipeline =
      longest > MAX_DIM
        ? img.resize({
            width: m.width >= m.height ? MAX_DIM : null,
            height: m.height > m.width ? MAX_DIM : null,
          })
        : img
    await pipeline.webp({ quality: QUALITY, effort: 5 }).toFile(out)
    const kb = (statSync(out).size / 1024).toFixed(0)
    console.log(`  ${f}  ${m.width}x${m.height} -> ${name}.webp  ${kb}kb`)
    renameSync(src, join(keep, f)) // preserve original out of the served folder
    total++
  }
}
console.log(`\ndone: ${total} image(s) re-optimized`)
