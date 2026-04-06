import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { type Locale, translations } from '@/lib/i18n';
import { CartProvider, useCart } from '@/contexts/CartContext';

// P2 FIX: t is now strongly typed — no more 't: any'.
// Consumers get full autocomplete: t.nav.home, t.checkout.total, etc.
type Translations = typeof translations[Locale];

interface AppContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Translations;
  recentlyViewed: string[];
  addRecentlyViewed: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    try {
      return (localStorage.getItem('pa-locale') as Locale) ?? 'zh';
    } catch {
      return 'zh';
    }
  });

  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('pa-recently-viewed');
      return stored ? JSON.parse(stored).slice(0, 6) : [];
    } catch {
      return [];
    }
  });

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('pa-locale', l);
  }, []);

  const addRecentlyViewed = useCallback((id: string) => {
    setRecentlyViewed(prev => {
      const deduped = [id, ...prev.filter(i => i !== id)].slice(0, 6);
      return deduped;
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('pa-recently-viewed', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  const t: Translations = translations[locale];

  return (
    <AppContext.Provider value={{ locale, setLocale, t, recentlyViewed, addRecentlyViewed }}>
      {/* CartProvider is nested here so cart state is isolated from locale re-renders */}
      <CartProvider>
        {children}
      </CartProvider>
    </AppContext.Provider>
  );
}

export function useApp() {
  const appCtx = useContext(AppContext);
  if (!appCtx) throw new Error('useApp must be used within AppProvider');
  const cartCtx = useCart();

  // Backward-compatibility shim: merges both contexts.
  // Existing components that call useApp() keep working unchanged.
  // For new components, prefer calling useCart() and useApp() separately
  // so re-renders are properly isolated.
  return { ...appCtx, ...cartCtx };
}
