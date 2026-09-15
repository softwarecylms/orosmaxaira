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

  test('flatlay hotspots add the pictured jar to the cart', async ({ page }) => {
    await page.goto('/')
    const band = page.getByTestId('flatlay-band')
    await band.scrollIntoViewIfNeeded()

    type Item = { handle: string; size?: string; quantity: number; variantId?: string }
    const cart = () =>
      page.evaluate(() => JSON.parse(localStorage.getItem('oros_cart') ?? '[]') as Item[])

    // Single-variant product: the mead.
    const mead = band.getByRole('button', { name: /Υδρόμελο/ }).locator('..')
    await mead.hover()
    await mead.getByRole('button', { name: 'Προσθήκη' }).click()
    await expect(mead.getByRole('button', { name: 'Προστέθηκε' })).toBeVisible()
    await expect.poll(cart).toEqual([
      expect.objectContaining({ handle: 'ydromelo', quantity: 1, variantId: expect.any(String) }),
    ])

    // Multi-size honey: exactly the 500 g jar in the photo, not the cheapest size.
    const honey = band.getByRole('button', { name: /Άβραστο Μέλι/ }).locator('..')
    await honey.hover()
    await expect(honey).toContainText('500 g')
    await honey.getByRole('button', { name: 'Προσθήκη' }).click()
    await expect
      .poll(async () => (await cart()).find((i) => i.handle === 'avrasto-meli-antheon-oros-machaira'))
      .toEqual(expect.objectContaining({ size: '500g', quantity: 1, variantId: expect.any(String) }))
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

test.describe('OROS MACHAIRA home page on a touch screen', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } })

  // Touch screens have no hover, so the card must open on a tap and stay open
  // while its own button is tapped (focus used to leave the pill mid-tap).
  test('a tapped flatlay hotspot adds its jar to the cart', async ({ page }) => {
    await page.goto('/')
    const band = page.getByTestId('flatlay-band')
    await band.scrollIntoViewIfNeeded()

    const pill = band.getByRole('button', { name: /Βασιλικός Πολτός/ })
    await pill.tap()
    await expect(pill).toHaveAttribute('aria-expanded', 'true')

    await pill.locator('..').getByRole('button', { name: 'Προσθήκη' }).tap()
    await expect
      .poll(() =>
        page.evaluate(() =>
          (JSON.parse(localStorage.getItem('oros_cart') ?? '[]') as { handle: string }[]).map(
            (i) => i.handle,
          ),
        ),
      )
      .toEqual(['vasilikos-poltos-oros-machaira'])
  })
})
