import { test, expect } from '@playwright/test'

test.describe('WhatsApp CTA', () => {
  test('displays the floating WhatsApp button on the home page', {
    tag: ['@flow:lead-whatsapp-cta'],
  }, async ({ page }) => {
    await page.goto('/')

    const whatsappLink = page.getByRole('link', { name: /whatsapp/i })
    await expect(whatsappLink).toBeVisible({ timeout: 10_000 })
    await expect(whatsappLink).toHaveAttribute('href', /wa\.me/)
  })

  test('WhatsApp button is visible on program pages', {
    tag: ['@flow:lead-whatsapp-cta'],
  }, async ({ page }) => {
    await page.goto('/ingles')

    const whatsappBtn = page.getByLabel('Contáctanos por WhatsApp')
    await expect(whatsappBtn).toBeVisible({ timeout: 10_000 })
    await expect(whatsappBtn).toHaveAttribute('href', /wa\.me/)
  })
})
