/**
 * CoinGecko Provider
 * 
 * Fetches cryptocurrency market data from CoinGecko API and transforms
 * it into the canonical UmfAssetLive schema.
 * 
 * Features:
 * - Optional API key authentication (x-cg-demo-api-key header)
 * - 5-second timeout
 * - 2 retries with exponential backoff (300ms, 900ms)
 * - Zod schema validation
 * - Proper error handling and logging
 * 
 * @see docs/UMF-Live-Firestore.md for integration architecture
 * @see https://docs.coingecko.com/reference/coins-markets
 */

import { z } from 'zod';
import type { UmfAssetLive } from '@shared/schema';
import { umfAssetLiveSchema } from '@shared/schema';

/**
 * CoinGecko API Configuration
 */
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
const COINGECKO_ENDPOINT = '/coins/markets';
const REQUEST_TIMEOUT_MS = 5000; // 5 seconds
const RETRY_DELAYS_MS = [300, 900]; // First retry: 300ms, second retry: 900ms

/**
 * CoinGecko API Response Schema (Single Coin)
 * 
 * Defines the expected shape of each coin object from /coins/markets.
 * Only includes fields we actually use for mapping to UmfAssetLive.
 */
const coinGeckoMarketItemSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  name: z.string(),
  current_price: z.number(),
  price_change_percentage_24h: z.number().nullable(),
  total_volume: z.number().nullable(),
  market_cap: z.number().nullable(),
  last_updated: z.string(),
});

/**
 * CoinGecko API Response Schema (Array)
 */
const coinGeckoMarketsResponseSchema = z.array(coinGeckoMarketItemSchema);

/**
 * TypeScript type for CoinGecko market item
 */
type CoinGeckoMarketItem = z.infer<typeof coinGeckoMarketItemSchema>;

/**
 * Fetch Markets Result
 * 
 * Returned by fetchMarkets() after successful API call and transformation.
 */
export interface FetchMarketsResult {
  assets: UmfAssetLive[];
  timestamp_utc: string; // ISO 8601 with 'Z' suffix
}

/**
 * Fetch Market Data from CoinGecko
 * 
 * Fetches cryptocurrency market data for specified coin IDs and transforms
 * it into the canonical UmfAssetLive schema with Zod validation.
 * 
 * @param ids - Array of CoinGecko coin IDs (e.g., ['bitcoin', 'ethereum'])
 * @param key - Optional CoinGecko API key for demo tier (better rate limits)
 * @returns Promise resolving to validated assets array with timestamp
 * @throws Error if API call fails after retries or validation fails
 * 
 * @example
 * ```typescript
 * const result = await fetchMarkets(['bitcoin', 'ethereum'], 'CG-xxx');
 * console.log(result.assets.length); // 2
 * console.log(result.timestamp_utc); // '2025-11-07T10:00:00.000Z'
 * ```
 */
export async function fetchMarkets(
  ids: string[],
  key?: string
): Promise<FetchMarketsResult> {
  // Validate inputs
  if (!ids || ids.length === 0) {
    throw new Error('fetchMarkets: ids array cannot be empty');
  }

  // Build URL with query parameters
  const url = new URL(COINGECKO_BASE_URL + COINGECKO_ENDPOINT);
  url.searchParams.set('vs_currency', 'usd');
  url.searchParams.set('ids', ids.join(',')); // Comma-separated, no spaces
  url.searchParams.set('sparkline', 'false');
  url.searchParams.set('price_change_percentage', '24h');

  // Build request headers
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };

  // Add API key header if provided
  if (key) {
    headers['x-cg-demo-api-key'] = key;
  }

  // Fetch with retries
  const response = await fetchWithRetry(url.toString(), {
    method: 'GET',
    headers,
    timeout: REQUEST_TIMEOUT_MS,
  });

  // Parse JSON
  const json = await response.json();

  // Validate response schema
  const coinsData = coinGeckoMarketsResponseSchema.parse(json);

  // Transform to UmfAssetLive schema
  const assets: UmfAssetLive[] = coinsData.map(transformCoinGeckoToUmfAsset);

  // Validate each transformed asset
  assets.forEach((asset, index) => {
    try {
      umfAssetLiveSchema.parse(asset);
    } catch (error) {
      throw new Error(
        `Asset validation failed for ${asset.symbol} (index ${index}): ${error instanceof Error ? error.message : String(error)}`
      );
    }
  });

  // Return validated result
  return {
    assets,
    timestamp_utc: new Date().toISOString(), // Always ends with 'Z'
  };
}

/**
 * Transform CoinGecko Market Item to UmfAssetLive
 * 
 * Maps CoinGecko API fields to our canonical live asset schema.
 * 
 * Mapping:
 * - id → id (CoinGecko ID, e.g., 'bitcoin')
 * - symbol → symbol (uppercase, e.g., 'BTC')
 * - name → name (e.g., 'Bitcoin')
 * - class → 'crypto' (all CoinGecko assets are crypto)
 * - current_price → price
 * - price_change_percentage_24h → changePct24h (nullable)
 * - total_volume → volume24h (nullable)
 * - market_cap → marketCap (nullable)
 * - last_updated → updatedAt_utc (ensure ends with 'Z')
 * 
 * @param item - CoinGecko market item from API response
 * @returns UmfAssetLive object
 */
function transformCoinGeckoToUmfAsset(item: CoinGeckoMarketItem): UmfAssetLive {
  return {
    id: item.id,
    symbol: item.symbol.toUpperCase(), // Uppercase: btc → BTC
    name: item.name,
    class: 'crypto', // All CoinGecko assets are cryptocurrencies
    price: item.current_price,
    changePct24h: item.price_change_percentage_24h ?? null,
    volume24h: item.total_volume ?? null,
    marketCap: item.market_cap ?? null,
    updatedAt_utc: ensureIsoWithZ(item.last_updated),
  };
}

/**
 * Ensure ISO timestamp ends with 'Z'
 * 
 * CoinGecko's last_updated field is already in ISO 8601 format with 'Z',
 * but this ensures consistency in case the format changes.
 * 
 * @param timestamp - ISO 8601 timestamp (may or may not end with 'Z')
 * @returns ISO 8601 timestamp guaranteed to end with 'Z'
 * 
 * @example
 * ensureIsoWithZ('2025-11-07T10:00:00.000Z') → '2025-11-07T10:00:00.000Z'
 * ensureIsoWithZ('2025-11-07T10:00:00.000') → '2025-11-07T10:00:00.000Z'
 * ensureIsoWithZ('2025-11-07T10:00:00') → '2025-11-07T10:00:00Z'
 */
function ensureIsoWithZ(timestamp: string): string {
  if (timestamp.endsWith('Z')) {
    return timestamp;
  }
  
  // Parse and re-serialize to ensure proper format
  const date = new Date(timestamp);
  return date.toISOString(); // Always ends with 'Z'
}

/**
 * Fetch with Retry Logic
 * 
 * Attempts to fetch from URL with exponential backoff retries.
 * 
 * Retry Strategy:
 * - Initial attempt (no delay)
 * - Retry 1: 300ms delay
 * - Retry 2: 900ms delay
 * - Total attempts: 3
 * 
 * @param url - URL to fetch
 * @param options - Fetch options (headers, method, timeout)
 * @returns Promise resolving to Response object
 * @throws Error if all retry attempts fail
 */
async function fetchWithRetry(
  url: string,
  options: {
    method: string;
    headers: Record<string, string>;
    timeout: number;
  }
): Promise<Response> {
  let lastError: Error | null = null;

  // Initial attempt + 2 retries = 3 total attempts
  const maxAttempts = 1 + RETRY_DELAYS_MS.length;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      // Add delay before retry attempts (not before first attempt)
      if (attempt > 0) {
        const delayMs = RETRY_DELAYS_MS[attempt - 1];
        await sleep(delayMs);
      }

      // Fetch with timeout
      const response = await fetchWithTimeout(url, options);

      // Check for HTTP errors
      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${response.statusText}`
        );
      }

      // Success!
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on last attempt
      if (attempt < maxAttempts - 1) {
        console.warn(
          `[CoinGecko] Attempt ${attempt + 1}/${maxAttempts} failed: ${lastError.message}. Retrying...`
        );
      }
    }
  }

  // All attempts failed
  throw new Error(
    `CoinGecko API failed after ${maxAttempts} attempts: ${lastError?.message || 'Unknown error'}`
  );
}

/**
 * Fetch with Timeout
 * 
 * Wraps native fetch with AbortController for timeout support.
 * 
 * @param url - URL to fetch
 * @param options - Fetch options with timeout
 * @returns Promise resolving to Response object
 * @throws Error if request times out or fails
 */
async function fetchWithTimeout(
  url: string,
  options: {
    method: string;
    headers: Record<string, string>;
    timeout: number;
  }
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout);

  try {
    const response = await fetch(url, {
      method: options.method,
      headers: options.headers,
      signal: controller.signal,
    });

    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${options.timeout}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Sleep Utility
 * 
 * Delays execution for specified milliseconds.
 * 
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after delay
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
