import { test, expect } from '../test-with-coverage';
import { waitForPageLoad } from '../fixtures';
import { CATALOG_PRODUCT_DETAIL, CATALOG_PRODUCT_GALLERY, CATALOG_BACK_NAVIGATION } from '../helpers/flow-tags';

test.describe('Product Pages', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/catalog');
    await waitForPageLoad(page);
  });

  test('opens a product from the catalog', { tag: [...CATALOG_PRODUCT_DETAIL, '@outcome:display'] }, async ({ page }) => {
    // quality: allow-fragile-selector (product list links uniquely scoped by href pattern)
    const productCards = page.locator('a[href^="/products/"]');
    await expect(productCards.first()).toBeVisible({ timeout: 15000 });
    await productCards.first().click();
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/.*products\/\d+/);
  });

  test('the product detail shows the listed title and its price', { tag: [...CATALOG_PRODUCT_DETAIL, '@outcome:display'] }, async ({ page }) => {
    // quality: allow-fragile-selector (product list links uniquely scoped by href pattern)
    const firstCard = page.locator('a[href^="/products/"]').first();
    await expect(firstCard).toBeVisible({ timeout: 15000 });
    const title = ((await firstCard.locator('h3').first().textContent()) ?? '').trim();
    expect(title.length).toBeGreaterThan(0);

    await firstCard.click();
    await waitForPageLoad(page);
    await expect(page).toHaveURL(/.*products\/\d+/);

    await expect(page.getByText(title, { exact: false }).first()).toBeVisible();
    // Price is rendered as $<digits> on the detail page.
    await expect(page.getByText(/\$\d/).first()).toBeVisible();
  });

  test('shows a not-found state when the product detail request fails', { tag: [...CATALOG_PRODUCT_DETAIL, '@outcome:failure'] }, async ({ page }) => {
    // Catches a regression where a failed detail fetch leaves `loading` stuck
    // true forever (page never resolves past "Loading...") instead of
    // falling back to the not-found UI.
    // quality: allow-fragile-selector (product list links uniquely scoped by href pattern)
    const productCards = page.locator('a[href^="/products/"]');
    await expect(productCards.first()).toBeVisible({ timeout: 15000 });

    // Glob is scoped to a detail id (`*`) so the catalog's own list request,
    // used above to render the cards, is never intercepted.
    await page.route('**/products/*/', (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: '{}' })
    );
    await productCards.first().click();

    await expect(page.getByText('Product not found.')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Back to catalog' })).toBeVisible();
  });

  test('the product detail renders a gallery image with a source', { tag: [...CATALOG_PRODUCT_GALLERY, '@outcome:display'] }, async ({ page }) => {
    // quality: allow-fragile-selector (product list links uniquely scoped by href pattern)
    const productCards = page.locator('a[href^="/products/"]');
    const firstCard = productCards.first();
    await expect(firstCard).toBeVisible({ timeout: 15000 });
    const title = ((await firstCard.locator('h3').first().textContent()) ?? '').trim();

    await firstCard.click();
    await waitForPageLoad(page);

    // Scoped by the product's own title (the gallery image's alt text) so
    // this cannot pass on an unrelated placeholder image.
    const galleryImage = page.getByRole('img', { name: title }).first();
    await expect(galleryImage).toBeVisible();
    await expect(galleryImage).toHaveAttribute('src', /.+/);
  });

  test('navigates back to the catalog from a product', { tag: [...CATALOG_BACK_NAVIGATION, '@outcome:success'] }, async ({ page }) => {
    // quality: allow-fragile-selector (product list links uniquely scoped by href pattern)
    const productCards = page.locator('a[href^="/products/"]');
    await expect(productCards.first()).toBeVisible({ timeout: 15000 });
    await productCards.first().click();
    await expect(page).toHaveURL(/.*products\/\d+/);

    // Client-side back navigation fires no 'load' event, so rely on the URL
    // assertion's retry rather than waitForPageLoad.
    await page.goBack();
    await expect(page).toHaveURL(/.*catalog/, { timeout: 15000 });
  });
});
