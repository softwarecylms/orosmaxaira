import { test, expect } from '@playwright/test'

test.describe('OROS MACHAIRA shop page', () => {
  test('renders the heading, sidebar filters and a product grid', async ({ page }) => {
    await page.goto('/shop')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Προϊόντα')
    await expect(page.getByTestId('shop-browser')).toBeVisible()
    // Category filter labels from the Figma sidebar
    await expect(page.getByText('Κατηγορία', { exact: true })).toBeVisible()
    await expect(page.getByText('Τιμή', { exact: true })).toBeVisible()
    // First infinite-scroll batch
    await expect(page.getByTestId('shop-card').first()).toBeVisible()
    const initial = await page.getByTestId('shop-card').count()
    expect(initial).toBe(12)
  })

  test('infinite scroll loads more products (no pagination)', async ({ page }) => {
    await page.goto('/shop')
    await expect(page.getByTestId('shop-card')).toHaveCount(12)
    // No pagination controls anywhere on the page
    await expect(page.getByRole('navigation', { name: /pagination/i })).toHaveCount(0)
    // Scroll to the bottom to trip the IntersectionObserver sentinel
    await page.mouse.wheel(0, 6000)
    await expect.poll(() => page.getByTestId('shop-card').count()).toBeGreaterThan(12)
    await page.mouse.wheel(0, 12000)
    // 31 products total in the catalogue
    await expect.poll(() => page.getByTestId('shop-card').count()).toBe(31)
  })

  test('category filter narrows the result set', async ({ page }) => {
    await page.goto('/shop')
    await expect(page.getByTestId('shop-card')).toHaveCount(12)
    // "Μέλι" bucket has 8 products — fewer than the initial page of 12
    await page.getByRole('checkbox', { name: 'Μέλι', exact: true }).check()
    await expect.poll(() => page.getByTestId('shop-card').count()).toBe(8)
    await expect(page.getByText('8 προϊόντα')).toBeVisible()
  })
})
