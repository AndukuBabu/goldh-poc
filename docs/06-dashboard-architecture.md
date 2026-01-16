# 06 – Dashboard Architecture

## Purpose of This Document

This document explains the **frontend architecture of the GOLDH.ai Dashboard**. It covers:

- How the UI is structured  
- How data is fetched, normalized, and cached  
- Modular components for a **premium web & mobile experience**  

It is intended for **new developers**, UI/UX engineers, and product owners to understand how dashboards consume ingestion pipelines and present multi-asset intelligence.

---

## 1. Page Hierarchy & Layout

The Dashboard is designed as a **centralized "Control Panel"** for market intelligence.

- **Global Layout**:  
  All pages are wrapped in a **theme provider** with consistent typography, brand colors, and spacing.  

- **Header (`Header.tsx`)**:  
  - Primary navigation  
  - User profile toggle  
  - Admin/Health shortcuts (Admin only)  
  - **Glassmorphism effect** (`backdrop-blur`) for premium dark aesthetic  

- **Main Dashboard (`Dashboard.tsx`)**:  
  Entry point after login. Manages the grid of assets, market movers, and premium teaser modules.  

- **Asset Detail Pages (`AssetPage.tsx`)**:  
  A deep-dive view for individual assets with a **two-tab system**:  
  1. **News** – Articles automatically linked from Guru Talk via symbol tagging.  
  2. **Events** – Important upcoming dates from the Market Events calendar.  

> The layout uses a mobile-first approach, adapting from **1 column (Mobile)** to **4 columns (Desktop)** using Tailwind's responsive breakpoints.

---

## 2. Data Fetching Strategy

GOLDH uses **TanStack Query (React Query)** for robust and performant data management.

### 2.1 Master Snapshot Pull

To avoid thousands of individual API requests, the dashboard uses a "Snapshot First" approach:

- **Master Snapshot**: Fetched via the `useUmfSnapshot` hook. This single JSON blob contains the top 100 assets.  
- **Cache TTL**: 1 hour (strictly aligned with the backend ingestion cycle).  
- **Background Prefetching**: The `DataPrefetcher` component in `App.tsx` warm up the cache as soon as the app loads.  

### 2.2 Parallel Fallback Logic

If the master snapshot is missing a specific asset (e.g., during a re-index):

- The app identifies missing assets via `useMemo`.  
- It triggers **individual fallback queries** (`/api/asset/:symbol`) in parallel.  
- This ensures the UI **remains interactive** even if the global snapshot document is partially stale.

---

## 3. Core Component Library

### 3.1 `AssetCard`

The primary unit of the dashboard grid:

- **State Aware**: Built-in `AssetCardSkeleton` variants prevent layout shift during loading.  
- **Interactive**: Displays the 24h trend (color-coded) and a badge showing the count of related news articles.  

### 3.2 `NewsScroller` (Landing & Future Dashboard)

- A marquee-style component used on the landing page to showcase real-time intelligence.
- Planned for the Dashboard header to provide a "Market Tape" experience.  

### 3.3 `UmfSnapshot` (List & Detail View)

- A specialized UI for showing sorted lists: **Top Gainers**, **Top Losers**, and **Market Cap Leaders**.  

---

## 4. State Management

| Type | Scope | Solution |
| :--- | :--- | :--- |
| **Server State** | Global | TanStack Query (`queryClient`) |
| **User Identity** | Global | `AuthProvider` (Firebase Auth + Postgres User Record) |
| **UI State** | Local | React `useState` (Filters, Sort order, Toggles) |
| **Notifications** | Global | Shadcn/UI `Toaster` system |

---

## 5. Performance Optimizations

1. **Skeleton Screens**: Every major module has a loading state to eliminate Cumulative Layout Shift (CLS).  
2. **Memoization**: Data transformation (mapping raw API to display formats) is wrapped in `useMemo`.  
3. **Smart Retries**: Failed fetches retry with exponential backoff to handle intermittent data blips.  
4. **Responsive Grid**: Flex and CSS Grid layouts ensure the dashboard is usable on everything from an iPhone to an Ultra-wide monitor.  
5. **In-Memory Cache**: Backend snapshot is kept in server RAM for **<1ms delivery**.

---

## 6. Multi-Asset Architecture (Roadmap)

While the focus is currently on the **Top 100 Crypto assets**, the dashboard is architected to support:

| Section | Content | Data Source | Status |
| :--- | :--- | :--- | :--- |
| **Crypto Grid** | Top 100 Assets | CoinGecko | **Live** |
| **Equities** | Select US/Global Stocks | Yahoo/Finnhub | Planned (P2) |
| **Indices** | S&P 500, NASDAQ | Yahoo/Finnhub | Planned (P2) |
| **Events Tab** | CPI, FOMC, Bank Holidays | Economic Calendar | **Live (Curated)** |
| **News Tab** | Tagged Market Intelligence | Guru Talk | **Live** |

---

## 7. Development Guidelines

- **New Widgets**: Should be built as standalone components in `src/components` and tested for mobile responsiveness.  
- **Iconography**: Exclusively use `Lucide React` for a consistent, modern stroke-weight.  
- **Tiering**: Use the `user.isPremium` flag to toggle visibility of advanced analytics or "Coming Soon" teasers.  

---

## 8. Integration With Data Pipeline

The dashboard is the "View" in our MVC-style architecture. It **never writes to the database**; it only consumes the **normalized master snapshot** produced by the ingestion pipeline documented in `05-data-ingestion.md`.

---

## 9. Key Takeaways

1. Modular, mobile-first design for a **premium multi-device experience**.  
2. Atomic snapshot consumption for **maximum speed**.  
3. Graceful degradation via **fallback parallel queries**.  
4. Extensible to **traditional assets and premium tiers** in future updates.  
5. Visual feedback (Skeletons/Elevations) ensures a **smooth, alive feel**.
