# UMF Live Integration - QA & Operations Policy

**Version:** 1.0  
**Date:** November 7, 2025  
**Status:** Production-Ready Testing Procedures

---

## Overview

This document defines the Quality Assurance and Operations procedures for validating the UMF (Universal Market Financials) live integration with CoinGecko API. The system implements a 1-call-per-hour rate limiting strategy with multi-tier caching.

**Architecture:**
```
Scheduler (55-min intervals) → CoinGecko API (1 call/hour)
                            ↓
        In-Memory Cache (1hr TTL) + Firestore (live + 48hr history)
                            ↓
                API Routes (cache → Firestore → empty)
                            ↓
                Frontend (API → Client Firestore → Mock)
```

---

## Prerequisites

### Environment Variables

Required environment variables for live integration:

```bash
# Enable UMF Scheduler
UMF_SCHEDULER=1

# CoinGecko API Key (Demo or Pro)
COINGECKO_API_KEY=CG-YOUR-API-KEY-HERE
```

**Setup Instructions:**

1. **Obtain CoinGecko API Key:**
   - Visit https://www.coingecko.com/api/pricing
   - Sign up for Demo (free) or Pro tier
   - Copy your API key from dashboard

2. **Configure Replit Secrets:**
   - Open Replit Secrets panel
   - Add `COINGECKO_API_KEY` with your key
   - Add `UMF_SCHEDULER=1` to enable scheduler

3. **Restart Workflow:**
   - Stop the application
   - Start the application
   - Verify logs show: `UMF Scheduler enabled (interval: 55 min)`

---

## Test Suite

### Test 1: Initial Scheduler Setup

**Objective:** Verify scheduler initializes correctly and starts background job.

**Steps:**

1. Set environment variables:
   ```bash
   UMF_SCHEDULER=1
   COINGECKO_API_KEY=<your-key>
   ```

2. Restart application workflow

3. Check server logs for:
   ```
   [express] UMF Scheduler enabled (interval: 55 min)
   [UMF Scheduler] Starting first tick...
   [UMF Scheduler] Fetching live snapshot from CoinGecko...
   [UMF Scheduler] Successfully fetched 25 assets
   [UMF Scheduler] Wrote snapshot to cache (TTL: 3600s)
   [UMF Scheduler] Wrote snapshot to Firestore: umf_snapshot_live/latest
   [UMF Scheduler] Next tick in ~55 minutes
   ```

**Expected Results:**
- ✅ Scheduler initializes within 10 seconds of startup
- ✅ First tick executes immediately (with 0-15s jitter)
- ✅ CoinGecko API call succeeds (200 OK)
- ✅ Cache and Firestore both populated
- ✅ No error messages in logs

**Pass Criteria:** All expected log messages appear within 30 seconds of startup.

---

### Test 2: Rate Limiting Validation

**Objective:** Verify no duplicate CoinGecko calls within 1-hour window.

**Steps:**

1. Load `/features/umf` page in browser
2. Refresh page 10 times rapidly
3. Wait 5 minutes
4. Refresh page 10 more times
5. Check server logs for CoinGecko provider calls

**Expected Results:**

**After First Scheduler Tick (cache populated):**
```
GET /api/umf/snapshot → x-umf-source: cache
GET /api/umf/movers → x-umf-source: cache
```

**Before First Scheduler Tick (cache empty):**
```
GET /api/umf/snapshot → x-umf-source: firestore
GET /api/umf/movers → x-umf-source: firestore
```

**Log Analysis:**
- ✅ Zero `[CoinGecko Provider]` entries during refresh storm
- ✅ All responses served from cache or Firestore
- ✅ Response times: cache <5ms, Firestore <200ms
- ✅ No rate limit errors (429) from CoinGecko

**Pass Criteria:** 
- 20+ page loads within 10 minutes = 0 CoinGecko API calls
- All responses include `x-umf-source` header

---

### Test 3: Hourly Tick Behavior

**Objective:** Verify scheduler executes exactly once per hour with correct data refresh.

**Steps:**

1. Note current time and `ageMinutes` on page
2. Wait for next scheduled tick (~55 minutes)
3. Monitor server logs during tick window
4. Refresh page after tick completes
5. Verify data freshness indicators

**Expected Results:**

**Server Logs (at tick):**
```
[UMF Scheduler] Starting tick...
[UMF Scheduler] Fetching live snapshot from CoinGecko...
[CoinGecko Provider] GET /api/v3/simple/price?ids=bitcoin,ethereum,...
[CoinGecko Provider] Response: 200 OK (25 assets)
[UMF Scheduler] Successfully fetched 25 assets
[UMF Scheduler] Wrote snapshot to cache (TTL: 3600s)
[UMF Scheduler] Wrote snapshot to Firestore: umf_snapshot_live/latest
[UMF Scheduler] Wrote history: umf_snapshot_history/{uuid}
[UMF Scheduler] Cleaned up 3 old snapshots (older than 48h)
[UMF Scheduler] Next tick in ~55 minutes (with ±15s jitter)
```

**Page UI (after tick):**
- Badge: `Data: Live` (green)
- Badge: `Updated just now` or `Updated 0 min ago`
- `ageMinutes < 1.0`

**Pass Criteria:**
- ✅ Exactly 1 CoinGecko call per hour (55-60 min intervals)
- ✅ Cache updated (visible in next API request)
- ✅ Firestore `latest` document updated
- ✅ History document created
- ✅ Page shows fresh timestamp

---

### Test 4: Degraded Mode (Broken API Key)

**Objective:** Verify graceful degradation when CoinGecko API fails.

**Steps:**

1. **Break the API key:**
   ```bash
   COINGECKO_API_KEY=INVALID_KEY_12345
   ```

2. Restart application

3. Wait for next scheduler tick

4. Monitor error handling

5. Load `/features/umf` page

**Expected Results:**

**Server Logs:**
```
[UMF Scheduler] Starting tick...
[UMF Scheduler] Fetching live snapshot from CoinGecko...
[CoinGecko Provider] GET /api/v3/simple/price (attempt 1/3)
[CoinGecko Provider] Error 401: Unauthorized
[CoinGecko Provider] Retrying in 1000ms...
[CoinGecko Provider] GET /api/v3/simple/price (attempt 2/3)
[CoinGecko Provider] Error 401: Unauthorized
[CoinGecko Provider] Retrying in 2000ms...
[CoinGecko Provider] GET /api/v3/simple/price (attempt 3/3)
[CoinGecko Provider] Error 401: Unauthorized
[UMF Scheduler] ⚠️ Failed to fetch from CoinGecko: Authentication failed
[UMF Scheduler] Cache NOT updated (keeping stale data)
[UMF Scheduler] Next tick in ~55 minutes
```

**API Routes (with stale cache):**
```
GET /api/umf/snapshot → 200 OK
Response: { degraded: true, timestamp_utc: "2025-11-07T15:00:00Z", ... }
Headers: x-umf-source: firestore
```

**Page UI:**
- Badge: `Data: Firestore` (blue)
- Badge: `Degraded ⚠️` (amber with pulsing dot)
- Tooltip: "Serving last good snapshot"
- Badge: `Updated 65 min ago` (stale)

**Pass Criteria:**
- ✅ No crashes or exceptions
- ✅ Retry logic executes (3 attempts with backoff)
- ✅ Routes serve from Firestore with `degraded: true`
- ✅ UI shows degraded indicator
- ✅ Scheduler continues running (doesn't crash)

---

### Test 5: History Cleanup

**Objective:** Verify old snapshots are automatically deleted after configured retention period.

**Method A: Accelerated Testing (Recommended for QA)**

Complete within 3-4 hours by temporarily lowering retention period.

**Steps:**

1. **Temporarily modify configuration** (for testing only):
   ```typescript
   // In server/umf/lib/config.ts
   export const HISTORY_MAX_HOURS = 2;  // Reduced from 48 to 2 hours
   ```

2. **Restart application** to apply config change

3. **Run scheduler for 3+ hours** (3-4 ticks at 55-min intervals)

4. **Monitor Firestore collection** `umf_snapshot_history`

5. **Check server logs** at each tick

6. **Restore configuration** after test:
   ```typescript
   // In server/umf/lib/config.ts
   export const HISTORY_MAX_HOURS = 48;  // Restore to production value
   ```

**Expected Results (with HISTORY_MAX_HOURS = 2):**

**After 1 Hour (1 tick):**
```
umf_snapshot_history:
  - snapshot_1 (2025-11-07T14:00:00Z) ✅
Total: 1 document
```

**After 2 Hours (2 ticks):**
```
umf_snapshot_history:
  - snapshot_1 (2025-11-07T14:00:00Z) ✅
  - snapshot_2 (2025-11-07T15:00:00Z) ✅
Total: 2 documents
```

**After 3 Hours (3 ticks):**
```
Server Logs:
[UMF Scheduler] Starting tick...
[UMF Scheduler] Wrote history: umf_snapshot_history/{uuid_3}
[UMF Scheduler] Cleaned up 1 old snapshots (older than 2h) ✅
[UMF Scheduler] Deleted snapshot: {uuid_1}

umf_snapshot_history:
  - snapshot_2 (2025-11-07T15:00:00Z) ✅
  - snapshot_3 (2025-11-07T16:00:00Z) ✅
Total: 2 documents (capped at max)
```

**After 4 Hours (4 ticks):**
```
[UMF Scheduler] Cleaned up 1 old snapshots (older than 2h) ✅
umf_snapshot_history: 2 documents (stable)
```

---

**Method B: Production Validation (Long-Term)**

Verify production behavior over multiple days.

**Steps:**

1. **Leave production config** unchanged:
   ```typescript
   HISTORY_MAX_HOURS = 48  // Production default
   ```

2. **Monitor over 50+ hours** (natural accumulation)

3. **Check Firestore collection** after 2+ days

**Expected Results (with HISTORY_MAX_HOURS = 48):**

**After 48 Hours:**
```
umf_snapshot_history: ~48 documents
[UMF Scheduler] Cleaned up 0 old snapshots (none older than 48h)
```

**After 50 Hours:**
```
[UMF Scheduler] Cleaned up 2 old snapshots (older than 48h) ✅
umf_snapshot_history: ~48 documents (stable)
```

---

**Pass Criteria (Both Methods):**
- ✅ History collection grows with each tick
- ✅ Cleanup runs automatically every tick
- ✅ Old snapshots deleted when exceeding retention period
- ✅ Collection size stabilizes at max (HISTORY_MAX_HOURS)
- ✅ Cleanup logged with count: "Cleaned up X old snapshots"

**Configuration Reference:**
- Default: `HISTORY_MAX_HOURS = 48` (production)
- Test: `HISTORY_MAX_HOURS = 2` (accelerated QA)
- Expected documents: ~HISTORY_MAX_HOURS (one per hour)

---

### Test 6: Performance Target

**Objective:** Verify initial page load remains under 2 seconds.

**Steps:**

1. Open Chrome DevTools (F12)

2. Navigate to **Lighthouse** tab

3. Run audit with:
   - Mode: Navigation (Default)
   - Device: Desktop
   - Categories: Performance

4. Navigate to **Network** tab

5. Hard refresh page (Cmd+Shift+R / Ctrl+Shift+R)

6. Check **DOMContentLoaded** and **Load** times

**Expected Results:**

**Lighthouse Performance Score:**
- ✅ Performance: 90+ (green)
- ✅ First Contentful Paint (FCP): <1.0s
- ✅ Largest Contentful Paint (LCP): <2.0s
- ✅ Total Blocking Time (TBT): <200ms
- ✅ Cumulative Layout Shift (CLS): <0.1

**Network Timings:**
- ✅ DOMContentLoaded: <1.5s
- ✅ Load: <2.0s
- ✅ `/api/umf/snapshot` response: <200ms (cached) or <500ms (Firestore)
- ✅ `/api/umf/movers` response: <200ms (cached) or <500ms (Firestore)

**Bundle Size:**
- ✅ JavaScript: <100KB (gzipped)
- ✅ CSS: <20KB (gzipped)
- ✅ Total transferred: <150KB

**Pass Criteria:**
- Initial load completes in <2s (all conditions)
- No performance regressions vs baseline

---

## Monitoring Checklist

### Daily Operations

**Health Checks:**
- [ ] Scheduler running (check logs for "UMF Scheduler enabled")
- [ ] CoinGecko calls succeeding (check for 200 OK responses)
- [ ] Cache hit rate >95% (after first tick)
- [ ] Firestore write latency <200ms
- [ ] No error spikes in logs

**Metrics to Track:**
```
- CoinGecko API calls per day: 24 (one per hour)
- Cache hit rate: >95%
- Average response time: <50ms (cache), <200ms (Firestore)
- Data staleness: <65 minutes (worst case)
- Degraded mode incidents: 0 (target)
```

### Weekly Reviews

- [ ] Review CoinGecko API quota usage (should be well under limit)
- [ ] Check history collection size (should be ~48 documents)
- [ ] Verify no memory leaks (cache size stable)
- [ ] Validate performance targets still met
- [ ] Review error logs for patterns

### Monthly Maintenance

- [ ] Validate CoinGecko API key still active
- [ ] Review rate limit policy (currently 1 call/hour)
- [ ] Check for CoinGecko API version updates
- [ ] Audit Firestore storage costs (history collection)
- [ ] Performance regression testing

---

## Troubleshooting Guide

### Problem: Scheduler Not Starting

**Symptoms:**
```
[express] UMF Scheduler disabled (set UMF_SCHEDULER=1 to enable)
```

**Solution:**
1. Check environment variable: `echo $UMF_SCHEDULER`
2. Set to `1` in Replit Secrets
3. Restart workflow

---

### Problem: CoinGecko API Errors (401/403)

**Symptoms:**
```
[CoinGecko Provider] Error 401: Unauthorized
```

**Solution:**
1. Verify API key: `echo $COINGECKO_API_KEY`
2. Test key manually: `curl "https://api.coingecko.com/api/v3/ping?x_cg_demo_api_key=YOUR_KEY"`
3. Check quota limits in CoinGecko dashboard
4. Regenerate key if expired

---

### Problem: High Staleness (Data Age >2 hours)

**Symptoms:**
- Badge shows "Updated 120 min ago"
- `x-umf-source: firestore` (no cache)

**Solution:**
1. Check scheduler logs for errors
2. Verify scheduler is running (`ps aux | grep tsx`)
3. Check for CoinGecko API failures
4. Manually trigger refresh if needed
5. Review retry logic in `server/umf/scheduler.ts`

---

### Problem: Cache Always Empty

**Symptoms:**
```
GET /api/umf/snapshot → x-umf-source: firestore (always)
```

**Solution:**
1. Check cache TTL: default is 3600s (1 hour)
2. Verify cache writes in logs: "Wrote snapshot to cache"
3. Check for cache eviction (memory pressure)
4. Review `server/umf/lib/cache.ts` implementation

---

### Problem: Firestore Write Errors

**Symptoms:**
```
[UMF Scheduler] ⚠️ Failed to write to Firestore: Permission denied
```

**Solution:**
1. Check Firebase service account credentials
2. Verify Firestore security rules
3. Check network connectivity
4. Review Firebase console for outages

---

## Performance Benchmarks

### Baseline Measurements (Target)

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Initial Page Load** | <2.0s | Chrome DevTools Network tab (Load event) |
| **API Response (Cache)** | <5ms | Server logs + Network tab |
| **API Response (Firestore)** | <200ms | Server logs + Network tab |
| **CoinGecko API Call** | <1500ms | Provider logs (avg across 3 retries) |
| **Cache Write** | <1ms | In-memory operation |
| **Firestore Write** | <150ms | Firebase latency |
| **Lighthouse Score** | 90+ | Chrome Lighthouse audit |

### Load Testing

**Scenario:** 100 concurrent users hitting `/features/umf`

**Expected Behavior:**
- All requests served from cache (after first tick)
- Zero CoinGecko API calls
- Response times: p50 <10ms, p95 <50ms, p99 <100ms
- No errors or timeouts

---

## Compliance & Attribution

### CoinGecko Terms of Service

**Required Attribution:**
- ✅ "Powered by CoinGecko" badge visible on page
- ✅ Link to https://www.coingecko.com
- ✅ Attribution appears in footer with external link icon

**Rate Limiting Compliance:**
- Demo tier: 10,000 calls/month (we use ~720/month = 7.2%)
- Pro tier: 500 calls/minute (we use 24/day = 0.0016 calls/min)
- Current usage: Well under all limits ✅

**Data Usage Policy:**
- ✅ Non-commercial or commercial use (depending on tier)
- ✅ No data redistribution (served through our API only)
- ✅ Caching allowed (we cache for 1 hour)

---

## Rollback Procedures

### Emergency Rollback (Scheduler Issues)

If scheduler causes instability:

1. **Disable Scheduler:**
   ```bash
   # Remove or set to 0
   UMF_SCHEDULER=0
   ```

2. **Restart Application**

3. **Verify Fallback:**
   - Routes serve from Firestore (last good data)
   - UI shows `Data: Firestore` badge
   - Page remains functional

4. **Investigate Root Cause**

5. **Re-enable When Fixed**

---

### Full Rollback (Revert to Mock Data)

If live integration causes issues:

1. **Disable Scheduler:** `UMF_SCHEDULER=0`

2. **Update Hooks:** Comment out live API fallback in `useUmfSnapshot()`

3. **Restart Application**

4. **Verify Mock Data:** UI shows `Data: Mock` badge

5. **Plan Fix:** Review logs, identify issue, implement fix

6. **Re-deploy:** Enable scheduler, test thoroughly

---

## Sign-Off Checklist

Before deploying to production:

- [ ] All 6 QA tests pass
- [ ] Environment variables configured
- [ ] CoinGecko API key valid
- [ ] Performance targets met (<2s initial load)
- [ ] Attribution visible on page
- [ ] Monitoring dashboard configured
- [ ] Error alerting enabled
- [ ] Rollback procedure documented
- [ ] Team trained on troubleshooting

---

## Appendix A: Configuration Reference

**Environment Variables:**
```bash
UMF_SCHEDULER=1                    # Enable scheduler
COINGECKO_API_KEY=CG-xxxxx        # API key
```

**Rate Limiting:**
```typescript
SCHEDULER_INTERVAL_MS = 55 * 60 * 1000  // 55 minutes
SCHEDULER_JITTER_MS = 15 * 1000         // ±15 seconds
CACHE_TTL_SECONDS = 3600                // 1 hour
HISTORY_MAX_HOURS = 48                  // 2 days
```

**Retry Policy:**
```typescript
MAX_RETRIES = 3
RETRY_DELAYS = [1000, 2000, 4000]  // Exponential backoff
```

---

## Appendix B: Log Message Reference

**Success Messages:**
```
✅ UMF Scheduler enabled (interval: 55 min)
✅ Successfully fetched 25 assets
✅ Wrote snapshot to cache (TTL: 3600s)
✅ Wrote snapshot to Firestore: umf_snapshot_live/latest
```

**Warning Messages:**
```
⚠️ Failed to fetch from CoinGecko: [error]
⚠️ Cache write failed (continuing without cache)
⚠️ Firestore write failed (degraded mode)
```

**Error Messages:**
```
❌ Scheduler failed to initialize
❌ All retries exhausted
❌ Invalid API response format
```

---

## Document Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-11-07 | Initial release | Replit Agent |

---

**End of Document**
