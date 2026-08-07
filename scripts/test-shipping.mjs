// Verify the refrigerated rules, Cyprus city dropdown, and delivery-method
// visibility.  node scripts/test-shipping.mjs
import { chromium } from '@playwright/test'

const base = process.env.BASE_URL || 'http://localhost:3002'
const browser = await chromium.launch()
const log = (...a) => console.log(...a)
let failed = false
const check = (cond, msg) => (log(`  ${cond ? '✓' : '✗ FAIL'} ${msg}`), cond ? 0 : (failed = true))

async function fillCyBilling(page, city) {
  await page.getByLabel(/^Όνομα/).first().fill('Δοκιμή')
  await page.getByLabel(/^Επώνυμο/).first().fill('Πελάτης')
  await page.locator('input[type=tel]').first().fill('99123456')
  await page.locator('input[type=email]').first().fill('pw@oros.cy')
  await page.getByPlaceholder('Αριθμός και όνομα οδού').first().fill('Οδός 1')
  await page.getByLabel(/^Πόλη/).first().selectOption(city) // Cyprus → dropdown
  await page.getByLabel(/Ταχ\. Κώδικας/).first().fill('7716')
  await page.getByRole('checkbox', { name: /όρους και προϋποθέσεις/i }).check()
}

const acsRadio = (p) => p.getByRole('radio', { name: /Παραλαβή από κατάστημα ACS/ })
const homeRadio = (p) => p.getByRole('radio', { name: /Παράδοση κατ’ οίκον/ })

// ── A: refrigerated (Βασιλικός πολτός) → home only, city dropdown, Paphos block ─
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 950 } })
  log('A) Refrigerated (Βασιλικός πολτός) — home only + area block:')
  await page.goto(`${base}/shop/vasilikos-poltos-oros-machaira`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /Προσθήκη στο καλάθι/ }).first().click()
  await page.waitForTimeout(600)
  await page.goto(`${base}/checkout`, { waitUntil: 'networkidle' })

  check((await page.getByText(/ψυγείου/).count()) > 0, 'refrigerated notice shown')
  check((await homeRadio(page).count()) > 0, 'home delivery shown')
  check((await acsRadio(page).count()) === 0, 'ACS pickup NOT shown')
  check((await page.getByLabel(/^Πόλη/).locator('option').count()) >= 5, 'city is a dropdown (5 cities)')

  await fillCyBilling(page, 'Πάφος')
  await page.waitForTimeout(300)
  const submit = page.getByRole('button', { name: /Ολοκλήρωση παραγγελίας/ })
  check((await page.getByText(/δεν είναι δυνατή η παράδοση/i).count()) > 0, 'Paphos → block message')
  check(await submit.isDisabled(), 'Paphos → submit disabled')
  check(await homeRadio(page).isDisabled(), 'Paphos → home delivery disabled')
  check(!(await homeRadio(page).isChecked()), 'Paphos → home delivery not selected')

  await page.getByLabel(/^Πόλη/).first().selectOption('Λευκωσία')
  await page.waitForTimeout(300)
  check(!(await submit.isDisabled()), 'Λευκωσία → submit enabled')
  await submit.click()
  await page.waitForURL(/\/order\//, { timeout: 20000 }).catch(() => {})
  const id = page.url().split('/order/')[1]
  check(!!id && id.startsWith('order_'), `home order created (${id})`)
  await page.close()
}

// ── B: non-refrigerated (Υδρόμελο) → ACS only €2,50, no home option ──────────
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 950 } })
  log('B) Non-refrigerated (Υδρόμελο) — ACS only:')
  await page.goto(`${base}/shop/ydromelo`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /Προσθήκη στο καλάθι/ }).first().click()
  await page.waitForTimeout(600)
  await page.goto(`${base}/checkout`, { waitUntil: 'networkidle' })

  check((await page.getByText('€2,50').count()) > 0, 'ACS €2,50 shown')
  check((await homeRadio(page).count()) === 0, 'home delivery NOT shown')
  await fillCyBilling(page, 'Λάρνακα')
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
