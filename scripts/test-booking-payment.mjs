// Drive a booking through the modal's payment step with a real Stripe test card
// — proving a slot is no longer confirmed without a payment.
//
//   node scripts/test-booking-payment.mjs                 → activity (xenagiseis), pay 4242
//   KIND=workshop node scripts/test-booking-payment.mjs   → workshop (ergastiria-mageirikis)
//   BACK=1 …                                              → Back from payment; the hold is released
//   SLUG=peripeteies-stis-kypseles …                      → another activity / workshop
//   SHOT=/path/to/fail.png …                              → where to save a screenshot on failure
//   PAYSHOT=/path/to/step.png …                           → screenshot of the payment step
import { chromium } from '@playwright/test'

const base = process.env.BASE_URL || 'http://localhost:3002'
const workshop = process.env.KIND === 'workshop'
const slug = process.env.SLUG || (workshop ? 'ergastiria-mageirikis' : 'xenagiseis')
const path = workshop ? `/drastiriotites/ergastiria/${slug}/` : `/drastiriotites/${slug}/`
const cta = workshop ? /Κλείστε online/ : /Δείτε διαθεσιμότητα/
const testId = workshop ? 'workshop-booking-modal' : 'booking-modal'
const detailsTitle = workshop ? 'Κράτηση εργαστηρίου' : 'Κράτηση'
const shot = process.env.SHOT || `booking-${workshop ? 'workshop' : 'activity'}-failure.png`

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } })
const log = (...a) => console.log(...a)
page.on('pageerror', (e) => log('  [pageerror]', e.message.slice(0, 200)))

let step = 'open page'
try {
  await page.goto(base + path, { waitUntil: 'domcontentloaded' })

  // A cold dev compile hydrates late, and a click on server-rendered HTML does
  // nothing — keep clicking until the modal is really open.
  step = 'open modal'
  const modal = page.getByTestId(testId)
  let opened = false
  for (let i = 0; i < 20 && !opened; i++) {
    await page.getByRole('button', { name: cta }).first().click({ timeout: 5000 }).catch(() => {})
    await page.waitForTimeout(1500)
    opened = await modal.isVisible().catch(() => false)
  }
  if (!opened) throw new Error('the booking modal never opened')
  await modal.getByText(/Φόρτωση διαθεσιμότητας/).waitFor({ state: 'hidden', timeout: 60000 }).catch(() => {})

  if (workshop) {
    step = 'pick programme'
    await modal.locator('button:not([disabled])').filter({ hasText: /πρόγραμμα/ }).first().click()
  }

  step = 'pick date'
  const timeBtn = modal.getByRole('button', { name: /\d{2}:\d{2}.*θέσεις/ })
  let picked = false
  for (let m = 0; m < 8 && !picked; m++) {
    const days = modal.locator('button:not([disabled])').filter({ hasText: /^\s*\d{1,2}\s*$/ })
    const n = await days.count()
    for (let i = 0; i < n && !picked; i++) {
      await days.nth(i).click()
      await page.waitForTimeout(250)
      picked = (await timeBtn.count()) > 0
    }
    if (!picked) await modal.getByRole('button', { name: 'Επόμενος μήνας' }).click()
  }
  if (!picked) throw new Error('no bookable date in the next 8 months')

  step = 'pick time'
  await timeBtn.first().click()

  step = 'people + contact'
  await modal.getByRole('button', { name: 'Αύξηση' }).first().click()
  await modal.getByLabel('Ονοματεπώνυμο').fill('Δοκιμή UI')
  // Resend's test inbox unless CUSTOMER_EMAIL says otherwise — a test booking
  // must never email a real person, info@ included.
  await modal.getByLabel('Email').fill(process.env.CUSTOMER_EMAIL || 'delivered@resend.dev')

  step = 'continue to payment'
  const next = modal.getByRole('button', { name: /Συνέχεια στην πληρωμή|Ολοκλήρωση κράτησης/ })
  log('footer button:', (await next.textContent())?.trim())
  await next.click()

  // The payment step must appear — and nothing may be confirmed yet.
  step = 'payment step'
  await modal.getByRole('heading', { name: 'Πληρωμή', exact: true }).waitFor({ timeout: 30000 })
  log('payment step shown, hold note:', await modal.getByText(/κρατούνται για 20 λεπτά/).isVisible())
  const early = await modal.getByText(/Η κράτησή σας επιβεβαιώθηκε/).count()
  log('confirmed before paying?', early > 0 ? 'YES — BUG' : 'no')
  if (early) process.exitCode = 1

  if (process.env.BACK) {
    step = 'back to details'
    await modal.getByRole('button', { name: 'Πίσω' }).click()
    await modal.getByRole('heading', { name: detailsTitle, exact: true }).waitFor({ timeout: 15000 })
    log('✓ back to the details — hold released')
  } else {
    step = 'card entry'
    const frame = modal
      .frameLocator('iframe[title*="payment" i], iframe[name^="__privateStripeFrame"]')
      .first()
    await frame.locator('[name="number"]').fill('4242424242424242', { timeout: 30000 })
    await frame.locator('[name="expiry"]').fill('12' + String(new Date().getFullYear() + 2).slice(-2))
    await frame.locator('[name="cvc"]').fill('123')
    const zip = frame.locator('[name="postalCode"]')
    if (await zip.count()) await zip.fill('7716').catch(() => {})

    // PAYSHOT=path saves the payment step — e.g. to check which methods are offered.
    if (process.env.PAYSHOT) await modal.screenshot({ path: process.env.PAYSHOT })

    step = 'pay'
    // Greek formats the amount as "8 €" and English as "€8" — match either.
    const payBtn = modal.getByRole('button', { name: /^(Πληρωμή|Pay)\s/ })
    log('pay button:', (await payBtn.textContent())?.trim())
    await payBtn.click()
    await modal.getByText(/Η κράτησή σας επιβεβαιώθηκε/).waitFor({ timeout: 60000 })
    const ref = await modal.getByText(/OM-[0-9A-F]{6}/).first().textContent()
    log('✓ confirmed only after paying —', ref?.trim())
  }
} catch (e) {
  log(`✗ FAILED at "${step}":`, e.message.split('\n')[0])
  await page.screenshot({ path: shot, fullPage: false }).catch(() => {})
  log('  screenshot:', shot)
  process.exitCode = 1
} finally {
  await browser.close()
}
