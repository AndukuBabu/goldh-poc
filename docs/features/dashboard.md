---
title: Dashboard Module
last_updated: 2026-01-10
version: 1.1.0
---

# Dashboard Module

## 1. Executive Summary
**Objective:** Aggregate key intelligence and personalization widgets into a central view for the user.

### Stakeholder Snapshot

| Stakeholder | Focus Area | Status/Details |
| :--- | :--- | :--- |
| **CEO (Strategy)** | **Strategic Health** | 📅 **Planned**<br>The "Command Center" for the user. Stickiness driver. |
| **CFO (Finance)** | **Cost/Burn** | **Load:** Heavy read operations (Market Data + News).<br>**Opt:** Client-side caching required. |
| **CMO (Marketing)** | **Value Prop** | **Experience:** "At-a-glance" intelligence. No tab switching needed. |

---

## 2. Functional Overview (Text-Visual)

The dashboard organizes modules into a grid layout, prioritizing high-velocity data (Market Pulse) over slow-moving content (News).

### Widget Layout Map (ASCII)

```
+--------------------------------------------------+
|  Global Header (User Menu / Nav / Search)        |
+----------------------+---------------------------+
|  Market Pulse Widget |  Portfolio Summary (Beta) |
|  (Live Prices)       |  (Paper Trading)          |
|  [BTC] [ETH] [SOL]   |  [Total Value: $0.00]     |
+----------------------+---------------------------+
|  Guru Talk News Feed |  Economic Calendar Widget |
|  [Latest Headlines]  |  [Next Event: FOMC]       |
+----------------------+---------------------------+
```

### Widget Logic Table

| Widget | Source | Frequency | Purpose |
| :--- | :--- | :--- | :--- |
| **Market Pulse** | Firestore | Live (Streaming) | Immediate price action context |
| **Portfolio** | Neon DB | On Load | Personal asset tracking |
| **Guru Talk** | Firestore | Hourly | Market narrative updates |
| **Calendar** | Static/API | Daily | Event awareness |

---

## 3. Technical Implementation

### Grid System
*   **Mobile:** Single column stack (Pulse -> Portfolio -> News -> Calendar).
*   **Desktop:** 2-column or 3-column masonry grid.

### Data Fetching Strategy
*   **Pulse:** specialized `useMarketData` hook with subscription.
*   **Others:** `useQuery` (React Query) with generous stale-time (5-10 mins).
