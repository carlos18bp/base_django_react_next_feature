import { test, expect } from '@playwright/test'

test.describe('English Program Page', () => {
  test('renders the English page hero section with MCER badge', {
    tag: ['@flow:public-english-page'],
  }, async ({ page }) => {
    await page.goto('/ingles')

    await expect(page.getByText('Domina el Inglés.')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(/Certificación MCER/i).first()).toBeVisible()
  })

  test('displays MCER level cards from A1 to C2', {
    tag: ['@flow:public-english-page'],
  }, async ({ page }) => {
    await page.goto('/ingles')

    await expect(page.getByText('A1').first()).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('C2').first()).toBeVisible()
  })

  test('displays the lead form pre-selected with English program', {
    tag: ['@flow:public-english-page'],
  }, async ({ page }) => {
    await page.goto('/ingles')

    await expect(page.getByPlaceholder('Nombre Completo')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('button', { name: /solicitar información/i })).toBeVisible()
  })
})
