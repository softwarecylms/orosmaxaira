import { test, expect } from '@playwright/test'

test.describe('OROS MACHAIRA shop page', () => {
  test('renders the breadcrumb, sidebar filters and a product grid', async ({ page }) => {
    await page.goto('/proionta')
    await expect(page.getByRole('navigation', { name: 'breadcrumb' })).toContainText('Προϊόντα')
    await expect(page.getByTestId('shop-browser')).toBeVisible()
    // Category filter labels from the Figma sidebar
    await expect(page.getByText('Κατηγορία', { exact: true })).toBeVisible()
    await expect(page.getByText('Τιμή', { exact: true })).toBeVisible()
    // First infinite-scroll batch
    await expect(page.getByTestId('shop-card').first()).toBeVisible()
    expect(await page.getByTestId('shop-card').count()).toBe(12)
  })

  test('infinite scroll loads more products (no pagination)', async ({ page }) => {
    await page.goto('/proionta')
    await expect(page.getByTestId('shop-card')).toHaveCount(12)
    // No pagination controls anywhere on the page
    await expect(page.getByRole('navigation', { name: /pagination/i })).toHaveCount(0)
    // Scroll to the bottom until the IntersectionObserver sentinel grows the grid.
    let count = 12
    for (let i = 0; i < 12; i++) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await page.waitForTimeout(350)
      count = await page.getByTestId('shop-card').count()
      if (count > 12) break
    }
    expect(count).toBeGreaterThan(12)
  })

  test('category filter narrows the result set', async ({ page }) => {
    await page.goto('/proionta')
    await expect(page.getByTestId('shop-card')).toHaveCount(12)
    // Selecting "Μέλι" narrows the grid to fewer products than the initial page.
    await page.getByRole('checkbox', { name: 'Μέλι', exact: true }).check()
    await expect.poll(() => page.getByTestId('shop-card').count()).toBeLessThan(12)
    await expect(page.getByTestId('shop-card').first()).toBeVisible()
  })
})
