import { test, expect } from '../test-with-coverage';
import { waitForPageLoad } from '../fixtures';
import { CATALOG_BROWSE, CATALOG_PRODUCT_DETAIL, CATALOG_PRODUCT_GALLERY, CATALOG_BACK_NAVIGATION } from '../helpers/flow-tags';

test.describe('Product Pages', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/catalog');
    await waitForPageLoad(page);
  });

  test('should display products catalog page', { tag: [...CATALOG_BROWSE] }, async ({ page }) => {
    // Check if the page loaded
    await expect(page).toHaveURL(/.*catalog/);
    
    // Check for product cards (if any exist)
    const productCards = page.locator('a[href^="/products/"]');
    const count = await productCards.count();
    
    if (count > 0) {
      // Verify first product card is visible
      // quality: allow-fragile-selector (product list links uniquely scoped by href pattern)
      await expect(productCards.first()).toBeVisible();
    }
  });

  test('should navigate to product detail page', { tag: [...CATALOG_PRODUCT_DETAIL] }, async ({ page }) => {
    // Find and click the first product card
    // quality: allow-fragile-selector (product list links uniquely scoped by href pattern)
    const firstProductCard = page.locator('a[href^="/products/"]').first();
    const count = await page.locator('a[href^="/products/"]').count();
    
    if (count > 0) {
      await firstProductCard.click();
      await waitForPageLoad(page);
      
      // Verify we're on a product detail page
      await expect(page).toHaveURL(/.*products\/\d+/);
    }
  });

  test('should show product details including price', { tag: [...CATALOG_PRODUCT_DETAIL] }, async ({ page }) => {
    const productCards = page.locator('a[href^="/products/"]');
    const count = await productCards.count();
    
    if (count > 0) {
      // Get product info from list
      // quality: allow-fragile-selector (product list links uniquely scoped by href pattern)
      const firstCard = productCards.first();
      const titleInList = await firstCard.locator('h3').textContent();
      
      // Click to go to detail
      await firstCard.click();
      await waitForPageLoad(page);
      
      // Verify title appears on detail page
      if (titleInList) {
        await expect(page.locator(`text=${titleInList}`)).toBeVisible();
      }
      
      // Verify price is shown (starts with $)
      await expect(page.locator('text=/\\$\\d+/')).toBeVisible();
    }
  });

  test('should display product gallery images', { tag: [...CATALOG_PRODUCT_GALLERY] }, async ({ page }) => {
    const productCards = page.locator('a[href^="/products/"]');
    const count = await productCards.count();
    
    if (count > 0) {
      // quality: allow-fragile-selector (product list links uniquely scoped by href pattern)
      await productCards.first().click();
      await waitForPageLoad(page);
      
      // Check if images are present
      const images = page.locator('img');
      const imageCount = await images.count();
      expect(imageCount).toBeGreaterThan(0);
    }
  });

  test('should navigate back to catalog from detail', { tag: [...CATALOG_BACK_NAVIGATION] }, async ({ page }) => {
    const productCards = page.locator('a[href^="/products/"]');
    const count = await productCards.count();
    
    if (count > 0) {
      // quality: allow-fragile-selector (product list links uniquely scoped by href pattern)
      await productCards.first().click();
      await waitForPageLoad(page);
      
      // Go back
      await page.goBack();
      await waitForPageLoad(page);
      
      // Verify we're back on catalog
      await expect(page).toHaveURL(/.*catalog/);
    }
  });
});
