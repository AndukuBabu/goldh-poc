/**
 * UMF Scheduler
 * 
 * The ONLY place in the application that calls CoinGecko API.
 * Runs on a fixed interval (1 hour ± jitter) to fetch market data,
 * update cache, and persist to Firestore.
 * 
 * Enabled by: UMF_SCHEDULER=1 environment variable
 * 
 * Features:
 * - Initial jitter (0-15s) to prevent thundering herd
 * - Per-tick jitter (±15s) for interval randomization
 * - Rate limit guard (prevents calls within 55 minutes)
 * - Three-tier update: Cache → Firestore live → Firestore history
 * - Automatic history cleanup
 * - Performance logging
 * 
 * @see docs/UMF-Live-Firestore.md for scheduler architecture
 */

import { fetchTopCoinsByMarketCap } from './providers/coingecko';
import { setFresh } from './lib/cache';
import { writeLiveSnapshot, appendHistorySnapshot, trimHistory } from './lib/firestoreUmf';
import { integrationConfig } from '../config';
import type { UmfSnapshotLive } from '@shared/schema';
import {
  SCHEDULER_INTERVAL_MS,
  SCHEDULER_JITTER_MS,
  CACHE_TTL_S,
  HISTORY_MAX,
  LOG_PREFIX_SCHEDULER,
} from './config';

/**
 * Number of Top Coins to Track
 * 
 * Fetches the top N cryptocurrencies by market cap from CoinGecko.
 * 
 * Value: 100 coins
 * 
 * Rationale:
 * - Comprehensive coverage of major, mid-cap, and small-cap cryptocurrencies
 * - Automatically updates as market cap rankings change
 * - Single API call (no pagination needed)
 * - Provides extensive market overview
 */
const TOP_COINS_COUNT = 100;

/**
 * Rate Limit Guard
 * 
 * Minimum time between CoinGecko calls: 55 minutes
 * This is a safety guard to prevent accidental over-calling.
 */
const MIN_CALL_INTERVAL_MS = 55 * 60 * 1000; // 55 minutes

/**
 * Last CoinGecko Call Timestamp
 * 
 * Tracks when we last called CoinGecko API.
 * Used by rate limit guard.
 */
let lastCallAt: number | null = null;

/**
 * Scheduler Tick
 * 
 * Fetches market data from CoinGecko, updates cache, and persists to Firestore.
 * 
 * Flow:
 * 1. Check rate limit guard (skip if called within 55 minutes)
 * 2. Call fetchMarkets(CRYPTO_IDS, COINGECKO_API_KEY)
 * 3. Build UmfSnapshot
 * 4. Update in-memory cache
 * 5. Write to Firestore (live + history)
 * 6. Cleanup old history
 * 7. Log performance metrics
 * 
 * @throws Error if CoinGecko fetch fails (logged but not thrown)
 */
async function tick(): Promise<void> {
  const startTime = Date.now();

  try {
    // Rate limit guard: prevent calls within 55 minutes
    if (lastCallAt !== null) {
      const timeSinceLastCall = Date.now() - lastCallAt;

      if (timeSinceLastCall < MIN_CALL_INTERVAL_MS) {
        const minutesSince = Math.floor(timeSinceLastCall / 60000);
        console.warn(
          `${LOG_PREFIX_SCHEDULER} TooSoon - Last call ${minutesSince} minutes ago (minimum: 55 minutes). Skipping.`
        );
        return;
      }
    }

    // Update last call timestamp BEFORE calling API
    // This prevents race conditions if tick() is called concurrently
    lastCallAt = Date.now();

    console.log(`${LOG_PREFIX_SCHEDULER} Starting tick...`);

    // Step 1: Fetch top coins by market cap from CoinGecko
    const apiKey = integrationConfig.coingecko.apiKey;
    const result = await fetchTopCoinsByMarketCap(TOP_COINS_COUNT, apiKey);

    // Step 2: Build UmfSnapshotLive
    const snapshot: UmfSnapshotLive = {
      timestamp_utc: result.timestamp_utc,
      assets: result.assets,
      degraded: false, // Live CoinGecko data = not degraded
    };

    // Step 3: Update in-memory cache
    setFresh('umf:snapshot', snapshot, CACHE_TTL_S);

    // Step 4: Write to Firestore live collection
    await writeLiveSnapshot(snapshot);

    // Step 5: Append to Firestore history collection
    await appendHistorySnapshot(snapshot);

    // Step 6: Cleanup old history (keep only HISTORY_MAX most recent)
    const deletedCount = await trimHistory(HISTORY_MAX);

    // Calculate duration
    const duration_ms = Date.now() - startTime;

    // Step 7: Log success metrics
    console.log(
      `${LOG_PREFIX_SCHEDULER} Tick completed:`,
      JSON.stringify({
        provider: 'coingecko',
        items: result.assets.length,
        duration_ms,
        cache_write: true,
        firestore_write: true,
        history_trimmed: deletedCount,
        timestamp: snapshot.timestamp_utc,
      })
    );
  } catch (error) {
    // Log error but don't throw (prevents scheduler from stopping)
    console.error(
      `${LOG_PREFIX_SCHEDULER} Tick failed:`,
      error instanceof Error ? error.message : String(error)
    );

    // Reset lastCallAt on error so we can retry on next tick
    lastCallAt = null;
  }
}

/**
 * Generate Random Jitter
 * 
 * Returns a random value between -jitter and +jitter milliseconds.
 * Used for interval randomization to prevent thundering herd.
 * 
 * @param jitter - Maximum jitter in milliseconds
 * @returns Random jitter between -jitter and +jitter
 * 
 * @example
 * getRandomJitter(15000) → -7234 (random between -15000 and +15000)
 */
function getRandomJitter(jitter: number): number {
  return Math.floor(Math.random() * jitter * 2) - jitter;
}

/**
 * Start UMF Scheduler
 * 
 * Starts the scheduler with initial jitter and periodic ticks.
 * 
 * Startup Flow:
 * 1. Wait random 0-15 seconds (initial jitter)
 * 2. Run first tick()
 * 3. Schedule periodic ticks with jitter
 * 
 * Interval:
 * - Base: 1 hour (3,600,000ms)
 * - Jitter: ±15 seconds (±15,000ms)
 * - Effective: 59m 45s - 60m 15s per tick
 * 
 * @example
 * // In server entry point
 * if (process.env.UMF_SCHEDULER === '1') {
 *   startScheduler();
 * }
 */
export function startScheduler(): void {
  console.log(`${LOG_PREFIX_SCHEDULER} Initializing scheduler...`);
  console.log(`${LOG_PREFIX_SCHEDULER} Base interval: ${SCHEDULER_INTERVAL_MS}ms (${SCHEDULER_INTERVAL_MS / 60000} minutes)`);
  console.log(`${LOG_PREFIX_SCHEDULER} Jitter: ±${SCHEDULER_JITTER_MS}ms (±${SCHEDULER_JITTER_MS / 1000} seconds)`);
  console.log(`${LOG_PREFIX_SCHEDULER} Rate limit guard: ${MIN_CALL_INTERVAL_MS / 60000} minutes`);

  // Calculate initial jitter (random 0 to SCHEDULER_JITTER_MS)
  const initialJitter = Math.floor(Math.random() * SCHEDULER_JITTER_MS);
  console.log(`${LOG_PREFIX_SCHEDULER} Initial delay: ${initialJitter}ms (${(initialJitter / 1000).toFixed(1)}s)`);

  // Wait initial jitter, then run first tick
  setTimeout(async () => {
    console.log(`${LOG_PREFIX_SCHEDULER} Running first tick after initial jitter...`);
    await tick();

    // Schedule periodic ticks with jitter
    scheduleNextTick();
  }, initialJitter);
}

/**
 * Schedule Next Tick
 * 
 * Schedules the next tick with random jitter.
 * Recursively calls itself after each tick to maintain jitter.
 * 
 * Why Recursive Instead of setInterval:
 * - setInterval has fixed interval (no per-tick jitter)
 * - setTimeout allows us to randomize each interval
 * - Better distribution of load over time
 */
function scheduleNextTick(): void {
  // Calculate jittered interval for this tick
  const jitter = getRandomJitter(SCHEDULER_JITTER_MS);
  const interval = SCHEDULER_INTERVAL_MS + jitter;

  const intervalMinutes = (interval / 60000).toFixed(2);
  console.log(`${LOG_PREFIX_SCHEDULER} Next tick in ${interval}ms (${intervalMinutes} minutes)`);

  setTimeout(async () => {
    await tick();

    // Schedule next tick (recursive)
    scheduleNextTick();
  }, interval);
}

/**
 * Get Scheduler Status
 * 
 * Returns current scheduler status for debugging/monitoring.
 * 
 * @returns Scheduler status object
 */
export function getSchedulerStatus() {
  return {
    enabled: true,
    lastCallAt: lastCallAt ? new Date(lastCallAt).toISOString() : null,
    timeSinceLastCall: lastCallAt ? Date.now() - lastCallAt : null,
    minCallInterval: MIN_CALL_INTERVAL_MS,
    baseInterval: SCHEDULER_INTERVAL_MS,
    jitter: SCHEDULER_JITTER_MS,
  };
}
