// Drive the full storefront checkout with a REAL Stripe test card, proving the
// order reaches Medusa with a captured Stripe payment.
//
//   node scripts/test-stripe-checkout.mjs                  → 4242, expect an order
//   CARD=decline node scripts/test-stripe-checkout.mjs     → expect a decline, no order
//   CARD=decline RETRY=1 node scripts/test-stripe-checkout.mjs
//        → decline then retry with 4242 in the same session. Compare the Stripe
//          PaymentIntent count before/after: it must rise by exactly ONE, i.e.
//          the retry re-confirmed the existing intent instead of stacking a new
//          cart and intent per attempt.
//   CARD=sca node scripts/test-stripe-checkout.mjs         → 3-D Secure challenge
//
//   CUSTOMER_EMAIL=… overrides the address the confirmation is sent to.
import { chromium } from '@playwright/test'

const base = process.env.BASE_URL || 'http://localhost:3002'
const CARDS = {
  ok:      '4242424242424242',
  decline: '4000000000000002',
  sca:     '4000002500003155',
}
const card = CARDS[process.env.CARD || 'ok']
// Resend refuses any recipient other than the account owner until the sending
// domain is verified, so the confirmation address has to be overridable.
const customerEmail = process.env.CUSTOMER_EMAIL || 'playwright@oros.cy'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 1100 } })
const log = (...a) => console.log(...a)
const netPost = []
page.on('request', (r) => {
  const u = r.url()
  if (r.method() === 'POST' && (u.includes('/payment-sessions') || u.includes('/complete')))
    netPost.push(u.replace(/^https?:\/\/[^/]+/, ''))
})
page.on('pageerror', (e) => log('  [pageerror]', e.message.slice(0, 200)))

try {
  await page.goto(`${base}/product/ydromelo`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3000)
  log('add-to-cart buttons:', await page.getByRole('button', { name: /καλάθι/i }).count())
  log('page title:', await page.title())
  await page.getByRole('button', { name: /Προσθήκη στο καλάθι/ }).first().waitFor({ timeout: 60000 })
  await page.getByRole('button', { name: /Προσθήκη στο καλάθι/ }).first().click()
  await page.waitForTimeout(800)

  await page.goto(`${base}/checkout`, { waitUntil: 'domcontentloaded' })
  // wait for the hydrated form (cart comes from localStorage)
  await page.getByLabel(/^Όνομα/).first().waitFor({ timeout: 60000 })
  log('stripe.js loaded:', await page.evaluate(() => !!document.querySelector('script[src*="js.stripe.com"]')))

  await page.getByLabel(/^Όνομα/).first().fill('Δοκιμή')
  await page.getByLabel(/^Επώνυμο/).first().fill('Πελάτης')
  await page.locator('input[type=tel]').first().fill('99123456')
  await page.locator('input[type=email]').first().fill(customerEmail)
  await page.getByPlaceholder('Αριθμός και όνομα οδού').first().fill('Οδός Μελισσών 1')
  await page.getByLabel(/^Πόλη/).first().selectOption('Λάρνακα')
  await page.getByLabel(/Ταχ\. Κώδικας/).first().fill('7716')
  await page.getByLabel(/σημείο παραλαβής ACS/i).selectOption({ index: 1 })
  await page.getByRole('checkbox', { name: /όρους και προϋποθέσεις/i }).check()

  // Stripe PaymentElement lives in a cross-origin iframe.
  const frame = page.frameLocator('iframe[title*="payment" i], iframe[name^="__privateStripeFrame"]').first()
  await frame.locator('[name="number"], [placeholder*="1234"]').first().fill(card, { timeout: 20000 })
  await frame.locator('[name="expiry"], [placeholder*="MM"]').first().fill('12' + String(new Date().getFullYear() + 2).slice(-2))
  await frame.locator('[name="cvc"]').first().fill('123')
  const zip = frame.locator('[name="postalCode"]')
  if (await zip.count()) await zip.first().fill('7716').catch(() => {})
  log('card filled:', card)

  const btn = page.getByRole('button', { name: /Πληρωμή|Ολοκλήρωση παραγγελίας/ })
  log('submit label:', (await btn.first().textContent())?.trim())
  await btn.first().click()

  // RETRY mode: after the decline, swap in a good card and submit again in the
  // SAME page session — this must re-use the existing PaymentIntent.
  if (process.env.RETRY) {
    await page.locator('.text-red-700').first().waitFor({ timeout: 60000 })
    log('  1st attempt declined:', (await page.locator('.text-red-700').first().textContent())?.trim())
    const f2 = page.frameLocator('iframe[title*="payment" i], iframe[name^="__privateStripeFrame"]').first()
    await f2.locator('[name="number"], [placeholder*="1234"]').first().fill(CARDS.ok, { timeout: 20000 })
    await f2.locator('[name="expiry"], [placeholder*="MM"]').first().fill('12' + String(new Date().getFullYear() + 2).slice(-2))
    await f2.locator('[name="cvc"]').first().fill('123')
    await page.getByRole('button', { name: /Πληρωμή|Ολοκλήρωση/ }).first().click()
    log('  retried with 4242')
  }

  const outcome = await Promise.race([
    page.waitForURL(/\/order\//, { timeout: 60000 }).then(() => 'order'),
    page.locator('.text-red-700').first().waitFor({ timeout: 60000 }).then(() => 'error'),
  ])

  if (outcome === 'error') {
    log('✗ error shown:', (await page.locator('.text-red-700').first().textContent())?.trim())
    process.exitCode = 1
  } else {
    const id = page.url().split('/order/')[1]?.replace(/\/$/, '')
    log('✓ order created:', id)
  }
  log('payment POSTs:', JSON.stringify(netPost, null, 0))
} catch (e) {
  log('✗ ERROR:', e.message.split('\n')[0])
  process.exitCode = 1
} finally {
  await browser.close()
}
