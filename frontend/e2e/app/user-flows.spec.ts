import { test, expect } from '../test-with-coverage';
import { waitForPageLoad } from '../fixtures';
import { HOME_TO_BLOG, HOME_TO_CATALOG, CATALOG_BROWSE } from '../helpers/flow-tags';

test.describe('User Flows', () => {
  test('should navigate from home to blog detail', { tag: [...HOME_TO_BLOG, '@outcome:success'] }, async ({ page }) => {
    // The "Read blogs" CTA is static hero chrome (frontend/app/page.tsx), not
    // data-dependent, so it is the one real path a user takes — no fallback.
    await page.goto('/');
    await waitForPageLoad(page);

    await page.getByRole('link', { name: 'Read blogs' }).click();
    await waitForPageLoad(page);

    // Should be on blogs page
    await expect(page).toHaveURL(/.*blogs/);

    // Click first blog
    const blogCards = page.locator('a[href^="/blogs/"]');
    await expect(blogCards.first()).toBeVisible({ timeout: 15000 });

    // quality: allow-fragile-selector (blog list links uniquely scoped by href pattern)
    await blogCards.first().click();
    await waitForPageLoad(page);

    // Should be on blog detail
    await expect(page).toHaveURL(/.*blogs\/\d+/);
  });

  test('should navigate from home to product detail', { tag: [...HOME_TO_CATALOG, '@outcome:success'] }, async ({ page }) => {
    // The "Shop now" CTA is static hero chrome (frontend/app/page.tsx), not
    // data-dependent, so it is the one real path a user takes — no fallback.
    await page.goto('/');
    await waitForPageLoad(page);

    await page.getByRole('link', { name: 'Shop now' }).click();
    // Wait for URL change explicitly — Next.js client-side nav doesn't fire load events
    await page.waitForURL(/.*catalog/, { timeout: 10_000 });
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/.*catalog/);

    // Click first product
    const productCards = page.locator('a[href^="/products/"]');
    await expect(productCards.first()).toBeVisible({ timeout: 15000 });

    // quality: allow-fragile-selector (product list links uniquely scoped by href pattern)
    await productCards.first().click();
    await page.waitForURL(/.*products\/\d+/, { timeout: 10_000 });

    await expect(page).toHaveURL(/.*products\/\d+/);
  });

  test('should browse multiple products in catalog', { tag: [...CATALOG_BROWSE, '@outcome:display'] }, async ({ page }) => {
    // Catches a regression where the catalog's product cards stop linking to
    // their own product (e.g. every card pointing at the same detail page).
    await page.goto('/catalog');
    await waitForPageLoad(page);

    const productCards = page.locator('a[href^="/products/"]');
    await expect(productCards.nth(2)).toBeVisible({ timeout: 15000 });

    // Visit first product
    // quality: allow-fragile-selector (intentional positional selection of first product)
    const firstTitle = ((await productCards.nth(0).locator('h3').first().textContent()) ?? '').trim();
    await productCards.nth(0).click();
    await waitForPageLoad(page);
    await expect(page).toHaveURL(/.*products\/\d+/);
    await expect(page.getByRole('heading', { name: firstTitle })).toBeVisible();

    // Go back to catalog
    await page.goto('/catalog');
    await waitForPageLoad(page);

    // Visit second product
    // quality: allow-fragile-selector (intentional positional selection of second product)
    const secondTitle = ((await productCards.nth(1).locator('h3').first().textContent()) ?? '').trim();
    await productCards.nth(1).click();
    await waitForPageLoad(page);
    await expect(page).toHaveURL(/.*products\/\d+/);
    await expect(page.getByRole('heading', { name: secondTitle })).toBeVisible();

    // Go back to catalog
    await page.goto('/catalog');
    await waitForPageLoad(page);

    // Visit third product
    // quality: allow-fragile-selector (intentional positional selection of third product)
    const thirdTitle = ((await productCards.nth(2).locator('h3').first().textContent()) ?? '').trim();
    await productCards.nth(2).click();
    await waitForPageLoad(page);
    await expect(page).toHaveURL(/.*products\/\d+/);
    await expect(page.getByRole('heading', { name: thirdTitle })).toBeVisible();
  });

  test('shows the catalog error state when the product list request fails', { tag: [...CATALOG_BROWSE, '@outcome:failure'] }, async ({ page }) => {
    // Catches a regression that leaves the catalog page stuck on its loading
    // skeleton (or crashes) instead of showing the error+retry affordance
    // when the product list request fails.
    // quality: allow-no-interaction (the error state renders automatically from the failed background fetch on page mount; there is no prior user action that triggers it)
    await page.route('**/products/', (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: '{}' })
    );

    await page.goto('/catalog');
    await waitForPageLoad(page);

    await expect(page.getByText('Catalog unavailable')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
  });

  test('pressing back twice returns from a product through the catalog to the home page', { tag: [...HOME_TO_CATALOG, '@outcome:success'] }, async ({ page }) => {
    // Catches a regression in client-side history handling where the browser
    // back button lands on a stale/blank view instead of the catalog list.
    // Start at home
    await page.goto('/');
    await waitForPageLoad(page);

    // Go to catalog
    await page.goto('/catalog');
    await waitForPageLoad(page);

    // Go to product
    const productCards = page.locator('a[href^="/products/"]');
    await expect(productCards.first()).toBeVisible({ timeout: 15000 });

    // quality: allow-fragile-selector (product list links uniquely scoped by href pattern)
    await productCards.first().click();
    await expect(page).toHaveURL(/.*products\/\d+/);

    // Use back button — client-side back navigation fires no 'load' event, so
    // rely on the assertions' own retry rather than waitForPageLoad.
    await page.goBack();
    await expect(page).toHaveURL(/.*catalog/, { timeout: 15000 });
    await expect(productCards.first()).toBeVisible({ timeout: 15000 });

    // Use back button again
    await page.goBack();
    await expect(page).toHaveURL('/', { timeout: 15000 });
  });
});
