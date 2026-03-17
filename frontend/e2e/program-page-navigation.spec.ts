import { test, expect } from '@playwright/test'

test.describe('Program Page Navigation', () => {
  test('navigates to a program page via slug and displays content', {
    tag: ['@flow:public-program-browse'],
  }, async ({ page }) => {
    await page.goto('/ingles')

    // The program page should show the program name
    await expect(page.getByText('Inglés').first()).toBeVisible({ timeout: 10_000 })
  })

  test('displays program details section', {
    tag: ['@flow:public-program-browse'],
  }, async ({ page }) => {
    await page.goto('/ingles')

    // Program pages show details like duration, modality, etc.
    await expect(page.getByText(/duración|modalidad|certificación/i).first()).toBeVisible({
      timeout: 10_000,
    })
  })

  test('shows navigation bar on program page', {
    tag: ['@flow:public-program-browse'],
  }, async ({ page }) => {
    await page.goto('/ingles')

    await expect(page.getByRole('navigation')).toBeVisible()
  })
})
