# GOLDH Platform – Engineering & Product Overview

## 1. What is GOLDH?

**GOLDH** is a premium multi-asset financial intelligence platform designed to help investors, founders, and decision-makers answer three core daily questions:

> **What happened across markets?
> Why did it happen?
> Where is risk flowing next?**

GOLDH combines **high-fidelity market data**, **AI-driven narrative analysis**, and **economic event intelligence** to deliver clarity without noise.
It is intentionally designed as a **market intelligence control panel**, not a trading terminal.

---

## 2. Product Philosophy

GOLDH is built on four foundational principles.

### 2.1 Snapshot, Not Tick-by-Tick

GOLDH does **not** compete on millisecond latency.

Instead:

* Market data is captured as **periodic snapshots**
* Focus is placed on **change, direction, and correlation**
* Architecture prioritizes **stability, predictability, and cost efficiency**

This aligns with long-term and macro-aware decision-making rather than intraday scalping.

---

### 2.2 Intelligence First, Data Second

Market data is commoditized. Insight is not.

GOLDH differentiates through:

* AI-generated explanations (“why this move matters”)
* Cross-asset context (crypto, equities, indices, FX, macro)
* Narrative framing of market regimes and risk transitions

Users consume **answers and context**, not raw feeds.

---

### 2.3 One Insight, Many Users

AI processing is centralized and batched.

* AI curation runs on schedules
* Outputs are cached and reused
* Thousands of users consume the same insight without incremental AI cost

This ensures:

* Predictable operating costs
* Consistent insight quality
* Scalable subscription economics

---

### 2.4 Strict Separation of Concerns

The system is intentionally layered:

* **Ingestion**: Private, scheduled, serverless
* **Storage**: Normalized, asset-class aware
* **Serving**: Cached, low-latency, user-facing
* **Presentation**: Readable, hierarchical UI

No user request ever directly calls an external data provider.

---

## 3. Core Product Modules

### 3.1 GOLDH Pulse (formerly UMF)

The heartbeat of the platform.

**Purpose**
Provides a snapshot view of multi-asset market performance.

**Coverage**

* Crypto: Top 100 assets by market cap
* Indices: S&P 500 and global benchmarks
* FX: USD index (DXY)
* Commodities: Gold and major contracts

**Data Source**

* CoinGecko API (dynamic ranking)

**Refresh Model**

* Snapshot-based ingestion
* Hourly updates
* 1-hour cache for performance and cost control

**Key Indicators**

* Price
* 24h % change
* Market capitalization
* Supply metrics

---

### 3.2 Guru Talk (formerly Guru Digest)

AI-enhanced market news intelligence.

**Purpose**
Explain *why* markets moved, not just *that* they moved.

**Sources**

* CoinDesk RSS
* CoinTelegraph RSS
* (Designed to expand to licensed macro sources)

**Tagging Engine**

* Deterministic symbol matching using canonical tickers
* AI-assisted summarization and relevance scoring

**Output**

* Global multi-asset news stream
* Asset-specific news embedded directly in dashboards

---

### 3.3 Market Events (Economic Calendar)

Macro intelligence layer.

**Purpose**
Surface events that **drive volatility and regime shifts**.

**Coverage**

* Central bank decisions
* Inflation data (CPI, PPI)
* Employment reports
* Key global macro releases

**Enhancement**

* AI-assisted summaries
* Impact and risk-level annotations

---

## 4. Asset Coverage (Phased)

### Phase 1 (Current / Near-Term)

* Crypto markets
* Market news and narrative intelligence

### Phase 2 (Planned)

* Equity indices
* ETFs
* Commodities
* FX
* Macro indicators

All asset classes are normalized into a **shared internal schema**, enabling cross-asset comparison and unified dashboards.

---

## 5. Target Users

GOLDH is designed for:

* Long-only and macro-aware investors
* Founders and operators tracking global risk
* Professionals seeking context over alerts

It is **not** designed for:

* High-frequency trading
* Order book analysis
* Execution-driven workflows

This focus shapes both product and system design.

---

## 6. System Architecture (High Level)

GOLDH uses a **Hybrid Serverless Ingestion + Dedicated Serving** model.

### Ingestion Layer (Private)

* Firebase / Google Cloud Functions
* Cloud Scheduler-driven jobs
* Fetch external data sources
* Normalize and persist snapshots
* Isolated from user traffic

### Data Layer

* Firestore (snapshots, market intelligence)
* Neon/PostgreSQL (core relational data)
* Acts as the single source of truth

### Serving Layer (Public)

* Node.js / Express API
* Multi-layer caching (in-memory → Firestore)
* Never calls external APIs during user requests

### Frontend

* React + TypeScript + Tailwind
* TanStack Query for data fetching
* Fully responsive (desktop + mobile)
* Data freshness and degradation indicators

---

## 7. Reliability, Performance & Data Philosophy

### Caching Strategy

* In-memory cache for sub-5ms reads
* Firestore fallback (~100ms)
* Background ingestion pushes updates (push model)

### Graceful Degradation

* If external providers fail:

  * Last known snapshot is served
  * UI flags “Degraded” mode
  * Platform remains functional

### Privacy & Governance

* Admin-only controls for sensitive actions
* Strong session isolation
* Secrets stored securely outside codebase

---

## 8. Environments & Deployment Model

GOLDH maintains **strict Dev / Prod separation**.

| Environment | Purpose                                | Stability |
| ----------- | -------------------------------------- | --------- |
| Dev         | Rapid experimentation and UI iteration | Fast      |
| Prod        | Revenue-impacting, customer-facing     | Stable    |

* Separate GitHub repositories
* Separate Firebase projects (`goldh-firebase-dev` / `goldh-firebase-prod`)
* Separate API keys and AI accounts
* Independent deployment pipelines

---

## 9. Cost & Scalability Philosophy

GOLDH is designed to scale **users faster than infrastructure cost**.

Key strategies:

* Snapshot-based ingestion
* Cached AI outputs
* Free-tier-friendly APIs where viable
* Real-time data positioned as premium upgrades

---

## 10. Documentation as a First-Class Asset

Documentation is part of the product.

This repository exists to:

* Accelerate onboarding
* Align product, marketing, and engineering
* Make architectural trade-offs explicit

If it’s not documented, it’s not finished.

---

## 11. What This Repo Is (and Is Not)

### This Repo IS

* A system blueprint
* An engineering reference
* An onboarding guide

### This Repo is NOT

* A trading system
* A real-time exchange connector
* A financial advice engine

---

**GOLDH exists to reduce cognitive load in financial decision-making.
Technology serves insight — never the other way around.**

*Last updated: January 2026*
