---
title: Admin Health Module
last_updated: 2026-01-10
version: 1.2.0
---

# Admin Health Module

## 1. Executive Summary
**Objective:** Provide administrators with real-time visibility into system uptime, scheduler status, and error logs.

### Strategic Health (CEO)
*   **Status:** 🟢 **Operational**
*   **Role:** The "Control Tower" for platform operations.
*   **Risk Mitigation:** Early warning system for data stale-outs or API failures.

### Cost/Burn Analysis (CFO)
*   **Cost:** Negligible (Internal use only).
*   **Value:** Saves engineering hours by centralizing diagnostics.

### Value Positioning (Marketing)
*   **Reliability:** Ensures the "Premium" experience is never broken by silent backend failures.

---

## 2. Functional Overview (Text-Visual)

The Dashboard aggregates signals from various backend systems to give a simple Red/Green status for platform health.

### Health Monitor System (ASCII)

```
[Schedulers] ----(Heartbeat)----> [Firestore Meta]
                                       |
                                       v
[Error Logs] ----(Events)-------> [Admin Dash] <--- [Admin User]
                                       |
                                       v
[API Status] ----(Uptime)-------> [Visual Red/Green]
```

### Monitoring Logic Table

| Step | Trigger | Action | Result |
| :--- | :--- | :--- | :--- |
| **1. Heartbeat** | Any Scheduler Run | Updates `metadata/schedulers` in Firestore | Timestamp refreshed |
| **2. Page Load** | Admin Visits Page | Subscribes to `metadata` collection | Real-time status loaded |
| **3. Stale Check** | Client-Side Logic | Compares `lastRun` vs Current Time | If > 65 mins, status = 🔴 |
| **4. Manual Trigger** | Admin Clicks "Run" | Calls API Endpoint (`/job/*`) | Scheduler force-started |
| **5. Event Log** | Error/Warning | Cloud Function writes to `system_events` | Log appears in Admin Console |

---

## 3. Technical Implementation

### System Events Schema

| Field | Type | Description |
| :--- | :--- | :--- |
| `type` | String | `info`, `warning`, `error` |
| `source` | String | Module name (e.g., `UMF_SCHEDULER`) |
| `message` | String | Human readable description |
| `timestamp` | Timestamp | Time of event |

### Security
*   **Access:** Strictly limited to users with `isAdmin: true` flag.
*   **Middleware:** Protected by `requireAuth` + Admin validation.
