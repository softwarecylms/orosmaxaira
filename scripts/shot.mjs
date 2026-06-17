// Reusable screenshot helper for pixel-diffing against Figma during the home build.
//   node scripts/shot.mjs <path> <width> <out> [selector]
// e.g. node scripts/shot.mjs / 1920 .shots/home-1920.png
//      node scripts/shot.mjs / 1920 .shots/hero.png '[data-testid="hero-pair"]'
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const [, , path = '/', widthArg = '1920', out = '.shots/shot.png', selector] = process.argv
const width = Number(widthArg)
const base = process.env.BASE_URL || 'http://localhost:3002'

mkdirSync(dirname(out), { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width, height: 1080 }, deviceScaleFactor: 1 })
await page.goto(base + path, { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(700) // let fonts/motion settle

if (selector) {
  const el = page.locator(selector).first()
  await el.scrollIntoViewIfNeeded()
  await page.waitForTimeout(300)
  await el.screenshot({ path: out })
} else {
  await page.screenshot({ path: out, fullPage: true })
}
await browser.close()
console.log('saved', out, '@', width)
