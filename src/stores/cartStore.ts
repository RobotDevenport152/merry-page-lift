import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '@/lib/store';

/**
 * Additive Zustand cart store. Lives alongside the existing CartContext —
 * does NOT replace it. Use this in new components when you want the
 * lightweight Zustand API without React context.
 */
interface CartState {
  items: CartItem[];
  addItem: (product: Product, variant?: string) => void;
  removeItem: (productId: string, variant?: string) => void;
  updateQuantity: (productId: string, qty: number, variant?: string) => void;
  clear: () => void;
  count: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, variant) =>
        set(state => {
          const existing = state.items.find(
            i => i.product.id === product.id && i.variant === variant,
          );
          if (existing) {
            return {
              items: state.items.map(i =>
                i.product.id === product.id && i.variant === variant
                  ? { ...i, quantity: i.quantity + 1 }
                  : i,
              ),
            };
          }
          return { items: [...state.items, { product, quantity: 1, variant }] };
        }),
      removeItem: (productId, variant) =>
        set(state => ({
          items: state.items.filter(
            i => !(i.product.id === productId && i.variant === variant),
          ),
        })),
      updateQuantity: (productId, qty, variant) =>
        set(state => ({
          items:
            qty <= 0
              ? state.items.filter(
                  i => !(i.product.id === productId && i.variant === variant),
                )
              : state.items.map(i =>
                  i.product.id === productId && i.variant === variant
                    ? { ...i, quantity: qty }
                    : i,
                ),
        })),
      clear: () => set({ items: [] }),
      count: () => get().items.reduce((s, i) => s + i.quantity, 0),
    }),
    { name: 'pa-cart-store-v1' },
  ),
);
