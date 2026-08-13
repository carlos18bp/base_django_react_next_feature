import { test, expect } from '../test-with-coverage';
import { waitForPageLoad, testCheckoutData } from '../fixtures';
import { CHECKOUT_FORM_DISPLAY, CHECKOUT_FORM_VALIDATION, CHECKOUT_FORM_FILL, CHECKOUT_SUBMIT_FAILURE, CART_EMPTY } from '../helpers/flow-tags';

test.describe('Checkout Flow', () => {

  test('shows the cart summary for a filled cart', { tag: [...CHECKOUT_FORM_DISPLAY, '@outcome:display'] }, async ({ page }) => {
    // Catches a regression where the checkout page stops rendering the cart
    // summary (title + quantity) for a product that is actually in the cart.
    await page.goto('/catalog');
    await waitForPageLoad(page);

    // quality: allow-fragile-selector (product list links uniquely scoped by href pattern)
    const productCards = page.locator('a[href^="/products/"]');
    await expect(productCards.first()).toBeVisible({ timeout: 15000 });
    const title = ((await productCards.first().locator('h3').first().textContent()) ?? '').trim();

    await productCards.first().click();
    await waitForPageLoad(page);

    await page.getByRole('button', { name: 'Add to cart' }).click();

    await page.goto('/checkout');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/.*checkout/);
    await expect(page.getByText(title)).toBeVisible();
    await expect(page.getByLabel('Qty')).toHaveValue('1');
  });

  test('shows the empty-cart message and disables checkout when the cart is empty', { tag: [...CART_EMPTY, '@outcome:display'] }, async ({ page }) => {
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

  test('rejects checkout when required shipping fields are left blank', { tag: [...CHECKOUT_FORM_VALIDATION, '@outcome:error'] }, async ({ page }) => {
    // Catches a regression where the backend's required-field validation on
    // Sale (email/address/city/state/postal_code are all non-blank on the
    // model) is silently loosened, or the frontend stops surfacing the
    // rejection — letting an incomplete order appear to succeed. The shipping
    // inputs carry no client-side `required` attribute
    // (frontend/app/checkout/page.tsx), so this is enforced by the real
    // create-sale/ endpoint; no route mock is used here on purpose.
    await page.goto('/catalog');
    await waitForPageLoad(page);

    // quality: allow-fragile-selector (product list links uniquely scoped by href pattern)
    const productCards = page.locator('a[href^="/products/"]');
    await expect(productCards.first()).toBeVisible({ timeout: 15000 });
    await productCards.first().click();
    await waitForPageLoad(page);

    await page.getByRole('button', { name: 'Add to cart' }).click();

    await page.goto('/checkout');
    await waitForPageLoad(page);
    await expect(page.getByText('Your cart is empty.')).toBeHidden();

    await page.getByRole('button', { name: 'Complete checkout' }).click();

    await expect(page.getByText('Could not complete checkout.')).toBeVisible();
    await expect(page.getByText('Your cart is empty.')).toBeHidden();
  });

  test('should accept valid checkout data', { tag: [...CHECKOUT_FORM_FILL, '@outcome:display'] }, async ({ page }) => {
    // Catches a regression where a shipping field stops accepting/reflecting
    // typed input (a broken controlled-input onChange wire-up).
    await page.goto('/checkout');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/.*checkout/);

    const emailInput = page.getByPlaceholder('Email');
    await emailInput.fill(testCheckoutData.email);
    await expect(emailInput).toHaveValue(testCheckoutData.email);

    const addressInput = page.getByPlaceholder('Address');
    await addressInput.fill(testCheckoutData.address);
    await expect(addressInput).toHaveValue(testCheckoutData.address);

    const cityInput = page.getByPlaceholder('City');
    await cityInput.fill(testCheckoutData.city);
    await expect(cityInput).toHaveValue(testCheckoutData.city);

    const stateInput = page.getByPlaceholder('State');
    await stateInput.fill(testCheckoutData.state);
    await expect(stateInput).toHaveValue(testCheckoutData.state);

    const postalCodeInput = page.getByPlaceholder('Postal code');
    await postalCodeInput.fill(testCheckoutData.postal_code);
    await expect(postalCodeInput).toHaveValue(testCheckoutData.postal_code);
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
