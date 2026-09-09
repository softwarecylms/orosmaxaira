import { test, expect } from '@playwright/test'

/**
 * The announcement bar cycles between the BEE10 discount code and the
 * free-shipping offer. The first message must be in the server-rendered HTML
 * (the bar is above the fold on every page), and the second must arrive on its
 * own.
 */

const HOLD_MS = 4000

const CASES = [
  {
    locale: 'Greek',
    path: '/',
    first: /BEE10/,
    second: /ΔΩΡΕΑΝ/,
    secondFull: /αποστολή στην Κύπρο .* €70/,
  },
  {
    locale: 'English',
    path: '/en/',
    first: /BEE10/,
    second: /FREE/,
    secondFull: /shipping in Cyprus .* €70/,
  },
] as const

for (const c of CASES) {
  test.describe(`announcement bar — ${c.locale}`, () => {
    test('starts on the coupon, then rotates to free shipping', async ({ page }) => {
      await page.goto(c.path)
      const bar = page.locator('[aria-live="polite"]').first()

      await expect(bar).toContainText(c.first)
      await expect(bar).not.toContainText(c.second)

      // The second message arrives without any interaction.
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
