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
    await expect(page.getByText('Ενήλικες (15+ ετών)').first()).toBeVisible()
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
    await expect(modal.getByText('Επιλέξτε ημερομηνία')).toBeVisible()

    // Availability resolves to a selectable day (seeded Saturdays).
    await expect(
      modal.locator('button[aria-pressed="false"]:not([disabled])').first(),
    ).toBeVisible({ timeout: 15000 })

    await page.keyboard.press('Escape')
    await expect(modal).toHaveCount(0)
  })
})
