---
title: Zoho CRM Integration
last_updated: 2026-01-10
version: 1.1.0
---

# Zoho CRM Integration

## 1. Executive Summary
**Objective:** Automate the flow of user data from the platform to the sales CRM to streamline lead qualification and management.

### Stakeholder Snapshot

| Stakeholder | Focus Area | Status/Details |
| :--- | :--- | :--- |
| **CEO (Strategy)** | **Strategic Health** | 🟡 **Active / Monitored**<br>Critical bridge between User Acquisition (Pillar A) and Sales Execution. |
| **CFO (Finance)** | **Cost/Burn** | **Cost:** $0.00 (Standard API included).<br>**Scale:** Cloud Functions auto-scale; API limits are high. |
| **CMO (Marketing)** | **Value Prop** | **Automation:** Instant lead capture.<br>**Integrity:** Single source of truth for customer data. |

---

## 2. Functional Overview (Text-Visual)

The integration listens for new user registration events and automatically pushes the user's profile data to Zoho CRM as a "Lead".

### Lead Capture Flow (ASCII)

```
[User Sign Up] ---> [Neon DB Record]
                         |
                         v
                   [Cloud Function] --- (Async API Call) --> [Zoho CRM]
                         |                                      ^
                         v                                      |
                  [Success Log] <------ (201 Created) ----------+
```

### Lead Capture Workflow

| Step | Trigger | Action | Result |
| :--- | :--- | :--- | :--- |
| **1. Signup** | User Registration | `auth.ts` creates user in DB | User ID generated |
| **2. Trigger** | User Creation | Calls `createLeadFromUser` | Async process starts |
| **3. API Call** | Async Job | POST to Zoho CRM API | Payload sent |
| **4. CRM Action** | API Receipt | Zoho creates "Lead" record | Lead ID returned |
| **5. Logging** | Completion | Success/Error logged to console | System event recorded |

---

## 3. Technical Implementation

### Data Mapping Table

| User Object (Neon) | Zoho Lead Field | Type | Notes |
| :--- | :--- | :--- | :--- |
| `email` | `Email` | String | Primary Key (Deduplication) |
| `firstName` | `First_Name` | String | Extracted from full name |
| `lastName` | `Last_Name` | String | Extracted from full name |
| `phone` | `Phone` | String | Optional |
| `id` | `External_User_ID` | String | Custom pairing reference |

### Configuration

| Variable | Description |
| :--- | :--- |
| `ZOHO_CLIENT_ID` | OAuth Client ID |
| `ZOHO_CLIENT_SECRET` | OAuth Client Secret |
| `ZOHO_REFRESH_TOKEN` | Long-lived token for access renewal |
| `ZOHO_API_DOMAIN` | `zoho.com` (US) or `zoho.eu` (EU) |
