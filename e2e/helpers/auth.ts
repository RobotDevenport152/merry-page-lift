import { Page } from '@playwright/test';

export const TEST_USERS = {
  regular: {
    email: process.env.E2E_USER_EMAIL || 'e2e-test@pacificalpacas-test.com',
    password: process.env.E2E_USER_PASSWORD || 'E2eTestPass123!',
  },
  grower: {
    email: process.env.E2E_GROWER_EMAIL || 'e2e-grower@pacificalpacas-test.com',
    password: process.env.E2E_GROWER_PASSWORD || 'E2eGrowerPass123!',
  },
  admin: {
    email: process.env.E2E_ADMIN_EMAIL || 'e2e-admin@pacificalpacas-test.com',
    password: process.env.E2E_ADMIN_PASSWORD || 'E2eAdminPass123!',
  },
};

export async function loginAs(page: Page, role: keyof typeof TEST_USERS) {
  const { email, password } = TEST_USERS[role];
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  // Wait for redirect away from login page
  await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 10_000 });
}

export async function logout(page: Page) {
  // Navigate to home, find logout button in nav
  await page.goto('/');
  const logoutBtn = page.getByRole('button', { name: /logout|登出/i });
  if (await logoutBtn.isVisible()) {
    await logoutBtn.click();
  }
}

export async function clearCart(page: Page) {
  await page.evaluate(() => {
    // AppContext uses React state; reload to reset
  });
  await page.reload();
}
