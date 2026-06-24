import { test, expect } from '@playwright/test'

test.describe('About page', () => {
  test('renders the main sections from the Figma', async ({ page }) => {
    await page.goto('/about')
    await expect(page.getByRole('heading', { level: 1, name: 'Ποιοι Είμαστε' })).toBeVisible()
    await expect(page.getByText('Χρόνια εμπειρίας')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Αγνότητα' })).toBeVisible()
    await expect(page.getByText('Τι θα βρείτε στους εσωτερικούς μας χώρους')).toBeVisible()
    await expect(page.getByText('Και τι θα βρείτε στους εξωτερικούς μας χώρους')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Η Οικογένειά μας' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Στόχος μας' })).toBeVisible()
  })

  test('outdoor carousel advances with the outside arrow', async ({ page }) => {
    await page.goto('/about')
    await expect(page.getByRole('heading', { name: 'Εργαστήρια & Δραστηριότητες' })).toBeVisible()
    await page.getByRole('button', { name: 'Επόμενο' }).click()
    await expect(page.getByRole('heading', { name: 'Πλούσιους Κήπους' })).toBeVisible()
  })
})
