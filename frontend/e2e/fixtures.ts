/**
 * E2E Test Fixtures and Helpers
 * 
 * Este archivo contiene fixtures y funciones auxiliares para las pruebas E2E
 */

import type { Page, Response } from '@playwright/test';

export const testUser = {
  email: 'test@example.com',
  password: 'password123',
};

export const testAdminUser = {
  email: 'admin@example.com',
  password: 'admin123',
};

export const testCheckoutData = {
  email: 'customer@example.com',
  address: '123 Main Street',
  city: 'New York',
  state: 'NY',
  postal_code: '10001',
};

/**
 * Wait for the page to finish loading
 * Using 'load' which waits for DOM and all resources (images, scripts)
 * but doesn't wait for network to be idle
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('load');
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Wait for API response
 */
export async function waitForApiResponse(page: Page, url: string) {
  return page.waitForResponse((response: Response) =>
    response.url().includes(url) && response.status() === 200
  );
}
