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

**Document End**
