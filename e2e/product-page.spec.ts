import { test, expect } from '@playwright/test'

const VARIATION = '/product/thymarisio-meli-oros-machaira' // has size variations
const SIMPLE = '/product/meli-me-foyntoykia' // in stock, no variations

test.describe('Product detail page', () => {
  test('renders the Figma layout (title, range price, variation chips, tabs, related)', async ({
    page,
  }) => {
    await page.goto(VARIATION)
    await expect(
      page.getByRole('heading', { level: 1, name: /Θυμαρίσιο Μέλι/ }),
    ).toBeVisible()
    await expect(page.getByText('Από €3,50').first()).toBeVisible()
    await expect(page.getByRole('button', { name: '330g', exact: true })).toBeVisible()
    await expect(page.getByText('🔥 Συνδυάστε το με')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Περιγραφή' })).toBeVisible()
    await expect(page.getByText('Προϊόντα που ίσως σας ενδιαφέρουν')).toBeVisible()
  })

  test('gates add-to-cart until a variation is selected', async ({ page }) => {
    await page.goto(VARIATION)
    const addToCart = page.getByRole('button', { name: /Προσθήκη στο καλάθι/ })
    await expect(addToCart).toBeDisabled()

    await page.getByRole('button', { name: '330g', exact: true }).click()
    await expect(page.getByText('Πλαστικό', { exact: true })).toBeVisible() // package line
    await expect(page.getByText('€5,70').first()).toBeVisible() // price updates
    await expect(addToCart).toBeEnabled()
  })

  test('adds to cart, updates the header badge, and shows in the cart', async ({ page }) => {
    await page.goto(VARIATION)
    await page.getByRole('button', { name: '330g', exact: true }).click()
    await page.getByRole('button', { name: /Προσθήκη στο καλάθι/ }).click()

    await expect(page.getByTestId('header-cart').first()).toContainText('1')

    await page.goto('/cart')
    await expect(page.getByRole('heading', { name: 'Σύνοψη παραγγελίας' })).toBeVisible()
    await expect(page.getByText('Θυμαρίσιο Μέλι «Όρος Μαχαιρά»')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Ταμείο' })).toBeVisible()
  })

  test('a product without variations has the buy buttons enabled from the start', async ({
    page,
  }) => {
    await page.goto(SIMPLE)
    await expect(page.getByRole('button', { name: /Προσθήκη στο καλάθι/ })).toBeEnabled()
    await expect(page.getByRole('button', { name: /Aγοράστε τώρα/ })).toBeEnabled()
  })

  test('buy-now takes the selected variation to checkout', async ({ page }) => {
    // Full order placement (address, shipping rules, real Medusa order) is
    // covered end-to-end by scripts/test-shipping.mjs.
    await page.goto(VARIATION)
    await page.getByRole('button', { name: '330g', exact: true }).click()
    await page.getByRole('button', { name: /Aγοράστε τώρα/ }).click()

    await expect(page).toHaveURL(/\/checkout/)
    await expect(page.getByText('Θυμαρίσιο Μέλι «Όρος Μαχαιρά»')).toBeVisible()
  })
})
