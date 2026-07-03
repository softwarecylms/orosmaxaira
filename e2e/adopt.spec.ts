import { test, expect } from '@playwright/test'

test.describe('Adopt a Hive page', () => {
  test('renders every programme section', async ({ page }) => {
    await page.goto('/adopt-a-hive')

    // Hero
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Bee-come a Hero')

    // Stats band
    await expect(page.getByText('ο στόχος μας')).toBeVisible()

    // Package + visits + gallery + goal
    await expect(page.getByRole('heading', { name: 'Τι Περιλαμβάνει το Πακέτο;' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Οι Δύο Επισκέψεις' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Η Εμπειρία σε Εικόνες' })).toBeVisible()
    await expect(page.getByText('200 κυψέλες.')).toBeVisible()

    // FAQ + partners + testimonials + CTA
    await expect(page.getByRole('heading', { name: 'Συχνές Ερωτήσεις' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Οι Εταιρείες που μας Εμπιστεύτηκαν' })).toBeVisible()
    await expect(page.getByText('Antigoni Pafiti')).toBeVisible()
    await expect(page.getByText('M.F. (OROS MAXAIRA) LTD')).toBeVisible()
  })

  test('shows all 14 gallery photos and the partner logos', async ({ page }) => {
    await page.goto('/adopt-a-hive')
    // scope to the gallery section (tiles are decorative alt="")
    const gallery = page.locator('section', {
      has: page.getByRole('heading', { name: 'Η Εμπειρία σε Εικόνες' }),
    })
    await expect(gallery.locator('img')).toHaveCount(14)
    // the marquee announces each logo once (the visual clone is aria-hidden)
    await expect(page.getByRole('img', { name: 'Amdocs' })).toHaveCount(1)
  })

  test('FAQ accordion expands an answer on click', async ({ page }) => {
    await page.goto('/adopt-a-hive')
    await page.getByRole('button', { name: 'Μπορώ να συμμετέχω αν δεν έχω επιχείρηση;' }).click()
    await expect(page.getByText('Ναι, υπάρχουν επιλογές και για μεμονωμένα άτομα.')).toBeVisible()
  })
})
