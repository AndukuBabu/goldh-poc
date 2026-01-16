---
title: Guru Talk (News) Module
last_updated: 2026-01-10
version: 1.1.0
---

# Guru Talk (News) Module

## 1. Executive Summary
**Objective:** Provide curated financial news and expert analysis to users.

### Stakeholder Snapshot

| Stakeholder | Focus Area | Status/Details |
| :--- | :--- | :--- |
| **CEO (Strategy)** | **Strategic Health** | 📅 **Planned**<br>Key engagement driver. "Why" behind the price moves. |
| **CFO (Finance)** | **Cost/Burn** | **API:** ~$0.00 (RSS/Free Tiers).<br>**Ops:** Automated aggregation reduces editorial cost. |
| **CMO (Marketing)** | **Value Prop** | **Authority:** Positions platform as a "Thought Leader" aggregator. |

---

## 2. Functional Overview (Text-Visual)

The system aggregates news from vetted financial sources, normalizes the data, and presents it in a clean feed.

### Aggregation Pipeline (ASCII)

```
[External RSS/API] --> [Cloud Scheduler] --> [Normalize] --> [Firestore]
(CNBC, Bloomberg)      (Daily 08:00)       (Tagging)            |
                                                                v
                                                         [News Feed UI]
                                                         (React Client)
```

### Aggregation Logic

| Component | Source | Frequency | Filter Rules |
| :--- | :--- | :--- | :--- |
| **Crypto** | CoinDesk RSS | Hourly | Keywords: "Bitcoin", "Regulation" |
| **Macro** | Yahoo Finance | Daily | Keywords: "Fed", "Rates", "CPI" |
| **Curated** | Admin CMS | Manual | "Editor's Choice" flag |

---

## 3. Technical Implementation

### Data Schema (Article)

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | String | Hash of URL (Deduplication) |
| `title` | String | Headline (Max 100 chars) |
| `summary` | String | AI-generated or RSS snippet |
| `source` | String | Publisher Name |
| `tags` | Array | `['crypto', 'macro', 'gold']` |
| `publishedAt` | Timestamp | Original publication time |

### Configuration
*   **RSS Parser:** `rss-parser` (Node.js).
*   **Storage:** Firestore `articles` collection (TTL: 30 days).
