#!/usr/bin/env node
/**
 * After `next build` with output: 'standalone', the `.next/standalone` folder
 * does NOT include `.next/static` or `public/`. This script copies them in so
 * the standalone server can serve assets directly.
 */
import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const standalone = join(root, '.next', 'standalone')

if (!existsSync(standalone)) {
  console.error('No .next/standalone found — did `next build` finish?')
  process.exit(1)
}

const targets = [
  { from: join(root, '.next', 'static'), to: join(standalone, '.next', 'static') },
  { from: join(root, 'public'), to: join(standalone, 'public') },
]

for (const { from, to } of targets) {
  if (!existsSync(from)) continue
  mkdirSync(dirname(to), { recursive: true })
  cpSync(from, to, { recursive: true })
  console.log(`Copied ${from} -> ${to}`)
}

console.log('Standalone build is ready at .next/standalone')
