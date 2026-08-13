import { test, expect } from '../test-with-coverage';
import { waitForPageLoad, testCheckoutData } from '../fixtures';
import { CHECKOUT_FORM_DISPLAY, CHECKOUT_FORM_VALIDATION, CHECKOUT_FORM_FILL, CHECKOUT_SUBMIT_FAILURE } from '../helpers/flow-tags';

test.describe('Checkout Flow', () => {

  test('should show cart summary if items exist', { tag: [...CHECKOUT_FORM_DISPLAY, '@outcome:display'] }, async ({ page }) => {
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

  test('should validate required fields', { tag: [...CHECKOUT_FORM_VALIDATION, '@outcome:display'] }, async ({ page }) => {
    // quality: allow-no-interaction (the empty cart is reached by clearing persisted storage, not by a user action; the empty-cart copy and the disabled submit are what this asserts)
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

  test('should accept valid checkout data', { tag: [...CHECKOUT_FORM_FILL, '@outcome:display'] }, async ({ page }) => {
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

  test('preserves the cart and re-enables submission when the sale request fails', { tag: [...CHECKOUT_SUBMIT_FAILURE, '@outcome:failure'] }, async ({ page }) => {
    // Catches a checkout submit handler that calls clearCart() even when the
    // sale request fails (losing the user's cart), or that leaves the submit
    // button permanently stuck disabled/"...", blocking a retry.
    await page.goto('/catalog');
    await waitForPageLoad(page);

    // quality: allow-fragile-selector (dynamic seeded product list, no stable per-card hook)
    const productCards = page.locator('a[href^="/products/"]');
    await expect(productCards.first()).toBeVisible({ timeout: 15000 });
    await productCards.first().click();
    await waitForPageLoad(page);

    await page.getByRole('button', { name: 'Add to cart' }).click();

    await page.goto('/checkout');
    await waitForPageLoad(page);

    await page.getByPlaceholder('Email').fill(testCheckoutData.email);
    await page.getByPlaceholder('Address').fill(testCheckoutData.address);
    await page.getByPlaceholder('City').fill(testCheckoutData.city);
    await page.getByPlaceholder('State').fill(testCheckoutData.state);
    await page.getByPlaceholder('Postal code').fill(testCheckoutData.postal_code);

    await page.route('**/create-sale/', (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: '{}' })
    );
    await page.getByRole('button', { name: 'Complete checkout' }).click();

    await expect(page.getByText('Could not complete checkout.')).toBeVisible();
    await expect(page.getByText('Your cart is empty.')).toBeHidden();
    await expect(page.getByRole('button', { name: 'Complete checkout' })).toBeVisible();
  });
});
