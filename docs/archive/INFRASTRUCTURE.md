---
title: GOLDH Infrastructure & Operational Guide
last_updated: 2026-01-10
version: 1.3.0
---

# Infrastructure & Cost Forecasting

## 1. Executive Summary
**Objective:** Provide a high-level overview of the system's technical foundation, cost projections, and operational status for stakeholders.

### Stakeholder Snapshot (Tabular)

| Stakeholder | Focus Area | Status/Details |
| :--- | :--- | :--- |
| **CEO (Strategy)** | **Strategic Health** | 🟢 **Stable**<br>Serverless-first approach verified for 10k scale.<br>Strict Pillar A (Intelligence) / B (Execution) separation enforced. |
| **CFO (Finance)** | **Cost/Burn** | **Current:** ~$0.00 (Free Tier)<br>**Proj (10k):** <$25/mo<br>**Proj (100k):** ~$200-500/mo<br>**Driver:** Egress & Compute. |
| **CMO (Marketing)** | **Value Prop** | **Reliability:** HA Global Infrastructure (GCP).<br>**Scale:** Auto-scaling for NFP/CPI volatility spikes. |

---

## 2. Infrastructure Components (Rule 20)

| Component | Provider | Purpose | Configuration |
| :--- | :--- | :--- | :--- |
| **Compute / API** | Firebase Cloud Functions (Gen 2) | Serverless Backend Logic | `nodejs22` runtime, US-Central1 |
| **Database (Relational)** | Neon (Serverless Postgres) | User Data, Profiles | Shared CPU, Auto-suspend |
| **Database (NoSQL)** | Firebase Firestore | Real-time Caching | Native Mode, US-Central1 |
| **Hosting / CDN** | Firebase Hosting | Frontend Delivery | Standard Global CDN |
| **Auth** | Firebase Auth | Identity Management | Email/Password, Google |

---

## 3. High-Level Architecture (Text-Visual)

The following Text-Based Map illustrates the high-level interaction between the client, serverless backend, and data persistence layers.

```
+-------------+       +-------------------+       +------------------+
| User Device | ----> |  Firebase Hosting | ----> |  Cloud Functions |
| (Mobile/PC) |       |  (CDN / Frontend) |       |  (API Logic)     |
+-------------+       +-------------------+       +--------+---------+
                                                           |
                      +-------------------+       +--------v---------+
                      |   3rd Party APIs  | <---- | Data Persistence |
                      | (Zoho / CoinGecko)|       | (Neon / Firestr) |
                      +-------------------+       +------------------+
```

---

## 4. Software & Development Tools (Rule 22)

| Category | Tool | Version/Command | Notes |
| :--- | :--- | :--- | :--- |
| **Runtime** | Node.js | `v22.0.0+` (LTS) | Mandatory |
| **Manager** | npm | `v10+` | Standard |
| **CLI** | Firebase Tools | `npm i -g firebase-tools` | Global Install |
| **CLI** | Drizzle Kit | `npm run db:push` | Dev Dependency |
| **IDE** | VS Code | N/A | Extensions: ESLint, Prettier, Tailwind |
| **Config** | .env | `DATABASE_URL`, `API_KEYS` | **DO NOT COMMIT** |

---

## 5. Cost Forecasting (Rule 13)

*Projections based on industry averages for a content-heavy financial application.*

| Service | Free Tier | Cost (10k MAU) | Cost (100k MAU) | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Firebase Auth** | 50k MAU | $0.00 | $0.00 | Phone auth excluded |
| **Firestore** | 50k reads/day | $5.00 | $50.00+ | Read/Write heavy |
| **Cloud Functions** | 2M invocations | $0.00 | $10.00+ | CPU time dependent |
| **Neon Postgres** | 0.5 GiB | $0.00 | $19.00 | Launch Pro tier |
| **Hosting** | 360MB/day | $0.00 | $20.00+ | Bandwidth |
| **TOTAL** | **$0.00** | **~$5.00/mo** | **~$100.00+/mo** | Linear scaling |

---

## 6. New Instance Setup (Zero-to-One)

### Setup Workflow

| Step | Action | Command / Details |
| :--- | :--- | :--- |
| **1.** | **Prerequisites** | Create GCP Project & Neon Project. Install Node.js 22. |
| **2.** | **Clone** | `git clone <repo> && cd goldh-poc && npm install` |
| **3.** | **Configure** | Copy `.env.example` to `.env`. Fill `DATABASE_URL` & `VITE_FIREBASE_*`. |
| **4.** | **Migrate** | `npm run db:push` (Pushes schema to Neon). |
| **5.** | **Simulate** | `npm run dev` (Frontend) & `npm run emulators` (Backend). |
| **6.** | **Seed** | `npm run db:init-schedulers` (Initialize System Jobs). |
