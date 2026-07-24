import { test, expect } from '../test-with-coverage';
import { waitForPageLoad } from '../fixtures';
import { CATALOG_PRODUCT_DETAIL, CATALOG_PRODUCT_GALLERY, CATALOG_BACK_NAVIGATION } from '../helpers/flow-tags';

test.describe('Product Pages', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/catalog');
    await waitForPageLoad(page);
  });

  test('opens a product from the catalog', { tag: [...CATALOG_PRODUCT_DETAIL] }, async ({ page }) => {
    // quality: allow-fragile-selector (product list links uniquely scoped by href pattern)
    const productCards = page.locator('a[href^="/products/"]');
    await expect(productCards.first()).toBeVisible({ timeout: 15000 });
    await productCards.first().click();
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/.*products\/\d+/);
  });

  test('the product detail shows the listed title and its price', { tag: [...CATALOG_PRODUCT_DETAIL] }, async ({ page }) => {
    // quality: allow-fragile-selector (product list links uniquely scoped by href pattern)
    const firstCard = page.locator('a[href^="/products/"]').first();
    await expect(firstCard).toBeVisible({ timeout: 15000 });
    const title = ((await firstCard.locator('h3').first().textContent()) ?? '').trim();

    await firstCard.click();
    await waitForPageLoad(page);
    await expect(page).toHaveURL(/.*products\/\d+/);

    if (title) {
      await expect(page.getByText(title, { exact: false }).first()).toBeVisible();
    }
    // Price is rendered as $<digits> on the detail page.
    await expect(page.getByText(/\$\d/).first()).toBeVisible();
  });

  test('the product detail renders a gallery image with a source', { tag: [...CATALOG_PRODUCT_GALLERY] }, async ({ page }) => {
    // quality: allow-fragile-selector (product list links uniquely scoped by href pattern)
    const productCards = page.locator('a[href^="/products/"]');
    await expect(productCards.first()).toBeVisible({ timeout: 15000 });
    await productCards.first().click();
    await waitForPageLoad(page);

    await expect(page.locator('img').first()).toHaveAttribute('src', /.+/);
  });

  test('navigates back to the catalog from a product', { tag: [...CATALOG_BACK_NAVIGATION] }, async ({ page }) => {
    // quality: allow-fragile-selector (product list links uniquely scoped by href pattern)
    const productCards = page.locator('a[href^="/products/"]');
    await expect(productCards.first()).toBeVisible({ timeout: 15000 });
    await productCards.first().click();
    await waitForPageLoad(page);

    await page.goBack();
    await waitForPageLoad(page);
    await expect(page).toHaveURL(/.*catalog/);
  });
});
