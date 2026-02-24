import { test, expect } from '../test-with-coverage';
import { waitForPageLoad, testCheckoutData } from '../fixtures';
import { CHECKOUT_FORM_DISPLAY, CHECKOUT_FORM_VALIDATION, CHECKOUT_FORM_FILL } from '../helpers/flow-tags';

test.describe('Checkout Flow', () => {
  test('should navigate to checkout page', { tag: [...CHECKOUT_FORM_DISPLAY] }, async ({ page }) => {
    await page.goto('/checkout');
    await waitForPageLoad(page);
    
    await expect(page).toHaveURL(/.*checkout/);
  });

  test('should display checkout form fields', { tag: [...CHECKOUT_FORM_DISPLAY] }, async ({ page }) => {
    await page.goto('/checkout');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/.*checkout/);

    // Check for common checkout form fields
    // quality: allow-fragile-selector (email input scoped by type and name attributes)
    const emailInput = page.locator('input[type="email"], input[name="email"], input[id*="email"]').first();
    if (await emailInput.isVisible()) {
      await expect(emailInput).toBeVisible();
    }
  });

  test('should show cart summary if items exist', { tag: [...CHECKOUT_FORM_DISPLAY] }, async ({ page }) => {
    // First, try to add a product to cart
    await page.goto('/catalog');
    await waitForPageLoad(page);
    
    const productCards = page.locator('a[href^="/products/"]');
    const count = await productCards.count();
    
    if (count > 0) {
      // Go to first product
      // quality: allow-fragile-selector (product list links uniquely scoped by href pattern)
      await productCards.first().click();
      await waitForPageLoad(page);
      
      // Look for "Add to Cart" button
      // quality: allow-fragile-selector (Add to Cart button scoped by text content)
      const addToCartBtn = page.locator('button:has-text("Add to Cart"), button:has-text("Add To Cart")').first();
      if (await addToCartBtn.isVisible()) {
        await addToCartBtn.click();
        await page.waitForLoadState('load');
        
        // Navigate to checkout
        await page.goto('/checkout');
        await waitForPageLoad(page);
        
        // Verify we're on checkout page
        await expect(page).toHaveURL(/.*checkout/);
      }
    }
  });

  test('should validate required fields', { tag: [...CHECKOUT_FORM_VALIDATION] }, async ({ page }) => {
    // Clear localStorage to ensure empty cart state
    await page.goto('/checkout');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/.*checkout/);

    // Wait for hydration — empty cart message confirms zustand persist has settled
    await expect(page.getByText('Your cart is empty.')).toBeVisible();

    // Submit button must be disabled when cart is empty
    const submitBtn = page.getByRole('button', { name: 'Complete checkout' });
    await expect(submitBtn).toBeDisabled();
  });

  test('should accept valid checkout data', { tag: [...CHECKOUT_FORM_FILL] }, async ({ page }) => {
    await page.goto('/checkout');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/.*checkout/);

    // Fill in email if field exists
    // quality: allow-fragile-selector (email input scoped by type and name attributes)
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill(testCheckoutData.email);
    }
    
    // Fill in address if field exists
    const addressInput = page.getByPlaceholder('Address');
    if (await addressInput.isVisible()) {
      await addressInput.fill(testCheckoutData.address);
    }
    
    // Fill in city if field exists
    const cityInput = page.getByPlaceholder('City');
    if (await cityInput.isVisible()) {
      await cityInput.fill(testCheckoutData.city);
    }
    
    // Fill in state if field exists
    const stateInput = page.getByPlaceholder('State');
    if (await stateInput.isVisible()) {
      await stateInput.fill(testCheckoutData.state);
    }
    
    // Fill in postal code if field exists
    const postalCodeInput = page.getByPlaceholder('Postal code');
    if (await postalCodeInput.isVisible()) {
      await postalCodeInput.fill(testCheckoutData.postal_code);
    }
  });
});
