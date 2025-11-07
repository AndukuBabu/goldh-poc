# UMF (Universal Market Financials) - UI MVP Specification

**Version:** 1.0  
**Date:** January 7, 2025  
**Status:** Planning  
**Route:** `/features/umf`

---

## 1. Overview

The Universal Market Financials (UMF) page is GOLDH's daily control center - a unified dashboard combining crypto, indices, and market intelligence into a single, premium-styled interface.

**Core Value Proposition:**  
Replace 5+ separate apps (Yahoo Finance, Binance, CNBC, Twitter) with one intelligent dashboard that shows what's happening, why it matters, and what to do next.

**MVP Scope:**  
UI-only implementation powered by Firestore mock data. No external APIs, no live price feeds - just a polished, responsive interface ready for future backend integration.

---

## 2. Route & Navigation

**URL:** `/features/umf`  
**Display:** Full-screen feature page (similar to `/features/calendar`)  
**Access:** Available to all authenticated users  
**Navigation:** Accessible from main features menu/dashboard

---

## 3. MVP Widgets

### 3.1 Live Market Snapshot
**Purpose:** One-glance view of top crypto assets + key market indices

**Content:**
- Top 20 cryptocurrencies (BTC, ETH, SOL, XRP, BNB, ADA, AVAX, DOGE, TON, DOT, etc.)
- Major indices: S&P 500, NASDAQ, DXY (Dollar Index)
- Each asset shows:
  - Current price
  - 24h % change
  - Visual indicator (up/down arrow, color-coded)
  - Sparkline chart (optional, if performance allows)

**Layout:**
- Grid/table format on desktop (4-5 columns)
- Scrollable card list on mobile
- Sortable by price, % change, market cap

**Data Fields:**
```typescript
{
  symbol: string;        // "BTC", "ETH", "SPY"
  name: string;          // "Bitcoin", "Ethereum", "S&P 500"
  price: number;         // 45678.90
  change24h: number;     // 3.4 (percentage)
  changeAbsolute: number; // 1504.23 (dollar amount)
  assetType: 'crypto' | 'index' | 'commodity';
}
```

---

### 3.2 Top Movers
**Purpose:** Highlight biggest gainers and losers across all tracked assets

**Content:**
- Top 3 Gainers (highest positive % change)
- Top 3 Losers (highest negative % change)
- Displayed as compact cards with:
  - Asset symbol + name
  - % change (prominently displayed)
  - Brief narrative snippet (optional)
    - Example: "BTC +4.2% - Institutional buying"

**Layout:**
- Two-column layout (Gainers | Losers) on desktop
- Stacked sections on mobile
- Each card uses gold/red color coding

**Data Fields:**
```typescript
{
  symbol: string;
  name: string;
  change24h: number;
  narrative?: string;  // "ETF inflows surge"
}
```

---

### 3.3 Morning Intelligence Banner
**Purpose:** AI-generated daily brief explaining market context

**Content:**
- Single-sentence market summary
- Auto-generated narrative (mock text for MVP)
- Examples:
  - "Risk-on sentiment as markets rally after Fed dovish tone"
  - "Crypto consolidation as institutional inflows pause"
  - "Gold rallies on rate cut speculation"

**Layout:**
- Full-width banner at top of page
- Gold accent border/background
- Dismissible (X button)
- Icon: Brain/Lightbulb/Trending

**Data Fields:**
```typescript
{
  id: string;
  date: string;          // ISO date
  summary: string;       // Single sentence
  sentiment: 'bullish' | 'bearish' | 'neutral';
  timestamp: string;     // When generated
}
```

---

### 3.4 Alert Card (Optional)
**Purpose:** Display one personalized mock alert

**Content:**
- Sample alert notification
- Examples:
  - "BTC volatility spike detected"
  - "Your watchlist: ETH +5.2% in 1 hour"
  - "DXY approaching key resistance"

**Layout:**
- Small card/banner (not full-width)
- Icon: Bell/Alert/Info
- Dismissible

**Data Fields:**
```typescript
{
  id: string;
  type: 'price' | 'volatility' | 'sentiment';
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
}
```

---

## 4. Data Source: Firestore Mock Collections

All data will be stored in Firestore collections with mock/demo values:

### Collection: `umf_market_snapshot`
```typescript
{
  assets: Array<{
    symbol: string;
    name: string;
    price: number;
    change24h: number;
    changeAbsolute: number;
    assetType: 'crypto' | 'index' | 'commodity';
    lastUpdated: timestamp;
  }>
}
```

### Collection: `umf_morning_intelligence`
```typescript
{
  id: string;
  date: string;
  summary: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  timestamp: timestamp;
}
```

### Collection: `umf_alerts` (optional)
```typescript
{
  id: string;
  type: 'price' | 'volatility' | 'sentiment';
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: timestamp;
  dismissed: boolean;
}
```

**Future Migration:**  
All Firestore queries will be wrapped in service functions (e.g., `getMarketSnapshot()`) that can later swap to REST API calls (`GET /api/umf/snapshot`) without changing UI components.

---

## 5. Design System & Styling

### Color Palette (Black-Gold Premium Theme)
- **Primary Gold:** `#C7AE6A`
- **Gold Hover:** `#d5c28f`
- **Dark Backgrounds:** `#111`, `#0a0a0a`
- **Subtle Borders:** `#2a2a2a`
- **Positive (Gainers):** Green (`#51cf66`, `#40c057`)
- **Negative (Losers):** Red (`#ff6b6b`, `#fa5252`)

### Component Styling
- Use shadcn/ui components: `<Card>`, `<Badge>`, `<Button>`
- Consistent with Economic Calendar Grid aesthetic
- Tailwind utility classes (no inline styles)
- Gold accents on focus states (`focus:ring-[#C7AE6A]`)
- Hover glows on interactive elements
- Responsive breakpoints: `sm:`, `md:`, `lg:`

### Typography
- **Prices:** Font-mono for numerical consistency
- **Headers:** Font-semibold, larger on desktop
- **Percentages:** Color-coded, prominent display

---

## 6. Performance Requirements

### Target Metrics
- **First Paint:** < 2 seconds (including Firestore fetch)
- **Time to Interactive:** < 3 seconds
- **Lighthouse Performance:** > 85
- **DOM Nodes:** < 1500 elements

### Optimization Strategies
- Lazy load sparkline charts (if included)
- Virtualize long asset lists (if > 30 items)
- Memoize computed values (top movers calculation)
- Use TanStack Query for efficient caching
- Minimize re-renders with React.memo where appropriate

---

## 7. Accessibility Requirements

### Keyboard Navigation
- All interactive elements focusable with Tab
- Arrow keys for navigating asset lists (optional)
- Enter/Space to activate buttons
- Escape to dismiss modals/banners

### ARIA Labels
Every interactive element needs:
```tsx
// Example: Asset row
<div 
  role="button"
  tabIndex={0}
  aria-label="Bitcoin, price $45,678, up 3.4%"
  data-testid="asset-BTC"
>
```

### Screen Reader Support
- Live regions for price updates (future)
- Clear status announcements
- Percentage changes announced with context
- Example: "Bitcoin up 3.4 percent"

### Visual Accessibility
- Color is not sole indicator (use icons + text)
- Sufficient contrast ratios (WCAG AA)
- Focus indicators visible on all interactive elements
- Text remains readable at 200% zoom

---

## 8. Responsive Design

### Mobile (< 768px)
- Stacked vertical layout
- Morning Intelligence full-width banner
- Market Snapshot as scrollable cards (1 column)
- Top Movers stacked (Gainers, then Losers)
- Bottom navigation for quick actions

### Tablet (768px - 1024px)
- 2-column layouts where appropriate
- Market Snapshot in 2-3 columns
- Top Movers side-by-side

### Desktop (> 1024px)
- Multi-column grid layouts
- Market Snapshot in 4-5 columns
- All widgets visible without scrolling (above fold)

---

## 9. Non-Goals (Out of Scope for MVP)

The following features are **NOT** included in this MVP:

❌ **Live Price Feeds** - No WebSocket connections, no real-time updates  
❌ **External API Integration** - CoinMarketCap, IEX Cloud, etc. come later  
❌ **Correlation Heatmaps** - Complex visualizations deferred to Phase 2  
❌ **Portfolio Integration** - No user-specific holdings tracking  
❌ **Push Notifications** - In-app alerts only, no email/SMS  
❌ **Customizable Layouts** - Drag-and-drop widgets deferred  
❌ **Historical Charts** - Sparklines only (if performance allows)  
❌ **Multi-timeframe Views** - 24h only for MVP  
❌ **Search/Filter** - Basic sorting only  
❌ **Export Data** - CSV/PDF downloads deferred

---

## 10. Future-Proofing Strategy

### API Migration Path
All data fetching will use abstracted service functions:

```typescript
// Current (MVP): Firestore
export async function getMarketSnapshot() {
  const snapshot = await getDoc(doc(db, 'umf_market_snapshot', 'current'));
  return snapshot.data().assets;
}

// Future: REST API (no UI changes needed)
export async function getMarketSnapshot() {
  const response = await fetch('/api/umf/snapshot');
  return response.json();
}
```

### Component Structure
Components receive data as props, never fetch directly:
```tsx
// ✅ Good: Reusable
function MarketSnapshot({ assets }: { assets: Asset[] }) { ... }

// ❌ Bad: Coupled to Firestore
function MarketSnapshot() {
  const assets = useFirestoreCollection('umf_market_snapshot');
  ...
}
```

### Backend API Endpoints (Future)
- `GET /api/umf/snapshot` - Market snapshot data
- `GET /api/umf/movers` - Top gainers/losers
- `GET /api/umf/intelligence` - Morning brief
- `GET /api/umf/alerts` - User alerts

---

## 11. File Structure

```
client/src/
├── pages/
│   └── UMF.tsx                          # Main page component
├── components/
│   └── umf/
│       ├── MarketSnapshot.tsx           # Top-20 crypto + indices grid
│       ├── TopMovers.tsx                # Gainers/Losers cards
│       ├── MorningIntelligence.tsx      # AI daily brief banner
│       ├── AlertCard.tsx                # Optional alert notification
│       └── AssetRow.tsx                 # Individual asset display
├── lib/
│   └── umf.ts                           # Type definitions & utilities
└── services/
    └── umfService.ts                    # Firestore data fetching

docs/
└── UMF-UI-MVP.md                        # This document

scripts/
└── uploadUMFMockData.ts                 # Firestore data seeding script
```

---

## 12. Testing Strategy

### Manual Testing
- Visual inspection on mobile/tablet/desktop
- Keyboard navigation verification
- Screen reader testing (VoiceOver/NVDA)
- Performance profiling (Chrome DevTools)

### Data Validation
- Verify Firestore data loads correctly
- Check error states (empty data, network failure)
- Confirm sorting/filtering logic

### Cross-Browser
- Chrome, Firefox, Safari, Edge
- iOS Safari, Android Chrome

---

## 13. Success Criteria

The UMF MVP is considered **complete** when:

✅ **Functional Requirements**
- [ ] Page loads at `/features/umf`
- [ ] All 4 widgets render correctly (Snapshot, Movers, Intelligence, Alert)
- [ ] Data fetches from Firestore mock collections
- [ ] Asset prices display with correct formatting
- [ ] Top Movers accurately show top 3 gainers/losers
- [ ] Morning Intelligence banner displays and is dismissible

✅ **Performance**
- [ ] First Paint < 2 seconds (on development server)
- [ ] No console errors or warnings
- [ ] Smooth scrolling on mobile devices
- [ ] Re-renders optimized (React DevTools Profiler)

✅ **Design System**
- [ ] Black-gold theme applied consistently
- [ ] Matches Economic Calendar aesthetic
- [ ] Responsive on mobile (375px), tablet (768px), desktop (1440px)
- [ ] Gold accents on hover/focus states
- [ ] Proper spacing and alignment

✅ **Accessibility**
- [ ] All interactive elements have `data-testid` attributes
- [ ] ARIA labels present on complex widgets
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus indicators visible
- [ ] Color alone not used for meaning (icons + text)
- [ ] Screen reader announces asset changes correctly

✅ **Code Quality**
- [ ] TypeScript types defined in `lib/umf.ts`
- [ ] No TypeScript errors or warnings
- [ ] Components use props (not direct Firestore access)
- [ ] Service layer abstraction in place for future API swap
- [ ] Consistent with existing codebase patterns

---

## 14. Acceptance Checklist

### Phase 1: Setup & Data (Prompt 2-3)
- [ ] Create TypeScript interfaces in `lib/umf.ts`
- [ ] Create Firestore collections (umf_market_snapshot, umf_morning_intelligence, umf_alerts)
- [ ] Write data seeding script (`scripts/uploadUMFMockData.ts`)
- [ ] Populate Firestore with realistic mock data (Top-20 crypto + indices)
- [ ] Create service functions in `services/umfService.ts`

### Phase 2: Core Components (Prompt 4-5)
- [ ] Build `MarketSnapshot.tsx` component (asset grid/table)
- [ ] Build `AssetRow.tsx` component (individual asset display)
- [ ] Build `TopMovers.tsx` component (gainers/losers cards)
- [ ] Implement sorting logic (price, % change, name)
- [ ] Add loading skeletons for each widget

### Phase 3: Intelligence & Alerts (Prompt 6)
- [ ] Build `MorningIntelligence.tsx` banner
- [ ] Build `AlertCard.tsx` (optional widget)
- [ ] Implement dismiss functionality
- [ ] Add proper ARIA announcements

### Phase 4: Main Page Integration (Prompt 7)
- [ ] Create `pages/UMF.tsx` main page
- [ ] Integrate all widgets with TanStack Query
- [ ] Add route to `App.tsx` (`/features/umf`)
- [ ] Implement error boundaries
- [ ] Add empty states (no data scenarios)

### Phase 5: Polish & Testing (Prompt 8)
- [ ] Apply black-gold styling across all components
- [ ] Add hover effects and gold glow
- [ ] Implement responsive breakpoints
- [ ] Add `data-testid` to all interactive elements
- [ ] Performance audit (< 2s first paint)
- [ ] Accessibility audit (keyboard, ARIA, screen reader)
- [ ] Cross-browser testing

### Phase 6: Documentation & Handoff (Prompt 9)
- [ ] Update `replit.md` with UMF feature details
- [ ] Document data schema and Firestore structure
- [ ] Create API migration guide (Firestore → REST)
- [ ] Add comments to complex logic
- [ ] Create demo/walkthrough video (optional)

---

## 15. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Firestore read limits exceeded | High | Implement client-side caching (TanStack Query), reduce polling frequency |
| Performance < 2s target | Medium | Lazy load non-critical widgets, optimize bundle size, use React.memo |
| Mobile layout breaks | Medium | Test early on real devices, use CSS Grid with fallbacks |
| Accessibility violations | Low | Follow WCAG 2.1 AA guidelines, use axe DevTools, test with screen readers |
| Type mismatches (Firestore) | Low | Strict TypeScript types, runtime validation with Zod |

---

## 16. Next Steps

After MVP completion:
1. **User Testing** - Gather feedback on layout, usability, clarity
2. **Performance Optimization** - Fine-tune rendering, caching strategies
3. **API Backend** - Build `/api/umf/*` endpoints
4. **Live Data Integration** - Connect to CoinMarketCap, IEX Cloud
5. **Phase 2 Features** - Correlation heatmap, portfolio integration

---

**Document Owner:** Development Team  
**Last Updated:** January 7, 2025  
**Next Review:** After MVP implementation
