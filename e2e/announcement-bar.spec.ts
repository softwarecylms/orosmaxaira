import { test, expect } from '@playwright/test'

/**
 * The announcement bar cycles between the free-shipping offer and the BEE10
 * discount code. The first message must be in the server-rendered HTML (the bar
 * is above the fold on every page), and the second must arrive on its own.
 */

const HOLD_MS = 4000

const CASES = [
  {
    locale: 'Greek',
    path: '/',
    first: /ΔΩΡΕΑΝ/,
    second: /BEE10/,
    secondFull: /έκπτωση .* €150 .* BEE10/,
  },
  {
    locale: 'English',
    path: '/en/',
    first: /FREE/,
    second: /BEE10/,
    secondFull: /orders over €150 with code BEE10/,
  },
] as const

for (const c of CASES) {
  test.describe(`announcement bar — ${c.locale}`, () => {
    test('starts on free shipping, then rotates to the coupon', async ({ page }) => {
      await page.goto(c.path)
      const bar = page.locator('[aria-live="polite"]').first()

      await expect(bar).toContainText(c.first)
      await expect(bar).not.toContainText(c.second)

      // The coupon message arrives without any interaction.
      await expect(bar).toContainText(c.secondFull, { timeout: HOLD_MS * 2 })
    })

    test('pauses while the pointer is over it', async ({ page }) => {
      await page.goto(c.path)
      const bar = page.locator('[aria-live="polite"]').first()
      await expect(bar).toContainText(c.first)

      await bar.hover()
      // Well past one hold — a paused bar must still show the first message.
      await page.waitForTimeout(HOLD_MS + 1500)
      await expect(bar).toContainText(c.first)
    })
  })
}
