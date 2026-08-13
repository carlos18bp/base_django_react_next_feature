import { test, expect } from '../test-with-coverage';
import { waitForPageLoad } from '../fixtures';
import { CART_ADD, CART_EMPTY, CART_UPDATE_QTY, CART_REMOVE, CART_SUBTOTAL, CART_PERSIST, CART_MULTIPLE_PRODUCTS, CART_QUANTITY_ZERO } from '../helpers/flow-tags';

test.describe('Shopping Cart', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cart before each test — each Playwright test gets a fresh browser context,
    // but we clear localStorage and reload to ensure zustand persist rehydrates cleanly.
    await page.goto('/checkout');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await waitForPageLoad(page);
  });

  test('should add product to cart', { tag: [...CART_ADD, '@outcome:success'] }, async ({ page }) => {
    // Catches a regression where "Add to cart" stops writing to the cart
    // store (or writes the wrong product), leaving checkout's cart empty.
    // Go to catalog
    await page.goto('/catalog');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/.*catalog/);

    // quality: allow-fragile-selector (product list links uniquely scoped by href pattern)
    const productCards = page.locator('a[href^="/products/"]');
    await expect(productCards.first()).toBeVisible({ timeout: 15000 });
    const title = ((await productCards.first().locator('h3').first().textContent()) ?? '').trim();

    await productCards.first().click();
    await waitForPageLoad(page);

    // Add to cart
    await page.getByRole('button', { name: 'Add to cart' }).click();

    // Navigate to checkout to verify
    await page.goto('/checkout');
    await waitForPageLoad(page);

    // Should see this specific product in cart, not just "something"
    await expect(page.getByText('Your cart is empty')).toBeHidden();
    await expect(page.getByText(title)).toBeVisible();
  });

  test('an empty cart shows the empty-cart message', { tag: [...CART_EMPTY, '@outcome:display'] }, async ({ page }) => {
    // quality: allow-no-interaction (the cart is empty by default after the beforeEach clear; the empty state is what this asserts)
    await page.goto('/checkout');
    await waitForPageLoad(page);

    await expect(page.getByText('Your cart is empty.')).toBeVisible();
  });

  test('should update product quantity in cart', { tag: [...CART_UPDATE_QTY, '@outcome:success'] }, async ({ page }) => {
    // First add a product
    await page.goto('/catalog');
    await waitForPageLoad(page);

    // quality: allow-fragile-selector (product list links uniquely scoped by href pattern)
    const productCards = page.locator('a[href^="/products/"]');
    await expect(productCards.first()).toBeVisible({ timeout: 15000 });
    await productCards.first().click();
    await waitForPageLoad(page);

    await page.getByRole('button', { name: 'Add to cart' }).click();

    // Go to checkout
    await page.goto('/checkout');
    await waitForPageLoad(page);

    // Update quantity to 3
    const qtyInput = page.getByLabel('Qty');
    await qtyInput.fill('3');

    // Verify quantity updated
    await expect(qtyInput).toHaveValue('3');
  });

  test('removes the cart item when its quantity is set to zero', { tag: [...CART_QUANTITY_ZERO, '@outcome:failure'] }, async ({ page }) => {
    // Catches an updateQuantity regression (e.g. the `quantity > 0` filter
    // changed to `quantity >= 0`, or removed) that would leave a ghost $0
    // line item in the cart instead of removing it.
    await page.goto('/catalog');
    await waitForPageLoad(page);

    // quality: allow-fragile-selector (product list links uniquely scoped by href pattern)
    const productCards = page.locator('a[href^="/products/"]');
    await expect(productCards.first()).toBeVisible({ timeout: 15000 });
    await productCards.first().click();
    await waitForPageLoad(page);

    await page.locator('button:has-text("Add to cart")').click();

    await page.goto('/checkout');
    await waitForPageLoad(page);

    // quality: allow-fragile-selector (number input is the only type="number" field on this page)
    const qtyInput = page.locator('input[type="number"]').first();
    await expect(qtyInput).toBeVisible();
    await qtyInput.fill('0');

    await expect(page.getByText('Your cart is empty.')).toBeVisible();
  });

  test('removes a product from the cart, leaving it empty', { tag: [...CART_REMOVE, '@outcome:success'] }, async ({ page }) => {
    await page.goto('/catalog');
    await waitForPageLoad(page);

    // quality: allow-fragile-selector (product list links uniquely scoped by href pattern)
    const productCards = page.locator('a[href^="/products/"]');
    await expect(productCards.first()).toBeVisible({ timeout: 15000 });
    await productCards.first().click();
    await waitForPageLoad(page);

    await page.locator('button:has-text("Add to cart")').click();

    await page.goto('/checkout');
    await waitForPageLoad(page);
    await expect(page.getByText('Your cart is empty.')).toBeHidden();

    // quality: allow-fragile-selector (Remove is the only such button in a cart item row)
    await page.locator('button:has-text("Remove")').first().click();

    await expect(page.getByText('Your cart is empty.')).toBeVisible();
  });

  test('should calculate subtotal correctly', { tag: [...CART_SUBTOTAL, '@outcome:display'] }, async ({ page }) => {
    // Catches a subtotal regression (wrong price, wrong quantity, or stuck at
    // $0) by pinning the checkout Subtotal to the exact unit price shown on
    // the product detail page before it was added (quantity defaults to 1).
    await page.goto('/catalog');
    await waitForPageLoad(page);

    // quality: allow-fragile-selector (product list links uniquely scoped by href pattern)
    const productCards = page.locator('a[href^="/products/"]');
    await expect(productCards.first()).toBeVisible({ timeout: 15000 });
    await productCards.first().click();
    await waitForPageLoad(page);

    const priceText = ((await page.getByText(/^\$\d+$/).first().textContent()) ?? '').trim();
    expect(priceText.length).toBeGreaterThan(0);

    await page.getByRole('button', { name: 'Add to cart' }).click();

    // Go to checkout
    await page.goto('/checkout');
    await waitForPageLoad(page);

    // Scope to the Subtotal row so the assertion can't match the per-item
    // price or line total, which render the same amount for quantity 1.
    const subtotalRow = page.getByText('Subtotal', { exact: true }).locator('..');
    await expect(subtotalRow.getByText(priceText, { exact: true })).toBeVisible();
  });

  test('should persist cart across page reloads', { tag: [...CART_PERSIST, '@outcome:display'] }, async ({ page }) => {
    // Add product to cart
    await page.goto('/catalog');
    await waitForPageLoad(page);

    // quality: allow-fragile-selector (product list links uniquely scoped by href pattern)
    const productCards = page.locator('a[href^="/products/"]');
    await expect(productCards.first()).toBeVisible({ timeout: 15000 });
    const firstProduct = productCards.first();
    const productTitle = ((await firstProduct.locator('h3').first().textContent()) ?? '').trim();
    await firstProduct.click();
    await waitForPageLoad(page);

    await page.locator('button:has-text("Add to cart")').click();

    // Reload page
    await page.reload();
    await waitForPageLoad(page);

    // Cart should still show THIS product, not just "something" — a
    // zustand-persist partialize bug that leaks a different/stale item
    // would still pass a bare "not empty" check.
    await page.goto('/checkout');
    await waitForPageLoad(page);

    await expect(page.getByText(productTitle)).toBeVisible();
  });

  test('adds two different products and both appear in the cart', { tag: [...CART_MULTIPLE_PRODUCTS, '@outcome:success'] }, async ({ page }) => {
    // Catches a regression where adding a second product overwrites or drops
    // the first one instead of appending a second cart line item.
    await page.goto('/catalog');
    await waitForPageLoad(page);

    // quality: allow-fragile-selector (product list links uniquely scoped by href pattern)
    const productCards = page.locator('a[href^="/products/"]');
    await expect(productCards.nth(1)).toBeVisible({ timeout: 15000 });
    const firstTitle = ((await productCards.nth(0).locator('h3').first().textContent()) ?? '').trim();
    const secondTitle = ((await productCards.nth(1).locator('h3').first().textContent()) ?? '').trim();

    await productCards.nth(0).click();
    await waitForPageLoad(page);
    await page.getByRole('button', { name: 'Add to cart' }).click();

    await page.goto('/catalog');
    await waitForPageLoad(page);
    await page.locator('a[href^="/products/"]').nth(1).click();
    await waitForPageLoad(page);
    await page.getByRole('button', { name: 'Add to cart' }).click();

    await page.goto('/checkout');
    await waitForPageLoad(page);

    await expect(page.getByText(firstTitle)).toBeVisible();
    await expect(page.getByText(secondTitle)).toBeVisible();
    // Each cart item row renders its own Remove button, so two items => two buttons.
    await expect(page.getByRole('button', { name: 'Remove' })).toHaveCount(2);
  });
});
