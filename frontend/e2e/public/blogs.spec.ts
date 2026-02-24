import { test, expect } from '../test-with-coverage';
import { waitForPageLoad } from '../fixtures';
import { BLOG_LIST_VIEW, BLOG_DETAIL_VIEW, BLOG_DETAIL_BACK } from '../helpers/flow-tags';

test.describe('Blog Pages', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/blogs');
    await waitForPageLoad(page);
  });

  test('should display blogs list page', { tag: [...BLOG_LIST_VIEW] }, async ({ page }) => {
    // Check if the page loaded
    await expect(page).toHaveURL(/.*blogs/);
    
    // Check for blog cards (if any exist)
    const blogCards = page.locator('a[href^="/blogs/"]');
    const count = await blogCards.count();
    
    if (count > 0) {
      // Verify first blog card is visible
      // quality: allow-fragile-selector (blog list links uniquely scoped by href pattern)
      await expect(blogCards.first()).toBeVisible();
    }
  });

  test('should navigate to blog detail page', { tag: [...BLOG_DETAIL_VIEW] }, async ({ page }) => {
    // Find and click the first blog card
    // quality: allow-fragile-selector (blog list links uniquely scoped by href pattern)
    const firstBlogCard = page.locator('a[href^="/blogs/"]').first();
    const count = await page.locator('a[href^="/blogs/"]').count();
    
    if (count > 0) {
      await firstBlogCard.click();
      await waitForPageLoad(page);
      
      // Verify we're on a blog detail page
      await expect(page).toHaveURL(/.*blogs\/\d+/);
    }
  });

  test('should show blog details', { tag: [...BLOG_DETAIL_VIEW] }, async ({ page }) => {
    const blogCards = page.locator('a[href^="/blogs/"]');
    const count = await blogCards.count();
    
    if (count > 0) {
      // Get blog title from list
      // quality: allow-fragile-selector (blog list links uniquely scoped by href pattern)
      const firstCard = blogCards.first();
      const titleInList = await firstCard.locator('h3').textContent();
      
      // Click to go to detail
      await firstCard.click();
      await waitForPageLoad(page);
      
      // Verify title appears on detail page
      if (titleInList) {
        await expect(page.locator(`text=${titleInList}`)).toBeVisible();
      }
    }
  });

  test('should navigate back to blogs list from detail', { tag: [...BLOG_DETAIL_BACK] }, async ({ page }) => {
    const blogCards = page.locator('a[href^="/blogs/"]');
    const count = await blogCards.count();
    
    if (count > 0) {
      // quality: allow-fragile-selector (blog list links uniquely scoped by href pattern)
      await blogCards.first().click();
      await waitForPageLoad(page);
      
      // Go back
      await page.goBack();
      await waitForPageLoad(page);
      
      // Verify we're back on blogs list
      await expect(page).toHaveURL(/.*blogs$/);
    }
  });
});
