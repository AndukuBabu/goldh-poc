---
title: Market Pulse (UMF) Module
last_updated: 2026-01-10
version: 1.2.0
---

# Market Pulse (UMF) Module

## 1. Executive Summary
**Objective:** Deliver real-time and historical market data to empower user decision-making (Pillar A).

### Strategic Health (CEO)
*   **Status:** 🟡 **Active / Beta**
*   **Role:** The core intelligence engine of the platform.
*   **Reliability:** 99.9% uptime target via decentralized data sourcing.

### Cost/Burn Analysis (CFO)
*   **Current:** $0.00 (CoinGecko Free Tier).
*   **Projection:** $129/mo (Pro API) if calls exceed 30/min.
*   **Optimization:** Caching layer (Firestore) reduces API cost by 95%.

### Value Positioning (Marketing)
*   **Insight:** Institutional-grade data speed for retail users.
*   **Clarity:** Noise-filtered "Pulse" view focuses only on valid signals.

---

## 2. Functional Overview (Text-Visual)

Market data is fetched, normalized, and cached server-side to prevent rate-limiting and ensure consistent views for all users.

### Data Flow Architecture (ASCII)

```
+-------------+      +------------------+      +------------------+
| Cron Job    | ---> | Cloud Function   | ---> | CoinGecko API    |
| (60 mins)   |      | (fetchMarketData)|      | (/coins/markets) |
+-------------+      +--------+---------+      +------------------+
                              |
                              v
                     +--------+---------+      +------------------+
                     | Firestore Cache  | ---> | React Frontend   |
                     | (market_data)    |      | (Live Snapshot)  |
                     +------------------+      +------------------+
```

### Data Fetching Workflow

| Step | Trigger | Action | Result |
| :--- | :--- | :--- | :--- |
| **1. Scheduler** | CRON `0 * * * *` | Cloud Scheduler hits Pub/Sub topic | `fetchMarketData` function wakes |
| **2. Ingestion** | Function Start | Calls CoinGecko API (`/coins/markets`) | Raw JSON array received |
| **3. Validation** | Data Receipt | Checks for `null` prices or missing IDs | Invalid assets dropped |
| **4. Caching** | Validated Data | Writes to Firestore `market_data` collection | Data persisted for UI |
| **5. Broadcast** | Firestore Write | React listeners (`onSnapshot`) trigger | UI updates instantly globally |

---

## 3. Technical Implementation

### Data Schema (Asset Object)

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | String | CoinGecko ID (e.g., `bitcoin`) |
| `symbol` | String | Ticker (e.g., `btc`) |
| `current_price` | Number | USD Price |
| `last_updated` | Timestamp | ISO String of fetch time |

### Configuration
*   **Source:** CoinGecko Public API (Demo Tier).
*   **Frequency:** **60 minutes** (Free Tier Limit Compliance).
*   **Failover:** Old cache remains valid if API fails.
