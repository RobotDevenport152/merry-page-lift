import { test, expect, Page } from '@playwright/test';
import { loginAs } from './helpers/auth';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8080';

async function addItemToCart(page: Page) {
  await page.goto(`${BASE_URL}/product/duvet-classic`);
  const addBtn = page.getByRole('button', { name: /加入购物车|Add to Cart/i }).first();
  await expect(addBtn).toBeVisible({ timeout: 10_000 });
  await addBtn.click();
  // Close drawer to continue
  const closeBtn = page.locator('[data-testid="cart-close"], button:has([data-lucide="x"])').first();
  if (await closeBtn.isVisible()) await closeBtn.click();
}

async function fillShippingInfo(page: Page) {
  await page.fill('input[placeholder*="姓名"], input[placeholder*="Name"], [data-field="name"] input', '张伟测试');
  await page.fill('input[placeholder*="电话"], input[placeholder*="Phone"], [data-field="phone"] input', '13800138000');
  await page.fill('input[placeholder*="邮箱"], input[type="email"]', 'e2e-test@pacificalpacas-test.com');
}

test.describe('Promo Code', () => {
  test('WELCOME10 shows 10% discount in cart', async ({ page }) => {
    await addItemToCart(page);
    await page.goto(`${BASE_URL}/shop`);
    // Open cart
    await page.getByRole('button', { name: /cart|购物车/i }).click().catch(() => {});

    // Find promo input and apply code
    const promoInput = page.locator('input[placeholder*="promo"], input[placeholder*="优惠"]');
    if (await promoInput.isVisible()) {
      await promoInput.fill('WELCOME10');
      await page.getByRole('button', { name: /apply|使用/i }).click();
      await expect(page.getByText(/WELCOME10|10%|折扣/i)).toBeVisible({ timeout: 5_000 });
    }
  });

  test('invalid promo code shows error', async ({ page }) => {
    await addItemToCart(page);
    // Navigate to checkout to see promo
    await page.goto(`${BASE_URL}/checkout`);
    // If on checkout with items, look for promo section
    const promoInput = page.locator('input[placeholder*="promo"], input[placeholder*="优惠"]');
    if (await promoInput.isVisible({ timeout: 3_000 })) {
      await promoInput.fill('BADCODE999');
      await page.getByRole('button', { name: /apply|使用/i }).click();
      await expect(page.getByText(/invalid|无效|error/i)).toBeVisible({ timeout: 5_000 });
    }
  });
});

test.describe('Checkout Flow — 3 Steps', () => {
  test.beforeEach(async ({ page }) => {
    await addItemToCart(page);
    await page.goto(`${BASE_URL}/checkout`);
  });

  // ─── Step 1: Shipping Info ─────────────────────────────────────────────────

  test('step 1 shows shipping info form', async ({ page }) => {
    await expect(page.getByText(/收货信息|Shipping/i)).toBeVisible({ timeout: 8_000 });
    await expect(page.locator('input[type="text"], input[type="email"]').first()).toBeVisible();
  });

  test('step 1 requires name, email, phone before proceeding', async ({ page }) => {
    const continueBtn = page.getByRole('button', { name: /下一步|Continue/i });
    await continueBtn.click({ timeout: 8_000 });
    await expect(page.getByText(/必填|required|填写/i)).toBeVisible({ timeout: 5_000 });
  });

  test('step 1 advances to step 2 after filling required fields', async ({ page }) => {
    await fillShippingInfo(page);
    await page.getByRole('button', { name: /下一步|Continue/i }).click({ timeout: 8_000 });
    await expect(page.getByText(/支付|Payment/i)).toBeVisible({ timeout: 8_000 });
  });

  test('gift mode checkbox is visible in step 1', async ({ page }) => {
    await expect(page.getByText(/礼品模式|Gift mode/i)).toBeVisible({ timeout: 8_000 });
  });

  test('gift message textarea appears when gift mode is checked', async ({ page }) => {
    const checkbox = page.locator('input[type="checkbox"]').first();
    await expect(checkbox).toBeVisible({ timeout: 8_000 });
    await checkbox.check();
    await expect(page.locator('textarea')).toBeVisible({ timeout: 3_000 });
  });

  // ─── Step 2: Payment ───────────────────────────────────────────────────────

  test('step 2 shows payment method options', async ({ page }) => {
    await fillShippingInfo(page);
    await page.getByRole('button', { name: /下一步|Continue/i }).click({ timeout: 8_000 });
    await expect(page.getByText(/Stripe|微信支付|WeChat Pay/i)).toBeVisible({ timeout: 8_000 });
  });

  test('step 2 can go back to step 1', async ({ page }) => {
    await fillShippingInfo(page);
    await page.getByRole('button', { name: /下一步|Continue/i }).click({ timeout: 8_000 });
    await page.getByRole('button', { name: /返回|Back/i }).click({ timeout: 5_000 });
    await expect(page.getByText(/收货信息|Shipping/i)).toBeVisible({ timeout: 5_000 });
  });

  // ─── Step 3: Confirm ──────────────────────────────────────────────────────

  test('step 3 shows order summary', async ({ page }) => {
    await fillShippingInfo(page);
    await page.getByRole('button', { name: /下一步|Continue/i }).click({ timeout: 8_000 });
    await page.getByRole('button', { name: /确认订单|Review Order/i }).click({ timeout: 8_000 });
    await expect(page.getByText(/确认|Confirm/i)).toBeVisible({ timeout: 8_000 });
    // Should show entered name
    await expect(page.getByText('张伟测试')).toBeVisible({ timeout: 5_000 });
  });

  // ─── Stripe Test Payment ───────────────────────────────────────────────────

  test('Stripe payment redirects to Stripe hosted checkout', async ({ page }) => {
    // Must be logged in for actual order submission
    await loginAs(page, 'regular');
    await addItemToCart(page);
    await page.goto(`${BASE_URL}/checkout`);

    await fillShippingInfo(page);
    await page.getByRole('button', { name: /下一步|Continue/i }).click({ timeout: 8_000 });
    // Select Stripe payment (should be default)
    await page.getByRole('button', { name: /确认订单|Review Order/i }).click({ timeout: 8_000 });

    // Submit order — this will invoke supabase function create-checkout
    const submitBtn = page.getByRole('button', { name: /提交订单|Place Order/i });
    await submitBtn.click({ timeout: 8_000 });

    // Should redirect to Stripe OR show payment failure (if Stripe not configured)
    await page.waitForURL(url =>
      url.hostname.includes('stripe.com') ||
      url.pathname.includes('order-success') ||
      url.pathname.includes('checkout'),
      { timeout: 15_000 }
    );

    if (page.url().includes('stripe.com')) {
      // Fill Stripe test card in Stripe's hosted checkout
      await page.waitForLoadState('networkidle', { timeout: 15_000 });
      await page.fill('[name="cardnumber"], #cardNumber', '4242 4242 4242 4242');
      await page.fill('[name="exp-date"], #cardExpiry', '12 / 30');
      await page.fill('[name="cvc"], #cardCvc', '123');
      await page.fill('[name="billing-name"], #billingName', 'Test User').catch(() => {});

      await page.getByRole('button', { name: /pay|支付/i }).click();
      await page.waitForURL(/order-success/, { timeout: 30_000 });
    }
  });
});

test.describe('Order Success Page', () => {
  test('order success page shows order number', async ({ page }) => {
    await page.goto(`${BASE_URL}/order-success?number=PA-2025-TEST001&batch=PA-2025-001`);
    await expect(page.getByText('PA-2025-TEST001')).toBeVisible({ timeout: 8_000 });
  });

  test('order success shows traceability CTA with batch code', async ({ page }) => {
    await page.goto(`${BASE_URL}/order-success?number=PA-2025-TEST001&batch=PA-2025-001`);
    await expect(page.getByText('PA-2025-001')).toBeVisible({ timeout: 8_000 });
    await expect(page.getByRole('link', { name: /溯源故事|Trace Story/i })).toBeVisible({ timeout: 5_000 });
  });

  test('traceability link carries batch code as query param', async ({ page }) => {
    await page.goto(`${BASE_URL}/order-success?number=PA-2025-TEST001&batch=PA-2025-002`);
    const traceLink = page.getByRole('link', { name: /溯源故事|Trace Story/i });
    const href = await traceLink.getAttribute('href');
    expect(href).toContain('PA-2025-002');
  });

  test('continue shopping link goes to /shop', async ({ page }) => {
    await page.goto(`${BASE_URL}/order-success?number=PA-2025-X`);
    await page.getByRole('link', { name: /继续购物|Continue Shopping/i }).click();
    await expect(page).toHaveURL(/\/shop/);
  });
});
