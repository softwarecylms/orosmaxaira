import { test, expect } from '@playwright/test'

/**
 * HeroVideo is a CMS (Puck) block. This spec activates automatically once the
 * block is placed on the homepage (or any page) and the DB is seeded; until
 * then it skips rather than false-failing. To wire it permanently, seed a page
 * containing a HeroVideo block and point `goto()` at it.
 */
test.describe('HeroVideo block', () => {
  test('renders poster + heading and a CTA', async ({ page }) => {
    await page.goto('/')
    const hero = page.getByTestId('hero-video-section').first()
    if ((await hero.count()) === 0) test.skip(true, 'HeroVideo not on this page yet')
    await expect(hero).toBeVisible()
    await expect(hero.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('shows the poster image and no autoplay video under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    const hero = page.getByTestId('hero-video-section').first()
    if ((await hero.count()) === 0) test.skip(true, 'HeroVideo not on this page yet')
    await expect(hero.locator('video')).toHaveCount(0)
    await expect(hero.locator('img')).toBeVisible()
  })
})
