---
title: User Profile Module
last_updated: 2026-01-10
version: 1.1.0
---

# User Profile Module

## 1. Executive Summary
**Objective:** Enable users to manage their personal information, preferences, and account settings.

### Stakeholder Snapshot

| Stakeholder | Focus Area | Status/Details |
| :--- | :--- | :--- |
| **CEO (Strategy)** | **Strategic Health** | 📅 **Planned**<br>Essential for personalization (Pillar A) and retention. |
| **CFO (Finance)** | **Cost/Burn** | **Storage:** Minimal (Postgres row per user).<br>**Ops:** Self-serve reduces support tickets. |
| **CMO (Marketing)** | **Value Prop** | **Personas:** Allows segmenting users (e.g., "Crypto Native" vs "Newbie"). |

---

## 2. Functional Overview (Text-Visual)

Users can update their profile details, which syncs to the central database and eventually updates the CRM.

### Update Workflow (ASCII)

```
[Dashboard] --> [Settings Page] --> [Update Form] --> [Neon DB]
                                                           |
                                                           v
                                                    [Confirmation UI]
```

### Interaction Logic

| Step | Trigger | Action | Result |
| :--- | :--- | :--- | :--- |
| **1. Access** | Click Avatar | Navigate to `/profile` | Form loads with current data |
| **2. Edit** | Modify Field | Input validation (Zod) | "Save" button enabled |
| **3. Save** | Click Save | PATCH `/api/user/:id` | Update sent to server |
| **4. Sync** | DB Update | Write to `users` table | Toast: "Profile Updated" |

---

## 3. Technical Implementation

### Data Schema (Profile)

| Field | Type | Editable | Notes |
| :--- | :--- | :--- | :--- |
| `firstName` | String | ✅ | Max 50 chars |
| `lastName` | String | ✅ | Max 50 chars |
| `phone` | String | ✅ | Optional format check |
| `experience` | Enum | ✅ | `new`, `enthusiast`, `pro` |
| `email` | String | ❌ | Identity anchor (Immutable) |

### API Endpoints

| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| **GET** | `/api/user/me` | Fetch current session user data |
| **PATCH** | `/api/user/:id` | Update allowed fields |
