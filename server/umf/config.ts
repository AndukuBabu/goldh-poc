/**
 * UMF (Universal Market Financials) Configuration
 * 
 * Central configuration for the live CoinGecko integration including:
 * - Asset IDs to track
 * - Cache TTL settings
 * - Scheduler timing configuration
 * - Firestore history retention
 * 
 * @see docs/UMF-Live-Firestore.md for architecture details
 */

/**
 * Top Coins Strategy
 * 
 * GOLDH Pulse now fetches the top N cryptocurrencies by market cap dynamically
 * from CoinGecko using pagination parameters instead of hardcoded coin IDs.
 * 
 * This provides several benefits:
 * - Automatically tracks the most important coins (BTC, ETH, etc.)
 * - Rankings update dynamically as market cap changes
 * - No need to manually update coin list
 * - More comprehensive market coverage (50 vs 15 coins)
 * 
 * The number of coins to fetch is configured in scheduler.ts (TOP_COINS_COUNT = 50)
 * 
 * API Parameters:
 * - vs_currency: usd
 * - order: market_cap_desc (sorts by market cap, highest first)
 * - per_page: 50 (gets top 50 coins)
 * - page: 1 (first page only)
 * 
 * @see server/umf/scheduler.ts for TOP_COINS_COUNT configuration
 * @see https://docs.coingecko.com/reference/coins-markets
 */

/**
 * Cache Time-To-Live (seconds)
 * 
 * How long to keep snapshot data in in-memory cache before expiring.
 * After expiration, API routes will fall back to Firestore.
 * 
 * Value: 3600 seconds = 1 hour
 * 
 * Rationale:
 * - Matches scheduler interval (data refreshes hourly)
 * - Reduces Firestore reads (cost optimization)
 * - Fast API responses (< 5ms from cache vs ~100ms from Firestore)
 */
export const CACHE_TTL_S = 3600; // 1 hour

/**
 * Scheduler Interval (milliseconds)
 * 
 * How often the scheduler runs to fetch fresh data from CoinGecko.
 * 
 * Value: 3,600,000 ms = 1 hour
 * 
 * Rationale:
 * - Conservative rate limiting (24 calls/day vs 43,200/day limit)
 * - CoinGecko free tier updates every 60 seconds, so hourly is sufficient
 * - Enables historical snapshots (48 per 2 days)
 * - Reduces API dependency and costs
 * 
 * Note: This is the base interval. Actual interval includes jitter.
 */
export const SCHEDULER_INTERVAL_MS = 3_600_000; // 1 hour

/**
 * Scheduler Jitter (milliseconds)
 * 
 * Random time variance added to scheduler interval to prevent
 * thundering herd problems if multiple instances restart simultaneously.
 * 
 * Value: ±15,000 ms = ±15 seconds
 * 
 * Effective interval range: 3,585,000 - 3,615,000 ms (59m 45s - 60m 15s)
 * 
 * Rationale:
 * - Prevents all instances from hitting CoinGecko at exact same time
 * - Distributes load more evenly
 * - Still maintains ~1 hour cadence
 */
export const SCHEDULER_JITTER_MS = 15_000; // ±15 seconds

/**
 * Firestore History Max Count
 * 
 * Maximum number of historical snapshots to keep in Firestore.
 * Older snapshots are automatically deleted during cleanup.
 * 
 * Value: 48 snapshots
 * 
 * Coverage: 48 hours (2 days) of hourly snapshots
 * 
 * Rationale:
 * - Enables 24-48 hour trend analysis
 * - Balances storage costs vs. historical value
 * - Sufficient for day-over-day comparisons
 * - Prevents unbounded growth
 * 
 * Firestore Collections:
 * - umf_snapshot_history/{timestamp} - Stores historical snapshots
 * - Cleanup runs after each scheduler tick
 * - Deletes snapshots older than 48 hours
 */
export const HISTORY_MAX = 48; // ~48 hours of hourly snapshots

/**
 * Derived Configuration Values
 */

/**
 * History Max Age (milliseconds)
 * 
 * Calculated from HISTORY_MAX and SCHEDULER_INTERVAL_MS.
 * Used to determine which snapshots to delete during cleanup.
 * 
 * Value: 48 hours = 172,800,000 ms
 */
export const HISTORY_MAX_AGE_MS = HISTORY_MAX * SCHEDULER_INTERVAL_MS;

/**
 * CoinGecko API Configuration
 */

/**
 * CoinGecko Base URL
 */
export const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

/**
 * CoinGecko Endpoint
 */
export const COINGECKO_ENDPOINT = '/coins/markets';

/**
 * CoinGecko Full URL
 */
export const COINGECKO_URL = `${COINGECKO_BASE_URL}${COINGECKO_ENDPOINT}`;

/**
 * CoinGecko Query Parameters (Legacy)
 * 
 * Note: These params are no longer used by the scheduler.
 * The scheduler now uses fetchTopCoinsByMarketCap() which builds
 * its own parameters dynamically.
 * 
 * Kept for reference only.
 */
export const COINGECKO_PARAMS_LEGACY = {
  vs_currency: 'usd',
  sparkline: 'false',
  price_change_percentage: '24h',
  order: 'market_cap_desc',
  per_page: '50',
  page: '1',
};

/**
 * Firestore Collection Names
 */

/**
 * Collection: umf_snapshot_live
 * 
 * Stores the latest live snapshot from CoinGecko.
 * Document ID: 'latest'
 * Overwrites on each scheduler run.
 */
export const FIRESTORE_COLLECTION_LIVE = 'umf_snapshot_live';

/**
 * Document ID for latest snapshot
 */
export const FIRESTORE_DOC_LATEST = 'latest';

/**
 * Collection: umf_snapshot_history
 * 
 * Stores historical snapshots for trend analysis.
 * Document IDs: ISO timestamps (e.g., '2025-11-07T10:00:00.000Z')
 * Retention: Last 48 hours (HISTORY_MAX)
 */
export const FIRESTORE_COLLECTION_HISTORY = 'umf_snapshot_history';

/**
 * Cache Keys
 */

/**
 * In-memory cache key for live snapshot
 */
export const CACHE_KEY_SNAPSHOT = 'umf_snapshot_live';

/**
 * Logging Prefixes
 */

/**
 * Scheduler log prefix
 */
export const LOG_PREFIX_SCHEDULER = '[UMF Scheduler]';

/**
 * Cache log prefix
 */
export const LOG_PREFIX_CACHE = '[UMF Cache]';

/**
 * API log prefix
 */
export const LOG_PREFIX_API = '[UMF API]';

/**
 * Timeouts
 */

/**
 * CoinGecko API request timeout (milliseconds)
 * 
 * Maximum time to wait for CoinGecko API response.
 * If exceeded, scheduler logs error and continues (serves stale data).
 */
export const COINGECKO_TIMEOUT_MS = 10_000; // 10 seconds

/**
 * Firestore operation timeout (milliseconds)
 * 
 * Maximum time to wait for Firestore read/write operations.
 */
export const FIRESTORE_TIMEOUT_MS = 5_000; // 5 seconds
