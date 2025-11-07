# UMF Live Integration Plan - CoinGecko + Firestore

**Feature:** Universal Market Financials (UMF)  
**Migration:** Firestore Mock Data → Live CoinGecko API  
**Date:** November 7, 2025  
**Version:** 2.0.0-live

---

## Overview

This document outlines the plan to migrate UMF from Firestore mock data to live CoinGecko API integration while maintaining strict rate limiting (1 call/hour) and graceful degradation.

**Key Principle:** Never call CoinGecko directly from API routes. Always serve from cache or Firestore.

---

## Data Provider: CoinGecko

### Provider Details

**Provider:** CoinGecko  
**Plan:** Free/Demo Tier  
**Base URL:** `https://api.coingecko.com/api/v3`  
**Documentation:** https://docs.coingecko.com/reference/coins-markets

---

### Authentication & Secrets

**API Key (Optional for Demo Tier):**
- **Header:** `x-cg-demo-api-key`
- **When to include:** If API key exists in environment
- **Fallback:** Works without key (more restrictive rate limits)

---

#### **Setting Up the Replit Secret**

**Secret Name:** `COINGECKO_API_KEY`

**How to Add:**
1. Click the **"Secrets"** tab (🔒 lock icon) in the left sidebar
2. Click **"+ New Secret"**
3. Enter:
   - **Key:** `COINGECKO_API_KEY`
   - **Value:** Your CoinGecko demo API key
4. Click **"Add Secret"**

**Important:**
- ⚠️ **NEVER commit the API key to Git** - Always use Replit Secrets
- ✅ The secret is automatically injected as `process.env.COINGECKO_API_KEY`
- 🔒 Only server-side code can access this secret (not client code)
- 📌 Used exclusively by the scheduler (hourly tick), never from API routes

---

#### **Usage in Server Code**

**Scheduler Implementation (`server/schedulers/umfScheduler.ts`):**

```typescript
async function refreshUmfSnapshot() {
  // Build request headers
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };

  // Add API key header ONLY if secret exists
  if (process.env.COINGECKO_API_KEY) {
    headers['x-cg-demo-api-key'] = process.env.COINGECKO_API_KEY;
    console.log('[UMF Scheduler] Using CoinGecko API key');
  } else {
    console.warn('[UMF Scheduler] No API key found, using keyless fallback');
  }

  // Fetch from CoinGecko
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIds}&sparkline=false&price_change_percentage=24h`;
  
  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
  }
  
  const coins = await response.json();
  // ... rest of logic
}
```

**Key Points:**
- ✅ Check `process.env.COINGECKO_API_KEY` before using
- ✅ Only add header if secret exists (graceful fallback)
- ✅ Log whether key is being used (for debugging)
- ⚠️ Never log the actual key value (security risk)

---

#### **Keyless Fallback Behavior**

**If Secret Missing:**
- Scheduler will still fetch data (no header sent)
- CoinGecko uses more restrictive rate limits (10 calls/min vs 30)
- Our 1-call-per-hour policy is still well within limits
- No functionality lost (just lower rate ceiling)

**Recommendation:** Always set the secret for better rate limits and future-proofing.

---

### Rate Limits

**Free/Demo Tier:**
- **Limit:** 30 calls/minute (demo), 10-50 calls/minute (free)
- **Update Frequency:** Every 60 seconds (public/demo)
- **Sparkline Update:** Every 6 hours

**Our Policy:** 1 call/hour (conservative, well under limits)

**Why 1 call/hour?**
- Extremely conservative (only 24 calls/day vs. 43,200 limit)
- Reduces API dependency
- Enables Firestore historical snapshots
- Ensures stability and cost predictability

---

## Data Endpoint

### Primary Endpoint: `/coins/markets`

**Full URL:**
```
GET https://api.coingecko.com/api/v3/coins/markets
```

**Purpose:** Fetch market data for multiple coins in a single request

---

### Required Parameters

#### **vs_currency** (required)
- **Type:** `string`
- **Value:** `usd`
- **Description:** Target currency for price conversion

#### **ids** (required)
- **Type:** `string` (comma-separated, no spaces)
- **Value:** Coin IDs from CoinGecko's ID system
- **Example:** `bitcoin,ethereum,solana,binancecoin`

**Our Asset List (25 assets):**
```typescript
// Crypto (15)
bitcoin, ethereum, solana, binancecoin, ripple, cardano, 
dogecoin, tron, polkadot, avalanche-2, chainlink, 
bitcoin-cash, litecoin, uniswap, ethereum-classic

// Note: For traditional assets (SPX, NDX, DXY, GOLD, WTI, etc.)
// we'll need alternative endpoints or providers.
// CoinGecko primarily covers cryptocurrencies.
```

---

#### **sparkline** (optional)
- **Type:** `boolean`
- **Value:** `false`
- **Description:** Exclude 7-day price sparkline data
- **Reason:** Not needed for MVP, reduces response size

---

#### **price_change_percentage** (optional)
- **Type:** `string` (comma-separated)
- **Value:** `24h`
- **Description:** Include 24-hour price change percentage
- **Valid values:** `1h`, `24h`, `7d`, `14d`, `30d`, `200d`, `1y`

---

### Optional Parameters

#### **order** (optional)
- **Type:** `string`
- **Default:** `market_cap_desc`
- **Options:** `market_cap_desc`, `volume_desc`, `id_asc`
- **Our choice:** `market_cap_desc` (default)

#### **per_page** (optional)
- **Type:** `integer`
- **Default:** `100`
- **Max:** `250`
- **Our choice:** `100` (sufficient for 25 assets)

---

### Example Request

**URL:**
```
https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana&sparkline=false&price_change_percentage=24h
```

**cURL:**
```bash
curl -X GET \
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana&sparkline=false&price_change_percentage=24h" \
  -H "Accept: application/json" \
  -H "x-cg-demo-api-key: YOUR_API_KEY"
```

---

### Response Format

**Response:** Array of coin objects

**Example Response (1 coin):**
```json
[
  {
    "id": "bitcoin",
    "symbol": "btc",
    "name": "Bitcoin",
    "image": "https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png",
    "current_price": 43250.50,
    "market_cap": 846234567890,
    "market_cap_rank": 1,
    "fully_diluted_valuation": 908765432100,
    "total_volume": 25678901234,
    "high_24h": 43890.75,
    "low_24h": 42567.25,
    "price_change_24h": 683.25,
    "price_change_percentage_24h": 1.61,
    "market_cap_change_24h": 13456789012,
    "market_cap_change_percentage_24h": 1.62,
    "circulating_supply": 19567890.0,
    "total_supply": 21000000.0,
    "max_supply": 21000000.0,
    "ath": 69045.00,
    "ath_change_percentage": -37.35,
    "ath_date": "2021-11-10T14:24:11.849Z",
    "atl": 67.81,
    "atl_change_percentage": 63689.45,
    "atl_date": "2013-07-06T00:00:00.000Z",
    "roi": null,
    "last_updated": "2025-11-07T10:30:45.123Z"
  }
]
```

---

### Fields We Use

**Mapped to UMF Schema:**

| CoinGecko Field | UMF Field | Type | Notes |
|-----------------|-----------|------|-------|
| `id` | `id` | string | Unique identifier |
| `symbol` | `symbol` | string | Uppercase (BTC) |
| `name` | `name` | string | Full name |
| `current_price` | `price` | number | Current USD price |
| `price_change_percentage_24h` | `changePct24h` | number | 24h % change |
| `total_volume` | `volume24h` | number | 24h volume |
| `market_cap` | `marketCap` | number | Market cap |
| `last_updated` | `updatedAt_utc` | string | ISO timestamp |

**Additional fields:**
- `class`: Always `"crypto"` for CoinGecko data
- `image`: Store for future use (asset logos)

---

## Architecture: 1-Call-Per-Hour Policy

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     SCHEDULER (Hourly)                      │
│                                                             │
│  1. Fetch from CoinGecko API (1 call/hour)                │
│  2. Transform to UMF schema                                │
│  3. Store in in-memory cache (TTL=3600s)                   │
│  4. Write to Firestore:                                    │
│     - umf_snapshot_live/latest (overwrites)               │
│     - umf_snapshot_history/{timestamp} (append-only)      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                   IN-MEMORY CACHE                           │
│                                                             │
│  Key: 'umf_snapshot_live'                                  │
│  TTL: 3600 seconds (1 hour)                                │
│  Invalidation: On scheduler success                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                   FIRESTORE STORAGE                         │
│                                                             │
│  Collection: umf_snapshot_live                             │
│    - Document: latest (current snapshot)                   │
│                                                             │
│  Collection: umf_snapshot_history                          │
│    - Documents: {timestamp} (historical snapshots)         │
│    - Retention: Last 168 hours (7 days)                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                   API ROUTES (Express)                      │
│                                                             │
│  GET /api/umf/snapshot                                     │
│    1. Check in-memory cache (fast path)                    │
│    2. If miss: Fetch from Firestore latest                │
│    3. If Firestore empty: Return error or mock fallback    │
│    4. NEVER call CoinGecko directly                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                   FRONTEND (React)                          │
│                                                             │
│  TanStack Query hooks:                                     │
│    - useUmfSnapshot() → GET /api/umf/snapshot              │
│    - 30s staleTime (background refetch)                    │
│    - Shows "Powered by CoinGecko" attribution              │
└─────────────────────────────────────────────────────────────┘
```

---

### Component Breakdown

#### 1. **Scheduler (Hourly)**

**File:** `server/schedulers/umfScheduler.ts` (new)

**Responsibilities:**
- Run once per hour (cron: `0 * * * *`)
- Fetch from CoinGecko `/coins/markets`
- Transform response to UMF schema
- Update in-memory cache (TTL=3600s)
- Write to Firestore (latest + history)
- Log success/failure

**Pseudocode:**
```typescript
async function refreshUmfSnapshot() {
  try {
    // 1. Fetch from CoinGecko
    const response = await fetch(coinGeckoUrl, { headers });
    const coins = await response.json();
    
    // 2. Transform to UMF schema
    const snapshot = transformCoinGeckoToUmf(coins);
    
    // 3. Update in-memory cache
    cache.set('umf_snapshot_live', snapshot, { ttl: 3600 });
    
    // 4. Write to Firestore latest
    await db.collection('umf_snapshot_live').doc('latest').set(snapshot);
    
    // 5. Append to history
    const timestamp = new Date().toISOString();
    await db.collection('umf_snapshot_history').doc(timestamp).set(snapshot);
    
    // 6. Clean old history (keep last 7 days)
    await cleanOldHistory();
    
    console.log('[UMF Scheduler] Success:', timestamp);
  } catch (error) {
    console.error('[UMF Scheduler] Failed:', error);
    // Scheduler continues; routes serve stale Firestore data
  }
}
```

**Trigger:**
- Node.js cron job (via `node-cron` or custom timer)
- Manual trigger endpoint (for testing): `POST /api/umf/refresh` (admin only)

---

#### 2. **In-Memory Cache**

**File:** `server/cache/umfCache.ts` (new)

**Technology:** Simple JavaScript Map or `node-cache` library

**Cache Structure:**
```typescript
interface CacheEntry {
  data: UmfSnapshot;
  timestamp: number; // Unix timestamp
  expiresAt: number; // Unix timestamp
}

const cache = new Map<string, CacheEntry>();
```

**TTL:** 3600 seconds (1 hour)

**Operations:**
```typescript
// Set (from scheduler)
cache.set('umf_snapshot_live', snapshot, { ttl: 3600 });

// Get (from API route)
const cached = cache.get('umf_snapshot_live');
if (cached && cached.expiresAt > Date.now()) {
  return cached.data; // Fresh
} else {
  return null; // Expired or missing
}

// Clear (on scheduler failure or manual)
cache.delete('umf_snapshot_live');
```

**Why In-Memory Cache?**
- Fastest possible read (no network/disk I/O)
- Reduces Firestore reads (cost savings)
- Simple implementation (no external service)
- Auto-expires after 1 hour (fresh data)

---

#### 3. **Firestore Storage**

**Collections:**

##### **Collection A: `umf_snapshot_live`**

**Purpose:** Store the latest live snapshot

**Documents:**
- **Document ID:** `latest`
- **Structure:** Same as `UmfSnapshot` schema
- **Update Frequency:** Once per hour (scheduler)
- **Overwrite:** Yes (always latest)

**Example Document:**
```typescript
{
  timestamp_utc: "2025-11-07T10:00:00.000Z",
  assets: [
    {
      id: "bitcoin",
      symbol: "BTC",
      name: "Bitcoin",
      class: "crypto",
      price: 43250.50,
      changePct24h: 1.61,
      volume24h: 25678901234,
      marketCap: 846234567890,
      updatedAt_utc: "2025-11-07T10:00:00.000Z"
    },
    // ... 24 more assets
  ],
  degraded: false, // true if scheduler failed
  source: "coingecko" // or "mock" if fallback
}
```

---

##### **Collection B: `umf_snapshot_history`**

**Purpose:** Store historical snapshots for trend analysis

**Documents:**
- **Document ID:** ISO timestamp (e.g., `2025-11-07T10:00:00.000Z`)
- **Structure:** Same as `UmfSnapshot` schema
- **Update Frequency:** Once per hour (append-only)
- **Retention:** Last 168 hours (7 days), auto-delete older

**Example Query:**
```typescript
// Get last 24 hours of snapshots
const history = await db
  .collection('umf_snapshot_history')
  .where('timestamp_utc', '>=', twentyFourHoursAgo)
  .orderBy('timestamp_utc', 'desc')
  .limit(24)
  .get();
```

**Cleanup Strategy:**
```typescript
// Run daily or after each scheduler run
async function cleanOldHistory() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  
  const oldDocs = await db
    .collection('umf_snapshot_history')
    .where('timestamp_utc', '<', sevenDaysAgo)
    .get();
  
  const batch = db.batch();
  oldDocs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  
  console.log(`[Cleanup] Deleted ${oldDocs.size} old snapshots`);
}
```

---

#### 4. **API Routes (Express)**

**File:** `server/routes.ts`

**Endpoints:**

##### **GET /api/umf/snapshot**

**Purpose:** Serve current market snapshot

**Flow:**
```typescript
app.get('/api/umf/snapshot', async (req, res) => {
  try {
    // 1. Check in-memory cache (FAST PATH)
    const cached = cache.get('umf_snapshot_live');
    if (cached && cached.expiresAt > Date.now()) {
      console.log('[UMF API] Cache hit');
      return res.json(cached.data);
    }
    
    // 2. Cache miss: Fetch from Firestore latest
    console.log('[UMF API] Cache miss, fetching from Firestore');
    const doc = await db.collection('umf_snapshot_live').doc('latest').get();
    
    if (doc.exists) {
      const snapshot = doc.data() as UmfSnapshot;
      
      // 3. Repopulate cache
      cache.set('umf_snapshot_live', snapshot, { ttl: 3600 });
      
      return res.json(snapshot);
    }
    
    // 4. Firestore empty: Return error or mock fallback
    console.error('[UMF API] No data in Firestore');
    
    // Option A: Return error
    return res.status(503).json({
      error: 'Service unavailable',
      message: 'Market data temporarily unavailable'
    });
    
    // Option B: Return mock fallback (degraded mode)
    const mockSnapshot = await getMockSnapshot();
    return res.json({ ...mockSnapshot, degraded: true, source: 'mock' });
    
  } catch (error) {
    console.error('[UMF API] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

**CRITICAL RULE:** NEVER call CoinGecko from this route!

---

##### **POST /api/umf/refresh** (Admin Only)

**Purpose:** Manually trigger scheduler (for testing/emergency)

**Flow:**
```typescript
app.post('/api/umf/refresh', requireAdmin, async (req, res) => {
  try {
    await refreshUmfSnapshot(); // Call scheduler function
    res.json({ success: true, message: 'Refresh triggered' });
  } catch (error) {
    res.status(500).json({ error: 'Refresh failed' });
  }
});
```

**Authentication:** Require admin session or API key

---

##### **GET /api/umf/movers** (Derived Data)

**Purpose:** Serve top gainers/losers

**Flow:**
```typescript
app.get('/api/umf/movers', async (req, res) => {
  try {
    // 1. Get snapshot (from cache or Firestore)
    const snapshot = await getSnapshot(); // Reuse logic from /snapshot
    
    // 2. Calculate movers (sort by changePct24h)
    const sorted = [...snapshot.assets].sort((a, b) => b.changePct24h - a.changePct24h);
    const gainers = sorted.slice(0, 5);
    const losers = sorted.slice(-5).reverse();
    
    // 3. Transform to UmfMover format
    const movers = [
      ...gainers.map(asset => ({ ...asset, direction: 'gainer' })),
      ...losers.map(asset => ({ ...asset, direction: 'loser' }))
    ];
    
    res.json(movers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movers' });
  }
});
```

**Note:** Movers are calculated on-demand, not stored separately

---

##### **GET /api/umf/brief** (Future)

**Purpose:** Serve AI-generated morning brief

**Data Source:** Separate Firestore collection (not from CoinGecko)

---

##### **GET /api/umf/alerts** (Future)

**Purpose:** Serve market alerts

**Data Source:** Separate Firestore collection or real-time monitoring

---

## Failure Policy: Degraded Mode

### Scenario: Scheduler Fails

**Possible Causes:**
- CoinGecko API down
- Rate limit exceeded (unlikely with 1/hour)
- Network timeout
- Invalid API response

**Behavior:**
1. **Scheduler logs error** (no crash)
2. **Cache expires** (after 1 hour)
3. **API routes serve stale Firestore data** (from `latest` doc)
4. **Frontend shows degraded indicator:**
   ```typescript
   {
     timestamp_utc: "2025-11-07T09:00:00.000Z", // Old timestamp
     assets: [...],
     degraded: true,
     source: "firestore",
     message: "Using cached data from 2 hours ago"
   }
   ```

---

### Scenario: Firestore Empty (First Run)

**Possible Causes:**
- Fresh deployment (no data yet)
- Firestore wiped accidentally

**Behavior:**

**Option A: Return Error (503)**
```typescript
res.status(503).json({
  error: 'Service unavailable',
  message: 'Market data not available yet. Please try again in a few minutes.'
});
```

**Option B: Return Mock Fallback (Degraded)**
```typescript
const mockSnapshot = await getMockSnapshotFromFirestore(); // umf_snapshot_mock
res.json({
  ...mockSnapshot,
  degraded: true,
  source: 'mock',
  message: 'Live data not available. Showing sample data.'
});
```

**Recommended:** Option B (graceful degradation)

---

### Frontend Degraded UI

**Detection:**
```typescript
const { data: snapshot } = useUmfSnapshot();

if (snapshot?.degraded) {
  // Show warning banner
  <Alert variant="warning">
    <AlertTriangle className="h-4 w-4" />
    <AlertDescription>
      {snapshot.message || "Market data may be outdated"}
    </AlertDescription>
  </Alert>
}
```

**UX Improvements:**
- Show timestamp age: "Data from 2 hours ago"
- Reduce refresh frequency (no auto-refetch)
- Hide "Last Updated" tooltips (misleading)
- Display "Powered by CoinGecko" in muted color

---

## Attribution Requirement

### Requirement

**CoinGecko Terms:** Display "Powered by CoinGecko" when using their data

**Placement:** Visible on UMF page, near market snapshot

---

### Implementation

**Component:** `client/src/components/umf/UmfAttribution.tsx` (new)

```typescript
export function UmfAttribution() {
  return (
    <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
      <span>Powered by</span>
      <a
        href="https://www.coingecko.com"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 hover-elevate px-2 py-1 rounded-md"
        data-testid="link-coingecko-attribution"
      >
        <img
          src="https://static.coingecko.com/s/coingecko-logo-8903d34ce19ca4be1c81f0db30e924154750d208683fad7ae6f2ce06c76d0a56.png"
          alt="CoinGecko"
          className="h-4 w-auto"
        />
        <span className="font-medium">CoinGecko</span>
      </a>
    </div>
  );
}
```

**Usage in Page:**
```typescript
// client/src/pages/FeaturesUMF.tsx
<div className="space-y-6">
  <UmfSnapshot />
  <UmfTopMovers />
  <UmfAttribution /> {/* Add at bottom of page */}
</div>
```

**Styling:**
- Small text (text-xs)
- Muted color (text-muted-foreground)
- Hover elevation for link
- CoinGecko logo (16px height)
- Right-aligned (justify-end)

---

## Traditional Assets (SPX, NDX, DXY, etc.)

### Challenge

**CoinGecko Limitation:** Primarily covers cryptocurrencies, not traditional indices

**Our Current Assets:**
- Crypto (15): BTC, ETH, SOL, BNB, XRP, ADA, DOGE, TRX, DOT, AVAX, LINK, BCH, LTC, UNI, ETC
- Indices (3): SPX (S&P 500), NDX (Nasdaq), DXY (Dollar Index)
- Commodities (2): GOLD, WTI (Oil)
- ETFs (5): Stocks/indices

---

### Solutions

#### **Option A: CoinGecko Only (Crypto Assets)**

**Approach:** Limit UMF to cryptocurrency assets only

**Pros:**
- Single API provider (simplicity)
- Consistent data quality
- No additional integrations

**Cons:**
- Loses "Universal" aspect of UMF
- No traditional market context

**Implementation:**
- Remove SPX, NDX, DXY, GOLD, WTI from asset list
- Rename feature to "Crypto Market Dashboard"
- Focus on top 20-25 cryptocurrencies

---

#### **Option B: Multi-Provider (Recommended for Full UMF)**

**Approach:** Use CoinGecko for crypto + alternative provider(s) for traditional assets

**Providers for Traditional Assets:**
- **Alpha Vantage:** Free tier, covers stocks/forex/commodities
- **Yahoo Finance API:** Free (unofficial), covers indices
- **Twelve Data:** Free tier (800 calls/day), covers everything
- **Polygon.io:** Free tier (5 calls/min), stocks/forex

**Pros:**
- Full "Universal" market coverage
- Best data quality per asset class

**Cons:**
- Multiple API keys to manage
- Different rate limits and schemas
- More complex scheduler logic

**Implementation:**
```typescript
async function refreshUmfSnapshot() {
  // 1. Fetch crypto from CoinGecko
  const cryptoAssets = await fetchCoinGecko();
  
  // 2. Fetch indices from Yahoo Finance
  const indicesAssets = await fetchYahooFinance(['SPX', 'NDX']);
  
  // 3. Fetch commodities from Alpha Vantage
  const commodityAssets = await fetchAlphaVantage(['GOLD', 'WTI']);
  
  // 4. Merge all assets
  const allAssets = [...cryptoAssets, ...indicesAssets, ...commodityAssets];
  
  // 5. Store snapshot
  const snapshot = { timestamp_utc: new Date().toISOString(), assets: allAssets };
  // ... rest of logic
}
```

---

#### **Option C: Hybrid (Crypto Live + Traditional Mock)**

**Approach:** Use live CoinGecko for crypto, keep mock data for traditional assets

**Pros:**
- Quick implementation (no new integrations)
- Maintains full asset list
- Crypto data is most important (more volatile)

**Cons:**
- Traditional asset data is stale/fake
- Misleading to users

**Implementation:**
```typescript
async function refreshUmfSnapshot() {
  // 1. Fetch crypto from CoinGecko
  const cryptoAssets = await fetchCoinGecko();
  
  // 2. Fetch traditional assets from Firestore mock
  const traditionalAssets = await db
    .collection('umf_snapshot_mock')
    .doc('current')
    .get()
    .then(doc => doc.data().assets.filter(a => a.class !== 'crypto'));
  
  // 3. Merge
  const allAssets = [...cryptoAssets, ...traditionalAssets];
  
  // 4. Mark as hybrid
  const snapshot = {
    timestamp_utc: new Date().toISOString(),
    assets: allAssets,
    hybrid: true, // Indicate mixed sources
    sources: {
      crypto: 'coingecko',
      traditional: 'mock'
    }
  };
  // ... rest of logic
}
```

---

**Recommendation for MVP:** Start with **Option A** (CoinGecko only, crypto assets)
- Simplest implementation
- Proves architecture works
- Can add traditional assets later (Option B)

---

## Acceptance Checklist

### Prerequisites

**Environment:**
- [ ] Node.js 18+ installed
- [ ] Firebase Admin SDK configured
- [ ] Firestore collections created (`umf_snapshot_live`, `umf_snapshot_history`)
- [ ] (Optional) CoinGecko API key added to environment (`COINGECKO_API_KEY`)

---

### Scheduler Implementation

**File:** `server/schedulers/umfScheduler.ts`

- [ ] Scheduler file created
- [ ] Fetches from CoinGecko `/coins/markets` with correct parameters
- [ ] Includes `x-cg-demo-api-key` header if API key exists
- [ ] Transforms CoinGecko response to `UmfSnapshot` schema
- [ ] Updates in-memory cache with TTL=3600s
- [ ] Writes to Firestore `umf_snapshot_live/latest` (overwrites)
- [ ] Appends to Firestore `umf_snapshot_history/{timestamp}`
- [ ] Cleans old history (keeps last 7 days)
- [ ] Logs success with timestamp
- [ ] Logs failure without crashing
- [ ] Runs on cron schedule (hourly: `0 * * * *`)
- [ ] Includes manual trigger endpoint: `POST /api/umf/refresh` (admin only)

**Testing:**
```bash
# Manual trigger
curl -X POST http://localhost:5000/api/umf/refresh \
  -H "Authorization: Bearer <admin-token>"

# Check Firestore
# - umf_snapshot_live/latest should exist
# - umf_snapshot_history should have 1 new document
```

---

### Cache Implementation

**File:** `server/cache/umfCache.ts`

- [ ] Cache module created (simple Map or `node-cache`)
- [ ] `set()` method stores data with TTL=3600s
- [ ] `get()` method returns data if not expired
- [ ] `get()` returns null if expired or missing
- [ ] `delete()` method clears cache entry
- [ ] Thread-safe (if using worker threads)

**Testing:**
```typescript
// In server console or test script
cache.set('test_key', { data: 'test' }, { ttl: 10 });
console.log(cache.get('test_key')); // { data: 'test' }
setTimeout(() => {
  console.log(cache.get('test_key')); // null (expired)
}, 11000);
```

---

### Firestore Schema

**Collections:**

- [ ] `umf_snapshot_live` collection exists
- [ ] `umf_snapshot_live/latest` document structure matches `UmfSnapshot` schema
- [ ] `umf_snapshot_history` collection exists
- [ ] History documents have ISO timestamp as document ID
- [ ] History documents structure matches `UmfSnapshot` schema

**Schema Validation:**
```typescript
// Example document in umf_snapshot_live/latest
{
  timestamp_utc: "2025-11-07T10:00:00.000Z",
  assets: [
    {
      id: "bitcoin",
      symbol: "BTC",
      name: "Bitcoin",
      class: "crypto",
      price: 43250.50,
      changePct24h: 1.61,
      volume24h: 25678901234,
      marketCap: 846234567890,
      updatedAt_utc: "2025-11-07T10:00:00.000Z"
    }
  ],
  degraded: false,
  source: "coingecko"
}
```

---

### API Routes

**File:** `server/routes.ts`

**GET /api/umf/snapshot:**
- [ ] Route exists
- [ ] Checks in-memory cache first (fast path)
- [ ] Falls back to Firestore `umf_snapshot_live/latest` on cache miss
- [ ] Repopulates cache on Firestore read
- [ ] Returns degraded mode or error if Firestore empty
- [ ] NEVER calls CoinGecko directly
- [ ] Returns JSON with correct schema
- [ ] Handles errors gracefully (500 status)

**GET /api/umf/movers:**
- [ ] Route exists
- [ ] Fetches snapshot (from cache or Firestore)
- [ ] Calculates top 5 gainers and 5 losers
- [ ] Returns array of `UmfMover` objects
- [ ] NEVER calls CoinGecko directly

**POST /api/umf/refresh:**
- [ ] Route exists
- [ ] Requires admin authentication
- [ ] Triggers scheduler manually
- [ ] Returns success/failure response

**Testing:**
```bash
# Test snapshot endpoint
curl http://localhost:5000/api/umf/snapshot

# Test movers endpoint
curl http://localhost:5000/api/umf/movers

# Test refresh endpoint (admin)
curl -X POST http://localhost:5000/api/umf/refresh \
  -H "Authorization: Bearer <admin-token>"
```

---

### Frontend Updates

**Client Hooks:**

**File:** `client/src/hooks/useUmf.ts`

- [ ] `useUmfSnapshot()` calls `GET /api/umf/snapshot` (not Firestore)
- [ ] `useUmfMovers()` calls `GET /api/umf/movers` (not Firestore)
- [ ] All hooks use TanStack Query (no direct fetch)
- [ ] StaleTime is appropriate (30s for snapshot, 60s for movers)

**Attribution Component:**

**File:** `client/src/components/umf/UmfAttribution.tsx`

- [ ] Component created
- [ ] Shows "Powered by CoinGecko" text
- [ ] Includes CoinGecko logo
- [ ] Links to https://www.coingecko.com
- [ ] Opens in new tab (target="_blank")
- [ ] Has proper styling (text-xs, muted color)
- [ ] Has data-testid attribute

**Page Integration:**

**File:** `client/src/pages/FeaturesUMF.tsx`

- [ ] `<UmfAttribution />` component added to page
- [ ] Placed at bottom or near snapshot widget
- [ ] Visible on all screen sizes

**Degraded Mode UI:**

- [ ] Frontend detects `degraded: true` in snapshot response
- [ ] Shows warning banner when degraded
- [ ] Displays timestamp age ("Data from 2 hours ago")
- [ ] Hides misleading "Last Updated" tooltips

**Testing:**
```bash
# Visit page
http://localhost:5000/features/umf

# Verify:
# - Page loads without errors
# - Attribution visible at bottom
# - All widgets display live data
# - No console errors
```

---

### Data Accuracy

**CoinGecko Integration:**

- [ ] Fetches correct endpoint: `/coins/markets`
- [ ] Uses correct parameters: `vs_currency=usd`, `sparkline=false`, `price_change_percentage=24h`
- [ ] Includes correct coin IDs (bitcoin, ethereum, etc.)
- [ ] Handles API errors gracefully (doesn't crash)
- [ ] Transforms response to UMF schema correctly
- [ ] Prices match CoinGecko website (within reasonable margin)
- [ ] 24h change percentages are correct
- [ ] Timestamps are in UTC ISO format

**Testing:**
```bash
# Compare with CoinGecko website
# Visit: https://www.coingecko.com/en/coins/bitcoin
# Check: Price, 24h change, volume, market cap

# Compare with your API
curl http://localhost:5000/api/umf/snapshot | jq '.assets[] | select(.symbol == "BTC")'

# Should match (within 1-2% due to timing)
```

---

### Performance & Reliability

**Scheduler:**

- [ ] Runs exactly once per hour (no duplicates)
- [ ] Completes in < 10 seconds (typical)
- [ ] Logs every run (success or failure)
- [ ] Doesn't crash on API failure
- [ ] Retries on network timeout (optional)

**Cache:**

- [ ] Cache hit rate > 90% (after first hour)
- [ ] Cache read time < 5ms
- [ ] Cache doesn't grow unbounded (TTL works)
- [ ] Memory usage < 10MB

**API Routes:**

- [ ] Response time < 100ms (cache hit)
- [ ] Response time < 500ms (Firestore fallback)
- [ ] No crashes on malformed requests
- [ ] Proper error status codes (500, 503)

**Frontend:**

- [ ] Page loads in < 2s
- [ ] No console errors
- [ ] Data refreshes on tab focus (background refetch)
- [ ] Loading skeletons display correctly

**Testing:**
```bash
# Check scheduler logs
grep "UMF Scheduler" logs/*.log

# Check API response time
time curl http://localhost:5000/api/umf/snapshot

# Check cache hit rate
# (Monitor logs for "Cache hit" vs "Cache miss")
```

---

### Documentation

**Files:**

- [ ] `docs/UMF-Live-Firestore.md` exists (this file)
- [ ] `replit.md` updated with live integration details
- [ ] API routes documented with examples
- [ ] Scheduler logic explained
- [ ] Failure modes documented

**Code Comments:**

- [ ] Scheduler has clear comments explaining each step
- [ ] Cache module has usage examples
- [ ] API routes have comments about NEVER calling CoinGecko
- [ ] Transformation logic is commented

---

### Security & Compliance

**API Keys:**

- [ ] CoinGecko API key stored in environment (not hardcoded)
- [ ] API key not logged or exposed to frontend
- [ ] Admin-only routes require authentication

**Rate Limiting:**

- [ ] Scheduler respects 1-call-per-hour policy
- [ ] No direct CoinGecko calls from API routes
- [ ] Manual refresh endpoint has rate limiting (optional)

**Attribution:**

- [ ] "Powered by CoinGecko" visible on frontend
- [ ] Links to https://www.coingecko.com
- [ ] Complies with CoinGecko Terms of Service

**Testing:**
```bash
# Verify no API key in client-side code
grep -r "COINGECKO_API_KEY" client/src/
# Should return no results

# Verify attribution on page
curl http://localhost:5000/features/umf | grep -i "coingecko"
# Should find attribution text
```

---

### Deployment Readiness

**Pre-Deployment:**

- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] Firestore collections seeded
- [ ] Scheduler runs successfully
- [ ] Cache is working
- [ ] API routes return data
- [ ] Frontend displays live data
- [ ] Attribution is visible

**Production Checklist:**

- [ ] Environment variables set (COINGECKO_API_KEY)
- [ ] Firestore security rules configured
- [ ] Scheduler auto-starts on server boot
- [ ] Monitoring/logging in place (optional)
- [ ] Error tracking configured (Sentry, etc.)

**Rollback Plan:**

- [ ] Can revert to mock data (umf_snapshot_mock)
- [ ] Feature flag to disable live data (optional)
- [ ] Database backup exists

---

### Final Acceptance

**Sign-Off:**

- [ ] Development Lead: Code review passed
- [ ] QA Lead: All tests passed
- [ ] Product Owner: Feature meets requirements
- [ ] DevOps: Deployment verified

**Go-Live Criteria:**

- [ ] All checklist items above are checked ✅
- [ ] No critical bugs
- [ ] Performance targets met
- [ ] Attribution compliant
- [ ] Data accuracy verified

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Version:** 2.0.0-live

---

## Appendix

### Useful Commands

**Start Scheduler:**
```bash
npm run scheduler:umf
# or
node server/schedulers/umfScheduler.js
```

**Manual Refresh:**
```bash
curl -X POST http://localhost:5000/api/umf/refresh \
  -H "Authorization: Bearer <admin-token>"
```

**Check Firestore:**
```bash
# Using Firebase CLI
firebase firestore:get umf_snapshot_live/latest
firebase firestore:get umf_snapshot_history --limit 5
```

**Check Cache:**
```typescript
// In server console
console.log(cache.get('umf_snapshot_live'));
```

**Test CoinGecko API:**
```bash
curl "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum&sparkline=false&price_change_percentage=24h" \
  -H "x-cg-demo-api-key: YOUR_KEY"
```

---

### Troubleshooting

**Issue: Scheduler not running**
- Check cron schedule syntax
- Verify server is running
- Check logs for errors
- Try manual trigger: `POST /api/umf/refresh`

**Issue: Cache always missing**
- Check TTL is set (3600s)
- Verify cache module is working
- Check if scheduler is populating cache
- Inspect cache state in console

**Issue: Firestore empty**
- Run scheduler manually
- Check Firebase credentials
- Verify collection names
- Check Firestore security rules

**Issue: API returns stale data**
- Check scheduler logs (is it running?)
- Verify Firestore latest document
- Clear cache and retry
- Check CoinGecko API status

**Issue: Frontend shows degraded mode**
- Check if scheduler failed (logs)
- Verify Firestore has data
- Check cache expiration
- Inspect API response (`degraded: true`)

---

### Secret Verification

**After Setting Up `COINGECKO_API_KEY` Secret:**

#### **Quick Verification Check**

Run this one-off server verification (no actual CoinGecko API call):

**Create:** `server/scripts/verifySecret.ts`

```typescript
// Verify that the COINGECKO_API_KEY secret is accessible
// Run with: npx tsx server/scripts/verifySecret.ts

console.log('🔍 Verifying CoinGecko API Key Secret...\n');

const apiKey = process.env.COINGECKO_API_KEY;

if (apiKey) {
  console.log('✅ Secret found: COINGECKO_API_KEY');
  console.log(`   Length: ${apiKey.length} characters`);
  console.log(`   First 10 chars: ${apiKey.substring(0, 10)}...`);
  console.log(`   Last 4 chars: ...${apiKey.slice(-4)}`);
  console.log('\n✅ Secret will be included in scheduler requests as header:');
  console.log('   x-cg-demo-api-key: <value>');
} else {
  console.warn('⚠️  Secret not found: COINGECKO_API_KEY');
  console.warn('   Scheduler will use keyless fallback (more restrictive rate limits)');
  console.warn('   To add secret:');
  console.warn('   1. Click "Secrets" tab (🔒) in left sidebar');
  console.warn('   2. Click "+ New Secret"');
  console.warn('   3. Key: COINGECKO_API_KEY');
  console.warn('   4. Value: Your CoinGecko demo API key');
}

console.log('\n✅ Verification complete');
```

**Run Verification:**
```bash
npx tsx server/scripts/verifySecret.ts
```

**Expected Output (if secret is set):**
```
🔍 Verifying CoinGecko API Key Secret...

✅ Secret found: COINGECKO_API_KEY
   Length: 29 characters
   First 10 chars: CG-njqZw9m...
   Last 4 chars: ...wK86W

✅ Secret will be included in scheduler requests as header:
   x-cg-demo-api-key: <value>

✅ Verification complete
```

**Expected Output (if secret is missing):**
```
🔍 Verifying CoinGecko API Key Secret...

⚠️  Secret not found: COINGECKO_API_KEY
   Scheduler will use keyless fallback (more restrictive rate limits)
   To add secret:
   1. Click "Secrets" tab (🔒) in left sidebar
   2. Click "+ New Secret"
   3. Key: COINGECKO_API_KEY
   4. Value: Your CoinGecko demo API key

✅ Verification complete
```

---

#### **Scheduler Behavior Verification**

**On Next Hourly Tick:**

The scheduler (`server/schedulers/umfScheduler.ts`) will:

1. **Check for secret:**
   ```typescript
   if (process.env.COINGECKO_API_KEY) {
     headers['x-cg-demo-api-key'] = process.env.COINGECKO_API_KEY;
     console.log('[UMF Scheduler] Using CoinGecko API key');
   }
   ```

2. **Log to console:**
   - With key: `[UMF Scheduler] Using CoinGecko API key`
   - Without key: `[UMF Scheduler] No API key found, using keyless fallback`

3. **Include header in request:**
   ```typescript
   const response = await fetch(url, { 
     headers: {
       'Accept': 'application/json',
       'x-cg-demo-api-key': process.env.COINGECKO_API_KEY // Only if exists
     }
   });
   ```

**Check Scheduler Logs:**
```bash
# After scheduler runs (hourly tick or manual trigger)
grep "UMF Scheduler" logs/*.log

# Or check real-time:
tail -f logs/*.log | grep "UMF Scheduler"
```

**Expected Log Output:**
```
[2025-11-07 10:00:00] [UMF Scheduler] Starting refresh...
[2025-11-07 10:00:00] [UMF Scheduler] Using CoinGecko API key
[2025-11-07 10:00:02] [UMF Scheduler] Success: 2025-11-07T10:00:00.000Z
```

---

#### **Security Checklist**

After setting up the secret, verify:

- [ ] Secret exists in Replit Secrets tab
- [ ] Secret name is exactly `COINGECKO_API_KEY` (case-sensitive)
- [ ] Secret value is not committed to Git (check: `git grep COINGECKO_API_KEY`)
- [ ] Secret value is not in any `.env` file
- [ ] Secret value is not logged in console (only "Using API key" message)
- [ ] Secret is only used in server code (never in `client/` directory)
- [ ] Secret is only used by scheduler (never in API routes)
- [ ] Verification script confirms secret is accessible

**Command to Check for Leaked Secrets:**
```bash
# Search all files for API key pattern (should return no results)
git grep -i "cg-njqzw9m" || echo "✅ No secrets found in Git"
git grep -i "x-cg-demo-api-key.*:" || echo "✅ No hardcoded headers"
grep -r "COINGECKO_API_KEY.*=" client/ || echo "✅ No secrets in client code"
```

All commands should return "✅ No secrets found" or similar.

---

**Document Owner:** Development Team  
**Created:** November 7, 2025  
**Last Updated:** November 7, 2025  
**Version:** 1.1.0 (Added Secret Verification)

**Related Documents:**
- `docs/UMF-UI-MVP.md` - UI specification
- `docs/UMF-Perf-Notes.md` - Performance targets
- `docs/UMF-GoLive-UI-Only.md` - Deployment checklist
- `server/openapi/umf.draft.yaml` - API specification

---

**END OF DOCUMENT**
