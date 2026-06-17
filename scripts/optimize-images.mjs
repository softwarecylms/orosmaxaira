// Optimize raw images dropped in public/images/home/_raw/ → web-ready .webp
// next/image then serves responsive avif/webp variants at request time.
//   node scripts/optimize-images.mjs
import sharp from 'sharp'
import { readdirSync, mkdirSync, statSync } from 'node:fs'
import { join, parse } from 'node:path'

const ROOT = 'public/images/home'
const RAW = join(ROOT, '_raw')
const MAX_DIM = 2000 // cap longest edge; next/image downsizes further per `sizes`
const QUALITY = 82

mkdirSync(ROOT, { recursive: true })

let files = []
try {
  files = readdirSync(RAW).filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
} catch {
  console.error(`No raw dir at ${RAW}`)
  process.exit(0)
}

for (const file of files) {
  const { name } = parse(file)
  const src = join(RAW, file)
  const out = join(ROOT, `${name}.webp`)
  const img = sharp(src)
  const meta = await img.metadata()
  const longest = Math.max(meta.width ?? 0, meta.height ?? 0)
  const pipeline = longest > MAX_DIM ? img.resize({ width: meta.width >= meta.height ? MAX_DIM : null, height: meta.height > meta.width ? MAX_DIM : null }) : img
  await pipeline.webp({ quality: QUALITY, effort: 5 }).toFile(out)
  const kb = (statSync(out).size / 1024).toFixed(0)
  console.log(`${file}  ${meta.width}x${meta.height} -> ${name}.webp  ${kb}kb`)
}
console.log(`done: ${files.length} image(s)`)
