import { test, expect } from '@playwright/test'

/**
 * Medusa-backed activity detail page + booking popup
 * (/drastiriotites/peripeteies-stis-kypseles). When the Medusa `bookings`
 * module isn't reachable the route falls back to the static activity page, so
 * the booking-specific assertions skip gracefully (mirrors the other specs).
 */
test.describe('Activity detail + booking', () => {
  const PATH = '/drastiriotites/peripeteies-stis-kypseles'

  test('renders the detail header, price tiers and policies', async ({ page }) => {
    await page.goto(PATH)
    await expect(
      page.getByRole('heading', { name: 'Περιπέτειες στις Κυψέλες', level: 1 }),
    ).toBeVisible()

    const bookBtn = page.getByRole('button', { name: /Δείτε διαθεσιμότητα/ }).first()
    if ((await bookBtn.count()) === 0) {
      test.skip(true, 'Medusa activity unavailable — static fallback rendered')
    }

    // Price tiers + cancellation policy come from the Medusa activity.
    await expect(page.getByText('Ενήλικες (12+ ετών)').first()).toBeVisible()
    await expect(page.getByText('Χρήσιμες πληροφορίες')).toBeVisible()
    await expect(page.getByText('Πολιτική Ακύρωσης').first()).toBeVisible()
  })

  test('opens the booking modal, loads availability, and closes on Escape', async ({
    page,
  }) => {
    await page.goto(PATH)
    const bookBtn = page.getByRole('button', { name: /Δείτε διαθεσιμότητα/ }).first()
    if ((await bookBtn.count()) === 0) {
      test.skip(true, 'Medusa activity unavailable — static fallback rendered')
    }

    await bookBtn.click()
    const modal = page.getByTestId('booking-modal')
    await expect(modal).toBeVisible()
    // With workshop programmes on offer, the activity on its own is chosen first.
    const single = modal.getByTestId('program-single')
    const dateStep = modal.getByText('Επιλέξτε ημερομηνία')
    await expect(single.or(dateStep)).toBeVisible({ timeout: 15000 })
    if (await single.isVisible()) await single.click()
    await expect(modal.getByText('Επιλέξτε ημερομηνία')).toBeVisible()

    // Availability resolves to a selectable day (seeded Saturdays).
    await expect(
      modal.locator('button[aria-pressed="false"]:not([disabled])').first(),
    ).toBeVisible({ timeout: 15000 })

    await page.keyboard.press('Escape')
    await expect(modal).toHaveCount(0)
  })

  test('offers the Full programme with the month\'s workshop', async ({ page }) => {
    await page.goto(PATH)
    const bookBtn = page.getByRole('button', { name: /Δείτε διαθεσιμότητα/ }).first()
    if ((await bookBtn.count()) === 0) {
      test.skip(true, 'Medusa activity unavailable — static fallback rendered')
    }
    await bookBtn.click()
    const modal = page.getByTestId('booking-modal')
    const combo = modal.getByTestId('program-combo').first()
    const offered = await combo
      .waitFor({ timeout: 15000 })
      .then(() => true)
      .catch(() => false)
    if (!offered) {
      test.skip(true, 'No workshop programme with open dates')
    }

    await combo.click()
    await modal.locator('button[aria-pressed="false"]:not([disabled])').first().click()
    // The chosen date's workshop is named, and people are priced by its combo.
    await expect(modal.getByText(/Πλήρες πρόγραμμα — Περιπέτειες στις Κυψέλες/)).toBeVisible()
    await modal.getByRole('button', { name: /θέσεις/ }).first().click()
    await expect(modal.getByText('20 €').first()).toBeVisible()
  })
})
