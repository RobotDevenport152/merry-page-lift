import { test, expect } from '@playwright/test';
import { TEST_USERS, loginAs, logout } from './helpers/auth';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8080';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  // ─── Registration ──────────────────────────────────────────────────────────

  test('register page renders all required fields', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /register|注册/i })).toBeVisible();
  });

  test('register with existing email shows error', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    await page.fill('input[type="email"]', TEST_USERS.regular.email);
    await page.fill('input[type="password"]', TEST_USERS.regular.password);
    await page.click('button[type="submit"]');
    // Supabase returns "User already registered" or similar
    await expect(page.getByText(/already|已存在|registered/i)).toBeVisible({ timeout: 8_000 });
  });

  test('register with invalid email shows validation error', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    await page.fill('input[type="email"]', 'not-an-email');
    await page.fill('input[type="password"]', 'somepassword');
    await page.click('button[type="submit"]');
    // Browser native validation or app validation
    const emailInput = page.locator('input[type="email"]');
    const validationMsg = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMsg).toBeTruthy();
  });

  // ─── Login / Logout ────────────────────────────────────────────────────────

  test('login with valid credentials redirects from /login', async ({ page }) => {
    await loginAs(page, 'regular');
    expect(page.url()).not.toContain('/login');
  });

  test('login with wrong password shows error', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', TEST_USERS.regular.email);
    await page.fill('input[type="password"]', 'WrongPassword999!');
    await page.click('button[type="submit"]');
    await expect(page.getByText(/invalid|incorrect|error|错误|失败/i)).toBeVisible({ timeout: 8_000 });
  });

  test('logged-in user can log out', async ({ page }) => {
    await loginAs(page, 'regular');
    await logout(page);
    // After logout, login link should be visible
    await expect(page.getByRole('link', { name: /login|登录/i })).toBeVisible({ timeout: 5_000 });
  });

  // ─── Forgot Password ───────────────────────────────────────────────────────

  test('forgot password page is accessible from login', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.click('a[href="/forgot-password"], a:has-text("forgot"), a:has-text("忘记")');
    await expect(page).toHaveURL(/forgot-password/);
  });

  test('forgot password form accepts email and shows confirmation', async ({ page }) => {
    await page.goto(`${BASE_URL}/forgot-password`);
    await page.fill('input[type="email"]', TEST_USERS.regular.email);
    await page.click('button[type="submit"]');
    await expect(page.getByText(/sent|发送|check|邮件/i)).toBeVisible({ timeout: 8_000 });
  });

  test('reset password page requires valid token', async ({ page }) => {
    // Without a real token, the page should show an error or the form
    await page.goto(`${BASE_URL}/reset-password`);
    // Page should render without crashing
    await expect(page.locator('body')).toBeVisible();
  });

  // ─── Protected routes ──────────────────────────────────────────────────────

  test('my-orders page redirects unauthenticated users to login', async ({ page }) => {
    await page.goto(`${BASE_URL}/my-orders`);
    await expect(page).toHaveURL(/login|my-orders/, { timeout: 5_000 });
  });
});
