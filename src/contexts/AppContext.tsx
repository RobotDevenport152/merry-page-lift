import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { type Locale, translations, type TranslationKey } from '@/lib/i18n';
import { type Currency, type CartItem, type Product, PROMO_CODES, formatPrice } from '@/lib/store';

interface AppContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: any;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  cart: CartItem[];
  addToCart: (product: Product, variant?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  cartTotal: number;
  cartCount: number;
  promoCode: string;
  setPromoCode: (code: string) => void;
  promoDiscount: number;
  applyPromo: (code: string) => boolean;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  fp: (amount: number) => string;
  recentlyViewed: string[];
  addRecentlyViewed: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('zh');
  const [currency, setCurrency] = useState<Currency>('CNY');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('pa-recently-viewed');
      return stored ? JSON.parse(stored).slice(0, 6) : [];
    } catch {
      return [];
    }
  });

  const t = translations[locale];

  const addToCart = useCallback((product: Product, variant?: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id && i.variant === variant);
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id && i.variant === variant
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { product, quantity: 1, variant }];
    });
    setCartOpen(true);
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(i => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(i => i.product.id !== productId));
    } else {
      setCart(prev => prev.map(i =>
        i.product.id === productId ? { ...i, quantity: qty } : i
      ));
    }
  }, []);

  const cartTotal = cart.reduce((sum, item) => sum + item.product.prices[currency] * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const applyPromo = useCallback((code: string) => {
    const promo = PROMO_CODES[code.toUpperCase()];
    if (!promo) return false;
    if (promo.minAmount && cartTotal < promo.minAmount) return false;
    if (promo.type === 'percent') {
      setPromoDiscount(cartTotal * promo.discount / 100);
    } else {
      setPromoDiscount(promo.discount);
    }
    setPromoCode(code.toUpperCase());
    return true;
  }, [cartTotal]);

  const fp = useCallback((amount: number) => formatPrice(amount, currency), [currency]);

  const addRecentlyViewed = useCallback((id: string) => {
    setRecentlyViewed(prev => {
      const deduped = [id, ...prev.filter(i => i !== id)].slice(0, 6);
      return deduped;
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('pa-recently-viewed', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  return (
    <AppContext.Provider value={{
      locale, setLocale, t, currency, setCurrency,
      cart, addToCart, removeFromCart, updateQuantity,
      cartTotal, cartCount, promoCode, setPromoCode,
      promoDiscount, applyPromo, cartOpen, setCartOpen, fp,
      recentlyViewed, addRecentlyViewed,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
