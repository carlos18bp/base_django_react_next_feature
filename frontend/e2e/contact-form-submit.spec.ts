import { test, expect } from '@playwright/test'

test.describe('Contact Form Submission', () => {
  test('displays the lead form with all required fields', {
    tag: ['@flow:lead-submit-form'],
  }, async ({ page }) => {
    await page.goto('/')

    await expect(page.getByPlaceholder('Nombre Completo')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByPlaceholder('Correo Electrónico')).toBeVisible()
    await expect(page.getByPlaceholder('Número de Celular')).toBeVisible()
    await expect(page.getByRole('combobox').or(page.locator('select'))).toBeVisible()
    await expect(page.getByRole('button', { name: /solicitar información/i })).toBeVisible()
  })

  test('submit button is present and enabled', {
    tag: ['@flow:lead-submit-form'],
  }, async ({ page }) => {
    await page.goto('/')

    const submitBtn = page.getByRole('button', { name: /solicitar información/i })
    await expect(submitBtn).toBeVisible({ timeout: 10_000 })
    await expect(submitBtn).toBeEnabled()
  })

  test('form requires fields before submission', {
    tag: ['@flow:lead-submit-form'],
  }, async ({ page }) => {
    await page.goto('/')

    // Try to click submit without filling fields — browser validation should prevent
    const submitBtn = page.getByRole('button', { name: /solicitar información/i })
    await submitBtn.scrollIntoViewIfNeeded()
    await submitBtn.click()

    // Form should still be visible (not navigated away or showing success)
    await expect(submitBtn).toBeVisible()
    // The URL should remain unchanged (no form action redirect)
    await expect(page).toHaveURL('/')
  })
})
