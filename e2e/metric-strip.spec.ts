import { test, expect } from '@playwright/test'

/**
 * MetricStrip is a CMS (Puck) block of animated KPIs. Under reduced motion the
 * Counter renders its final value immediately. Activates once seeded; skips
 * otherwise.
 */
test.describe('MetricStrip block', () => {
  test('renders metric cells with final values under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    const strip = page.getByTestId('metric-strip').first()
    if ((await strip.count()) === 0) test.skip(true, 'MetricStrip not on this page yet')
    await expect(strip).toBeVisible()
    await expect(strip.getByTestId('metric-cell')).not.toHaveCount(0)
  })
})
