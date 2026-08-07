// Verify the refrigerated-product delivery rules + new shipping prices.
//   node scripts/test-shipping.mjs
import { chromium } from '@playwright/test'

const base = process.env.BASE_URL || 'http://localhost:3002'
const browser = await chromium.launch()
const log = (...a) => console.log(...a)
let failed = false
const check = (cond, msg) => log(`  ${cond ? '✓' : '✗ FAIL'} ${msg}`) || (cond ? 0 : (failed = true))

async function fillBilling(page) {
  await page.getByLabel(/^Όνομα/).first().fill('Δοκιμή')
  await page.getByLabel(/^Επώνυμο/).first().fill('Πελάτης')
  await page.locator('input[type=tel]').first().fill('99123456')
  await page.locator('input[type=email]').first().fill('pw@oros.cy')
  await page.getByPlaceholder('Αριθμός και όνομα οδού').first().fill('Οδός 1')
  await page.getByLabel(/^Πόλη/).first().fill('Λάρνακα')
  await page.getByLabel(/Ταχ\. Κώδικας/).first().fill('7716')
  await page.getByRole('checkbox', { name: /όρους και προϋποθέσεις/i }).check()
}

// ── Part A: refrigerated product (Βασιλικός πολτός) ─────────────────────────
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  log('A) Refrigerated product (Βασιλικός πολτός):')
  await page.goto(`${base}/shop/vasilikos-poltos-oros-machaira`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /Προσθήκη στο καλάθι/ }).first().click()
  await page.waitForTimeout(600)
  await page.goto(`${base}/checkout`, { waitUntil: 'networkidle' })

  check(await page.getByText(/προϊόντα ψυγείου/).count() > 0, 'refrigerated notice shown')
  const acs = page.getByRole('radio', { name: /Παραλαβή από κατάστημα ACS/ })
  check(await acs.isDisabled(), 'ACS pickup is disabled')
  check(await page.getByText(/Επαρχία/).count() > 0, 'district selector shown (home forced)')

  await fillBilling(page)
  // Blocked district → error + submit disabled
  await page.getByLabel(/Επαρχία/).selectOption('Πάφος')
  await page.waitForTimeout(300)
  const submit = page.getByRole('button', { name: /Ολοκλήρωση παραγγελίας/ })
  check(await page.getByText(/δεν αποστέλλονται.*Πάφο|δεν είναι δυνατή η παράδοση/i).count() > 0, 'Paphos → block message')
  check(await submit.isDisabled(), 'Paphos → submit disabled')

  // Allowed district → order completes (Medusa order id)
  await page.getByLabel(/Επαρχία/).selectOption('Λευκωσία')
  await page.waitForTimeout(300)
  check(!(await submit.isDisabled()), 'Λευκωσία → submit enabled')
  await submit.click()
  await page.waitForURL(/\/order\//, { timeout: 20000 }).catch(() => {})
  const id = page.url().split('/order/')[1]
  check(!!id && id.startsWith('order_'), `home order created (${id})`)
  await page.close()
}

// ── Part B: non-refrigerated via ACS = €2,50 ────────────────────────────────
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  log('B) Non-refrigerated (Υδρόμελο) via ACS €2,50:')
  await page.goto(`${base}/shop/ydromelo`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /Προσθήκη στο καλάθι/ }).first().click()
  await page.waitForTimeout(600)
  await page.goto(`${base}/checkout`, { waitUntil: 'networkidle' })

  check(await page.getByText('€2,50').count() > 0, 'ACS price shows €2,50')
  await fillBilling(page)
  await page.getByLabel(/σημείο παραλαβής ACS/i).selectOption({ index: 1 })
  await page.getByRole('button', { name: /Ολοκλήρωση παραγγελίας/ }).click()
  await page.waitForURL(/\/order\//, { timeout: 20000 }).catch(() => {})
  const id = page.url().split('/order/')[1]
  check(!!id && id.startsWith('order_'), `ACS order created (${id})`)
  await page.close()
}

await browser.close()
log(failed ? '\n✗ SOME CHECKS FAILED' : '\n✓ ALL CHECKS PASSED')
process.exitCode = failed ? 1 : 0
