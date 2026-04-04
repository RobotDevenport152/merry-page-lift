import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8080';

test.describe('Traceability System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/traceability`);
  });

  // ─── Valid batch code ──────────────────────────────────────────────────────

  test('searching PA-2025-001 returns batch data', async ({ page }) => {
    const input = page.locator('input[placeholder*="批次"], input[placeholder*="batch"]');
    await expect(input).toBeVisible({ timeout: 8_000 });
    await input.fill('PA-2025-001');
    await page.getByRole('button', { name: /查询|Search/i }).click();

    // Should show batch result card
    await expect(page.getByText('PA-2025-001')).toBeVisible({ timeout: 8_000 });
    await expect(page.getByText(/Canterbury Hills Farm|Canterbury/i)).toBeVisible({ timeout: 5_000 });
  });

  test('batch result shows farm, weight, micron, and grade', async ({ page }) => {
    const input = page.locator('input[placeholder*="批次"], input[placeholder*="batch"]');
    await input.fill('PA-2025-001');
    await page.getByRole('button', { name: /查询|Search/i }).click();

    await page.getByText('PA-2025-001').waitFor({ timeout: 8_000 });

    // Key data points
    await expect(page.getByText(/45\.2.*kg|45\.2/i)).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText(/22\.5.*μm|22\.5/i)).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText(/A\+|grade/i)).toBeVisible({ timeout: 5_000 });
  });

  test('batch result shows processing chain timeline', async ({ page }) => {
    const input = page.locator('input[placeholder*="批次"], input[placeholder*="batch"]');
    await input.fill('PA-2025-001');
    await page.getByRole('button', { name: /查询|Search/i }).click();

    await page.getByText('PA-2025-001').waitFor({ timeout: 8_000 });
    // Processing steps
    await expect(page.getByText(/剪获|Shearing/i)).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText(/洗涤|Scouring/i)).toBeVisible({ timeout: 5_000 });
  });

  test('pressing Enter in input triggers search', async ({ page }) => {
    const input = page.locator('input[placeholder*="批次"], input[placeholder*="batch"]');
    await input.fill('PA-2025-002');
    await input.press('Enter');
    await expect(page.getByText('PA-2025-002')).toBeVisible({ timeout: 8_000 });
  });

  test('clicking batch from the recent list shows its data', async ({ page }) => {
    // Click first batch in the recent list
    await page.locator('button:has(.font-mono)').first().click({ timeout: 5_000 });
    await expect(page.locator('[class*="bg-card"]').first()).toBeVisible({ timeout: 8_000 });
  });

  // ─── Invalid batch code ────────────────────────────────────────────────────

  test('invalid batch code shows error toast', async ({ page }) => {
    const input = page.locator('input[placeholder*="批次"], input[placeholder*="batch"]');
    await input.fill('INVALID-CODE');
    await page.getByRole('button', { name: /查询|Search/i }).click();
    await expect(
      page.getByText(/未找到|not found|请检查|invalid/i)
    ).toBeVisible({ timeout: 8_000 });
  });

  test('empty search does not crash the page', async ({ page }) => {
    await page.getByRole('button', { name: /查询|Search/i }).click();
    await expect(page.locator('body')).toBeVisible();
    // No crash, page still functional
    await expect(page.locator('h1')).toBeVisible({ timeout: 3_000 });
  });

  // ─── Share functionality ───────────────────────────────────────────────────

  test('share button appears after a valid batch is found', async ({ page }) => {
    const input = page.locator('input[placeholder*="批次"], input[placeholder*="batch"]');
    await input.fill('PA-2025-001');
    await page.getByRole('button', { name: /查询|Search/i }).click();
    await page.getByText('PA-2025-001').waitFor({ timeout: 8_000 });

    await expect(page.getByRole('button', { name: /分享|Share/i })).toBeVisible({ timeout: 5_000 });
  });

  test('share button copies link when Web Share API unavailable', async ({ page }) => {
    // Override navigator.share to be undefined
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
    });

    // Grant clipboard permission
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.goto(`${BASE_URL}/traceability`);
    const input = page.locator('input[placeholder*="批次"], input[placeholder*="batch"]');
    await input.fill('PA-2025-001');
    await page.getByRole('button', { name: /查询|Search/i }).click();
    await page.getByText('PA-2025-001').waitFor({ timeout: 8_000 });

    await page.getByRole('button', { name: /分享|Share/i }).click();
    await expect(page.getByText(/已复制|Copied/i)).toBeVisible({ timeout: 5_000 });
  });

  // ─── Deep link from product page ──────────────────────────────────────────

  test('deep link ?code=PA-2025-002 auto-fills and searches batch', async ({ page }) => {
    await page.goto(`${BASE_URL}/traceability?code=PA-2025-002`);
    // Should auto-run search and show result
    await expect(page.getByText('PA-2025-002')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Waikato Valley Farm/i)).toBeVisible({ timeout: 5_000 });
  });

  test('deep link from OrderSuccess carries batch code', async ({ page }) => {
    await page.goto(`${BASE_URL}/order-success?number=PA-2025-TEST&batch=PA-2025-003`);
    const traceLink = page.getByRole('link', { name: /溯源故事|Trace Story/i });
    await traceLink.click({ timeout: 5_000 });
    await expect(page).toHaveURL(/traceability.*PA-2025-003/);
    await expect(page.getByText('PA-2025-003')).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('Compare Page', () => {
  test('/compare renders all three tiers', async ({ page }) => {
    await page.goto(`${BASE_URL}/compare`);
    await expect(page.getByText(/经典款|Classic/i)).toBeVisible({ timeout: 8_000 });
    await expect(page.getByText(/轻奢款|Luxury/i)).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText(/高奢款|Premium/i)).toBeVisible({ timeout: 5_000 });
  });

  test('View Details links navigate to correct product pages', async ({ page }) => {
    await page.goto(`${BASE_URL}/compare`);
    await page.getByRole('link', { name: /查看详情|View Details/i }).first().click({ timeout: 8_000 });
    await expect(page).toHaveURL(/\/product\//);
  });
});

test.describe('Returns Page', () => {
  test('/returns page loads and shows 30-day policy', async ({ page }) => {
    await page.goto(`${BASE_URL}/returns`);
    await expect(page.getByText(/30天|30-Day/i)).toBeVisible({ timeout: 8_000 });
  });

  test('returns page has contact email link', async ({ page }) => {
    await page.goto(`${BASE_URL}/returns`);
    await expect(page.getByText(/returns@pacificalpacas/i)).toBeVisible({ timeout: 5_000 });
  });
});
