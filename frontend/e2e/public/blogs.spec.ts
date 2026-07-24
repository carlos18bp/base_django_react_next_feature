import { test, expect } from '../test-with-coverage';
import { waitForPageLoad } from '../fixtures';
import { BLOG_LIST_VIEW, BLOG_DETAIL_VIEW, BLOG_DETAIL_BACK } from '../helpers/flow-tags';

test.describe('Blog Pages', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/blogs');
    await waitForPageLoad(page);
  });

  test('reaches the blogs list from the header and shows blog cards', { tag: [...BLOG_LIST_VIEW] }, async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    // quality: allow-fragile-selector (blogs link appears in header and footer; first nav occurrence)
    await page.locator('a[href="/blogs"]').first().click();
    await expect(page).toHaveURL(/.*blogs/);

    // quality: allow-fragile-selector (blog list links uniquely scoped by href pattern)
    const blogCards = page.locator('a[href^="/blogs/"]');
    await expect(blogCards.first()).toBeVisible({ timeout: 15000 });
    await expect(blogCards.first()).toHaveAttribute('href', /\/blogs\/\d+/);
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

  test('the blog detail shows the post title from the list', { tag: [...BLOG_DETAIL_VIEW] }, async ({ page }) => {
    // quality: allow-fragile-selector (blog list links uniquely scoped by href pattern)
    const firstCard = page.locator('a[href^="/blogs/"]').first();
    await expect(firstCard).toBeVisible({ timeout: 15000 });
    const title = ((await firstCard.locator('h3').first().textContent()) ?? '').trim();

    await firstCard.click();
    await waitForPageLoad(page);
    await expect(page).toHaveURL(/.*blogs\/\d+/);

    if (title) {
      await expect(page.getByText(title, { exact: false }).first()).toBeVisible();
    } else {
      await expect(page.getByRole('heading').first()).not.toHaveText('');
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
