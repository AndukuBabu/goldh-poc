---
title: Learn Module
last_updated: 2026-01-10
version: 1.1.0
---

# Learn Module

## 1. Executive Summary
**Objective:** Educate users on financial markets and platform usage through structured content.

### Stakeholder Snapshot

| Stakeholder | Focus Area | Status/Details |
| :--- | :--- | :--- |
| **CEO (Strategy)** | **Strategic Health** | 📅 **Planned**<br>Long-term retention driver. Builds "Stickiness" and trust. |
| **CFO (Finance)** | **Cost/Burn** | **Content:** In-house creation (Time cost).<br>**Hosting:** YouTube/Vimeo embeds ($0.00). |
| **CMO (Marketing)** | **Value Prop** | **Funnel:** "Learn to Earn" mentality. Upsells platform features. |

---

## 2. Functional Overview (Text-Visual)

Users progress through structured courses (Modules) comprised of articles and videos, tracked by a progress bar.

### Content Delivery Flow (ASCII)

```
[Admin CMS] --> [Content DB] --> [Learn Hub] --> [Article/Video]
(Publish)       (Neon/Postgres)    (Index)            |
                                                      v
                                               [Progress Tracker]
                                               (User Profile)
```

### Content Types Table

| Type | Format | Storage | Player/Renderer |
| :--- | :--- | :--- | :--- |
| **Video** | MP4/Stream | YouTube / Vimeo | `react-player` |
| **Article** | Markdown | Neon (Text) | `react-markdown` |
| **Quiz** | JSON | Neon (Structure) | Custom React Component |

---

## 3. Technical Implementation

### Progress Schema

| Field | Type | Description |
| :--- | :--- | :--- |
| `userId` | UUID | Foreign Key -> Users |
| `moduleId` | String | Course Identifier |
| `completedUnits` | Array | `['unit_1', 'unit_2']` |
| `isCertified` | Boolean | True if Quiz passed |

### Data Relations
*   **Course:** HasMany **Units**.
*   **User:** HasMany **ProgressRecords**.
