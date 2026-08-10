// Drive the full storefront checkout to prove it creates a REAL Medusa order.
//   node scripts/test-checkout.mjs
import { chromium } from '@playwright/test'

const base = process.env.BASE_URL || 'http://localhost:3002'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
const log = (...a) => console.log(...a)
page.on('console', (m) => { if (m.type() === 'error') log('  [console.error]', m.text().slice(0, 200)) })
page.on('pageerror', (e) => log('  [pageerror]', e.message.slice(0, 200)))

try {
  // 1. Add a simple product to the cart from its detail page.
  await page.goto(`${base}/product/ydromelo`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /Προσθήκη στο καλάθι/ }).first().click()
  await page.waitForTimeout(800)

  // 2. Go straight to checkout.
  await page.goto(`${base}/checkout`, { waitUntil: 'networkidle' })

  // 3. Fill the required billing fields (precise selectors to avoid clobbering).
  await page.getByLabel(/^Όνομα/).first().fill('Δοκιμή')
  await page.getByLabel(/^Επώνυμο/).first().fill('Πελάτης')
  await page.locator('input[type=tel]').first().fill('99123456')
  await page.locator('input[type=email]').first().fill('playwright@oros.cy')
  await page.getByPlaceholder('Αριθμός και όνομα οδού').first().fill('Οδός Μελισσών 1')
  await page.getByLabel(/^Πόλη/).first().selectOption('Λάρνακα')
  await page.getByLabel(/Ταχ\. Κώδικας/).first().fill('7716')

  // ACS pickup point (required select) + terms checkbox (required).
  await page.getByLabel(/σημείο παραλαβής ACS/i).selectOption({ index: 1 })
  await page.getByRole('checkbox', { name: /όρους και προϋποθέσεις/i }).check()

  // 4. Submit and wait for the order confirmation redirect.
  await page.getByRole('button', { name: /Ολοκλήρωση παραγγελίας/ }).click()
  const err = await page
    .locator('.text-red-700')
    .first()
    .textContent({ timeout: 4000 })
    .catch(() => null)
  if (err) log('  order error shown:', err.trim())
  await page.waitForURL(/\/order\//, { timeout: 20000 })

  const url = page.url()
  const id = url.split('/order/')[1]
  log('redirected to:', url)
  if (id?.startsWith('order_')) {
    log('✓ REAL Medusa order created:', id)
  } else {
    log('✗ Not a Medusa order id (got:', id, ')')
    process.exitCode = 1
  }
} catch (e) {
  log('✗ ERROR:', e.message)
  process.exitCode = 1
} finally {
  await browser.close()
}
