import "@testing-library/jest-dom";
import { vi } from 'vitest';

// ── matchMedia stub (required for any component using media queries) ────────
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// ── localStorage: jsdom provides a real implementation.
// Tests that use CartContext must call localStorage.clear() in beforeEach.
// No mock needed — the real jsdom localStorage is sufficient. ────────────────

// ── Supabase client: prevent real network calls from unit tests ─────────────
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
      getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(() => Promise.resolve({ data: null, error: null })),
    })),
    rpc: vi.fn(() => Promise.resolve({ data: null, error: null })),
    functions: {
      invoke: vi.fn(() => Promise.resolve({ data: null, error: null })),
    },
  },
}));

// ── Exchange rate fetch: prevent real HTTP in unit tests ────────────────────
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: false,                       // triggers fallback path in useExchangeRates
    status: 503,
    json: () => Promise.resolve({}),
  } as Response)
);
