# Economic Calendar - Grid View Specification

**Feature:** Calendar Grid View (Monthly Calendar)  
**Version:** 1.0.0  
**Phase:** MVP (UI-Only with Firestore Mock Data)  
**Status:** 🚧 **IN DEVELOPMENT**

---

## Executive Summary

The Calendar Grid View is an **add-on feature** to the existing Economic Calendar List View. It provides an interactive monthly calendar grid (similar to Google Calendar) that displays economic events in a visual 7×6 day matrix. This view complements the existing list-based interface without replacing it, giving users a choice of how to explore upcoming economic events.

**Key Principles:**
- ✅ Non-destructive addition (all List View files remain untouched)
- ✅ Shared data layer (reuses `useEconEvents()` hook and Firestore)
- ✅ Consistent black-gold theme and accessibility standards
- ✅ No new external dependencies

---

## 1. Feature Overview

### 1.1 User Experience

**Users can:**
- Toggle between List and Grid views via URL parameter (`?view=list|grid`)
- Navigate months using Previous, Today, Next buttons
- See economic events visualized on a calendar grid
- View up to 3 events per day cell with "+N more" indicator
- Drill down into daily events via hover popover (desktop) or bottom drawer (mobile)
- Navigate with keyboard (arrow keys, Enter, Space, PageUp/PageDown)
- Deep link to List View filtered to specific day

### 1.2 Navigation Flow

```
/features/calendar               → Default List View
/features/calendar?view=list     → Explicit List View
/features/calendar?view=grid     → New Grid View
```

**View Toggle:**
- Button/toggle component in page header
- Persists selection in URL parameter (enables bookmarking)
- Maintains filters when switching views

---

## 2. Architecture & Data Flow

### 2.1 Component Structure

```
client/src/
├── pages/
│   └── FeaturesCalendar.tsx         ← Updated: view toggle logic
├── components/econ/
│   ├── EconFilters.tsx              ← Unchanged (shared)
│   ├── EconSummary.tsx              ← Unchanged (shared)
│   ├── EconLegend.tsx               ← Unchanged (shared)
│   ├── EconList.tsx                 ← Unchanged (List View)
│   ├── EconRow.tsx                  ← Unchanged (List View)
│   └── grid/                        ← NEW DIRECTORY
│       ├── index.ts                 ← Barrel export
│       ├── EconGridView.tsx         ← Main grid container
│       ├── EconGridHeader.tsx       ← Month nav (Prev, Today, Next)
│       ├── EconGridCalendar.tsx     ← 7×6 day grid
│       ├── EconGridDayCell.tsx      ← Individual day cell
│       ├── EconGridDayPopover.tsx   ← Desktop hover popover
│       └── EconGridDayDrawer.tsx    ← Mobile bottom drawer
```

### 2.2 Data Layer (Reused)

**No changes to existing data layer:**
- ✅ Reuse `useEconEvents()` hook from `client/src/hooks/useEcon.ts`
- ✅ Reuse `getEconEventsMock()` from `client/src/lib/econ.ts`
- ✅ Same Firestore `econEvents_mock` collection
- ✅ Same `EconEvent` type from `shared/schema.ts`

**Grid-specific logic:**
- Compute visible month date range (start of first week → end of last week in UTC)
- Fetch events for entire visible range (typically 42 days)
- Bucket events by day (group by `datetime_utc` date)

**Example:**
```typescript
// User views January 2025 grid
// Grid shows: Dec 30, 2024 → Feb 9, 2025 (42 days)
const visibleRange = {
  from: '2024-12-30T00:00:00.000Z',  // Monday of first week
  to: '2025-02-09T23:59:59.999Z'     // Sunday of last week
};

// Fetch events for full range
const { data: events } = useEconEvents({ 
  from: visibleRange.from, 
  to: visibleRange.to,
  ...otherFilters 
});

// Bucket by day
const eventsByDay = bucketEventsByDay(events);
// Result: Map<'2025-01-15', EconEvent[]>
```

---

## 3. Grid View Layout

### 3.1 Month Header

**Components:** Previous Month, Current Month/Year, Today, Next Month

```
┌─────────────────────────────────────────────────┐
│  [← Prev]  January 2025  [Today]  [Next →]     │
└─────────────────────────────────────────────────┘
```

**Interactions:**
- **Previous:** Navigate to previous month
- **Today:** Jump to current month (highlight today's date)
- **Next:** Navigate to next month
- **Month/Year:** Display only (no inline editing in MVP)

**Keyboard:**
- `PageUp` → Previous month
- `PageDown` → Next month
- `Home` → Jump to today

### 3.2 Calendar Grid

**Structure:** 7 columns (Mon→Sun) × 6 rows = 42 day cells

**Column Headers:**
```
┌──────┬──────┬──────┬──────┬──────┬──────┬──────┐
│  Mon │  Tue │  Wed │  Thu │  Fri │  Sat │  Sun │
├──────┼──────┼──────┼──────┼──────┼──────┼──────┤
```

**Week Layout:**
- Always start on Monday (ISO 8601 standard)
- Always show 6 weeks (42 days total)
- Include leading days from previous month (grayed out)
- Include trailing days from next month (grayed out)

**Example (January 2025):**
```
Mon   Tue   Wed   Thu   Fri   Sat   Sun
30    31     1     2     3     4     5    ← Dec 30-31 grayed
 6     7     8     9    10    11    12
13    14    15    16    17    18    19
20    21    22    23    24    25    26
27    28    29    30    31     1     2    ← Feb 1-2 grayed
 3     4     5     6     7     8     9    ← Feb 3-9 grayed
```

### 3.3 Day Cell Layout

**Each cell shows:**
1. **Date number** (top-left, e.g., "15")
2. **Up to 3 event indicators** (dots or small chips)
3. **"+N more" indicator** if > 3 events

**Visual Design:**
```
┌─────────────────┐
│ 15             │  ← Date number
│                │
│ 🔴 US CPI      │  ← Event 1 (High importance)
│ 🟠 GDP         │  ← Event 2 (Medium importance)
│ 🟡 Retail      │  ← Event 3 (Low importance)
│ +2 more        │  ← More events indicator
└─────────────────┘
```

**Responsive Sizing:**
- Desktop: ~120px × 120px per cell
- Tablet: ~100px × 100px per cell
- Mobile: ~80px × 80px per cell (stacked 1-2 events max)

**States:**
- **Current month:** Default card background
- **Other month:** Muted background (bg-muted/30)
- **Today:** Gold border (border-primary)
- **Focused:** Gold ring (ring-primary, ring-2)
- **Has events:** Slightly elevated on hover

---

## 4. Event Display in Grid

### 4.1 Event Indicators (Per Day Cell)

**Display up to 3 events:**
- Each event shown as a small chip/badge
- Color-coded by importance (High=Red, Medium=Orange, Low=Yellow)
- Truncate long titles (e.g., "US Consumer Price Index YoY" → "US CPI")

**Priority Sorting:**
```typescript
// Show high-importance events first
events
  .sort((a, b) => {
    const importanceOrder = { High: 0, Medium: 1, Low: 2 };
    return importanceOrder[a.importance] - importanceOrder[b.importance];
  })
  .slice(0, 3); // Take top 3
```

### 4.2 "+N More" Indicator

**When to show:**
- Day has more than 3 events
- Calculate: `totalEvents - 3`

**Design:**
```tsx
<div className="text-xs text-primary hover-elevate cursor-pointer">
  +{remainingCount} more
</div>
```

**Interaction:**
- Click to open popover/drawer with all day events

---

## 5. Interactions

### 5.1 Desktop: Hover Popover

**Trigger:** Hover over day cell with events

**Popover Content:**
- List of all events for that day (sorted by time, then importance)
- Each event shows:
  - Time (HH:MM UTC)
  - Title
  - Importance badge
  - Impact score
  - Previous/Forecast/Actual data

**Footer:**
- "View day in List" link → Deep link to List View filtered to that date

**Implementation:**
- Use shadcn `Popover` component
- Delay 200ms before showing (prevent accidental hovers)
- Dismiss on mouse leave after 300ms
- Max height: 400px with scroll

**Example:**
```
┌─────────────────────────────────┐
│ Wednesday, January 15, 2025     │
├─────────────────────────────────┤
│ 14:30 🔴 US CPI YoY             │
│ Impact: 85  Conf: 92%           │
│ Prev: 2.7% | Forecast: 2.8%    │
│                                 │
│ 18:00 🟠 GDP Growth QoQ         │
│ Impact: 72  Conf: 88%           │
│ ...                             │
├─────────────────────────────────┤
│ → View day in List              │
└─────────────────────────────────┘
```

### 5.2 Mobile: Bottom Drawer

**Trigger:** Tap on day cell with events

**Drawer Behavior:**
- Slide up from bottom (50% screen height)
- Drag handle at top (swipe down to dismiss)
- Same content as desktop popover
- Scrollable if content exceeds height

**Implementation:**
- Use shadcn `Sheet` component with `side="bottom"`
- Smooth slide-in animation (300ms ease-out)
- Backdrop overlay (bg-black/50)

### 5.3 Deep Link to List View

**Functionality:**
- Link from popover/drawer footer
- Navigates to List View filtered to selected day

**URL Structure:**
```
/features/calendar?view=list&date=2025-01-15
```

**List View Integration:**
- Parse `?date=YYYY-MM-DD` parameter
- Set date filter to that specific day (00:00 → 23:59 UTC)
- Scroll to first event of the day

---

## 6. Keyboard Navigation

### 6.1 Arrow Key Navigation

**Grid Cell Focus:**
- `↑` Arrow Up → Move to cell above (7 days earlier)
- `↓` Arrow Down → Move to cell below (7 days later)
- `←` Arrow Left → Move to previous day
- `→` Arrow Right → Move to next day

**Boundaries:**
- At edge of grid, wrap to adjacent month
- Visually update month header when crossing month boundary

### 6.2 Additional Shortcuts

**Month Navigation:**
- `PageUp` → Previous month
- `PageDown` → Next month
- `Home` → Jump to today
- `End` → Jump to last day of current month

**Event Interaction:**
- `Enter` or `Space` on focused day → Open popover/drawer
- `Escape` → Close popover/drawer
- `Tab` → Cycle through popover event links

### 6.3 Focus Management

**Visual Indicator:**
- Focused cell: `ring-2 ring-primary ring-offset-2`
- Offset ensures ring is visible on dark background

**ARIA State:**
- `aria-selected="true"` on focused cell
- `aria-label="January 15, 2025, 5 events"` on each cell

---

## 7. Accessibility (ARIA & Roles)

### 7.1 Grid Semantics

**Calendar Grid:**
```tsx
<div 
  role="grid" 
  aria-label="Economic events calendar for January 2025"
  aria-readonly="true"
>
  <div role="row">
    <div role="columnheader" aria-label="Monday">Mon</div>
    ...
  </div>
  <div role="row">
    <div 
      role="gridcell" 
      aria-selected="false"
      aria-label="January 15, 2025, 5 events. High importance: US CPI, Medium importance: GDP Growth, and 3 more."
      tabIndex={0}
    >
      15
    </div>
    ...
  </div>
</div>
```

### 7.2 Screen Reader Announcements

**Day Cell:**
- Format: `"[Date], [Day of week], [Event count] events. [Top 3 event titles]. Press Enter to view all."`
- Example: `"January 15, Wednesday, 5 events. High importance: US CPI, Medium importance: GDP Growth, Low importance: Retail Sales. Press Enter to view all."`

**Month Navigation:**
- Announce month change: `"Showing January 2025"`
- Today button: `"Jump to current month"`

**Popover/Drawer:**
- Focus trap when open
- Announce opening: `"Event details for January 15, 2025"`
- Announce closing: `"Closed event details"`

### 7.3 Color Independence

**Importance Indicators:**
- Not just color-coded (same as List View)
- High: Red + AlertTriangle icon ▲
- Medium: Orange + Info icon ⓘ
- Low: Yellow + Circle icon ○

### 7.4 Data-TestID Coverage

**All interactive elements:**
- `data-testid="button-view-toggle"`
- `data-testid="button-prev-month"`
- `data-testid="button-today"`
- `data-testid="button-next-month"`
- `data-testid="grid-calendar"`
- `data-testid="grid-day-cell-2025-01-15"`
- `data-testid="grid-day-popover-2025-01-15"`
- `data-testid="grid-day-drawer"`
- `data-testid="link-view-day-list-2025-01-15"`

---

## 8. Performance Optimizations

### 8.1 Memoized Month Matrix

**Problem:** Recalculating 42-day grid on every render is expensive

**Solution:**
```typescript
const monthMatrix = useMemo(() => {
  return generateMonthMatrix(year, month); // Returns 6×7 array
}, [year, month]);
```

### 8.2 Event Bucketing

**Problem:** Filtering events per cell on every render (42 cells × N events)

**Solution:**
```typescript
const eventsByDay = useMemo(() => {
  return bucketEventsByDay(events); // Map<'2025-01-15', EconEvent[]>
}, [events]);

// In day cell component:
const dayEvents = eventsByDay.get(dateKey) || [];
```

### 8.3 Deferred Popovers

**Problem:** Rendering 42 popover components (even if hidden) is wasteful

**Solution:**
- Lazy load popover content on first hover
- Use `React.lazy()` for drawer component (mobile only)
- Portal popovers to body (prevent layout thrashing)

### 8.4 Virtual Scrolling (Future)

**Not in MVP:**
- If performance issues arise, consider virtualizing rows (only render visible weeks)
- Likely unnecessary for 42 cells, but noted for future

---

## 9. Responsive Design

### 9.1 Breakpoints

**Desktop (≥ 1024px):**
- Full 7-column grid
- ~120px × 120px cells
- Show up to 3 events per cell
- Hover popovers enabled

**Tablet (768px - 1023px):**
- Full 7-column grid
- ~100px × 100px cells
- Show up to 2 events per cell
- Tap to open popover/drawer

**Mobile (< 768px):**
- Condensed 7-column grid
- ~60px × 80px cells
- Show 1 event + "+N more"
- Tap to open bottom drawer
- Horizontal scroll if needed (prevent squishing)

### 9.2 Mobile-Specific Adaptations

**Month Header:**
- Stack on small screens (Prev/Next buttons on sides, month centered)

**Day Cells:**
- Remove event text (show colored dots only)
- Larger tap targets (≥ 44px)

**Drawer:**
- Full-width event list
- Larger text for readability

---

## 10. Theme & Styling

### 10.1 Black-Gold Palette (Consistent)

**Colors:**
- Primary: `#C7AE6A` (gold)
- Background: `#000000`, `#1a1a1a`
- Card: `#0a0a0a`, `#1a1a1a`
- Border: Gold with opacity (`border-primary/20`)
- Text: High contrast white/light gray

### 10.2 Grid-Specific Styling

**Day Cell:**
```tsx
// Default state
className="border border-border rounded-md p-2 hover-elevate cursor-pointer"

// Current month
className="bg-card"

// Other month (grayed out)
className="bg-muted/30 text-muted-foreground"

// Today
className="border-primary border-2"

// Focused
className="ring-2 ring-primary ring-offset-2 ring-offset-background"
```

**Event Indicators:**
- Small badges (h-6 text-xs)
- Color-coded by importance
- Truncate text with ellipsis

### 10.3 Animations

**Subtle transitions:**
- Month change: Fade in/out (200ms)
- Popover: Slide down (150ms)
- Drawer: Slide up (300ms)
- Hover elevation: Scale 1.02 (100ms)

**No jarring animations:**
- Avoid spinning/bouncing
- Prefer opacity and transform transitions

---

## 11. Edge Cases & Error Handling

### 11.1 No Events in Month

**Display:**
- Empty grid (all cells show just date numbers)
- Subtle message: "No events scheduled for this month"
- Filters still visible (user can adjust)

### 11.2 Firestore Connection Error

**Fallback:**
- Show error state in grid
- Reuse `EconErrorState` component from List View
- Offer retry button

### 11.3 Extreme Date Ranges

**Limits:**
- Allow navigation ±5 years from today (2020-2030)
- Prevent infinite past/future navigation
- Show warning if no data exists for range

### 11.4 Timezone Handling

**All dates in UTC:**
- Display times in UTC (consistent with List View)
- Tooltip shows local time conversion (future enhancement)

---

## 12. Integration with Existing List View

### 12.1 Shared Components

**Reused without modification:**
- `EconFilters.tsx` - Same filter panel
- `EconSummary.tsx` - Same KPI cards
- `EconLegend.tsx` - Same legend (importance, impact, confidence)

**Placement:**
- Filters above both List and Grid views
- Summary KPIs above both views
- Legend on side (desktop) or below (mobile)

### 12.2 View Toggle Component

**Location:** Page header (next to "Economic Calendar" title)

**Design:**
```tsx
<ToggleGroup type="single" value={view} onValueChange={setView}>
  <ToggleGroupItem value="list" aria-label="List view">
    <List className="w-4 h-4" />
  </ToggleGroupItem>
  <ToggleGroupItem value="grid" aria-label="Grid view">
    <Calendar className="w-4 h-4" />
  </ToggleGroupItem>
</ToggleGroup>
```

**Behavior:**
- Persists in URL (`?view=list|grid`)
- Maintains current filters when switching
- Default: `list` (if no param specified)

### 12.3 Filter Synchronization

**Filters apply to both views:**
- Region/Country filter
- Category filter
- Importance filter
- Status filter (Upcoming/Released)

**Grid-specific behavior:**
- Date range filter ignored (Grid determines range by visible month)
- Other filters applied client-side after bucketing events

---

## 13. File Structure Summary

### 13.1 New Files Created

```
client/src/components/econ/grid/
├── index.ts                      (Barrel export)
├── EconGridView.tsx              (Main grid container - 200 lines)
├── EconGridHeader.tsx            (Month nav - 100 lines)
├── EconGridCalendar.tsx          (7×6 grid - 150 lines)
├── EconGridDayCell.tsx           (Individual cell - 120 lines)
├── EconGridDayPopover.tsx        (Desktop popover - 150 lines)
└── EconGridDayDrawer.tsx         (Mobile drawer - 120 lines)

Total: ~840 lines of new code
```

### 13.2 Modified Files

```
client/src/pages/FeaturesCalendar.tsx
  - Add view toggle logic (~30 lines)
  - Conditional rendering (List vs Grid)
  - Parse ?view=list|grid param

client/src/lib/econ.ts
  - Add bucketEventsByDay() helper (~20 lines)
  - Add generateMonthMatrix() helper (~40 lines)

Total modifications: ~90 lines
```

### 13.3 No Changes to These Files

- ✅ `client/src/components/econ/EconFilters.tsx`
- ✅ `client/src/components/econ/EconSummary.tsx`
- ✅ `client/src/components/econ/EconLegend.tsx`
- ✅ `client/src/components/econ/EconList.tsx`
- ✅ `client/src/components/econ/EconRow.tsx`
- ✅ `client/src/components/econ/EconEmptyState.tsx`
- ✅ `client/src/components/econ/EconErrorState.tsx`
- ✅ `client/src/hooks/useEcon.ts`
- ✅ `shared/schema.ts`

---

## 14. Testing Strategy

### 14.1 Manual Testing Checklist

**View Toggle:**
- [ ] Switch from List to Grid view
- [ ] Switch from Grid to List view
- [ ] Filters preserved when switching
- [ ] URL param updates correctly
- [ ] Bookmark Grid view URL and reload

**Month Navigation:**
- [ ] Click Previous month (updates grid)
- [ ] Click Next month (updates grid)
- [ ] Click Today (jumps to current month, highlights today)
- [ ] Navigate 12 months forward (Jan → Dec)
- [ ] Navigate 12 months backward (Dec → Jan)

**Grid Display:**
- [ ] 7 columns (Mon-Sun) rendered
- [ ] 6 rows (42 days) rendered
- [ ] Leading days from previous month grayed out
- [ ] Trailing days from next month grayed out
- [ ] Today's date has gold border
- [ ] Event indicators show in cells
- [ ] "+N more" indicator appears when > 3 events

**Desktop Popover:**
- [ ] Hover over day cell → popover appears (200ms delay)
- [ ] Move mouse away → popover disappears (300ms delay)
- [ ] All day events listed
- [ ] "View day in List" link works
- [ ] Clicking link navigates to List View with date filter

**Mobile Drawer:**
- [ ] Tap day cell → drawer slides up
- [ ] Swipe down → drawer dismisses
- [ ] Tap backdrop → drawer dismisses
- [ ] All day events listed
- [ ] "View day in List" link works

**Keyboard Navigation:**
- [ ] Tab to grid → first day focused
- [ ] Arrow keys move focus (↑↓←→)
- [ ] PageUp → previous month
- [ ] PageDown → next month
- [ ] Home → jump to today
- [ ] Enter on focused day → open popover/drawer
- [ ] Escape → close popover/drawer

**Accessibility:**
- [ ] Screen reader announces day cell correctly
- [ ] Screen reader announces month changes
- [ ] All interactive elements have data-testid
- [ ] Focus visible on all cells
- [ ] Color-blind mode: Importance distinguishable by icons

**Performance:**
- [ ] Grid renders in < 200ms
- [ ] Month navigation smooth (no jank)
- [ ] Hover/focus transitions smooth (60fps)
- [ ] No memory leaks after multiple month navigations

**Responsive:**
- [ ] Desktop: Full grid, 3 events per cell
- [ ] Tablet: Full grid, 2 events per cell
- [ ] Mobile: Condensed grid, 1 event + dots

### 14.2 E2E Test Plan (Future)

**Not in MVP scope, but noted for Phase 2:**
- Automated Playwright tests for navigation
- Visual regression testing (screenshot comparison)
- Performance benchmarking (Lighthouse)

---

## 15. Known Limitations (MVP Scope)

**Features NOT included in Grid View MVP:**
- ❌ Inline event editing
- ❌ Drag-and-drop event rescheduling
- ❌ Multi-day event spanning (all events shown as single-day)
- ❌ Week view or agenda view
- ❌ Print-friendly calendar
- ❌ Export to iCal/Google Calendar
- ❌ Event color customization
- ❌ Mini-calendar date picker
- ❌ Timezone selector (all times UTC)
- ❌ Event search within grid

**Acceptable for MVP:**
- Grid is **read-only** (view events, navigate, drill down)
- All event details still accessible via popover/drawer
- Full functionality available in List View

---

## 16. Migration Path to Phase 2 (API Integration)

**When switching from Firestore mock to real-time API:**

1. **No changes to Grid View components** (data-agnostic)
2. **Only update `useEconEvents()` hook** (same as List View migration)
3. **API provides same date range** (Grid fetches 42 days)
4. **Bucketing logic unchanged** (still group by day)

**Estimated effort:** 1-2 hours (same as List View Phase 2 migration)

---

## Acceptance Checklist

### ✅ Core Functionality

- [ ] Grid View accessible at `/features/calendar?view=grid`
- [ ] View toggle button switches between List and Grid
- [ ] URL parameter `?view=list|grid` persists correctly
- [ ] Default view is List (when no param specified)
- [ ] Filters shared between List and Grid views
- [ ] Month header shows current month/year
- [ ] Previous/Today/Next buttons navigate months
- [ ] 7-column grid (Mon-Sun) displays correctly
- [ ] 6 rows (42 days) always shown
- [ ] Leading/trailing days from adjacent months grayed out
- [ ] Today's date highlighted with gold border

### ✅ Event Display

- [ ] Events fetched for full visible month range (42 days)
- [ ] Events grouped by day correctly
- [ ] Up to 3 events shown per day cell
- [ ] "+N more" indicator shown when > 3 events
- [ ] High-importance events prioritized (shown first)
- [ ] Event titles truncated appropriately
- [ ] Color-coded by importance (High=Red, Medium=Orange, Low=Yellow)
- [ ] Icons distinguish importance (not just color)

### ✅ Interactions (Desktop)

- [ ] Hover over day cell → popover appears (200ms delay)
- [ ] Popover shows all events for that day
- [ ] Popover content: time, title, importance, impact, data
- [ ] "View day in List" link navigates correctly
- [ ] Popover dismisses on mouse leave (300ms delay)
- [ ] Clicking outside popover dismisses it

### ✅ Interactions (Mobile)

- [ ] Tap day cell → bottom drawer slides up
- [ ] Drawer shows all events for that day
- [ ] Drawer content matches desktop popover
- [ ] "View day in List" link works
- [ ] Swipe down → drawer dismisses
- [ ] Tap backdrop → drawer dismisses

### ✅ Keyboard Navigation

- [ ] Tab to grid → first day focused
- [ ] Arrow Up → move to day above (7 days earlier)
- [ ] Arrow Down → move to day below (7 days later)
- [ ] Arrow Left → move to previous day
- [ ] Arrow Right → move to next day
- [ ] PageUp → previous month
- [ ] PageDown → next month
- [ ] Home → jump to today
- [ ] Enter/Space on focused day → open popover/drawer
- [ ] Escape → close popover/drawer

### ✅ Accessibility

- [ ] Grid has `role="grid"`
- [ ] Rows have `role="row"`
- [ ] Cells have `role="gridcell"`
- [ ] Column headers have `role="columnheader"`
- [ ] Focused cell has `aria-selected="true"`
- [ ] Each cell has descriptive `aria-label` (date + event count)
- [ ] Screen reader announces day correctly
- [ ] Screen reader announces month changes
- [ ] All buttons have `aria-label`
- [ ] Importance distinguishable by icons (color-blind safe)
- [ ] Focus ring visible on all cells
- [ ] All interactive elements have `data-testid`

### ✅ Performance

- [ ] Grid renders in < 200ms (42 cells)
- [ ] Month navigation smooth (no jank)
- [ ] Hover/focus transitions smooth (60fps)
- [ ] Month matrix memoized (recalc only on month change)
- [ ] Event bucketing memoized (recalc only on events change)
- [ ] No memory leaks after 20+ month navigations

### ✅ Responsive Design

- [ ] Desktop (≥1024px): Full grid, 3 events per cell
- [ ] Tablet (768-1023px): Full grid, 2 events per cell
- [ ] Mobile (<768px): Condensed grid, 1 event + "+N more"
- [ ] Grid doesn't overflow viewport (horizontal scroll if needed)
- [ ] Touch targets ≥ 44px on mobile

### ✅ Theme & Styling

- [ ] Black-gold color scheme consistent
- [ ] Current month cells: default card background
- [ ] Other month cells: muted background
- [ ] Today: gold border (border-primary)
- [ ] Focused cell: gold ring (ring-primary)
- [ ] Hover elevation subtle (no jarring animations)
- [ ] All transitions smooth (200-300ms)

### ✅ Integration

- [ ] No existing List View files modified (except FeaturesCalendar.tsx)
- [ ] Filters component shared (unchanged)
- [ ] Summary KPIs shared (unchanged)
- [ ] Legend shared (unchanged)
- [ ] Same `useEconEvents()` hook used
- [ ] Same Firestore data source
- [ ] View toggle preserves filters

### ✅ Error Handling

- [ ] No events in month → empty grid + message
- [ ] Firestore error → show error state + retry
- [ ] Invalid date navigation → prevent/warn
- [ ] Missing data → graceful fallback

### ✅ Documentation

- [ ] `docs/EC-GridView.md` created (this file)
- [ ] Component JSDoc comments added
- [ ] README updated (if applicable)
- [ ] QA manual updated with Grid View tests

### ✅ Code Quality

- [ ] No new external dependencies added
- [ ] TypeScript strict mode passes
- [ ] No console errors or warnings
- [ ] No accessibility violations (ARIA)
- [ ] All components under `grid/` directory
- [ ] Barrel export (`grid/index.ts`) created

---

## Appendix A: Helper Functions

### A.1 Generate Month Matrix

```typescript
/**
 * Generates a 6×7 matrix of dates for a given month.
 * Always starts on Monday (ISO 8601).
 * Includes leading days from previous month and trailing days from next month.
 * 
 * @param year - Year (e.g., 2025)
 * @param month - Month (1-12)
 * @returns Array of 6 weeks, each week is array of 7 Date objects
 */
function generateMonthMatrix(year: number, month: number): Date[][] {
  const firstDay = new Date(Date.UTC(year, month - 1, 1));
  const lastDay = new Date(Date.UTC(year, month, 0));
  
  // Find Monday of first week (may be in previous month)
  const startDate = new Date(firstDay);
  const dayOfWeek = startDate.getUTCDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  startDate.setUTCDate(startDate.getUTCDate() + mondayOffset);
  
  // Generate 6 weeks (42 days)
  const matrix: Date[][] = [];
  let currentDate = new Date(startDate);
  
  for (let week = 0; week < 6; week++) {
    const weekDays: Date[] = [];
    for (let day = 0; day < 7; day++) {
      weekDays.push(new Date(currentDate));
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }
    matrix.push(weekDays);
  }
  
  return matrix;
}
```

### A.2 Bucket Events by Day

```typescript
/**
 * Groups events by day (UTC date string).
 * 
 * @param events - Array of EconEvent objects
 * @returns Map of date string → events array
 */
function bucketEventsByDay(events: EconEvent[]): Map<string, EconEvent[]> {
  const buckets = new Map<string, EconEvent[]>();
  
  events.forEach(event => {
    const dateKey = event.datetime_utc.split('T')[0]; // 'YYYY-MM-DD'
    if (!buckets.has(dateKey)) {
      buckets.set(dateKey, []);
    }
    buckets.get(dateKey)!.push(event);
  });
  
  // Sort events within each bucket (by time, then importance)
  buckets.forEach((dayEvents, key) => {
    dayEvents.sort((a, b) => {
      const timeA = new Date(a.datetime_utc).getTime();
      const timeB = new Date(b.datetime_utc).getTime();
      if (timeA !== timeB) return timeA - timeB;
      
      const importanceOrder = { High: 0, Medium: 1, Low: 2 };
      return importanceOrder[a.importance] - importanceOrder[b.importance];
    });
  });
  
  return buckets;
}
```

---

## Appendix B: Component Prop Interfaces

```typescript
// EconGridView.tsx
interface EconGridViewProps {
  filters: EconEventFilters;
  events: EconEvent[];
  isLoading: boolean;
}

// EconGridHeader.tsx
interface EconGridHeaderProps {
  year: number;
  month: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

// EconGridCalendar.tsx
interface EconGridCalendarProps {
  year: number;
  month: number;
  eventsByDay: Map<string, EconEvent[]>;
  onDayClick: (date: Date) => void;
}

// EconGridDayCell.tsx
interface EconGridDayCellProps {
  date: Date;
  events: EconEvent[];
  isCurrentMonth: boolean;
  isToday: boolean;
  isFocused: boolean;
  onFocus: () => void;
  onClick: () => void;
}

// EconGridDayPopover.tsx
interface EconGridDayPopoverProps {
  date: Date;
  events: EconEvent[];
  isOpen: boolean;
  onClose: () => void;
  anchorEl: HTMLElement | null;
}

// EconGridDayDrawer.tsx
interface EconGridDayDrawerProps {
  date: Date;
  events: EconEvent[];
  isOpen: boolean;
  onClose: () => void;
}
```

---

## 15. Swap to API (Production Migration)

### 15.1 Overview

The Grid View currently uses **mock Firestore data** via `getEconEventsMock()` for development. When the production API endpoint `/api/econ/events` is live, the data fetching logic can be swapped with minimal code changes.

**Migration Impact:**
- ✅ **One file change:** `client/src/components/econ/EconCalendarGrid.tsx`
- ✅ **No UI refactor needed:** All components remain unchanged
- ✅ **Same data flow:** Event bucketing and UTC logic stay identical
- ✅ **No new dependencies:** Use existing `fetchEconEvents()` function

---

### 15.2 Current Implementation (Mock Data)

**File:** `client/src/components/econ/EconCalendarGrid.tsx`

```typescript
import { getEconEventsMock, type EconEvent } from "@/lib/econ";

// Current: Fetch from Firestore mock
const {
  data: events = [],
  isLoading,
  error,
} = useQuery({
  queryKey: ["/api/econ/events", bounds.startUtcISO, bounds.endUtcISO, filters],
  queryFn: async () => {
    return getEconEventsMock({
      from: bounds.startUtcISO,
      to: bounds.endUtcISO,
      ...filters,
    });
  },
});
```

**Data Source:** Firestore `guruDigest` collection (mock data)

---

### 15.3 Production Implementation (Real API)

**File:** `client/src/components/econ/EconCalendarGrid.tsx`

```typescript
import { fetchEconEvents, type EconEvent } from "@/lib/econ";

// Production: Fetch from backend API
const {
  data: events = [],
  isLoading,
  error,
} = useQuery({
  queryKey: ["/api/econ/events", bounds.startUtcISO, bounds.endUtcISO, filters],
  queryFn: async () => {
    return fetchEconEvents({
      from: bounds.startUtcISO,
      to: bounds.endUtcISO,
      ...filters,
    });
  },
});
```

**Data Source:** Express backend `/api/econ/events` endpoint

---

### 15.4 Migration Steps

**Step 1: Verify API Endpoint Ready**
```bash
# Test API endpoint responds correctly
curl http://localhost:5000/api/econ/events?from=2025-01-01T00:00:00.000Z&to=2025-01-31T23:59:59.999Z

# Expected response:
# [
#   {
#     "id": "...",
#     "title": "US CPI (YoY)",
#     "datetime_utc": "2025-01-15T13:30:00.000Z",
#     "country": "US",
#     "category": "Inflation",
#     "importance": "High",
#     "impactScore": 85,
#     "confidence": 90,
#     ...
#   }
# ]
```

**Step 2: Update EconCalendarGrid.tsx**

Replace this:
```typescript
import { getEconEventsMock, type EconEvent } from "@/lib/econ";

const { data: events = [] } = useQuery({
  queryFn: async () => {
    return getEconEventsMock({ from: bounds.startUtcISO, to: bounds.endUtcISO, ...filters });
  },
});
```

With this:
```typescript
import { fetchEconEvents, type EconEvent } from "@/lib/econ";

const { data: events = [] } = useQuery({
  queryFn: async () => {
    return fetchEconEvents({ from: bounds.startUtcISO, to: bounds.endUtcISO, ...filters });
  },
});
```

**Step 3: Test Grid View**
```
1. Navigate to /features/calendar?view=grid
2. Verify events load from API (check Network tab)
3. Test month navigation (Prev/Next)
4. Verify event bucketing works (events on correct days)
5. Test drawer/popover (events show correct data)
```

**Step 4: Verify UTC Logic Unchanged**

```typescript
// Event bucketing logic (unchanged)
const eventsByDay = useMemo(() => {
  const map = new Map<string, EconEvent[]>();
  
  events.forEach((event) => {
    // Extract date portion from datetime_utc (YYYY-MM-DD)
    const dateKey = event.datetime_utc.split('T')[0];
    
    if (!map.has(dateKey)) {
      map.set(dateKey, []);
    }
    map.get(dateKey)!.push(event);
  });

  // Sort events within each day by time, then importance
  map.forEach((dayEvents) => {
    dayEvents.sort((a, b) => {
      const timeA = new Date(a.datetime_utc).getTime();
      const timeB = new Date(b.datetime_utc).getTime();
      if (timeA !== timeB) return timeA - timeB;
      
      const importanceOrder: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
      return importanceOrder[a.importance] - importanceOrder[b.importance];
    });
  });

  return map;
}, [events]);
```

✅ **This logic remains identical** - works with both mock and real API data.

---

### 15.5 API Requirements

**Endpoint:** `GET /api/econ/events`

**Query Parameters:**
- `from` (required): ISO 8601 UTC datetime string (e.g., `2025-01-01T00:00:00.000Z`)
- `to` (required): ISO 8601 UTC datetime string (e.g., `2025-01-31T23:59:59.999Z`)
- `country` (optional): Filter by country code (e.g., `US`, `EU`, `GB`)
- `category` (optional): Filter by category (e.g., `Inflation`, `Employment`, `GDP`)
- `importance` (optional): Filter by importance (e.g., `High`, `Medium`, `Low`)

**Response Format:**
```typescript
type EconEvent[] = {
  id: string;
  title: string;
  country: string;
  category: 'Inflation' | 'Employment' | 'GDP' | 'Rates' | 'Earnings' | 'Other';
  datetime_utc: string; // ISO 8601 with Z suffix
  importance: 'High' | 'Medium' | 'Low';
  impactScore: number; // 0-100
  confidence: number; // 0-100
  status: 'upcoming' | 'released';
  previous: number | null;
  forecast: number | null;
  actual: number | null;
}[]
```

**Critical:** All `datetime_utc` values MUST end with `Z` (UTC timezone indicator).

---

### 15.6 No Changes Needed

The following components **remain unchanged** during API swap:

**Grid Components:**
- ✅ `CalendarGrid.tsx` - Matrix rendering logic
- ✅ `DayCell.tsx` - Event dot display
- ✅ `DayDrawer.tsx` - Mobile bottom sheet
- ✅ `EventPopover.tsx` - Desktop hover preview
- ✅ `EventDot.tsx` - Event indicator
- ✅ `MonthHeader.tsx` - Navigation controls

**Shared Utilities:**
- ✅ `econDate.ts` - UTC date utilities (matrix generation, formatting)
- ✅ All date bucketing logic
- ✅ All event sorting logic
- ✅ All keyboard navigation
- ✅ All accessibility features

**Why no changes needed?**
- Components receive events as props from parent
- UTC date parsing happens in parent (`EconCalendarGrid`)
- Event bucketing logic works on any `EconEvent[]` array
- UI rendering doesn't care about data source

---

### 15.7 Rollback Plan

If API issues arise, revert to mock data immediately:

**Step 1: Revert import**
```typescript
// Change this back
import { fetchEconEvents } from "@/lib/econ";

// To this
import { getEconEventsMock } from "@/lib/econ";
```

**Step 2: Revert queryFn**
```typescript
// Change this back
queryFn: async () => fetchEconEvents({ ... })

// To this
queryFn: async () => getEconEventsMock({ ... })
```

**Step 3: Deploy**
```bash
git checkout client/src/components/econ/EconCalendarGrid.tsx
git commit -m "Rollback to Firestore mock data"
```

**Estimated rollback time:** < 2 minutes

---

### 15.8 Testing Checklist

After swapping to API, verify:

**Data Loading:**
- [ ] Events load on grid mount
- [ ] Month navigation triggers new API calls
- [ ] Loading spinner shows during fetch
- [ ] Error state shows if API fails
- [ ] Filters trigger API refetch with correct params

**Event Display:**
- [ ] Events appear on correct UTC day
- [ ] Event count matches API response
- [ ] Up to 3 events shown per day
- [ ] "+N more" appears for 4+ events
- [ ] Event shapes match importance (Triangle/Info/Circle)

**UTC Logic:**
- [ ] Events bucket by UTC date (not local date)
- [ ] Month matrix uses UTC dates
- [ ] Drawer/popover show correct local time tooltips
- [ ] Deep links to List View use UTC date filters

**Performance:**
- [ ] First render < 500ms
- [ ] API response < 300ms
- [ ] No layout shifts
- [ ] Month navigation smooth

**Edge Cases:**
- [ ] Empty months (no events) show empty grid
- [ ] API errors show user-friendly message
- [ ] Network timeout handled gracefully
- [ ] Large event counts (80+) render smoothly

---

### 15.9 Summary

**Migration Complexity:** ⭐ Low (1-file change)

**What changes:**
- Data source: Firestore mock → Backend API
- Function call: `getEconEventsMock()` → `fetchEconEvents()`

**What stays the same:**
- All UI components (0 changes)
- All date utilities (0 changes)
- All event bucketing logic (0 changes)
- All keyboard navigation (0 changes)
- All accessibility features (0 changes)

**Estimated migration time:** 15 minutes

---

**End of Specification**

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Jan 2025 | Initial specification for Grid View MVP |

---

## Sign-Off

**Product Owner:** _____________________________ **Date:** _____________

**Technical Lead:** _____________________________ **Date:** _____________

**UX Designer:** _____________________________ **Date:** _____________
