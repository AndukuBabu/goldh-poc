/**
 * In-Memory Cache Utility
 * 
 * Simple TTL-based cache for UMF snapshot and movers data.
 * Uses Map for O(1) lookups with timestamp-based freshness checks.
 * 
 * Cache Keys:
 * - 'umf:snapshot' - Live market snapshot
 * - 'umf:movers' - Top gainers/losers
 * 
 * @see docs/UMF-Live-Firestore.md for cache architecture
 */

/**
 * Cache Entry Structure
 * 
 * Stores cached value with timestamp and TTL for freshness checks.
 */
interface CacheEntry<T> {
  value: T;
  at: number;  // Unix timestamp in milliseconds (Date.now())
  ttl: number; // Time-to-live in seconds
}

/**
 * In-memory cache store
 * 
 * Map<key, CacheEntry> for O(1) lookups
 */
const cache = new Map<string, CacheEntry<unknown>>();

/**
 * Get Fresh Cache Entry
 * 
 * Returns cached value if it exists and is still fresh (within TTL).
 * Returns null if entry doesn't exist or has expired.
 * 
 * Freshness Check:
 * - Fresh if: (now - at) < (ttl * 1000)
 * - TTL is in seconds, timestamps in milliseconds
 * - If expired, entry remains in cache but null is returned
 * 
 * @param key - Cache key (e.g., 'umf:snapshot', 'umf:movers')
 * @returns Cached value if fresh, null if expired or missing
 * 
 * @example
 * ```typescript
 * // Set cache with 1 hour TTL
 * setFresh('umf:snapshot', snapshot, 3600);
 * 
 * // Get within 1 hour - returns value
 * const cached = getFresh<UmfSnapshotLive>('umf:snapshot');
 * if (cached) {
 *   console.log('Cache hit:', cached.assets.length);
 * }
 * 
 * // Get after 1 hour - returns null
 * const expired = getFresh<UmfSnapshotLive>('umf:snapshot');
 * if (!expired) {
 *   console.log('Cache miss or expired');
 * }
 * ```
 */
export function getFresh<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;

  if (!entry) {
    // Entry doesn't exist
    return null;
  }

  const now = Date.now();
  const age = now - entry.at; // Age in milliseconds
  const ttlMs = entry.ttl * 1000; // Convert TTL from seconds to milliseconds

  // Check freshness: age < TTL
  if (age < ttlMs) {
    // Still fresh
    return entry.value;
  }

  // Expired
  return null;
}

/**
 * Set Fresh Cache Entry
 * 
 * Stores a value in cache with current timestamp and TTL.
 * 
 * @param key - Cache key (e.g., 'umf:snapshot', 'umf:movers')
 * @param value - Value to cache
 * @param ttl - Time-to-live in seconds
 * 
 * @example
 * ```typescript
 * setFresh('umf:snapshot', snapshot, 3600); // Cache for 1 hour (3600 seconds)
 * setFresh('umf:movers', movers, 3600);     // Cache for 1 hour
 * ```
 */
export function setFresh<T>(key: string, value: T, ttl: number): void {
  const entry: CacheEntry<T> = {
    value,
    at: Date.now(),
    ttl,
  };

  cache.set(key, entry);
}
