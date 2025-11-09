/**
 * Guru Digest Scheduler
 * 
 * Automatically updates Guru Digest on a fixed interval (2.5 hours ± jitter).
 * Fetches RSS feeds from CoinDesk and Cointelegraph, clears old entries,
 * and stores fresh articles in Firestore.
 * 
 * Enabled by: GURU_SCHEDULER=1 environment variable
 * 
 * Features:
 * - Initial jitter (0-30s) to prevent thundering herd
 * - Per-tick jitter (±30s) for interval randomization
 * - Rate limit guard (prevents calls within 2.4 hours)
 * - Automatic clearing of old entries before each update
 * - Performance logging
 * 
 * Update frequency: Every 2.5 hours = 10 updates per day
 * - 00:00 (midnight)
 * - 02:30
 * - 05:00
 * - 07:30
 * - 10:00
 * - 12:30
 * - 15:00
 * - 17:30
 * - 20:00
 * - 22:30
 */

import { updateGuruDigest } from './updater';

/**
 * Scheduler Configuration
 */
const SCHEDULER_INTERVAL_MS = 2.5 * 60 * 60 * 1000; // 2.5 hours
const SCHEDULER_JITTER_MS = 30 * 1000; // ±30 seconds
const MIN_CALL_INTERVAL_MS = 2.4 * 60 * 60 * 1000; // 2.4 hours (safety guard)
const LOG_PREFIX = '[Guru Scheduler]';

/**
 * Last Update Timestamp
 * 
 * Tracks when we last updated Guru Digest.
 * Used by rate limit guard.
 */
let lastUpdateAt: number | null = null;

/**
 * Scheduler Interval ID
 * 
 * Used to stop the scheduler.
 */
let intervalId: NodeJS.Timeout | null = null;

/**
 * Random Jitter
 * 
 * Returns a random jitter value between -jitter and +jitter.
 * Used to randomize scheduler intervals.
 * 
 * @param jitter - Maximum jitter in milliseconds
 * @returns Random jitter value
 */
function randomJitter(jitter: number): number {
  return Math.floor(Math.random() * jitter * 2) - jitter;
}

/**
 * Scheduler Tick
 * 
 * Updates Guru Digest with latest RSS articles.
 * 
 * Flow:
 * 1. Check rate limit guard (skip if called within 2.4 hours)
 * 2. Clear old entries
 * 3. Fetch RSS feeds
 * 4. Process articles
 * 5. Store in Firestore
 * 6. Log performance metrics
 * 
 * @throws Error if update fails (logged but not thrown)
 */
async function tick(): Promise<void> {
  const startTime = Date.now();
  
  try {
    // Rate limit guard: prevent calls within 2.4 hours
    if (lastUpdateAt !== null) {
      const timeSinceLastUpdate = Date.now() - lastUpdateAt;
      
      if (timeSinceLastUpdate < MIN_CALL_INTERVAL_MS) {
        const hoursSince = (timeSinceLastUpdate / (60 * 60 * 1000)).toFixed(1);
        console.warn(
          `${LOG_PREFIX} TooSoon - Last update ${hoursSince} hours ago (minimum: 2.4 hours). Skipping.`
        );
        return;
      }
    }
    
    // Update last update timestamp BEFORE calling updater
    // This prevents race conditions if tick() is called concurrently
    lastUpdateAt = Date.now();
    
    console.log(`${LOG_PREFIX} Starting tick...`);
    
    // Update Guru Digest (clear old entries first)
    const result = await updateGuruDigest({
      clearFirst: true,
      logPrefix: LOG_PREFIX,
    });
    
    // Log performance metrics
    const duration = Date.now() - startTime;
    const durationSec = (duration / 1000).toFixed(2);
    
    console.log(
      `${LOG_PREFIX} ✓ Tick complete in ${durationSec}s`,
      `(${result.successfulEntries}/${result.totalArticles} articles, ${result.deletedEntries} deleted)`
    );
    
    // Schedule next tick with jitter
    scheduleNextTick();
  } catch (error) {
    console.error(`${LOG_PREFIX} Tick failed:`, error);
    
    // Schedule retry with full interval
    scheduleNextTick();
  }
}

/**
 * Schedule Next Tick
 * 
 * Schedules the next scheduler tick with randomized jitter.
 * Clears any existing scheduled tick before scheduling new one.
 */
function scheduleNextTick(): void {
  // Clear existing interval
  if (intervalId) {
    clearTimeout(intervalId);
  }
  
  // Calculate next interval with jitter
  const jitter = randomJitter(SCHEDULER_JITTER_MS);
  const nextInterval = SCHEDULER_INTERVAL_MS + jitter;
  const nextIntervalMin = (nextInterval / (60 * 1000)).toFixed(1);
  
  console.log(`${LOG_PREFIX} Next tick in ${nextIntervalMin} minutes`);
  
  // Schedule next tick
  intervalId = setTimeout(() => {
    tick();
  }, nextInterval);
}

/**
 * Start Guru Digest Scheduler
 * 
 * Starts the scheduler with initial jitter and recurring ticks.
 * 
 * Initial behavior:
 * - Waits 0-30s (random jitter) before first tick
 * - Subsequent ticks every 2.5 hours ± 30s
 * 
 * @returns True if scheduler started, false if already running
 */
export function startGuruScheduler(): boolean {
  if (intervalId !== null) {
    console.warn(`${LOG_PREFIX} Already running`);
    return false;
  }
  
  console.log(`${LOG_PREFIX} Starting...`);
  console.log(`${LOG_PREFIX} Update interval: ${SCHEDULER_INTERVAL_MS / (60 * 1000)} minutes (2.5 hours)`);
  console.log(`${LOG_PREFIX} Jitter: ±${SCHEDULER_JITTER_MS / 1000} seconds`);
  
  // Initial jitter (0-30s) to prevent thundering herd
  const initialJitter = Math.floor(Math.random() * SCHEDULER_JITTER_MS);
  const initialDelaySec = (initialJitter / 1000).toFixed(1);
  
  console.log(`${LOG_PREFIX} First tick in ${initialDelaySec} seconds`);
  
  // Schedule first tick
  setTimeout(() => {
    tick();
  }, initialJitter);
  
  return true;
}

/**
 * Stop Guru Digest Scheduler
 * 
 * Stops the scheduler and clears scheduled ticks.
 * 
 * @returns True if scheduler stopped, false if not running
 */
export function stopGuruScheduler(): boolean {
  if (intervalId === null) {
    console.warn(`${LOG_PREFIX} Not running`);
    return false;
  }
  
  clearTimeout(intervalId);
  intervalId = null;
  
  console.log(`${LOG_PREFIX} Stopped`);
  return true;
}
