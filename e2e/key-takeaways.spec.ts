import { test, expect } from '@playwright/test'

/**
 * KeyTakeaways is a CMS (Puck) block, typically placed near the top of an
 * article. Activates once seeded onto a page; skips otherwise.
 */
test.describe('KeyTakeaways block', () => {
  test('renders the labelled summary card with bullet items', async ({ page }) => {
    await page.goto('/')
    const card = page.getByTestId('key-takeaways').first()
    if ((await card.count()) === 0) test.skip(true, 'KeyTakeaways not on this page yet')
    await expect(card).toBeVisible()
    await expect(card.locator('li')).not.toHaveCount(0)
  })
})
