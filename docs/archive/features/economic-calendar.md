---
title: Economic Calendar Module
last_updated: 2026-01-10
version: 1.1.0
---

# Economic Calendar Module

## 1. Executive Summary
**Objective:** Inform users about key upcoming global economic events that impact markets.

### Stakeholder Snapshot

| Stakeholder | Focus Area | Status/Details |
| :--- | :--- | :--- |
| **CEO (Strategy)** | **Strategic Health** | 📅 **Planned**<br>Essential utility for "Serious" investors. |
| **CFO (Finance)** | **Cost/Burn** | **Data:** Free Tier (TradingEconomics/Investing.com scraping) or Cheap API. |
| **CMO (Marketing)** | **Value Prop** | **Planning:** Helps users navigate volatility events (NFP, FOMC). |

---

## 2. Functional Overview (Text-Visual)

The module fetches a weekly schedule of high-impact economic events and displays them in a timeline.

### Data Sourcing Flow (ASCII)

```
[Data Vendor] --> [Fetch Function] --> [Event Cache] --> [Calendar Widget]
(Investing.com)    (Weekly Cron)      (Firestore)           ^
                                                            |
                                                   (Filter: High Impact)
```

### Impact Logic Table

| Impact Level | Color | criteria | Example |
| :--- | :--- | :--- | :--- |
| **High** | 🔴 Red | Central Bank, GDP, Jobs | FOMC Rate Decision |
| **Medium** | 🟠 Orange | Retail Sales, PMI | US Retail Sales |
| **Low** | 🟡 Yellow | Weekly Inventories | Crude Oil Stocks |

---

## 3. Technical Implementation

### Event Schema

| Field | Type | Example |
| :--- | :--- | :--- |
| `eventId` | String | `evt_usa_cpi_2026_01` |
| `country` | String | `USD`, `EUR` |
| `impact` | Enum | `high`, `medium`, `low` |
| `previous` | String | "3.4%" |
| `forecast` | String | "3.2%" |
| `actual` | String | "3.3%" (Updated live) |

### API Strategy
*   **Primary:** External API (e.g., Financial Modeling Prep or similar free tier).
*   **Fallback:** Manual Admin Entry via CMS for critical events.
