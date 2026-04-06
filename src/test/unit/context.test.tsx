import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { products } from '@/lib/store';

// P1 FIX: CartContext persists to localStorage.
// Without clearing between tests, cart state leaks and causes false failures.
beforeEach(() => {
  localStorage.clear();
});

function CartHarness() {
  const {
    cart, cartTotal, cartCount,
    addToCart, removeFromCart, updateQuantity,
    applyPromo, promoDiscount, currency, fp,
  } = useApp();

  const duvet = products.find(p => p.id === 'duvet-classic')!;
  const vest  = products.find(p => p.id === 'vest-x6')!;

  return (
    <div>
      <span data-testid="count">{cartCount}</span>
      <span data-testid="total">{cartTotal}</span>
      <span data-testid="promo-discount">{promoDiscount}</span>
      <span data-testid="currency">{currency}</span>
      <span data-testid="fp-duvet">{fp(duvet.prices[currency])}</span>

      <button data-testid="add-duvet"       onClick={() => addToCart(duvet)}>Add Duvet</button>
      <button data-testid="add-vest"        onClick={() => addToCart(vest)}>Add Vest</button>
      <button data-testid="add-duvet-s"     onClick={() => addToCart(duvet, '200x230')}>Add S</button>
      <button data-testid="add-duvet-l"     onClick={() => addToCart(duvet, '220x240')}>Add L</button>

      {/* P1 FIX: removeFromCart and updateQuantity now accept variant as third/second arg */}
      <button data-testid="remove-duvet"    onClick={() => removeFromCart(duvet.id, undefined)}>Remove</button>
      <button data-testid="remove-duvet-s"  onClick={() => removeFromCart(duvet.id, '200x230')}>Remove S</button>
      <button data-testid="qty-duvet-2"     onClick={() => updateQuantity(duvet.id, 2, undefined)}>Qty 2</button>
      <button data-testid="qty-duvet-0"     onClick={() => updateQuantity(duvet.id, 0, undefined)}>Qty 0</button>

      <button data-testid="apply-welcome10" onClick={() => applyPromo('WELCOME10')}>Promo 10</button>
      <button data-testid="apply-luxury20"  onClick={() => applyPromo('LUXURY20')}>Promo 20</button>

      <ul data-testid="cart-items">
        {cart.map(item => (
          <li key={`${item.product.id}-${item.variant ?? 'none'}`}
              data-testid={`item-${item.product.id}-${item.variant ?? 'none'}`}>
            {item.product.id}/{item.variant ?? 'none'} × {item.quantity}
          </li>
        ))}
      </ul>
    </div>
  );
}

function renderCart() {
  return render(<AppProvider><CartHarness /></AppProvider>);
}

// ── Basic cart operations ───────────────────────────────────────────────────

describe('AppContext — cart (via useApp shim)', () => {
  it('starts with an empty cart', () => {
    renderCart();
    expect(screen.getByTestId('count').textContent).toBe('0');
    expect(screen.getByTestId('total').textContent).toBe('0');
  });

  it('addToCart increments count and total', async () => {
    renderCart();
    await userEvent.setup().click(screen.getByTestId('add-duvet'));
    const duvet = products.find(p => p.id === 'duvet-classic')!;
    expect(screen.getByTestId('count').textContent).toBe('1');
    expect(screen.getByTestId('total').textContent).toBe(String(duvet.prices.CNY));
  });

  it('adding the same product again increases quantity', async () => {
    renderCart();
    const user = userEvent.setup();
    await user.click(screen.getByTestId('add-duvet'));
    await user.click(screen.getByTestId('add-duvet'));
    expect(screen.getByTestId('count').textContent).toBe('2');
    expect(screen.getByTestId('item-duvet-classic-none').textContent).toContain('× 2');
  });

  it('removeFromCart clears the item', async () => {
    renderCart();
    const user = userEvent.setup();
    await user.click(screen.getByTestId('add-duvet'));
    await user.click(screen.getByTestId('remove-duvet'));
    expect(screen.getByTestId('count').textContent).toBe('0');
  });

  it('updateQuantity sets new quantity', async () => {
    renderCart();
    const user = userEvent.setup();
    await user.click(screen.getByTestId('add-duvet'));
    await user.click(screen.getByTestId('qty-duvet-2'));
    expect(screen.getByTestId('count').textContent).toBe('2');
  });

  it('updateQuantity(id, 0) removes the item', async () => {
    renderCart();
    const user = userEvent.setup();
    await user.click(screen.getByTestId('add-duvet'));
    await user.click(screen.getByTestId('qty-duvet-0'));
    expect(screen.getByTestId('count').textContent).toBe('0');
  });

  it('total reflects sum of all items', async () => {
    renderCart();
    const user = userEvent.setup();
    await user.click(screen.getByTestId('add-duvet'));
    await user.click(screen.getByTestId('add-vest'));
    const duvet = products.find(p => p.id === 'duvet-classic')!;
    const vest  = products.find(p => p.id === 'vest-x6')!;
    expect(screen.getByTestId('total').textContent).toBe(String(duvet.prices.CNY + vest.prices.CNY));
  });
});

// ── P1 FIX: Variant isolation ───────────────────────────────────────────────

describe('CartContext — variant isolation (P1 regression tests)', () => {
  it('two different variants are separate cart entries', async () => {
    renderCart();
    const user = userEvent.setup();
    await user.click(screen.getByTestId('add-duvet-s'));
    await user.click(screen.getByTestId('add-duvet-l'));
    expect(screen.getByTestId('count').textContent).toBe('2');
    expect(screen.getByTestId('item-duvet-classic-200x230')).toBeTruthy();
    expect(screen.getByTestId('item-duvet-classic-220x240')).toBeTruthy();
  });

  it('removing one variant leaves the other intact', async () => {
    renderCart();
    const user = userEvent.setup();
    await user.click(screen.getByTestId('add-duvet-s'));
    await user.click(screen.getByTestId('add-duvet-l'));
    await user.click(screen.getByTestId('remove-duvet-s'));
    expect(screen.getByTestId('count').textContent).toBe('1');
    expect(screen.queryByTestId('item-duvet-classic-200x230')).toBeNull();
    expect(screen.getByTestId('item-duvet-classic-220x240')).toBeTruthy();
  });

  it('re-adding the same variant deduplicates (quantity++)', async () => {
    renderCart();
    const user = userEvent.setup();
    await user.click(screen.getByTestId('add-duvet-s'));
    await user.click(screen.getByTestId('add-duvet-s'));
    expect(screen.getByTestId('item-duvet-classic-200x230').textContent).toContain('× 2');
    expect(screen.getByTestId('count').textContent).toBe('2');
  });
});

// ── localStorage persistence ────────────────────────────────────────────────

describe('CartContext — localStorage persistence', () => {
  it('writes cart to localStorage after add', async () => {
    renderCart();
    await userEvent.setup().click(screen.getByTestId('add-duvet'));
    const stored = localStorage.getItem('pa-cart-v1');
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].product.id).toBe('duvet-classic');
  });

  it('starts empty when localStorage is clear (beforeEach guarantee)', () => {
    renderCart();
    expect(screen.getByTestId('count').textContent).toBe('0');
  });
});

// ── Promo codes ─────────────────────────────────────────────────────────────

describe('AppContext — promo codes', () => {
  it('WELCOME10 sets promoDiscount to 10% of total', async () => {
    renderCart();
    const user = userEvent.setup();
    await user.click(screen.getByTestId('add-duvet'));
    await user.click(screen.getByTestId('apply-welcome10'));
    const discount = parseFloat(screen.getByTestId('promo-discount').textContent!);
    expect(discount).toBeCloseTo(2880 * 0.1);
  });

  it('LUXURY20 applies when total exceeds minAmount', async () => {
    renderCart();
    const user = userEvent.setup();
    await user.click(screen.getByTestId('add-vest')); // CNY 1980
    await user.click(screen.getByTestId('apply-luxury20'));
    const discount = parseFloat(screen.getByTestId('promo-discount').textContent!);
    expect(discount).toBeCloseTo(1980 * 0.2);
  });
});

// ── fp helper ───────────────────────────────────────────────────────────────

describe('AppContext — fp helper', () => {
  it('formats CNY with default currency', () => {
    renderCart();
    const duvet = products.find(p => p.id === 'duvet-classic')!;
    expect(screen.getByTestId('fp-duvet').textContent).toBe(`¥${duvet.prices.CNY.toLocaleString()}`);
  });
});
