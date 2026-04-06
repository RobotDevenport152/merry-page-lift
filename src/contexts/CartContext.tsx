import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { type Currency, type CartItem, type Product, formatPrice, PROMO_CODES } from '@/lib/store';

// PROMO_CODES is imported from store.ts — single source of truth for the client.
// The authoritative server-side calculation lives in create-checkout/index.ts.
// Both copies must stay in sync when promo rules change.

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, variant?: string) => void;
  removeFromCart: (productId: string, variant?: string) => void;
  updateQuantity: (productId: string, qty: number, variant?: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  promoCode: string;
  setPromoCode: (code: string) => void;
  promoDiscount: number;
  setPromoDiscount: (d: number) => void;
  applyPromo: (code: string) => boolean;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  fp: (amount: number) => string;
}

const CartContext = createContext<CartContextType | null>(null);

const CART_STORAGE_KEY = 'pa-cart-v1';
const CURRENCY_STORAGE_KEY = 'pa-currency-v1';

function loadCart(): CartItem[] {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function loadCurrency(): Currency {
  try {
    const stored = localStorage.getItem(CURRENCY_STORAGE_KEY) as Currency | null;
    return stored ?? 'CNY';
  } catch {
    return 'CNY';
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(loadCart);
  const [currency, setCurrencyState] = useState<Currency>(loadCurrency);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);

  // P1 FIX: Persist cart to localStorage on every change
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  // Persist currency preference
  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem(CURRENCY_STORAGE_KEY, c);
  }, []);

  const addToCart = useCallback((product: Product, variant?: string) => {
    setCart(prev => {
      const existing = prev.find(
        i => i.product.id === product.id && i.variant === variant,
      );
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id && i.variant === variant
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        );
      }
      return [...prev, { product, quantity: 1, variant }];
    });
    setCartOpen(true);
  }, []);

  // P1 FIX: removeFromCart now requires variant to disambiguate.
  // The old implementation only matched on productId, silently deleting ALL
  // variants of a product (e.g. removing duvet-200x230 would also remove duvet-220x240).
  const removeFromCart = useCallback((productId: string, variant?: string) => {
    setCart(prev =>
      prev.filter(
        i => !(i.product.id === productId && i.variant === variant),
      ),
    );
  }, []);

  // P1 FIX: updateQuantity also matches on variant
  const updateQuantity = useCallback((productId: string, qty: number, variant?: string) => {
    if (qty <= 0) {
      setCart(prev =>
        prev.filter(i => !(i.product.id === productId && i.variant === variant)),
      );
    } else {
      setCart(prev =>
        prev.map(i =>
          i.product.id === productId && i.variant === variant
            ? { ...i, quantity: qty }
            : i,
        ),
      );
    }
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setPromoCode('');
    setPromoDiscount(0);
  }, []);

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.prices[currency] * item.quantity,
    0,
  );
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const applyPromo = useCallback(
    (code: string) => {
      const promo = PROMO_CODES[code.toUpperCase()];
      if (!promo) return false;
      if (promo.minAmount && cartTotal < promo.minAmount) return false;
      const discount =
        promo.type === 'percent'
          ? parseFloat((cartTotal * promo.discount / 100).toFixed(2))
          : promo.discount;
      setPromoDiscount(discount);
      setPromoCode(code.toUpperCase());
      return true;
    },
    [cartTotal],
  );

  const fp = useCallback(
    (amount: number) => formatPrice(amount, currency),
    [currency],
  );

  return (
    <CartContext.Provider
      value={{
        cart, addToCart, removeFromCart, updateQuantity, clearCart,
        cartTotal, cartCount,
        promoCode, setPromoCode, promoDiscount, setPromoDiscount, applyPromo,
        cartOpen, setCartOpen,
        currency, setCurrency, fp,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
