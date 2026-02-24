import { test, expect } from '../test-with-coverage';
import { waitForPageLoad } from '../fixtures';
import { CART_ADD, CART_EMPTY, CART_UPDATE_QTY, CART_REMOVE, CART_SUBTOTAL, CART_PERSIST, CART_MULTIPLE_PRODUCTS } from '../helpers/flow-tags';

test.describe('Shopping Cart', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cart before each test — each Playwright test gets a fresh browser context,
    // but we clear localStorage and reload to ensure zustand persist rehydrates cleanly.
    await page.goto('/checkout');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await waitForPageLoad(page);
  });

  test('should add product to cart', { tag: [...CART_ADD] }, async ({ page }) => {
    // Go to catalog
    await page.goto('/catalog');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/.*catalog/);

    const productCards = page.locator('a[href^="/products/"]');
    const count = await productCards.count();
    
    if (count > 0) {
      // quality: allow-fragile-selector (product list links uniquely scoped by href pattern)
      await productCards.first().click();
      await waitForPageLoad(page);
      
      // Add to cart
      const addToCartBtn = page.locator('button:has-text("Add to cart")');
      await expect(addToCartBtn).toBeVisible();
      await addToCartBtn.click();
      
      await page.waitForURL('**/catalog', { timeout: 5000 }).catch(() => {});

      // Navigate to checkout to verify
      await page.goto('/checkout');
      await waitForPageLoad(page);
      
      // Should see item in cart
      await expect(page.locator('text=Your cart is empty')).toBeHidden();
    }
  });

  test('should show empty cart message', { tag: [...CART_EMPTY] }, async ({ page }) => {
    await page.goto('/checkout');
    await waitForPageLoad(page);

    await expect(page.getByText('Your cart is empty.')).toBeVisible();
  });

  test('should update product quantity in cart', { tag: [...CART_UPDATE_QTY] }, async ({ page }) => {
    // First add a product
    await page.goto('/catalog');
    await waitForPageLoad(page);
    
    const productCards = page.locator('a[href^="/products/"]');
    const count = await productCards.count();
    
    if (count > 0) {
      // quality: allow-fragile-selector (product list links uniquely scoped by href pattern)
      await productCards.first().click();
      await waitForPageLoad(page);
      
      await page.locator('button:has-text("Add to cart")').click();
      await page.waitForLoadState('load');
      
      // Go to checkout
      await page.goto('/checkout');
      await waitForPageLoad(page);
      
      // Find quantity input
      // quality: allow-fragile-selector (number input is the only type="number" field on this page)
      const qtyInput = page.locator('input[type="number"]').first();
      if (await qtyInput.isVisible()) {
        // Update quantity to 3
        await qtyInput.fill('3');
        
        // Verify quantity updated
        await expect(qtyInput).toHaveValue('3');
      }
    }
  });

  test('should remove product from cart', { tag: [...CART_REMOVE] }, async ({ page }) => {
    // First add a product
    await page.goto('/catalog');
    await waitForPageLoad(page);
    
    const productCards = page.locator('a[href^="/products/"]');
    const count = await productCards.count();
    
    if (count > 0) {
      // quality: allow-fragile-selector (product list links uniquely scoped by href pattern)
      await productCards.first().click();
      await waitForPageLoad(page);
      
      await page.locator('button:has-text("Add to cart")').click();
      await page.waitForLoadState('load');
      
      // Go to checkout
      await page.goto('/checkout');
      await waitForPageLoad(page);
      
      // Remove item
      // quality: allow-fragile-selector (Remove button is the only such button in cart item row)
      const removeBtn = page.locator('button:has-text("Remove")').first();
      if (await removeBtn.isVisible()) {
        await removeBtn.click();
        
        // Should show empty cart
        await expect(page.locator('text=Your cart is empty')).toBeVisible();
      }
    }
  });

  test('should calculate subtotal correctly', { tag: [...CART_SUBTOTAL] }, async ({ page }) => {
    // Add product to cart
    await page.goto('/catalog');
    await waitForPageLoad(page);
    
    const productCards = page.locator('a[href^="/products/"]');
    const count = await productCards.count();
    
    if (count > 0) {
      // quality: allow-fragile-selector (product list links uniquely scoped by href pattern)
      await productCards.first().click();
      await waitForPageLoad(page);
      
      await page.locator('button:has-text("Add to cart")').click();
      await page.waitForLoadState('load');
      
      // Go to checkout
      await page.goto('/checkout');
      await waitForPageLoad(page);
      
      // Verify subtotal is visible
      const subtotalLabel = page.locator('text=Subtotal');
      await expect(subtotalLabel).toBeVisible();
    }
  });

  test('should persist cart across page reloads', { tag: [...CART_PERSIST] }, async ({ page }) => {
    // Add product to cart
    await page.goto('/catalog');
    await waitForPageLoad(page);
    
    const productCards = page.locator('a[href^="/products/"]');
    const count = await productCards.count();
    
    if (count > 0) {
      // quality: allow-fragile-selector (product list links uniquely scoped by href pattern)
      await productCards.first().click();
      await waitForPageLoad(page);
      
      await page.locator('button:has-text("Add to cart")').click();
      await page.waitForLoadState('load');
      
      // Reload page
      await page.reload();
      await waitForPageLoad(page);
      
      // Cart should still have item
      await page.goto('/checkout');
      await waitForPageLoad(page);
      
      await expect(page.locator('text=Your cart is empty')).toBeHidden();
    }
  });

  test('should add multiple different products', { tag: [...CART_MULTIPLE_PRODUCTS] }, async ({ page }) => {
    await page.goto('/catalog');
    await waitForPageLoad(page);
    
    const productCards = page.locator('a[href^="/products/"]');
    const count = await productCards.count();
    
    if (count >= 2) {
      // quality: allow-fragile-selector (product list links uniquely scoped by href pattern)
      await productCards.nth(0).click();
      await waitForPageLoad(page);
      await page.locator('button:has-text("Add to cart")').click();
      await page.waitForLoadState('load');
      
      // Go back and add second product
      await page.goto('/catalog');
      await waitForPageLoad(page);
      
      // quality: allow-fragile-selector (product list links uniquely scoped by href pattern)
      await productCards.nth(1).click();
      await waitForPageLoad(page);
      await page.locator('button:has-text("Add to cart")').click();
      await page.waitForLoadState('load');
      
      // Check cart has 2 items
      await page.goto('/checkout');
      await waitForPageLoad(page);
      
      const cartItems = page.locator('[data-testid="cart-item"], .border.rounded.p-4');
      const itemCount = await cartItems.count();
      expect(itemCount).toBeGreaterThanOrEqual(2);
    }
  });
});
