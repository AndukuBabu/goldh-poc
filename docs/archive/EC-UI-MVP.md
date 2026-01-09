# Economic Calendar UI MVP
**Feature**: Economic Calendar with AI Impact  
**Phase**: MVP (UI-only with mock data)  
**Created**: January 2025  
**Status**: Design Specification

---

## 1. Overview

The Economic Calendar (EC) MVP provides a fullscreen, filterable calendar interface displaying macroeconomic events with AI impact predictions. This initial version uses client-side Firestore mock data to validate UX patterns before integrating external APIs.

### Key Objectives
- Validate UI/UX patterns for event browsing and filtering
- Test performance with ~60 mock events
- Establish design patterns for impact visualization
- Create foundation for future API integration

---

## 2. Scope

### In Scope (MVP)
- ✅ Fullscreen calendar page at `/features/calendar`
- ✅ Four-axis filtering system (Region, Category, Importance, Date Range)
- ✅ Client-side Firestore data fetching (same pattern as Guru Digest)
- ✅ Impact and confidence badge visualization
- ✅ Responsive layout (mobile-first)
- ✅ Keyboard navigation and ARIA accessibility
- ✅ Black-gold premium theme consistency
- ✅ Loading states and error handling
- ✅ Default 14-day event window

### Out of Scope (MVP)
- ❌ External macro API integration (EconoData, Alpha Vantage, Trading Economics)
- ❌ Real-time WebSocket updates
- ❌ ML-based impact prediction models
- ❌ Backend `/api/econ/events` endpoint
- ❌ Historical event backtesting
- ❌ Cross-module integration (UMF, GID, TAC)
- ❌ User event preferences/personalization
- ❌ Event notifications or alerts

---

## 3. Data Source

### Firestore Collection: `econEvents_mock`

**Collection Structure:**
```typescript
interface EconEvent {
  id: string;                    // Auto-generated Firestore doc ID
  title: string;                 // Event name (e.g., "US CPI Report")
  description: string;           // Brief context (1-2 sentences)
  date: string;                  // ISO 8601 timestamp
  region: string;                // "US" | "EU" | "UK" | "CN" | "JP" | "Global"
  category: string;              // "Inflation" | "Employment" | "GDP" | "Central Bank" | "Crypto Regulation" | "Earnings"
  importance: string;            // "High" | "Medium" | "Low"
  impactScore: number;           // -2 to +2 (mock AI prediction)
  confidenceLevel: number;       // 0-100 (mock confidence %)
  forecast?: string;             // Expected value (optional)
  previous?: string;             // Previous period value (optional)
  source: string;                // "Mock Data" for MVP
  createdAt: string;             // ISO 8601 timestamp
}
```

**Sample Event:**
```json
{
  "id": "mock_event_001",
  "title": "US Non-Farm Payrolls",
  "description": "Monthly employment change excluding farm workers and government employees. Key indicator of labor market health.",
  "date": "2025-01-10T13:30:00Z",
  "region": "US",
  "category": "Employment",
  "importance": "High",
  "impactScore": 1.5,
  "confidenceLevel": 85,
  "forecast": "180K",
  "previous": "227K",
  "source": "Mock Data",
  "createdAt": "2025-01-06T00:00:00Z"
}
```

**Data Volume:** ~60 events spanning 30 days (covering past 7 days + next 23 days from current date)

**Data Distribution:**
- **Regions**: US (40%), EU (25%), UK (15%), CN (10%), JP (5%), Global (5%)
- **Categories**: Inflation (20%), Employment (15%), GDP (10%), Central Bank (25%), Crypto Regulation (15%), Earnings (15%)
- **Importance**: High (30%), Medium (50%), Low (20%)
- **Impact Scores**: Distributed -2 to +2 with bias toward ±0.5 to ±1.5

---

## 4. Route & Navigation

### Route Definition
- **Path**: `/features/calendar`
- **Page Component**: `client/src/pages/FeaturesCalendar.tsx`
- **Route Registration**: Already exists in `client/src/App.tsx`

### Navigation Entry Points
1. **Features page** (`/features`) - "Economic Calendar" card (existing)
2. **Dashboard** (future) - Quick access widget
3. **Header navigation** - Highlighted when on `/features/calendar`

### Page Header
- **Breadcrumb**: "Features > Economic Calendar"
- **Back Button**: "Back to Features" → navigates to `/features`
- **Page Title**: "Economic Calendar with AI Impact"
- **Subtitle**: "Global crypto-relevant macroeconomic events with intelligent impact predictions"

---

## 5. UI Components & Layout

### 5.1 Page Structure

```
┌─────────────────────────────────────────────────────────┐
│ Header (Back Button + Title)                           │
├─────────────────────────────────────────────────────────┤
│ Filter Bar (Region | Category | Importance | Date)     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Event List / Calendar View                             │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Event Card 1                                    │  │
│  │ [Impact Badge] [Confidence Badge]               │  │
│  └─────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Event Card 2                                    │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│ (Load More / Pagination if needed)                     │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Filter Bar Component

**Filter Types:**

1. **Region Filter** (Multi-select dropdown)
   - Options: All Regions, US, EU, UK, CN, JP, Global
   - Default: "All Regions"
   - Component: shadcn `<Select>` with multi-select capability

2. **Category Filter** (Multi-select dropdown)
   - Options: All Categories, Inflation, Employment, GDP, Central Bank, Crypto Regulation, Earnings
   - Default: "All Categories"

3. **Importance Filter** (Toggle group)
   - Options: All, High, Medium, Low
   - Default: "All"
   - Component: shadcn `<ToggleGroup>`

4. **Date Range Filter** (Date picker)
   - Default: Today + 14 days
   - Component: shadcn `<DateRangePicker>`
   - Quick presets: "Today", "This Week", "Next 7 Days", "Next 14 Days", "Next 30 Days"

**Filter Behavior:**
- Filters apply immediately (no "Apply" button)
- Multiple filters combine with AND logic
- Active filters show badge count (e.g., "3 filters active")
- "Clear All Filters" button visible when filters active
- Filter state persists in URL query params (optional enhancement)

### 5.3 Event Card Component

**Card Layout:**
```
┌────────────────────────────────────────────────────────┐
│ [High] [+1.5 Impact] [85% Confidence]      Jan 10 13:30│
│ ─────────────────────────────────────────────────────── │
│ 🇺🇸 US Non-Farm Payrolls                               │
│                                                         │
│ Monthly employment change excluding farm workers...    │
│                                                         │
│ Forecast: 180K  |  Previous: 227K                      │
│                                                         │
│ Category: Employment  |  Region: US                    │
└────────────────────────────────────────────────────────┘
```

**Card Elements:**
- **Importance Badge**: Color-coded (High=red, Medium=gold, Low=gray)
- **Impact Score Badge**: Color gradient based on -2 to +2 (red=negative, green=positive, gray=neutral)
- **Confidence Badge**: Percentage with color intensity (high confidence=bright gold, low=muted)
- **Date/Time**: Formatted with `date-fns` (e.g., "Jan 10, 2025 • 1:30 PM EST")
- **Flag Emoji**: Country flag based on region
- **Title**: Bold, 16-18px
- **Description**: 2-line truncation with "Read more" expansion
- **Data Points**: Forecast vs Previous (if available)
- **Metadata**: Category and Region tags

**Card Interactions:**
- Hover: Gold border glow (`hover:border-primary/60`) + scale-up (`hover:scale-[1.02]`)
- Click: Expand to show full description (future: link to detailed view)
- Keyboard: Focusable with Enter/Space to expand

### 5.4 Empty States

**No Events Found:**
```
┌─────────────────────────────────────────────────┐
│              🗓️                                 │
│                                                 │
│    No events match your filters                │
│                                                 │
│    Try adjusting your date range or region     │
│                                                 │
│    [Clear All Filters]                         │
└─────────────────────────────────────────────────┘
```

**Loading State:**
- Skeleton cards (3-4 visible)
- Shimmer animation
- No spinner (smooth loading UX)

**Error State:**
```
┌─────────────────────────────────────────────────┐
│              ⚠️                                 │
│                                                 │
│    Unable to load calendar events               │
│                                                 │
│    Please try again later                       │
│                                                 │
│    [Retry]                                      │
└─────────────────────────────────────────────────┘
```

---

## 6. Performance Requirements

### Success Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Initial Load** | < 2s | Time to interactive |
| **Filter Response** | < 300ms | Filter change to UI update |
| **Firestore Query** | < 500ms | Database read time |
| **Card Render** | 60 FPS | Smooth scrolling with 60 events |
| **Mobile Performance** | < 3s | TTI on 3G network |

### Optimization Strategies
- Use TanStack Query caching (5-minute stale time)
- Virtualized list for 100+ events (future)
- Lazy load event descriptions (truncated by default)
- Debounce filter inputs (300ms)
- Memoize event cards with React.memo

---

## 7. Accessibility (WCAG 2.1 AA)

### Keyboard Navigation
- **Tab**: Navigate between filters and event cards
- **Arrow Keys**: Navigate within filter dropdowns
- **Enter/Space**: Activate filters, expand event cards
- **Escape**: Close dropdowns, collapse expanded cards
- **Ctrl+F**: Focus search/filter input (future)

### ARIA Attributes
```tsx
<div
  role="article"
  aria-labelledby="event-title-{id}"
  aria-describedby="event-desc-{id}"
  tabIndex={0}
>
  <h3 id="event-title-{id}">US Non-Farm Payrolls</h3>
  <p id="event-desc-{id}">Monthly employment change...</p>
  <span aria-label="High importance">High</span>
  <span aria-label="Positive impact: +1.5">+1.5 Impact</span>
</div>
```

### Screen Reader Support
- Announce filter changes (e.g., "Showing 12 events for US region")
- Read impact scores meaningfully ("Positive impact of 1.5 out of 2")
- Announce loading/error states
- Provide context for badges and icons

### Visual Accessibility
- Minimum contrast ratio: 4.5:1 for text
- Color is not sole indicator (use icons + text)
- Focus indicators visible on all interactive elements
- Font size minimum: 14px (body text)

---

## 8. Responsive Design

### Breakpoints
- **Mobile**: < 640px (stack filters vertically, 1 column event cards)
- **Tablet**: 640px - 1024px (2-column filter grid, 1-2 column event cards)
- **Desktop**: > 1024px (horizontal filter bar, 2-3 column event cards)

### Mobile Optimizations
- Bottom sheet filters (slide-up panel)
- Sticky filter bar on scroll
- Larger touch targets (48px minimum)
- Swipe gestures to navigate date range (future)

---

## 9. Theme Consistency

### Black-Gold Premium Aesthetic

**Colors:**
- Background: `bg-background` (black/dark)
- Event cards: `bg-card` with `border-primary/20`
- Importance badges:
  - High: `bg-destructive` (red tint)
  - Medium: `bg-primary` (gold)
  - Low: `bg-muted` (gray)
- Impact badges:
  - Positive (+): `bg-green-900 text-green-300`
  - Negative (-): `bg-red-900 text-red-300`
  - Neutral (0): `bg-muted`
- Confidence: `bg-primary/20 text-primary` (gold glow)

**Typography:**
- Headers: Inter 600-700 (semi-bold to bold)
- Body: Inter 400 (regular)
- Monospace (data): JetBrains Mono 400

**Effects:**
- Card hover: `hover:border-primary/60 hover:shadow-lg hover:shadow-primary/20`
- Filter buttons: Use shadcn Button variants (default, outline, ghost)
- Transitions: 200-300ms ease-in-out

---

## 10. Component Architecture

### File Structure
```
client/src/
  pages/
    FeaturesCalendar.tsx           # Main page (replace "Coming Soon")
  components/
    economic-calendar/
      EconEventList.tsx            # Event list container
      EconEventCard.tsx            # Individual event card
      EconFilterBar.tsx            # Filter controls
      EconEventSkeleton.tsx        # Loading skeleton
  lib/
    firebase.ts                    # Firestore config (existing)
    econEvents.ts                  # Event data helpers
  hooks/
    useEconEvents.ts               # TanStack Query hook for events
```

### Component Responsibilities

**FeaturesCalendar.tsx**
- Page layout and routing
- Filter state management
- Integration with `useEconEvents` hook

**EconEventList.tsx**
- Render event cards or empty state
- Handle loading/error states
- Future: virtualization for large lists

**EconEventCard.tsx**
- Single event display
- Expand/collapse behavior
- Accessibility attributes

**EconFilterBar.tsx**
- Filter UI components
- Emit filter changes to parent
- Clear filters action

**useEconEvents.ts (TanStack Query Hook)**
```typescript
export function useEconEvents(filters: EventFilters) {
  return useQuery({
    queryKey: ['/api/econ/events', filters], // Future-proof key
    queryFn: async () => {
      // MVP: Fetch from Firestore
      const eventsRef = collection(db, 'econEvents_mock');
      let q = query(eventsRef, orderBy('date', 'asc'));
      
      // Apply filters...
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EconEvent[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  });
}
```

---

## 11. Future Migration Path (Swap Plan)

### Goal
Replace client-side Firestore reads with backend API calls **without changing UI components**.

### Strategy: Data Abstraction Layer

**Step 1: Current MVP (Firestore)**
```typescript
// hooks/useEconEvents.ts
export function useEconEvents(filters: EventFilters) {
  return useQuery({
    queryKey: ['/api/econ/events', filters],
    queryFn: () => fetchFromFirestore(filters), // MVP implementation
  });
}
```

**Step 2: Future API Integration**
```typescript
// hooks/useEconEvents.ts (SAME FILE, SAME HOOK)
export function useEconEvents(filters: EventFilters) {
  return useQuery({
    queryKey: ['/api/econ/events', filters],
    // queryFn changes, but components stay the same
    // TanStack Query default fetcher handles this automatically
  });
}

// server/routes.ts (NEW ENDPOINT)
app.get('/api/econ/events', async (req, res) => {
  const { region, category, importance, startDate, endDate } = req.query;
  
  // Fetch from external API (Alpha Vantage, Trading Economics, etc.)
  const events = await fetchFromExternalAPI({ ... });
  
  // Cache in PostgreSQL or Redis
  await cacheEvents(events);
  
  res.json(events);
});
```

### Migration Checklist

**Backend Changes (Phase 2):**
- [ ] Create `/api/econ/events` endpoint in `server/routes.ts`
- [ ] Integrate external macro API (EconoData, Alpha Vantage)
- [ ] Add PostgreSQL schema for event caching
- [ ] Implement hourly refresh cron job
- [ ] Add response caching (Redis or in-memory)

**Frontend Changes (Minimal):**
- [ ] Remove Firestore import from `useEconEvents.ts`
- [ ] Rely on TanStack Query default fetcher (already configured)
- [ ] Update query key to match new endpoint (already using `/api/econ/events`)
- [ ] No changes to UI components (EconEventCard, EconEventList, etc.)

**Data Migration:**
- [ ] Optional: Migrate Firestore mock data to PostgreSQL
- [ ] Or: Deprecate Firestore collection after API is live
- [ ] Update upload script to hit `/api/econ/events/seed` instead of Firestore

### Key Principle: UI Component Independence

**DO:**
- ✅ UI components receive `EconEvent[]` array as prop
- ✅ UI components don't care about data source
- ✅ Single `useEconEvents` hook abstracts data fetching
- ✅ TypeScript interface `EconEvent` remains stable

**DON'T:**
- ❌ Import Firestore directly in UI components
- ❌ Hard-code collection names in components
- ❌ Expose Firestore-specific types in component props
- ❌ Mix data fetching logic with rendering logic

---

## 12. Testing & Validation

### Manual Testing Checklist
- [ ] Page loads in < 2s with 60 events
- [ ] All filters work correctly (Region, Category, Importance, Date)
- [ ] Filter combinations narrow results correctly
- [ ] "Clear All Filters" resets to default state
- [ ] Event cards display all data fields correctly
- [ ] Impact/confidence badges color-coded properly
- [ ] Hover effects work (gold glow, scale-up)
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Screen reader announces events and filters
- [ ] Mobile layout stacks filters and cards
- [ ] Loading skeleton displays before data loads
- [ ] Error state shows when Firestore fails
- [ ] Empty state shows when no events match filters

### E2E Test Scenarios (Playwright)
1. Navigate to `/features/calendar` and verify page loads
2. Apply Region filter and verify event count changes
3. Apply multiple filters and verify AND logic
4. Clear filters and verify all events show again
5. Expand event card and verify full description shows
6. Test keyboard navigation through filter bar
7. Test mobile viewport filter panel

---

## 13. Open Questions & Decisions Needed

### Design Decisions
- [ ] **Calendar vs List View**: MVP uses list view; future calendar grid?
- [ ] **Event Detail Page**: Click card to expand inline or navigate to `/features/calendar/:id`?
- [ ] **Real-time Updates**: Polling interval for Phase 2 (hourly? 15min?)
- [ ] **Pagination**: Load all 60 events or paginate at 20 per page?

### Technical Decisions
- [ ] **Firestore vs PostgreSQL**: Keep mock data in Firestore or migrate to PostgreSQL early?
- [ ] **Filter State**: Store in component state or URL query params?
- [ ] **Virtualization**: Implement react-window for 100+ events now or later?

---

## 14. Timeline & Milestones

### Phase 1: Setup & Data Seeding (Current)
- [x] Create design spec (`docs/EC-UI-MVP.md`)
- [ ] Create Firestore collection schema
- [ ] Write data seeding script (60 mock events)
- [ ] Upload mock data to Firestore

### Phase 2: UI Implementation
- [ ] Replace "Coming Soon" in `FeaturesCalendar.tsx`
- [ ] Build `EconEventCard` component
- [ ] Build `EconFilterBar` component
- [ ] Build `EconEventList` component
- [ ] Create `useEconEvents` hook

### Phase 3: Polish & Testing
- [ ] Add loading states and error handling
- [ ] Implement responsive breakpoints
- [ ] Add keyboard navigation and ARIA
- [ ] Manual testing and bug fixes
- [ ] E2E test coverage

### Phase 4: Future API Integration (Phase 2)
- [ ] Create `/api/econ/events` backend endpoint
- [ ] Integrate external macro API
- [ ] Migrate `useEconEvents` to use API
- [ ] Deprecate Firestore mock data

---

## 15. Success Metrics (Post-Launch)

### Performance
- 95th percentile page load < 2.5s
- 0% client-side errors in production

### Engagement
- Average session time on calendar page (target: 2+ minutes)
- Filter usage rate (target: 70% of users interact with filters)

### Accessibility
- 0 critical accessibility violations (aXe scan)
- Keyboard navigation score: 100% (manual audit)

---

## Appendix A: Mock Data Examples

See separate script: `scripts/uploadEconEvents.ts` (to be created)

Sample events cover:
- US CPI, Non-Farm Payrolls, FOMC Minutes
- EU ECB Rate Decision, Eurozone GDP
- UK BoE Rate Decision, UK Inflation
- China PMI, GDP
- Japan BoJ Meeting
- Global crypto regulation announcements
- Major earnings (Coinbase, MicroStrategy, etc.)

---

## Appendix B: References

- **TDD Source**: `attached_assets/Economic Calendar with AI Impact TDD V1 4NOV 2025.docx_1762505607150.pdf`
- **Guru Digest Pattern**: `client/src/components/GuruDigestList.tsx`
- **Firebase Config**: `client/src/lib/firebase.ts`
- **Design System**: `docs/design_guidelines.md` (if exists)
- **shadcn Components**: https://ui.shadcn.com/

---

## 16. Phase 2 Migration Guide: Firestore → API

### Overview

The Economic Calendar MVP uses Firestore for mock data to validate UX patterns quickly. When ready to migrate to a production backend API, follow these steps to swap data sources with minimal code changes.

**Migration Files Created:**
- `client/src/lib/econ.client.ts` - API client functions (empty placeholders)
- `server/routes.ts` - Commented route stubs for `/api/econ/events` and `/api/econ/health`
- `server/openapi/econ.draft.yaml` - Complete API specification

---

### Step 1: Implement Backend API Endpoints

#### 1.1 Database Setup

Create `econEvents` table in PostgreSQL (schema already defined in `shared/schema.ts`):

```sql
CREATE TABLE econ_events (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  datetime_utc TIMESTAMP NOT NULL,
  country VARCHAR(10) NOT NULL,
  category VARCHAR(50) NOT NULL,
  importance VARCHAR(10) NOT NULL,
  impact_score INTEGER NOT NULL,
  confidence INTEGER NOT NULL,
  previous DECIMAL,
  forecast DECIMAL,
  actual DECIMAL,
  status VARCHAR(10) NOT NULL,
  source VARCHAR(100) NOT NULL,
  url VARCHAR(500)
);

CREATE INDEX idx_econ_events_datetime ON econ_events(datetime_utc);
CREATE INDEX idx_econ_events_country ON econ_events(country);
CREATE INDEX idx_econ_events_status ON econ_events(status);
```

**Note:** Use Drizzle ORM instead of raw SQL. Add table definition to `server/storage.ts`.

#### 1.2 Uncomment Route Stubs

In `server/routes.ts` (lines 229-314), uncomment the route implementations:

```typescript
// Before (commented):
/*
app.get("/api/econ/events", async (req: Request, res: Response) => {
  // ...
});
*/

// After (uncommented and implemented):
app.get("/api/econ/events", async (req: Request, res: Response) => {
  try {
    const { from, to, country, category, importance, status } = req.query;
    
    // Validate inputs with Zod schema
    const filters = econEventFiltersSchema.parse({
      from: from || new Date().toISOString(),
      to: to || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      country: country ? (country as string).split(',') : undefined,
      category: category ? (category as string).split(',') : undefined,
      importance: importance ? (importance as string).split(',') : undefined,
      status: status as 'upcoming' | 'released' | undefined,
    });
    
    // Fetch from database with filters
    const events = await storage.getEconEvents(filters);
    
    // Return events with metadata
    res.json({
      events,
      count: events.length,
      filters: filters,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get econ events error:", error);
    res.status(500).json({ error: "Failed to get economic events" });
  }
});
```

**Reference:** See `server/openapi/econ.draft.yaml` for complete API specification.

#### 1.3 Implement Storage Methods

Add to `server/storage.ts`:

```typescript
interface IStorage {
  // ... existing methods
  
  // Economic Calendar methods
  getEconEvents(filters: EconEventFilters): Promise<EconEvent[]>;
  getLastEconSync(): Promise<string | null>;
  countEconEvents(): Promise<number>;
}
```

**Implementation:**
```typescript
async getEconEvents(filters: EconEventFilters): Promise<EconEvent[]> {
  let query = db
    .select()
    .from(econEvents)
    .where(
      and(
        gte(econEvents.datetime_utc, filters.from),
        lte(econEvents.datetime_utc, filters.to)
      )
    );
  
  if (filters.country) {
    query = query.where(inArray(econEvents.country, filters.country));
  }
  
  if (filters.category) {
    query = query.where(inArray(econEvents.category, filters.category));
  }
  
  if (filters.importance) {
    query = query.where(inArray(econEvents.importance, filters.importance));
  }
  
  if (filters.status) {
    query = query.where(eq(econEvents.status, filters.status));
  }
  
  const results = await query
    .orderBy(asc(econEvents.datetime_utc))
    .limit(500);
  
  return results;
}
```

---

### Step 2: Implement Frontend API Client

#### 2.1 Complete fetchEconEvents()

In `client/src/lib/econ.client.ts`, replace placeholder with implementation:

```typescript
// Before (placeholder):
export async function fetchEconEvents(filters: EconEventFilters): Promise<EconEvent[]> {
  throw new Error('fetchEconEvents() not implemented yet.');
}

// After (implemented):
export async function fetchEconEvents(filters: EconEventFilters): Promise<EconEvent[]> {
  const params = new URLSearchParams();
  
  if (filters.from) params.append('from', filters.from);
  if (filters.to) params.append('to', filters.to);
  if (filters.country) params.append('country', filters.country.join(','));
  if (filters.category) params.append('category', filters.category.join(','));
  if (filters.importance) params.append('importance', filters.importance.join(','));
  if (filters.status) params.append('status', filters.status);
  
  const response = await fetch(`/api/econ/events?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch events: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.events;
}
```

#### 2.2 Complete fetchEconHealth()

```typescript
export async function fetchEconHealth(): Promise<EconHealthResponse> {
  const response = await fetch('/api/econ/health');
  
  if (!response.ok) {
    throw new Error(`Health check failed: ${response.statusText}`);
  }
  
  return response.json();
}
```

---

### Step 3: Update useEconEvents Hook

#### 3.1 Swap Data Source

In `client/src/hooks/useEcon.ts` (lines 131-134), replace Firestore call:

```typescript
// BEFORE (MVP - Firestore):
import { getEconEventsMock, type EconEventFilters } from "@/lib/econ";

queryFn: async () => {
  const fetchStartTime = performance.now();
  
  if (isDev) {
    console.log('[useEconEvents] Fetch Start', normalizedParams);
  }
  
  const events = await getEconEventsMock(normalizedParams);
  
  const fetchDuration = performance.now() - fetchStartTime;
  
  if (isDev) {
    console.log('[useEconEvents] Fetch Complete', `${fetchDuration.toFixed(2)}ms`);
  }
  
  return events;
}
```

```typescript
// AFTER (Phase 2 - API):
import { fetchEconEvents } from "@/lib/econ.client";
import type { EconEventFilters } from "@/lib/econ";

queryFn: async () => {
  const fetchStartTime = performance.now();
  
  if (isDev) {
    console.log('[useEconEvents] Fetch Start (API)', normalizedParams);
  }
  
  const events = await fetchEconEvents(normalizedParams);
  
  const fetchDuration = performance.now() - fetchStartTime;
  
  if (isDev) {
    console.log('[useEconEvents] Fetch Complete (API)', `${fetchDuration.toFixed(2)}ms`);
  }
  
  return events;
}
```

**That's it!** All UI components automatically use the new API without any changes.

---

### Step 4: Data Sync Service (Optional)

#### 4.1 External API Options

Choose one or more data providers:

1. **Trading Economics** (Recommended)
   - Coverage: 196 countries, 300K+ indicators
   - API: https://tradingeconomics.com/api
   - Cost: $500-2000/month
   - Quality: ★★★★★

2. **Alpha Vantage**
   - Coverage: US economic indicators
   - API: https://www.alphavantage.co/
   - Cost: Free tier available, $49+/month
   - Quality: ★★★★☆

3. **Benzinga Calendar API**
   - Coverage: US earnings + macro events
   - API: https://www.benzinga.com/apis/calendar
   - Cost: Custom pricing
   - Quality: ★★★★☆

4. **FMP Economic Calendar**
   - Coverage: Global macro events
   - API: https://financialmodelingprep.com/
   - Cost: $14-79/month
   - Quality: ★★★☆☆

5. **Federal Reserve Economic Data (FRED)**
   - Coverage: US only, free
   - API: https://fred.stlouisfed.org/
   - Cost: Free
   - Quality: ★★★★★ (US only)

#### 4.2 Sync Script Example

Create `server/services/econSync.ts`:

```typescript
import { db } from '@db';
import { econEvents } from '@db/schema';

export async function syncEconEvents() {
  // Fetch from external API
  const response = await fetch(
    `https://api.tradingeconomics.com/calendar?c=${process.env.TE_API_KEY}`
  );
  
  const externalEvents = await response.json();
  
  // Transform to our schema
  const transformed = externalEvents.map(e => ({
    id: `te_${e.CalendarId}`,
    title: e.Event,
    datetime_utc: new Date(e.Date).toISOString(),
    country: e.Country,
    category: mapCategory(e.Category),
    importance: mapImportance(e.Importance),
    impactScore: calculateImpact(e),
    confidence: calculateConfidence(e),
    previous: e.Previous,
    forecast: e.Forecast,
    actual: e.Actual,
    status: e.Actual ? 'released' : 'upcoming',
    source: 'Trading Economics',
    url: e.URL,
  }));
  
  // Upsert to database
  await db.insert(econEvents)
    .values(transformed)
    .onConflictDoUpdate({
      target: econEvents.id,
      set: {
        actual: sql`EXCLUDED.actual`,
        status: sql`EXCLUDED.status`,
      },
    });
  
  console.log(`Synced ${transformed.length} events`);
}

// Run every 15 minutes
setInterval(syncEconEvents, 15 * 60 * 1000);
```

---

### Step 5: Testing & Validation

#### 5.1 Manual Testing Checklist

- [ ] `/api/econ/events` returns data (no 501 error)
- [ ] Filters work (country, category, importance, status)
- [ ] Default 14-day window applied correctly
- [ ] Events sorted by datetime_utc ascending
- [ ] Performance: API response < 100ms
- [ ] Frontend displays events (no Firestore errors in console)
- [ ] Pagination still works (20 events/page)
- [ ] Filter interactions responsive (< 100ms)

#### 5.2 Performance Comparison

**Target Metrics:**
- API response time: < 100ms (vs. Firestore 120-180ms)
- First paint: < 400ms (vs. MVP 250-350ms)
- Total page load: < 1.5s (vs. MVP 1.2-1.5s)

**Run performance tests:**
```bash
# In browser console (after navigating to /features/calendar)
# Look for console logs from useEconEvents hook:
[useEconEvents] Fetch Start (API) {...}
[useEconEvents] Fetch Complete (API) 87.32ms | 58 events
[EconCalendar] First Paint 398.21ms (58 events)
```

#### 5.3 QA Manual

Run complete QA test suite: `qa/EC-UI-Manual.md`

Focus areas:
- Test 2: Filter functionality (all combinations)
- Test 3: Released vs Upcoming display
- Test 7: Performance with 60+ events

---

### Step 6: Cleanup (After Validation)

#### 6.1 Remove Firestore Dependencies

```bash
# Uninstall Firebase SDK
npm uninstall firebase
```

**Delete files:**
- `client/src/lib/firebase.ts` (if only used for EC)
- `scripts/uploadEconEventsMock.ts`
- `client/src/lib/econ.ts` (getEconEventsMock function)

#### 6.2 Update Documentation

- [ ] Update `replit.md` - Change "Firestore" to "PostgreSQL API"
- [ ] Update `docs/EC-Perf-Notes.md` - Add API benchmark results
- [ ] Archive `docs/EC-UI-MVP.md` → `docs/EC-UI-MVP-Phase1.md`
- [ ] Create `docs/EC-API-Phase2.md` with API details

#### 6.3 Environment Variables

Add to `.env`:
```bash
# Economic Calendar API (Phase 2)
ECON_API_PROVIDER=Trading Economics
TE_API_KEY=your_trading_economics_key_here
ECON_SYNC_INTERVAL=900000  # 15 minutes in ms
```

---

### Migration Checklist Summary

**Backend (Server):**
- [ ] 1. Create `econEvents` table in PostgreSQL
- [ ] 2. Uncomment route stubs in `server/routes.ts`
- [ ] 3. Implement storage methods in `server/storage.ts`
- [ ] 4. Set up data sync service (optional)
- [ ] 5. Test `/api/econ/events` endpoint (Postman/curl)
- [ ] 6. Test `/api/econ/health` endpoint

**Frontend (Client):**
- [ ] 7. Implement `fetchEconEvents()` in `lib/econ.client.ts`
- [ ] 8. Implement `fetchEconHealth()` in `lib/econ.client.ts`
- [ ] 9. Update `useEconEvents` hook to use `fetchEconEvents()`
- [ ] 10. Test page load (no Firestore errors)
- [ ] 11. Validate all filters work
- [ ] 12. Run performance benchmarks

**Cleanup:**
- [ ] 13. Remove Firebase SDK (`npm uninstall firebase`)
- [ ] 14. Delete `lib/firebase.ts` and `scripts/uploadEconEventsMock.ts`
- [ ] 15. Remove `getEconEventsMock()` from `lib/econ.ts`
- [ ] 16. Update documentation (replit.md, EC-Perf-Notes.md)
- [ ] 17. Run full QA test suite (`qa/EC-UI-Manual.md`)
- [ ] 18. Deploy to production

**Estimated Time:** 4-6 hours for experienced developer

---

### Troubleshooting Common Issues

**Issue: 501 Not Implemented**
```
GET /api/econ/events → 501 Not implemented yet
```
**Solution:** Routes are still commented. Uncomment in `server/routes.ts` (lines 229-314).

---

**Issue: Filters not working (returns all events)**
```
GET /api/econ/events?country=US → returns EU events too
```
**Solution:** Check storage method implementation. Ensure `inArray()` and `eq()` filters are applied.

---

**Issue: Performance regression (API slower than Firestore)**
```
API response: 450ms (vs. Firestore 145ms)
```
**Solution:** 
- Add database indexes on `datetime_utc`, `country`, `status`
- Check N+1 query issues
- Enable query result caching (Redis)

---

**Issue: Frontend still using Firestore**
```
Console: "Firebase error: Permission denied"
```
**Solution:** Check `useEconEvents` hook - ensure it imports `fetchEconEvents` from `lib/econ.client.ts`, not `getEconEventsMock` from `lib/econ.ts`.

---

### API Specification Reference

**Complete OpenAPI spec:** `server/openapi/econ.draft.yaml`

**Quick Reference:**

**GET /api/econ/events**
- Query params: `from`, `to`, `country`, `category`, `importance`, `status`, `limit`, `offset`
- Response: `{ events: EconEvent[], count: number, total: number, filters: object, timestamp: string }`
- Example: `GET /api/econ/events?from=2025-01-01&country=US,EU&importance=High`

**GET /api/econ/health**
- Response: `{ status: 'healthy' | 'degraded' | 'down', timestamp: string, dataSource: {...}, uptime: number, version: string }`
- Example: `GET /api/econ/health`

---

**Document End**
