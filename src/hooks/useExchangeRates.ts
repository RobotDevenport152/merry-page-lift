import { useQuery } from '@tanstack/react-query';
import type { Currency } from '@/lib/store';

/**
 * P2 FIX: Exchange rates were hardcoded in store.ts:
 *   const EXCHANGE_RATES = { NZD: 1, CNY: 4.5, USD: 0.6 }
 *
 * This hook fetches live rates from a free open API (Frankfurter) with a
 * 6-hour stale time. Falls back to the hardcoded values if the fetch fails,
 * so the app remains functional offline or if the API is down.
 *
 * Usage:
 *   const { rates } = useExchangeRates();
 *   const nzdPrice = cnyPrice / rates.CNY;
 *
 * NOTE: Exchange rates are used for display only — actual payment amounts
 * are always derived from the stored per-currency price in the DB / store.
 * Do NOT use these rates to convert payment amounts.
 */

export type ExchangeRates = Record<Currency, number>;

// Fallback rates (last known good values) — used when API is unreachable
const FALLBACK_RATES: ExchangeRates = {
  NZD: 1,
  CNY: 4.5,
  USD: 0.6,
};

async function fetchRates(): Promise<ExchangeRates> {
  // Frankfurter is a free, open-source ECB exchange rate API
  const res = await fetch('https://api.frankfurter.app/latest?from=NZD&to=CNY,USD');
  if (!res.ok) throw new Error(`Exchange rate fetch failed: ${res.status}`);
  const data = await res.json();

  return {
    NZD: 1,
    CNY: parseFloat(data.rates?.CNY ?? FALLBACK_RATES.CNY),
    USD: parseFloat(data.rates?.USD ?? FALLBACK_RATES.USD),
  };
}

export function useExchangeRates() {
  const { data: rates, isError } = useQuery<ExchangeRates>({
    queryKey: ['exchange-rates'],
    queryFn: fetchRates,
    staleTime: 1000 * 60 * 60 * 6,  // 6 hours — rates don't change that fast
    gcTime:    1000 * 60 * 60 * 24, // Keep in cache for 24h
    retry: 2,
    // Return fallback rates as placeholder while loading / on error
    placeholderData: FALLBACK_RATES,
  });

  return {
    rates: rates ?? FALLBACK_RATES,
    isFallback: isError,
  };
}
