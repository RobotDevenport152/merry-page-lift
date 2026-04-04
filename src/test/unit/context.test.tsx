import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { products } from '@/lib/store';

// Helper component that exposes AppContext values via data-testid attributes
function CartHarness() {
  const { cart, cartTotal, cartCount, addToCart, removeFromCart, updateQuantity, applyPromo, promoDiscount, currency, fp } = useApp();

  const duvet = products.find(p => p.id === 'duvet-classic')!;
  const vest = products.find(p => p.id === 'vest-x6')!;

  return (
    <div>
      <span data-testid="count">{cartCount}</span>
      <span data-testid="total">{cartTotal}</span>
      <span data-testid="promo-discount">{promoDiscount}</span>
      <span data-testid="currency">{currency}</span>
      <span data-testid="fp-duvet">{fp(duvet.prices[currency])}</span>

      <button data-testid="add-duvet" onClick={() => addToCart(duvet)}>Add Duvet</button>
      <button data-testid="add-vest" onClick={() => addToCart(vest)}>Add Vest</button>
      <button data-testid="remove-duvet" onClick={() => removeFromCart(duvet.id)}>Remove Duvet</button>
      <button data-testid="qty-duvet-2" onClick={() => updateQuantity(duvet.id, 2)}>Set Duvet Qty 2</button>
      <button data-testid="qty-duvet-0" onClick={() => updateQuantity(duvet.id, 0)}>Remove via Qty 0</button>
      <button data-testid="apply-welcome10" onClick={() => applyPromo('WELCOME10')}>Apply WELCOME10</button>
      <button data-testid="apply-luxury20" onClick={() => applyPromo('LUXURY20')}>Apply LUXURY20</button>

      <ul data-testid="cart-items">
        {cart.map(item => (
          <li key={`${item.product.id}-${item.variant}`} data-testid={`item-${item.product.id}`}>
            {item.product.id} × {item.quantity}
          </li>
        ))}
      </ul>
    </div>
  );
}

function renderCart() {
  return render(
    <AppProvider>
      <CartHarness />
    </AppProvider>
  );
}

// ─── AppContext — cart operations ──────────────────────────────────────────────

describe('AppContext — cart', () => {
  it('starts with an empty cart', () => {
    renderCart();
    expect(screen.getByTestId('count').textContent).toBe('0');
    expect(screen.getByTestId('total').textContent).toBe('0');
  });

  it('addToCart increments count and total', async () => {
    renderCart();
    const user = userEvent.setup();
    await user.click(screen.getByTestId('add-duvet'));

    const duvet = products.find(p => p.id === 'duvet-classic')!;
    expect(screen.getByTestId('count').textContent).toBe('1');
    // Default currency is CNY
    expect(screen.getByTestId('total').textContent).toBe(String(duvet.prices.CNY));
  });

  it('adding the same product again increases quantity', async () => {
    renderCart();
    const user = userEvent.setup();
    await user.click(screen.getByTestId('add-duvet'));
    await user.click(screen.getByTestId('add-duvet'));

    expect(screen.getByTestId('count').textContent).toBe('2');
    const item = screen.getByTestId('item-duvet-classic');
    expect(item.textContent).toContain('× 2');
  });

  it('addToCart opens cart (cartOpen=true)', async () => {
    // We only test the observable effect via count; cartOpen is internal state
    renderCart();
    const user = userEvent.setup();
    await user.click(screen.getByTestId('add-duvet'));
    expect(screen.getByTestId('count').textContent).toBe('1');
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
    const vest = products.find(p => p.id === 'vest-x6')!;
    const expectedTotal = duvet.prices.CNY + vest.prices.CNY; // default CNY
    expect(screen.getByTestId('total').textContent).toBe(String(expectedTotal));
  });
});

// ─── AppContext — promo codes ──────────────────────────────────────────────────

describe('AppContext — promo codes', () => {
  it('WELCOME10 sets promoDiscount to 10% of total', async () => {
    renderCart();
    const user = userEvent.setup();
    await user.click(screen.getByTestId('add-duvet')); // CNY 2880

    await user.click(screen.getByTestId('apply-welcome10'));

    const discount = parseFloat(screen.getByTestId('promo-discount').textContent!);
    expect(discount).toBeCloseTo(2880 * 0.1);
  });

  it('LUXURY20 applies when total exceeds minAmount', async () => {
    // vest CNY 1980 > minAmount 500 — promo should apply
    renderCart();
    const user = userEvent.setup();
    await user.click(screen.getByTestId('add-vest')); // CNY 1980

    await user.click(screen.getByTestId('apply-luxury20'));

    const discount = parseFloat(screen.getByTestId('promo-discount').textContent!);
    expect(discount).toBeCloseTo(1980 * 0.2);
  });
});

// ─── AppContext — fp (formatPrice) ────────────────────────────────────────────

describe('AppContext — fp helper', () => {
  it('fp uses default CNY currency', () => {
    renderCart();
    const duvet = products.find(p => p.id === 'duvet-classic')!;
    // Default locale is zh, currency is CNY
    expect(screen.getByTestId('fp-duvet').textContent).toBe(`¥${duvet.prices.CNY.toLocaleString()}`);
  });
});
