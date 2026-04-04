import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8080';

test.describe('Shop Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/shop`);
  });

  // ─── Products load from Supabase ───────────────────────────────────────────

  test('shop page renders product grid', async ({ page }) => {
    // Wait for at least one product card to appear (Supabase data)
    await expect(page.locator('.group.bg-card').first()).toBeVisible({ timeout: 15_000 });
  });

  test('shows loading skeleton while fetching', async ({ page }) => {
    // Intercept Supabase REST request to delay it
    await page.route('**/rest/v1/products**', async route => {
      await new Promise(r => setTimeout(r, 500));
      await route.continue();
    });
    await page.goto(`${BASE_URL}/shop`);
    // Skeleton should be visible briefly
    const skeleton = page.locator('.animate-pulse').first();
    await expect(skeleton).toBeVisible({ timeout: 3_000 });
  });

  test('product cards display name, description, and price', async ({ page }) => {
    await page.locator('.group.bg-card').first().waitFor({ timeout: 15_000 });
    const firstCard = page.locator('.group.bg-card').first();
    // Name
    await expect(firstCard.locator('h3')).not.toBeEmpty();
    // Description
    await expect(firstCard.locator('p')).not.toBeEmpty();
    // Price — look for ¥ or NZD$ or US$
    await expect(firstCard.getByText(/¥|NZD\s?\$|US\$/)).toBeVisible();
  });

  test('gift recommendation banner is visible', async ({ page }) => {
    await expect(page.getByText(/为亲友挑选礼物|Shopping for a gift/i)).toBeVisible({ timeout: 8_000 });
  });

  test('compare tiers link navigates to /compare', async ({ page }) => {
    await page.getByRole('link', { name: /系列对比|Compare tiers/i }).first().click();
    await expect(page).toHaveURL(/\/compare/);
  });

  // ─── Filtering ─────────────────────────────────────────────────────────────

  test('search filters product list', async ({ page }) => {
    await page.locator('.group.bg-card').first().waitFor({ timeout: 15_000 });
    await page.fill('input[placeholder*="Search"], input[placeholder*="搜索"]', 'duvet');
    await page.waitForTimeout(400); // debounce
    const cards = page.locator('.group.bg-card');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('clearing search restores all products', async ({ page }) => {
    await page.locator('.group.bg-card').first().waitFor({ timeout: 15_000 });
    const initialCount = await page.locator('.group.bg-card').count();

    await page.fill('input[placeholder*="Search"], input[placeholder*="搜索"]', 'xxxxnotfound');
    await page.waitForTimeout(400);

    await page.locator('button:has-text("✕"), button:has-text("Clear")').click();
    await page.waitForTimeout(400);

    const restoredCount = await page.locator('.group.bg-card').count();
    expect(restoredCount).toBeGreaterThanOrEqual(initialCount);
  });
});

test.describe('Product Detail Page', () => {
  test('navigates from shop to product detail', async ({ page }) => {
    await page.goto(`${BASE_URL}/shop`);
    await page.locator('.group.bg-card').first().waitFor({ timeout: 15_000 });
    await page.locator('.group.bg-card h3').first().click();
    await expect(page).toHaveURL(/\/product\//);
  });

  test('product detail shows name, price, and add-to-cart button', async ({ page }) => {
    await page.goto(`${BASE_URL}/product/duvet-classic`);
    await expect(page.locator('h1')).not.toBeEmpty({ timeout: 10_000 });
    await expect(page.getByText(/¥|NZD\s?\$|US\$/)).toBeVisible();
    await expect(page.getByRole('button', { name: /加入购物车|Add to Cart/i })).toBeVisible();
  });

  test('size guide popover expands on click', async ({ page }) => {
    await page.goto(`${BASE_URL}/product/duvet-classic`);
    const sizeGuideBtn = page.getByRole('button', { name: /尺寸参考|Size Guide/i });
    await expect(sizeGuideBtn).toBeVisible({ timeout: 10_000 });
    await sizeGuideBtn.click();
    await expect(page.getByText(/1\.5m|200×230/)).toBeVisible();
  });

  test('care instructions collapsible expands', async ({ page }) => {
    await page.goto(`${BASE_URL}/product/duvet-classic`);
    const careBtn = page.getByRole('button', { name: /护理说明|Care Instructions/i });
    await expect(careBtn).toBeVisible({ timeout: 10_000 });
    await careBtn.click();
    await expect(page.getByText(/30°C|hand wash|手洗/i)).toBeVisible();
  });

  test('traceability badge links to /traceability', async ({ page }) => {
    await page.goto(`${BASE_URL}/product/duvet-classic`);
    await page.waitForTimeout(2_000);
    const traceLink = page.getByRole('link', { name: /溯源|Traceable/i });
    await expect(traceLink.first()).toBeVisible({ timeout: 10_000 });
    await traceLink.first().click();
    await expect(page).toHaveURL(/\/traceability/);
  });

  // ─── Add to cart ───────────────────────────────────────────────────────────

  test('add to cart opens cart drawer', async ({ page }) => {
    await page.goto(`${BASE_URL}/product/duvet-classic`);
    const addBtn = page.getByRole('button', { name: /加入购物车|Add to Cart/i }).first();
    await expect(addBtn).toBeVisible({ timeout: 10_000 });
    await addBtn.click();
    // Cart drawer should open
    await expect(page.getByText(/cart|购物车/i).first()).toBeVisible({ timeout: 5_000 });
  });

  test('cart count increments after adding item', async ({ page }) => {
    await page.goto(`${BASE_URL}/product/duvet-classic`);
    await page.getByRole('button', { name: /加入购物车|Add to Cart/i }).first().click({ timeout: 10_000 });
    // Cart count badge in navbar
    await expect(page.getByText('1')).toBeVisible({ timeout: 5_000 });
  });

  test('shipping progress bar shows in cart drawer', async ({ page }) => {
    await page.goto(`${BASE_URL}/product/duvet-classic`);
    await page.getByRole('button', { name: /加入购物车|Add to Cart/i }).first().click({ timeout: 10_000 });
    // Shipping progress bar or free shipping message
    await expect(
      page.getByText(/免运费|free shipping|还差|more for free/i)
    ).toBeVisible({ timeout: 5_000 });
  });
});
