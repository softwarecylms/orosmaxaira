// Optimize the award photo folders (messy space/Greek-named source dirs) into
// clean kebab-case slug folders of web-ready .webp, then tuck the raw originals
// away under _raw/ (gitignored) so nothing with spaces/Greek is committed/served.
//   node scripts/optimize-awards.mjs
import sharp from 'sharp'
import { readdirSync, mkdirSync, statSync, existsSync, renameSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = 'public/images/awards'
const RAW = join(ROOT, '_raw')
const MAX_DIM = 1600 // gallery photos; next/image downsizes further per `sizes`
const QUALITY = 82

// messy source dir (matched on a normalized name — folders use NBSP/odd spacing) -> clean slug
const SLUG_BY_NORM = {
  'cyprus hospitality awards': 'cyprus-hospitality',
  'cyprus tourism awards 2025 από boussias': 'cyprus-tourism-2025',
  'excellent taste awards 2025': 'excellent-taste-2025',
  'cyprus tourism awards 2024': 'cyprus-tourism-2024',
  'γε’ νέο επιχειρείν 2025 στον μενέλαο φιλίππου': 'ge-neo-epicheirein-2025',
}
const norm = (s) => s.replace(/ /g, ' ').replace(/\s+/g, ' ').trim().toLowerCase()
// loose single file -> slug (its sole image)
const SINGLES = {
  'aadf2c60.png': 'specialist-awards-2026',
}

const isImg = (f) => /\.(png|jpe?g|webp)$/i.test(f)
const natSort = (a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })

mkdirSync(RAW, { recursive: true })

async function optimize(src, outDir, index) {
  mkdirSync(outDir, { recursive: true })
  const out = join(outDir, String(index).padStart(2, '0') + '.webp')
  const img = sharp(src)
  const meta = await img.metadata()
  const longest = Math.max(meta.width ?? 0, meta.height ?? 0)
  const pipeline =
    longest > MAX_DIM
      ? img.resize({
          width: meta.width >= meta.height ? MAX_DIM : null,
          height: meta.height > meta.width ? MAX_DIM : null,
        })
      : img
  await pipeline.webp({ quality: QUALITY, effort: 5 }).toFile(out)
  const kb = (statSync(out).size / 1024).toFixed(0)
  console.log(`  ${meta.width}x${meta.height} -> ${out.replace(ROOT + '/', '')}  ${kb}kb`)
}

let total = 0
for (const dir of readdirSync(ROOT, { withFileTypes: true })) {
  if (!dir.isDirectory() || dir.name === '_raw') continue
  const slug = SLUG_BY_NORM[norm(dir.name)]
  if (!slug) continue // already-processed slug folders aren't in the map
  const srcDir = join(ROOT, dir.name)
  const files = readdirSync(srcDir).filter(isImg).sort(natSort)
  console.log(`\n${slug}  (${files.length} photos)`)
  let i = 1
  for (const f of files) {
    await optimize(join(srcDir, f), join(ROOT, slug), i++)
    total++
  }
  renameSync(srcDir, join(RAW, dir.name)) // tuck raw originals away
}

for (const [file, slug] of Object.entries(SINGLES)) {
  const src = join(ROOT, file)
  if (!existsSync(src)) {
    console.log(`(skip, already processed) ${file}`)
    continue
  }
  console.log(`\n${slug}  (1 photo)`)
  await optimize(src, join(ROOT, slug), 1)
  total++
  renameSync(src, join(RAW, file))
}

console.log(`\ndone: ${total} image(s) optimized into slug folders`)
