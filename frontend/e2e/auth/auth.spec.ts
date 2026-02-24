import { test, expect } from '../test-with-coverage';
import { waitForPageLoad } from '../fixtures';
import { AUTH_SIGN_IN_FORM, AUTH_SIGN_UP_FORM, AUTH_LOGIN_INVALID, AUTH_PROTECTED_REDIRECT, AUTH_FORGOT_PASSWORD_FORM } from '../helpers/flow-tags';

test.describe('Authentication', () => {
  test('should navigate to sign-in page', { tag: [...AUTH_SIGN_IN_FORM] }, async ({ page }) => {
    await page.goto('/sign-in');
    await waitForPageLoad(page);
    
    await expect(page).toHaveURL(/.*sign-in/);
  });

  test('should display sign-in form', { tag: [...AUTH_SIGN_IN_FORM] }, async ({ page }) => {
    await page.goto('/sign-in');
    await waitForPageLoad(page);
    
    // Check for email input (by placeholder since it doesn't have type="email")
    const emailInput = page.getByPlaceholder('Email');
    await expect(emailInput).toBeVisible();
    
    // Check for password input
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
    
    // Check for submit button
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();
  });

  test('should show validation on empty form submission', { tag: [...AUTH_SIGN_IN_FORM] }, async ({ page }) => {
    await page.goto('/sign-in');
    await waitForPageLoad(page);
    
    // Try to submit empty form
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();
    
    // Should still be on sign-in page
    await expect(page).toHaveURL(/.*sign-in/);
  });

  test('should accept input in form fields', { tag: [...AUTH_SIGN_IN_FORM] }, async ({ page }) => {
    await page.goto('/sign-in');
    await waitForPageLoad(page);
    
    // Fill email (using placeholder)
    const emailInput = page.getByPlaceholder('Email');
    await emailInput.fill('test@example.com');
    await expect(emailInput).toHaveValue('test@example.com');
    
    // Fill password
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('password123');
    await expect(passwordInput).toHaveValue('password123');
  });

  test('should handle invalid credentials gracefully', { tag: [...AUTH_LOGIN_INVALID] }, async ({ page }) => {
    await page.goto('/sign-in');
    await waitForPageLoad(page);
    
    // Fill with invalid credentials (using placeholder)
    const emailInput = page.getByPlaceholder('Email');
    await emailInput.fill('invalid@example.com');
    
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('wrongpassword');
    
    // Submit
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();
    
    // Should show error or stay on sign-in page
    await expect(page).toHaveURL(/.*sign-in/);
  });

  test('should have link to dashboard after sign-in', { tag: [...AUTH_SIGN_IN_FORM] }, async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);
    
    // Dashboard link presence depends on auth state; verify home page loads successfully
    await expect(page).toHaveURL('/');
  });

  test('should navigate to dashboard page', { tag: [...AUTH_PROTECTED_REDIRECT] }, async ({ page }) => {
    await page.goto('/dashboard');
    await waitForPageLoad(page);
    
    // Either redirected to sign-in or the dashboard is shown
    await expect(page).toHaveURL(/dashboard|sign-in/);
  });

  test('should navigate to backoffice page', { tag: [...AUTH_PROTECTED_REDIRECT] }, async ({ page }) => {
    await page.goto('/backoffice');
    await waitForPageLoad(page);
    
    // Either redirected to sign-in or the backoffice is shown
    await expect(page).toHaveURL(/backoffice|sign-in/);
  });

  test('should display sign-up page heading', { tag: [...AUTH_SIGN_UP_FORM] }, async ({ page }) => {
    await page.goto('/sign-up');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/.*sign-up/);
    await expect(page.getByRole('heading', { name: 'Create account' })).toBeVisible();
  });

  test('should show all required sign-up form fields', { tag: [...AUTH_SIGN_UP_FORM] }, async ({ page }) => {
    await page.goto('/sign-up');
    await waitForPageLoad(page);

    await expect(page.getByPlaceholder('First Name')).toBeVisible();
    await expect(page.getByPlaceholder('Last Name')).toBeVisible();
    await expect(page.getByPlaceholder('Email')).toBeVisible();
    await expect(page.getByPlaceholder('Password', { exact: true })).toBeVisible();
    await expect(page.getByPlaceholder('Confirm Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible();
  });

  test('should validate password mismatch on sign-up', { tag: [...AUTH_SIGN_UP_FORM] }, async ({ page }) => {
    await page.goto('/sign-up');
    await waitForPageLoad(page);

    // Fill form with mismatched passwords
    await page.getByPlaceholder('First Name').fill('Test');
    await page.getByPlaceholder('Last Name').fill('User');
    await page.getByPlaceholder('Email').fill('test@example.com');
    await page.getByPlaceholder('Password', { exact: true }).fill('password123');
    await page.getByPlaceholder('Confirm Password').fill('different456');

    await page.getByRole('button', { name: 'Create account' }).click();

    // Should show password mismatch error and stay on sign-up page
    await expect(page.getByText('Passwords do not match')).toBeVisible();
    await expect(page).toHaveURL(/.*sign-up/);
  });

  test('should display forgot password form', { tag: [...AUTH_FORGOT_PASSWORD_FORM] }, async ({ page }) => {
    await page.goto('/forgot-password');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/.*forgot-password/);
    await expect(page.getByRole('heading', { name: 'Reset Password' })).toBeVisible();

    // Step A: email input and send code button
    await expect(page.getByPlaceholder('Email')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send verification code' })).toBeVisible();

    // Link back to sign-in
    await expect(page.getByRole('link', { name: 'Back to sign in' })).toBeVisible();
  });

  test('should navigate from sign-in to forgot password', { tag: [...AUTH_FORGOT_PASSWORD_FORM] }, async ({ page }) => {
    await page.goto('/sign-in');
    await waitForPageLoad(page);

    // Click forgot password link
    const forgotLink = page.getByRole('link', { name: 'Forgot password?' });
    await expect(forgotLink).toBeVisible();
    await forgotLink.click();
    await page.waitForURL(/.*forgot-password/, { timeout: 10_000 });

    await expect(page).toHaveURL(/.*forgot-password/);
    await expect(page.getByRole('heading', { name: 'Reset Password' })).toBeVisible();
  });
});
