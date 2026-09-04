#!/usr/bin/env node
/**
 * Writes `public/media-manifest.json` — the index the Medusa admin's image
 * picker browses.
 *
 * The site's media library is the storefront's own `public/images/` folder, not
 * Medusa's file storage: every activity, workshop and page image is stored as a
 * `/images/...` path. Medusa runs on a different host and cannot read this
 * filesystem, so we publish a static index it can fetch instead (via
 * `GET /admin/media` on the backend, which proxies this file).
 *
 * Runs before `next dev` and before `next build`, so the index is always in step
 * with what is actually on disk. The output is gitignored — it is derived.
 */
import { readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const imagesDir = join(root, 'public', 'images')
const out = join(root, 'public', 'media-manifest.json')

const EXT = /\.(webp|jpe?g|png|svg|avif|gif)$/i
/** Working files and source art that should not be offered as page media. */
const SKIP_DIR = /(^|\/)_raw(\/|$)/

function walk(dir) {
  let files = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      files = files.concat(walk(full))
    } else if (EXT.test(entry.name)) {
      files.push(full)
    }
  }
  return files
}

let items = []
try {
  items = walk(imagesDir)
    .map((full) => {
      const path = '/' + relative(join(root, 'public'), full).split('\\').join('/')
      const folder = dirname(path).replace(/^\/images\/?/, '') || 'images'
      return {
        path,
        name: path.split('/').pop(),
        folder,
        bytes: statSync(full).size,
      }
    })
    .filter((f) => !SKIP_DIR.test(f.path))
    .sort((a, b) => a.folder.localeCompare(b.folder) || a.name.localeCompare(b.name))
} catch (err) {
  if (err?.code !== 'ENOENT') throw err
  // No public/images yet — emit an empty manifest rather than failing the build.
}

const folders = [...new Set(items.map((i) => i.folder))].sort()
writeFileSync(out, JSON.stringify({ generatedAt: new Date().toISOString(), folders, items }, null, 0) + '\n')
console.log(`media-manifest: ${items.length} images across ${folders.length} folders`)
