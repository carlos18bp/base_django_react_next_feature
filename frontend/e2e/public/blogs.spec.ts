import { test, expect } from '../test-with-coverage';
import { waitForPageLoad } from '../fixtures';
import { BLOG_LIST_VIEW, BLOG_DETAIL_VIEW, BLOG_DETAIL_BACK } from '../helpers/flow-tags';

test.describe('Blog Pages', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/blogs');
    await waitForPageLoad(page);
  });

  test('reaches the blogs list from the header and shows blog cards', { tag: [...BLOG_LIST_VIEW, '@outcome:display'] }, async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    await page.getByRole('banner').getByRole('link', { name: 'Blogs' }).click();
    await expect(page).toHaveURL(/.*blogs/);

    // quality: allow-fragile-selector (blog list links uniquely scoped by href pattern)
    const blogCards = page.locator('a[href^="/blogs/"]');
    await expect(blogCards.first()).toBeVisible({ timeout: 15000 });
    await expect(blogCards.first()).toHaveAttribute('href', /\/blogs\/\d+/);
  });

  test('shows the blogs error state when the blog list request fails', { tag: [...BLOG_LIST_VIEW, '@outcome:failure'] }, async ({ page }) => {
    // Catches a regression that leaves the blogs page stuck on its loading
    // skeleton (or crashes) instead of showing the error+retry affordance
    // when the blog list request fails.
    // quality: allow-no-interaction (the error state renders automatically from the failed background fetch on page mount; there is no prior user action that triggers it)
    await page.route('**/blogs/', (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: '{}' })
    );

    await page.goto('/blogs');
    await waitForPageLoad(page);

    await expect(page.getByText('Blogs unavailable')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
  });

  test('should navigate to blog detail page', { tag: [...BLOG_DETAIL_VIEW, '@outcome:display'] }, async ({ page }) => {
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

  test('the blog detail shows the post title from the list', { tag: [...BLOG_DETAIL_VIEW, '@outcome:display'] }, async ({ page }) => {
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

  test('should navigate back to blogs list from detail', { tag: [...BLOG_DETAIL_BACK, '@outcome:success'] }, async ({ page }) => {
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
