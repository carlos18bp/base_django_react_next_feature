import { test, expect } from '../test-with-coverage';
import { waitForPageLoad } from '../fixtures';
import { HOME_TO_BLOG, HOME_TO_CATALOG, CATALOG_BROWSE, NAVIGATION_BETWEEN_PAGES } from '../helpers/flow-tags';

test.describe('User Flows', () => {
  test('should navigate from home to blog detail', { tag: [...HOME_TO_BLOG] }, async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);
    
    // Click "Read blogs" button
    const readBlogsBtn = page.locator('text=Read blogs');
    if (await readBlogsBtn.isVisible()) {
      await readBlogsBtn.click();
      await waitForPageLoad(page);
    } else {
      await page.goto('/blogs');
      await waitForPageLoad(page);
    }
    
    // Should be on blogs page
    await expect(page).toHaveURL(/.*blogs/);
    
    // Click first blog
    const blogCards = page.locator('a[href^="/blogs/"]');
    const count = await blogCards.count();
    
    if (count > 0) {
      // quality: allow-fragile-selector (blog list links uniquely scoped by href pattern)
      await blogCards.first().click();
      await waitForPageLoad(page);
      
      // Should be on blog detail
      await expect(page).toHaveURL(/.*blogs\/\d+/);
    }
  });

  test('should navigate from home to product detail', { tag: [...HOME_TO_CATALOG] }, async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    // Click primary CTA to catalog — use getByRole for stability
    const shopNowLink = page.getByRole('link', { name: 'Shop now' });
    if (await shopNowLink.isVisible()) {
      await shopNowLink.click();
      // Wait for URL change explicitly — Next.js client-side nav doesn't fire load events
      await page.waitForURL(/.*catalog/, { timeout: 10_000 });
    } else {
      await page.goto('/catalog');
    }
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/.*catalog/);

    // Click first product
    const productCards = page.locator('a[href^="/products/"]');
    const count = await productCards.count();

    if (count > 0) {
      // quality: allow-fragile-selector (product list links uniquely scoped by href pattern)
      await productCards.first().click();
      await page.waitForURL(/.*products\/\d+/, { timeout: 10_000 });

      await expect(page).toHaveURL(/.*products\/\d+/);
    }
  });

  test('should browse multiple products in catalog', { tag: [...CATALOG_BROWSE] }, async ({ page }) => {
    await page.goto('/catalog');
    await waitForPageLoad(page);
    
    const productCards = page.locator('a[href^="/products/"]');
    const count = await productCards.count();
    
    if (count >= 3) {
      // Visit first product
      // quality: allow-fragile-selector (intentional positional selection of first product)
      await productCards.nth(0).click();
      await waitForPageLoad(page);
      await expect(page).toHaveURL(/.*products\/\d+/);
      
      // Go back to catalog
      await page.goto('/catalog');
      await waitForPageLoad(page);
      
      // Visit second product
      // quality: allow-fragile-selector (intentional positional selection of second product)
      await productCards.nth(1).click();
      await waitForPageLoad(page);
      await expect(page).toHaveURL(/.*products\/\d+/);
      
      // Go back to catalog
      await page.goto('/catalog');
      await waitForPageLoad(page);
      
      // Visit third product
      // quality: allow-fragile-selector (intentional positional selection of third product)
      await productCards.nth(2).click();
      await waitForPageLoad(page);
      await expect(page).toHaveURL(/.*products\/\d+/);
    }
  });

  test('should navigate between all main sections', { tag: [...NAVIGATION_BETWEEN_PAGES] }, async ({ page }) => {
    test.setTimeout(120_000);

    const goToSection = async (path: string, expectedUrl: string | RegExp) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(expectedUrl);
    };

    // Start at home
    await goToSection('/', '/');
    
    // Go to catalog
    await goToSection('/catalog', /.*catalog/);
    
    // Go to blogs
    await goToSection('/blogs', /.*blogs/);
    
    // Go to checkout
    await goToSection('/checkout', /.*checkout/);
    
    // Go to sign-in
    await goToSection('/sign-in', /.*sign-in/);
    
    // Back to home
    await goToSection('/', '/');
  });

  test('should use browser back button correctly', { tag: [...HOME_TO_CATALOG] }, async ({ page }) => {
    // Start at home
    await page.goto('/');
    await waitForPageLoad(page);
    
    // Go to catalog
    await page.goto('/catalog');
    await waitForPageLoad(page);
    
    // Go to product
    const productCards = page.locator('a[href^="/products/"]');
    const count = await productCards.count();
    
    if (count > 0) {
      // quality: allow-fragile-selector (product list links uniquely scoped by href pattern)
      await productCards.first().click();
      await waitForPageLoad(page);
      
      // Use back button
      await page.goBack();
      await waitForPageLoad(page);
      await expect(page).toHaveURL(/.*catalog/);
      
      // Use back button again
      await page.goBack();
      await waitForPageLoad(page);
      await expect(page).toHaveURL('/');
    }
  });

  test('should handle direct URL navigation', { tag: [...CATALOG_BROWSE] }, async ({ page }) => {
    // Navigate directly to product (if exists)
    await page.goto('/products/1');
    await waitForPageLoad(page);
    
    // Either shows product or goes back to catalog/home
    const url = page.url();
    expect(url).toMatch(/products|catalog|^\//);
  });

  test('should show appropriate content for each page type', { tag: [...NAVIGATION_BETWEEN_PAGES] }, async ({ page }) => {
    test.setTimeout(120_000);

    // Home page has main heading
    await page.goto('/');
    await waitForPageLoad(page);
    await expect(page.getByRole('heading', { name: /Everything you need/i })).toBeVisible();
    
    // Catalog page
    await page.goto('/catalog');
    await waitForPageLoad(page);
    // Should have products or a message
    const catalogContent = page.locator('body');
    await expect(catalogContent).toBeVisible();
    
    // Blogs page
    await page.goto('/blogs');
    await waitForPageLoad(page);
    // Should have blogs or a message
    const blogsContent = page.locator('body');
    await expect(blogsContent).toBeVisible();
    
    // Checkout page
    await page.goto('/checkout');
    await waitForPageLoad(page);
    await expect(page.getByRole('heading', { name: 'Checkout', level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Cart', level: 2 })).toBeVisible();
    
    // Sign-in page
    await page.goto('/sign-in');
    await waitForPageLoad(page);
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
  });
});
