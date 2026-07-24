import { test, expect } from '../test-with-coverage';
import { waitForPageLoad } from '../fixtures';
import { HOME_LOADS, NAVIGATION_BETWEEN_PAGES, NAVIGATION_HEADER, NAVIGATION_FOOTER } from '../helpers/flow-tags';

test.describe('Navigation', () => {
  test('home page loads with its hero heading', { tag: [...HOME_LOADS] }, async ({ page }) => {
    // quality: allow-no-interaction (home is the app entry point; there is no prior page to navigate from)
    await page.goto('/');
    await waitForPageLoad(page);

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Everything you need, in one place' })).toBeVisible();
  });

  test('navigates from home to blogs via the nav link', { tag: [...NAVIGATION_BETWEEN_PAGES] }, async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    // quality: allow-fragile-selector (blogs link appears in header and footer; first nav occurrence)
    await page.locator('a[href="/blogs"]').first().click();

    await expect(page).toHaveURL(/.*blogs/);
  });

  test('navigates from home to catalog via the nav link', { tag: [...NAVIGATION_BETWEEN_PAGES] }, async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    // quality: allow-fragile-selector (catalog link appears in header and footer; first nav occurrence)
    await page.locator('a[href="/catalog"]').first().click();

    await expect(page).toHaveURL(/.*catalog/);
  });

  test('the header links reach the catalog', { tag: [...NAVIGATION_HEADER] }, async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    const header = page.locator('header, nav').first();
    await expect(header).toBeVisible();
    await header.locator('a[href="/catalog"]').first().click();

    await expect(page).toHaveURL(/.*catalog/);
  });

  test('the footer links reach the blogs page', { tag: [...NAVIGATION_FOOTER] }, async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await footer.locator('a[href="/blogs"]').first().click();

    await expect(page).toHaveURL(/.*blogs/);
  });

  test('maintains navigation across pages', { tag: [...NAVIGATION_BETWEEN_PAGES] }, async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    await page.locator('a[href="/blogs"]').first().click();
    await expect(page).toHaveURL(/.*blogs/);

    await page.locator('a[href="/catalog"]').first().click();
    await expect(page).toHaveURL(/.*catalog/);
  });
});
