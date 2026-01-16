# 05 – Data Ingestion Pipeline

## Purpose of This Document

This document explains how data enters the GOLDH.ai ecosystem. It covers the automated pipelines for:

- **Market prices** (Crypto primary; traditional benchmarks in Phase 2)
- **News aggregation** (Guru Talk financial intelligence)
- **Economic event intelligence** (Market Events)

Understanding these flows is critical for maintaining data accuracy, troubleshooting stale feeds, and adding new asset classes.

---

## 1. Pipeline Architecture

GOLDH uses a **Scheduled Pull Model** for data ingestion.

| Layer | Description |
| :--- | :--- |
| **Scheduler** | Firebase Cloud Functions triggered every 60 minutes via Cloud Scheduler. |
| **Provider Layer** | Data fetched from external APIs (CoinGecko, RSS Feeds). Traditional sources (Yahoo) planned for Phase 2. |
| **Normalization Layer** | Raw data is validated and transformed into a unified internal schema. |
| **Storage Layer**| Normalized snapshots persisted to Firestore with UTC timestamps. |
| **Broadcast Layer** | Server-level listeners detect changes and update in-memory caches and real-time listeners. |

---

## 2. Market Data (GOLDH Pulse)

### 2.1 Overview & Coverage

The Pulse pipeline maintains a snapshot view of multiple asset classes. 

| Asset Class | Primary Source | Status | Refresh |
| :--- | :--- | :--- | :--- |
| **Crypto (Top 100)** | CoinGecko API | **Live** | Hourly |
| **Indices (S&P/NDX)** | Placeholder / Yahoo (P2) | Planned | Hourly |
| **Commodities (Gold)** | Placeholder / Yahoo (P2) | Planned | Hourly |
| **Forex (DXY)** | Placeholder / Yahoo (P2) | Planned | Hourly |

### 2.2 Transformation Logic

All market data is normalized to a common internal schema (`UmfAssetLive`):

| Field | Description |
| :--- | :--- |
| `symbol` | Uppercase ticker (e.g., BTC, ETH) |
| `name` | Full asset name |
| `price` | Current USD value |
| `changePct24h` | 24-hour percentage change |
| `timestamp_utc` | Time of the last successful fetch |
| `degraded` | Boolean flag indicating stale or fallback data |

### 2.3 Persistence & Storage

- **Live Snapshot**: The system overwrites a single master document: `umf_snapshot_live/latest`.
- **Reasoning**: Storing all asset classes in one document allows for a single, sub-millisecond atomic read for the entire dashboard.
- **Historical Scaling**: High-frequency snapshots are appended to `umf_snapshot_history` for chart generation.

---

## 3. News Intelligence (Guru Talk)

### 3.1 Sources & Ingestion

| Source | Type | Content |
| :--- | :--- | :--- |
| **CoinDesk** | RSS | General macro and crypto financial news |
| **CoinTelegraph** | RSS | Deep crypto market and industry updates |

### 3.2 The Tagging Engine (Regex Bridge)

The engine uses a deterministic matching system to link news articles to assets:
1.  **Fetch**: Extracts the raw Title and Description from RSS feeds.
2.  **Match**: Scans text against `ASSET_SYMBOL_MAP` (tickers + names + aliases).
3.  **Tag**: If "Ethereum" or "ETH" is mentioned, the article is tagged with the `ETH` symbol.
4.  **Categorize**: Articles without specific tags are defaulted to "Global Macro" or "Crypto News."

---

## 4. Economic Events (Market Events)

### 4.1 Ingestion Model

| Mode | Trigger | AI Enhancement |
| :--- | :--- | :--- |
| **Automated (P2)** | API Integration | AI-generated "Why it Matters" summaries |
| **Curated** | Admin UI Upload | Risk scoring (High/Med/Low) |

---

## 5. Reliability & Performance

### 5.1 In-Memory Caching
The server maintains an in-memory cache of the `latest` snapshot.
- **Latency**: `< 1ms` (Cache) vs `~100ms` (Firestore).
- **Synchronization**: Real-time Firestore listeners (`onSnapshot`) push updates to the cache instantly upon ingestion.

### 5.2 Graceful Degradation
If CoinGecko or RSS feeds error out:
1.  The failed attempt is logged to **Admin Health**.
2.  The API continues to serve the **Last Known Good** data.
3.  The UI displays a **"Degraded" icon** to inform the user of data staleness.

---

## 6. Maintenance Checklist

- **Add New Asset**: Update `shared/constants.ts` with the new symbol and its aliases.
- **Modify Frequency**: Adjust the cron syntax in `functions/src/index.ts`.
- **Manual Override**: Use the **Admin > Health** dashboard to trigger an immediate ingestion cycle.

---

*Last updated: January 2026*