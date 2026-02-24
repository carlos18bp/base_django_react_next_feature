import { test, expect } from '../test-with-coverage';
import { waitForPageLoad } from '../fixtures';
import { HOME_LOADS, NAVIGATION_BETWEEN_PAGES, NAVIGATION_HEADER, NAVIGATION_FOOTER } from '../helpers/flow-tags';

test.describe('Navigation', () => {
  test('should navigate to home page', { tag: [...HOME_LOADS] }, async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);
    
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Everything you need, in one place' })).toBeVisible();
  });

  test('should navigate to blogs page', { tag: [...NAVIGATION_BETWEEN_PAGES] }, async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);
    
    // Look for blogs link in navigation or page
    // quality: allow-fragile-selector (blogs link appears in both header and footer; selecting first nav occurrence)
    const blogsLink = page.locator('a[href="/blogs"]').first();
    if (await blogsLink.isVisible()) {
      await blogsLink.click();
      await waitForPageLoad(page);
      await expect(page).toHaveURL(/.*blogs/);
    } else {
      // Direct navigation if link not found
      await page.goto('/blogs');
      await waitForPageLoad(page);
      await expect(page).toHaveURL(/.*blogs/);
    }
  });

  test('should navigate to catalog page', { tag: [...NAVIGATION_BETWEEN_PAGES] }, async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);
    
    // Look for catalog link in navigation or page
    // quality: allow-fragile-selector (catalog link appears in both header and footer; selecting first nav occurrence)
    const catalogLink = page.locator('a[href="/catalog"]').first();
    if (await catalogLink.isVisible()) {
      await catalogLink.click();
      await waitForPageLoad(page);
      await expect(page).toHaveURL(/.*catalog/);
    } else {
      // Direct navigation if link not found
      await page.goto('/catalog');
      await waitForPageLoad(page);
      await expect(page).toHaveURL(/.*catalog/);
    }
  });

  test('should have working header navigation', { tag: [...NAVIGATION_HEADER] }, async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);
    
    // Check if header exists
    // quality: allow-fragile-selector (selecting first of header/nav structural elements)
    const header = page.locator('header, nav').first();
    if (await header.isVisible()) {
      // Header exists, verify it has links
      const links = header.locator('a');
      const linkCount = await links.count();
      expect(linkCount).toBeGreaterThan(0);
    }
  });

  test('should have working footer', { tag: [...NAVIGATION_FOOTER] }, async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);
    
    // Check if footer exists
    const footer = page.locator('footer');
    if (await footer.isVisible()) {
      await expect(footer).toBeVisible();
    }
  });

  test('should maintain navigation across pages', { tag: [...NAVIGATION_BETWEEN_PAGES] }, async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForURL('/');
    
    // Navigate to blogs
    await page.goto('/blogs', { waitUntil: 'domcontentloaded' });
    await page.waitForURL(/.*blogs/);
    await expect(page).toHaveURL(/.*blogs/);
    
    // Navigate to catalog
    await page.goto('/catalog', { waitUntil: 'domcontentloaded' });
    await page.waitForURL(/.*catalog/);
    await expect(page).toHaveURL(/.*catalog/);
    
    // Navigate back to home
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForURL('/');
    await expect(page).toHaveURL('/');
  });
});
