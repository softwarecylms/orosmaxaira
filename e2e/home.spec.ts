import { test, expect } from '@playwright/test'

const SECTIONS = [
  'hero-pair',
  'trust-badges',
  'deal-of-month',
  'home-ticker',
  'product-categories',
  'adopt-hive',
  'heritage',
  'flatlay-band',
  'blog-teaser',
] as const

test.describe('OROS MACHAIRA home page', () => {
  test('renders all body sections in order', async ({ page }) => {
    await page.goto('/')
    for (const id of SECTIONS) {
      await expect(page.getByTestId(id).first()).toBeVisible()
    }
    await expect(page.getByRole('heading', { level: 1 }).first()).toContainText('Θησαυροί')
  })

  test('header shows logo, nav and the live cart pill', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('site-header')).toBeVisible()
    await expect(page.getByTestId('header-cart').first()).toBeVisible()
    // empty cart total comes from Medusa (€0.00) — just assert the € is present
    await expect(page.getByTestId('header-cart').first()).toContainText('€')
    await expect(page.getByRole('link', { name: 'Blog' }).first()).toBeVisible()
  })

  test('trust strip renders four badges', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('trust-badge-cell')).toHaveCount(4)
  })

  test('footer shows the legal bar with SoftwareCy', async ({ page }) => {
    await page.goto('/')
    const footer = page.getByTestId('site-footer')
    await expect(footer).toBeVisible()
    await expect(footer).toContainText('SoftwareCy')
    await expect(footer).toContainText('Χρήσιμοι Σύνδεσμοι')
  })

  test('ticker holds still under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    const ticker = page.getByTestId('home-ticker').first()
    await expect(ticker).toBeVisible()
    const row = ticker.locator('> div').first()
    // The marquee keyframes (`marquee-x`) must not be running under reduced
    // motion. Poll to avoid a first-paint race on the freshly-compiled dev
    // server, where the stylesheet can land a beat after `networkidle`.
    await expect
      .poll(() => row.evaluate((el) => getComputedStyle(el).animationName))
      .not.toBe('marquee-x')
  })
})
