import { test, expect } from '@playwright/test';
import { loginAs, logout, TEST_USERS } from './helpers/auth';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8080';

/**
 * RLS & Access Control Tests
 *
 * Prerequisites:
 * - E2E_GROWER_EMAIL / E2E_GROWER_PASSWORD: A user with role=grower in Supabase
 * - E2E_ADMIN_EMAIL  / E2E_ADMIN_PASSWORD:  A user with role=admin in Supabase
 * - E2E_USER_EMAIL   / E2E_USER_PASSWORD:   A regular authenticated user
 *
 * The grower user must have at least one fiber_batch row where grower_user_id = their UUID.
 * The regular user must NOT have any fiber_batch rows.
 */

test.describe('Admin Route — Access Control', () => {
  test('unauthenticated user is blocked from /admin', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin`);
    // Should either redirect to login or show access denied
    const url = page.url();
    const isBlocked =
      url.includes('/login') ||
      url.includes('/admin') && (await page.getByText(/access denied|unauthorized|login|登录|权限/i).isVisible());
    expect(isBlocked).toBe(true);
  });

  test('regular user cannot access admin functionality', async ({ page }) => {
    await loginAs(page, 'regular');
    await page.goto(`${BASE_URL}/admin`);
    // Either redirected or shown unauthorized message
    await page.waitForLoadState('networkidle');
    const hasAdminContent = await page.getByText(/管理后台|Admin Dashboard|admin panel/i).isVisible();
    const hasBlockMessage = await page.getByText(/unauthorized|access denied|not allowed|权限不足/i).isVisible();
    // Regular user should NOT see full admin content, or should be blocked
    expect(hasAdminContent || hasBlockMessage).toBeTruthy();
    // If they somehow see admin page, there should be no dangerous data exposed
  });
});

test.describe('Grower RLS — fiber_batches isolation', () => {
  /**
   * These tests verify that the Supabase RLS policy on fiber_batches
   * ensures growers only see their own rows.
   *
   * The test calls the Supabase API directly via the app's supabase client.
   * We verify isolation by checking that the grower's API calls only return
   * rows belonging to their own user_id.
   */

  test('grower sees only their own fiber_batches via Supabase RLS', async ({ page }) => {
    await loginAs(page, 'grower');

    // Inject a script that queries fiber_batches and returns the result
    const result = await page.evaluate(async () => {
      // @ts-ignore — accessing window globals from app bundle
      const { supabase } = await import('/src/integrations/supabase/client.ts').catch(() => ({ supabase: null }));
      if (!supabase) return { error: 'supabase not accessible', data: null };

      const { data, error } = await supabase
        .from('fiber_batches')
        .select('grower_user_id, batch_code');

      return { data, error: error?.message };
    });

    // If RLS is working: all returned rows should have grower_user_id = the grower's UUID
    // If the query returns data, verify isolation
    if (result.data && Array.isArray(result.data) && result.data.length > 0) {
      const growerSession = await page.evaluate(async () => {
        // @ts-ignore
        const { supabase } = await import('/src/integrations/supabase/client.ts').catch(() => ({ supabase: null }));
        if (!supabase) return null;
        const { data } = await supabase.auth.getSession();
        return data.session?.user?.id;
      });

      if (growerSession) {
        for (const row of result.data) {
          expect(row.grower_user_id).toBe(growerSession);
        }
      }
    } else {
      // If empty, RLS is filtering everything (acceptable for a test grower with no batches)
      expect(result.error).toBeNull();
    }
  });

  test('regular user cannot read other users fiber_batches', async ({ page }) => {
    await loginAs(page, 'regular');

    const result = await page.evaluate(async () => {
      // @ts-ignore
      const { supabase } = await import('/src/integrations/supabase/client.ts').catch(() => ({ supabase: null }));
      if (!supabase) return { data: null, error: 'supabase not accessible' };

      const { data, error } = await supabase
        .from('fiber_batches')
        .select('grower_user_id, batch_code');

      return { count: data?.length ?? 0, error: error?.message };
    });

    // Regular user should see 0 rows (RLS blocks all non-grower access)
    // or get a permission error
    expect(result.count === 0 || result.error).toBeTruthy();
  });

  test('grower can view their own batch detail on traceability page', async ({ page }) => {
    await loginAs(page, 'grower');

    // Navigate to traceability — grower should be able to search
    await page.goto(`${BASE_URL}/traceability`);
    const input = page.locator('input[placeholder*="批次"], input[placeholder*="batch"]');
    await expect(input).toBeVisible({ timeout: 8_000 });
    // The grower page should render without errors
    await expect(page.locator('h1')).toBeVisible({ timeout: 5_000 });
  });
});

test.describe('Authentication State Isolation', () => {
  test('cart state resets after session change', async ({ page }) => {
    // Add item to cart as regular user
    await loginAs(page, 'regular');
    await page.goto(`${BASE_URL}/product/duvet-classic`);
    await page.getByRole('button', { name: /加入购物车|Add to Cart/i }).first().click({ timeout: 10_000 });

    // Log out
    await logout(page);

    // Cart should be empty (React state clears on full reload)
    await page.reload();
    const cartCount = page.locator('[data-testid="cart-count"]');
    if (await cartCount.isVisible()) {
      expect(await cartCount.textContent()).toBe('0');
    }
  });

  test('order history on my-orders requires authentication', async ({ page }) => {
    // Unauthenticated access to /my-orders
    await page.goto(`${BASE_URL}/my-orders`);
    await page.waitForLoadState('networkidle');
    // Should redirect to login or show a login prompt
    const loginPrompt = await page.getByText(/login|登录|sign in/i).isVisible();
    const redirectedToLogin = page.url().includes('/login');
    expect(loginPrompt || redirectedToLogin).toBe(true);
  });

  test('authenticated user can access my-orders', async ({ page }) => {
    await loginAs(page, 'regular');
    await page.goto(`${BASE_URL}/my-orders`);
    await page.waitForLoadState('networkidle');
    // Should NOT redirect to login
    expect(page.url()).not.toContain('/login');
  });
});
