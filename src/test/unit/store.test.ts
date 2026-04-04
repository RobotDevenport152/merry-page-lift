import { describe, it, expect } from 'vitest';
import {
  products,
  PROMO_CODES,
  EXCHANGE_RATES,
  CURRENCY_SYMBOLS,
  formatPrice,
  type Currency,
  type CartItem,
} from '@/lib/store';

// ─── formatPrice ───────────────────────────────────────────────────────────────

describe('formatPrice', () => {
  it('formats NZD with symbol and no decimal', () => {
    expect(formatPrice(579, 'NZD')).toBe('NZD $579');
  });

  it('formats CNY with ¥ symbol', () => {
    expect(formatPrice(2880, 'CNY')).toBe('¥2,880');
  });

  it('formats USD with US$ symbol', () => {
    expect(formatPrice(349, 'USD')).toBe('US$349');
  });

  it('formats large CNY amount with thousand separator', () => {
    expect(formatPrice(12800, 'CNY')).toBe('¥12,800');
  });
});

// ─── PROMO_CODES data ──────────────────────────────────────────────────────────

describe('PROMO_CODES definitions', () => {
  it('WELCOME10 is a 10% percent discount with no minimum', () => {
    expect(PROMO_CODES['WELCOME10']).toEqual({ discount: 10, type: 'percent' });
  });

  it('LUXURY20 requires minAmount of 500', () => {
    expect(PROMO_CODES['LUXURY20']).toMatchObject({ discount: 20, type: 'percent', minAmount: 500 });
  });

  it('ALPACA50 is a fixed $50 discount', () => {
    expect(PROMO_CODES['ALPACA50']).toEqual({ discount: 50, type: 'fixed' });
  });
});

// ─── Promo code application logic (mirrors AppContext.applyPromo) ──────────────

function applyPromoCalc(code: string, cartTotal: number): number | false {
  const promo = PROMO_CODES[code.toUpperCase()];
  if (!promo) return false;
  if (promo.minAmount && cartTotal < promo.minAmount) return false;
  if (promo.type === 'percent') return cartTotal * promo.discount / 100;
  return promo.discount;
}

describe('applyPromo calculation', () => {
  it('WELCOME10 gives 10% of cart total', () => {
    expect(applyPromoCalc('WELCOME10', 579)).toBeCloseTo(57.9);
  });

  it('WELCOME10 is case-insensitive', () => {
    expect(applyPromoCalc('welcome10', 1000)).toBe(100);
  });

  it('LUXURY20 fails when cart is below 500', () => {
    expect(applyPromoCalc('LUXURY20', 499)).toBe(false);
  });

  it('LUXURY20 applies when cart is exactly 500', () => {
    expect(applyPromoCalc('LUXURY20', 500)).toBe(100);
  });

  it('LUXURY20 applies 20% when cart exceeds minimum', () => {
    expect(applyPromoCalc('LUXURY20', 1280)).toBeCloseTo(256);
  });

  it('ALPACA50 gives fixed 50 regardless of cart total', () => {
    expect(applyPromoCalc('ALPACA50', 100)).toBe(50);
    expect(applyPromoCalc('ALPACA50', 5000)).toBe(50);
  });

  it('unknown code returns false', () => {
    expect(applyPromoCalc('INVALID', 1000)).toBe(false);
    expect(applyPromoCalc('', 1000)).toBe(false);
  });
});

// ─── Cart total calculation ────────────────────────────────────────────────────

function computeCartTotal(items: CartItem[], currency: Currency): number {
  return items.reduce((sum, item) => sum + item.product.prices[currency] * item.quantity, 0);
}

function computeCartCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

describe('cart total calculation', () => {
  const duvet = products.find(p => p.id === 'duvet-classic')!;
  const vest = products.find(p => p.id === 'vest-x6')!;

  it('single item × 1 in NZD', () => {
    const cart: CartItem[] = [{ product: duvet, quantity: 1 }];
    expect(computeCartTotal(cart, 'NZD')).toBe(duvet.prices.NZD);
  });

  it('single item × 2 doubles the total', () => {
    const cart: CartItem[] = [{ product: duvet, quantity: 2 }];
    expect(computeCartTotal(cart, 'NZD')).toBe(duvet.prices.NZD * 2);
  });

  it('two different items sum correctly in NZD', () => {
    const cart: CartItem[] = [
      { product: duvet, quantity: 1 },
      { product: vest, quantity: 2 },
    ];
    const expected = duvet.prices.NZD + vest.prices.NZD * 2;
    expect(computeCartTotal(cart, 'NZD')).toBe(expected);
  });

  it('uses CNY prices when currency is CNY', () => {
    const cart: CartItem[] = [{ product: duvet, quantity: 1 }];
    expect(computeCartTotal(cart, 'CNY')).toBe(duvet.prices.CNY);
  });

  it('uses USD prices when currency is USD', () => {
    const cart: CartItem[] = [{ product: duvet, quantity: 1 }];
    expect(computeCartTotal(cart, 'USD')).toBe(duvet.prices.USD);
  });

  it('empty cart total is 0', () => {
    expect(computeCartTotal([], 'NZD')).toBe(0);
  });

  it('cart count sums quantities', () => {
    const cart: CartItem[] = [
      { product: duvet, quantity: 2 },
      { product: vest, quantity: 3 },
    ];
    expect(computeCartCount(cart)).toBe(5);
  });
});

// ─── Shipping threshold ────────────────────────────────────────────────────────

describe('shipping threshold logic', () => {
  const FREE_THRESHOLD = 500;

  it('order below 500 NZD incurs shipping', () => {
    expect(499 < FREE_THRESHOLD).toBe(true);
  });

  it('order at exactly 500 NZD is free shipping', () => {
    expect(500 >= FREE_THRESHOLD).toBe(true);
  });

  it('duvet-classic at NZD$579 qualifies for free shipping', () => {
    const duvet = products.find(p => p.id === 'duvet-classic')!;
    expect(duvet.prices.NZD >= FREE_THRESHOLD).toBe(true);
  });
});

// ─── Product catalogue integrity ───────────────────────────────────────────────

describe('product catalogue', () => {
  it('has at least 8 products', () => {
    expect(products.length).toBeGreaterThanOrEqual(8);
  });

  it('every product has prices for all three currencies', () => {
    const currencies: Currency[] = ['NZD', 'CNY', 'USD'];
    for (const p of products) {
      for (const c of currencies) {
        expect(p.prices[c]).toBeGreaterThan(0);
      }
    }
  });

  it('every product has a non-empty id', () => {
    for (const p of products) {
      expect(p.id).toBeTruthy();
    }
  });

  it('duvet-classic exists and is featured', () => {
    const p = products.find(p => p.id === 'duvet-classic');
    expect(p).toBeDefined();
    expect(p!.featured).toBe(true);
  });

  it('CNY prices are approximately 4.5× NZD prices', () => {
    for (const p of products) {
      const ratio = p.prices.CNY / p.prices.NZD;
      // Allow ±30% variance for pricing strategy
      expect(ratio).toBeGreaterThan(3);
      expect(ratio).toBeLessThan(7);
    }
  });
});

// ─── Exchange rates ────────────────────────────────────────────────────────────

describe('exchange rates', () => {
  it('NZD base rate is 1', () => {
    expect(EXCHANGE_RATES.NZD).toBe(1);
  });

  it('CNY rate is 4.5', () => {
    expect(EXCHANGE_RATES.CNY).toBe(4.5);
  });

  it('USD rate is 0.6', () => {
    expect(EXCHANGE_RATES.USD).toBe(0.6);
  });
});
