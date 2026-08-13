import { test, expect } from '../test-with-coverage';
import { waitForPageLoad } from '../fixtures';
import { HOME_LOADS, NAVIGATION_BETWEEN_PAGES, NAVIGATION_HEADER, NAVIGATION_FOOTER, NAVIGATION_UNKNOWN_ROUTE } from '../helpers/flow-tags';

test.describe('Navigation', () => {
  test('home page loads with its hero heading', { tag: [...HOME_LOADS, '@outcome:display'] }, async ({ page }) => {
    // quality: allow-no-interaction (home is the app entry point; there is no prior page to navigate from)
    await page.goto('/');
    await waitForPageLoad(page);

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Everything you need, in one place' })).toBeVisible();
  });

  test('navigates from home to blogs via the nav link', { tag: [...NAVIGATION_BETWEEN_PAGES, '@outcome:success'] }, async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    await page.getByRole('banner').getByRole('link', { name: 'Blogs' }).click();

    await expect(page).toHaveURL(/.*blogs/);
  });

  test('navigates from home to catalog via the nav link', { tag: [...NAVIGATION_BETWEEN_PAGES, '@outcome:success'] }, async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    await page.getByRole('banner').getByRole('link', { name: 'Catalog' }).click();

    await expect(page).toHaveURL(/.*catalog/);
  });

  test('the header links reach the catalog', { tag: [...NAVIGATION_HEADER, '@outcome:success'] }, async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    const header = page.getByRole('banner');
    await expect(header).toBeVisible();
    await header.getByRole('link', { name: 'Catalog' }).click();

    await expect(page).toHaveURL(/.*catalog/);
  });

  test('the footer shows the site copyright on every page', { tag: [...NAVIGATION_FOOTER, '@outcome:display'] }, async ({ page }) => {
    // quality: allow-no-interaction (the footer is static layout chrome with no links; this asserts its content renders)
    await page.goto('/');
    await waitForPageLoad(page);

    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer).toContainText('Base Django + React + Next Feature Template');
  });

  test('maintains navigation across pages', { tag: [...NAVIGATION_BETWEEN_PAGES, '@outcome:success'] }, async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    await page.getByRole('banner').getByRole('link', { name: 'Blogs' }).click();
    await expect(page).toHaveURL(/.*blogs/);

    await page.getByRole('banner').getByRole('link', { name: 'Catalog' }).click();
    await expect(page).toHaveURL(/.*catalog/);
  });

  test('returns a 404 status for an unknown route', { tag: [...NAVIGATION_UNKNOWN_ROUTE, '@outcome:failure'] }, async ({ page }) => {
    // Catches a routing regression (e.g. an accidental catch-all, or a
    // middleware rewrite) that would make unknown URLs resolve as 200 with a
    // blank/broken page, or 500, instead of a clean 404.
    // quality: allow-no-interaction (no UI link to a nonexistent route exists by definition; direct navigation is the only way to reach this behavior)
    const response = await page.goto('/this-route-does-not-exist-e2e');

    expect(response?.status()).toEqual(404);
  });
});
