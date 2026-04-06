import { useState, useCallback, useEffect } from 'react';

const KEY = 'pa-wishlist-v1';

function load(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

/**
 * P1 FIX: Wishlist persisted to localStorage.
 * No login required — works for guest users too.
 * When the user logs in, wishlist can later be migrated to a DB table.
 *
 * Upgrade path: replace localStorage reads/writes with Supabase
 * `wishlists(user_id, product_id, created_at)` table queries.
 */
export function useWishlist() {
  const [ids, setIds] = useState<string[]>(load);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(ids));
  }, [ids]);

  const toggle = useCallback((productId: string) => {
    setIds(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId],
    );
  }, []);

  const isWishlisted = useCallback(
    (productId: string) => ids.includes(productId),
    [ids],
  );

  return { wishlistIds: ids, toggle, isWishlisted, count: ids.length };
}
