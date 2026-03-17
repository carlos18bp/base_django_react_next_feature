import { test, expect } from '@playwright/test'

test.describe('Site Navigation', () => {
  test('renders navbar with logo and main navigation links', {
    tag: ['@flow:public-navigation'],
  }, async ({ page }) => {
    await page.goto('/')

    const nav = page.getByRole('navigation')
    await expect(nav).toBeVisible()

    await expect(nav.getByRole('link', { name: /inicio/i })).toBeVisible()
    await expect(nav.getByText(/programas/i).first()).toBeVisible()
    await expect(nav.getByRole('link', { name: /inglés/i })).toBeVisible()
  })

  test('renders footer with contact information', {
    tag: ['@flow:public-navigation'],
  }, async ({ page }) => {
    await page.goto('/')

    const footer = page.getByRole('contentinfo')
    await expect(footer).toBeVisible()
  })

  test('navbar is visible on program pages', {
    tag: ['@flow:public-navigation'],
  }, async ({ page }) => {
    await page.goto('/ingles')

    await expect(page.getByRole('navigation')).toBeVisible()
    await expect(page.getByRole('contentinfo')).toBeVisible()
  })
})
