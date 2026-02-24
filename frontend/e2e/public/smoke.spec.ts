import { expect, test } from '../test-with-coverage';
import { HOME_LOADS } from '../helpers/flow-tags';

test('home page loads', { tag: [...HOME_LOADS] }, async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Everything you need, in one place' })).toBeVisible();
});
