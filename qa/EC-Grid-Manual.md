# Economic Calendar - Grid View Manual QA Test Script

## Overview
This document provides step-by-step manual testing procedures for the Economic Calendar Grid View feature. Follow each test case sequentially and document any failures or unexpected behavior.

**Test Environment:**
- Browser: Chrome/Firefox/Safari (latest versions)
- Viewport sizes: Desktop (1920×1080), Tablet (768×1024), Mobile (375×667)
- Test data: 58-80 mock events across current month

---

## Test Suite 1: View Toggle & Layout

### Test 1.1: Grid View Activation
**Objective:** Verify Grid View loads correctly via URL parameter

**Steps:**
1. Navigate to `/features/calendar`
2. Observe default List View loads
3. Append `?view=grid` to URL
4. Press Enter

**Expected Results:**
- ✅ Page transitions to Grid View
- ✅ 6×7 calendar grid displayed (6 rows, 7 columns)
- ✅ Weekday headers visible (Mon, Tue, Wed, Thu, Fri, Sat, Sun)
- ✅ Current month displayed in header
- ✅ "Today" button visible
- ✅ Prev/Next month navigation arrows visible

**Pass Criteria:**
- All 42 cells render (6 weeks × 7 days)
- No layout shifts or broken grid alignment
- Month header shows correct month/year

---

### Test 1.2: Weekday Header Alignment
**Objective:** Verify weekday labels align with correct columns

**Steps:**
1. In Grid View, locate the weekday header row
2. Identify Monday column (leftmost)
3. Identify Sunday column (rightmost)
4. Verify each weekday label aligns with its column

**Expected Results:**
- ✅ Monday is first column (leftmost)
- ✅ Sunday is last column (rightmost)
- ✅ Headers: Mon → Tue → Wed → Thu → Fri → Sat → Sun
- ✅ No misalignment or wrapping

**Pass Criteria:**
- All 7 weekday labels visible and correctly ordered
- Labels center-aligned within columns

---

### Test 1.3: Grid Cell Structure
**Objective:** Verify each cell shows date number and event indicators

**Steps:**
1. Inspect cells in current month (not grayed out)
2. Check for date number in top-left of each cell
3. Look for event dots/chips below date number
4. Verify grayed-out dates (previous/next month overflow)

**Expected Results:**
- ✅ Each cell shows day number (1-31)
- ✅ Current month dates: darker background
- ✅ Previous/next month dates: lighter/grayed background
- ✅ Today's date: highlighted with border (if in view)
- ✅ Event indicators visible for days with events

**Pass Criteria:**
- Date numbers readable and correctly positioned
- Visual distinction between current/other months
- Today's date clearly identifiable

---

## Test Suite 2: Month Navigation

### Test 2.1: Previous Month Button
**Objective:** Navigate to previous month and verify grid updates

**Steps:**
1. Note current month in header (e.g., "November 2025")
2. Click left arrow (Previous Month) button
3. Observe grid update

**Expected Results:**
- ✅ Month header updates to previous month (e.g., "October 2025")
- ✅ Grid cells refresh with new dates
- ✅ New events load for visible date range
- ✅ Smooth transition (no flash/flicker)

**Pass Criteria:**
- Month decrements correctly
- Events load within 500ms
- No console errors

---

### Test 2.2: Next Month Button
**Objective:** Navigate to next month and verify grid updates

**Steps:**
1. Note current month in header
2. Click right arrow (Next Month) button
3. Observe grid update

**Expected Results:**
- ✅ Month header updates to next month
- ✅ Grid cells refresh with new dates
- ✅ New events load for visible date range
- ✅ Smooth transition (no flash/flicker)

**Pass Criteria:**
- Month increments correctly
- Events load within 500ms
- No console errors

---

### Test 2.3: Today Button
**Objective:** Return to current month from any other month

**Steps:**
1. Navigate to a different month (e.g., +3 months)
2. Click "Today" button
3. Observe grid return to current month

**Expected Results:**
- ✅ Grid jumps to current month
- ✅ Today's date highlighted (if in view)
- ✅ Focus moves to today's cell
- ✅ Events reload correctly

**Pass Criteria:**
- Returns to exact current month
- Today cell visually distinct
- No navigation errors

---

### Test 2.4: Month Navigation with Keyboard (Optional)
**Objective:** Use PageUp/PageDown to navigate months

**Steps:**
1. Focus any grid cell (Tab or click)
2. Press `PageDown` key
3. Observe month change
4. Press `PageUp` key
5. Observe month change

**Expected Results:**
- ✅ PageDown navigates to next month
- ✅ PageUp navigates to previous month
- ✅ Focus maintained on equivalent day (if exists)
- ✅ Smooth transitions

**Pass Criteria:**
- Keyboard navigation works as expected
- Focus preserved across month changes

---

## Test Suite 3: Event Display & Time Zones

### Test 3.1: Events Appear on Correct UTC Day
**Objective:** Verify events display on the correct UTC date

**Steps:**
1. Open Grid View for current month
2. Locate a day with known events (check mock data or List View)
3. Compare event placement in Grid vs List
4. Verify events appear on same UTC date in both views

**Expected Results:**
- ✅ Events appear on correct UTC day in grid
- ✅ No events missing from grid cells
- ✅ Grid and List views show same events for same dates
- ✅ Event count matches between views

**Pass Criteria:**
- All events visible on correct days
- No discrepancies between Grid and List

---

### Test 3.2: Event Dot Display (Up to 3)
**Objective:** Verify maximum 3 event dots shown per day

**Steps:**
1. Find a day with 1 event
2. Find a day with 2 events
3. Find a day with 3 events
4. Find a day with 4+ events (if available)
5. Count visible event dots in each case

**Expected Results:**
- ✅ 1 event → 1 dot displayed
- ✅ 2 events → 2 dots displayed
- ✅ 3 events → 3 dots displayed
- ✅ 4+ events → 3 dots displayed + "+N more" text

**Pass Criteria:**
- Never more than 3 dots visible per day
- "+N more" appears for 4+ events
- Event dots sorted by importance (High → Medium → Low)

---

### Test 3.3: Event Shape Legend (Importance)
**Objective:** Verify importance levels use different shapes

**Steps:**
1. Locate days with High, Medium, and Low importance events
2. Compare event dot shapes/icons
3. Reference legend for shape meanings

**Expected Results:**
- ✅ High importance: Triangle icon (AlertTriangle)
- ✅ Medium importance: Info icon (circle with i)
- ✅ Low importance: Circle icon
- ✅ Shapes visible even without color (accessibility)

**Pass Criteria:**
- Three distinct shapes for importance levels
- Shapes match legend documentation
- Color-blind users can distinguish events

---

### Test 3.4: Hover Tooltip - Local Time Conversion (Desktop)
**Objective:** Verify UTC times convert to local time on hover

**Steps:**
1. **Desktop only**: Hover over a day cell with events
2. Wait for popover to appear (lazy-mounted)
3. Hover over event time (UTC format)
4. Observe tooltip with local time

**Expected Results:**
- ✅ Popover appears on hover (desktop only)
- ✅ Event times shown in UTC format
- ✅ Hovering time shows tooltip with local time
- ✅ Tooltip format: "UTC: HH:MM" and "Local: [formatted time]"

**Pass Criteria:**
- Local time conversion accurate
- Tooltip appears within 100ms
- No layout shifts when tooltip appears

---

### Test 3.5: Tap Time - Local Time Conversion (Mobile)
**Objective:** Verify local time visible in mobile drawer

**Steps:**
1. **Mobile device**: Tap a day cell with events
2. Drawer opens from bottom
3. Locate event time (clock icon + UTC time)
4. Tap on the time element
5. Observe tooltip/popover with local time

**Expected Results:**
- ✅ Drawer opens on tap
- ✅ Times displayed in UTC
- ✅ Tapping time shows local conversion
- ✅ Conversion accurate to user's timezone

**Pass Criteria:**
- Mobile tooltip/popover accessible
- Local time matches device timezone
- Touch target large enough (min 44×44px)

---

## Test Suite 4: Overflow & Drill-Down

### Test 4.1: "+N more" Indicator Display
**Objective:** Verify overflow indicator for days with 4+ events

**Steps:**
1. Identify a day with 4 or more events
2. Check event dot display in grid cell
3. Verify "+N more" text appears

**Expected Results:**
- ✅ Exactly 3 event dots visible
- ✅ "+N more" text displayed below dots
- ✅ N = total events - 3 (e.g., 7 events → "+4 more")
- ✅ Text color: primary gold (#C7AE6A)

**Pass Criteria:**
- Overflow count accurate
- Text clearly visible
- No overlapping with other cell content

---

### Test 4.2: Drawer Shows All Events
**Objective:** Opening drawer displays all events, not just first 3

**Steps:**
1. Find day with "+N more" indicator
2. Click/tap the day cell
3. Drawer/modal opens
4. Count events in drawer
5. Compare to expected total

**Expected Results:**
- ✅ Drawer opens smoothly
- ✅ All events listed (not just 3)
- ✅ Event count matches "+N more" calculation
- ✅ Events sorted by time, then importance

**Pass Criteria:**
- No events missing from drawer
- Event order logical (chronological)
- Drawer scrollable if many events

---

### Test 4.3: Drawer Event Anatomy
**Objective:** Verify drawer events show full EconRow structure

**Steps:**
1. Open drawer for any day with events
2. Inspect first event card in drawer
3. Verify all data fields present

**Expected Results:**
- ✅ Country flag displayed
- ✅ Event title visible
- ✅ Category badge present
- ✅ UTC time with local tooltip
- ✅ Importance badge (High/Medium/Low)
- ✅ Impact score badge
- ✅ Confidence percentage badge
- ✅ Status badge (Upcoming/Released)
- ✅ Prev/Forecast/Actual data grid (if applicable)

**Pass Criteria:**
- All badges and data visible
- Compact layout (not too tall)
- Readable on mobile screens

---

### Test 4.4: "View in List" Deep Link
**Objective:** Verify drill-down to List View with date filter

**Steps:**
1. Open drawer for a specific date (e.g., Nov 15, 2025)
2. Scroll to bottom of drawer
3. Click "View this day in List" button
4. Observe navigation to List View

**Expected Results:**
- ✅ Navigates to List View
- ✅ URL includes `?view=list&from=YYYY-MM-DD&to=YYYY-MM-DD`
- ✅ List View filtered to selected date
- ✅ Only events from that date visible
- ✅ Date filter chips show selected date

**Pass Criteria:**
- URL parameters correct
- List View pre-filtered
- No extra/missing events

---

## Test Suite 5: Keyboard Navigation

### Test 5.1: Arrow Key Navigation
**Objective:** Navigate grid cells using arrow keys

**Steps:**
1. Tab to focus first grid cell (or click any cell)
2. Press `ArrowRight` → Focus moves right
3. Press `ArrowDown` → Focus moves down
4. Press `ArrowLeft` → Focus moves left
5. Press `ArrowUp` → Focus moves up
6. Verify focus ring visible on each cell

**Expected Results:**
- ✅ Right arrow: focus moves to next day (right)
- ✅ Down arrow: focus moves down one week (same weekday)
- ✅ Left arrow: focus moves to previous day (left)
- ✅ Up arrow: focus moves up one week (same weekday)
- ✅ Focus wraps to next/previous row at edges
- ✅ Blue focus ring visible on focused cell

**Pass Criteria:**
- All arrow keys navigate correctly
- Focus never lost or stuck
- Visual focus indicator clear

---

### Test 5.2: Home/End Key Navigation (Week)
**Objective:** Jump to start/end of week using Home/End

**Steps:**
1. Focus a cell in middle of week (e.g., Wednesday)
2. Press `Home` key
3. Observe focus jumps to Monday (start of week)
4. Press `End` key
5. Observe focus jumps to Sunday (end of week)

**Expected Results:**
- ✅ Home: focus moves to Monday of same week
- ✅ End: focus moves to Sunday of same week
- ✅ Smooth focus transition
- ✅ No unintended scrolling

**Pass Criteria:**
- Home/End navigation works as documented
- Focus remains visible after jump

---

### Test 5.3: Enter/Space Opens Drawer
**Objective:** Open drawer using keyboard (not mouse)

**Steps:**
1. Navigate to a cell with events using arrow keys
2. Press `Enter` key
3. Observe drawer opens
4. Press `Escape` to close
5. Return to same cell
6. Press `Space` key
7. Observe drawer opens again

**Expected Results:**
- ✅ Enter key opens drawer
- ✅ Space key opens drawer
- ✅ Drawer shows events for focused cell
- ✅ Escape key closes drawer
- ✅ Focus returns to originating cell after close

**Pass Criteria:**
- Both Enter and Space trigger drawer
- Drawer opens within 200ms
- Focus restoration works correctly

---

### Test 5.4: Focus Restoration After Drawer Close (Detailed)
**Objective:** Verify focus returns to correct cell after drawer closes

**Steps:**
1. Use keyboard to navigate to cell at row 3, column 4 (count from top-left)
2. Note cell date (e.g., "November 15")
3. Press Enter to open drawer
4. Drawer slides up
5. **Method 1:** Press Escape key
6. Observe drawer close
7. **Check 1:** Run in console: `document.activeElement.getAttribute('data-testid')`
8. Verify matches pattern: `grid-day-cell-YYYY-MM-DD`
9. **Check 2:** Focus ring visible on original cell
10. **Check 3:** Arrow keys continue navigation from that cell

**Repeat with Method 2:**
11. Navigate to different cell (row 2, column 5)
12. Press Enter to open drawer
13. Click drawer close button (X)
14. Verify focus returns to row 2, column 5

**Repeat with Method 3:**
15. Navigate to cell with events
16. Press Enter to open drawer
17. Click backdrop (outside drawer)
18. Verify focus returns to original cell

**Expected Results:**
- ✅ All 3 close methods restore focus correctly
- ✅ `document.activeElement` points to original grid cell
- ✅ Focus ring visible immediately
- ✅ Arrow keys work without re-focusing
- ✅ Screen reader announces: "Returned to [cell date]" (or similar)

**Pass Criteria:**
- Focus restoration works 100% of the time (all 3 methods)
- No focus lost to body or other element
- `data-testid` matches original cell
- Immediate keyboard navigation possible

**Console Commands for Verification:**
```javascript
// Check focused element
document.activeElement.getAttribute('data-testid')
// Should output: "grid-day-cell-2025-11-15" (or similar)

// Check if focus ring visible
getComputedStyle(document.activeElement).getPropertyValue('outline')
// Should show outline/ring styles, not "none"
```

---

### Test 5.5: Tab Navigation (Focus Management)
**Objective:** Verify Tab key follows logical focus order

**Steps:**
1. Load Grid View
2. Press Tab repeatedly from page start
3. Note focus order: Filters → View Toggle → Month Nav → Grid → Legend
4. Verify only focused grid cell is tabbable

**Expected Results:**
- ✅ Tab enters grid on first grid cell (or today's cell)
- ✅ Only one grid cell has tabIndex={0} (focused cell)
- ✅ All other cells have tabIndex={-1}
- ✅ Arrow keys navigate within grid (not Tab)
- ✅ Tab exits grid to next component

**Pass Criteria:**
- Tab order logical and predictable
- Grid doesn't trap focus
- Roving tabindex implemented correctly

---

## Test Suite 6: Mobile Interactions

### Test 6.1: Tap Day Opens Drawer
**Objective:** Verify tap gesture opens drawer on mobile

**Steps:**
1. Open Grid View on mobile device (or resize browser to mobile width)
2. Tap a day cell with events
3. Observe drawer animation

**Expected Results:**
- ✅ Drawer slides up from bottom
- ✅ Smooth animation (~300ms)
- ✅ Drawer shows events for tapped day
- ✅ Backdrop dims rest of page
- ✅ No accidental double-taps

**Pass Criteria:**
- Single tap opens drawer reliably
- Animation smooth (no jank)
- Touch target large enough (min 44×44px)

---

### Test 6.2: Drawer Scrolling (Smooth)
**Objective:** Verify smooth scrolling within drawer on mobile

**Steps:**
1. Open drawer with 5+ events (scrollable content)
2. Swipe up/down inside drawer
3. Test scroll momentum
4. Try quick flicks

**Expected Results:**
- ✅ Content scrolls smoothly (60fps)
- ✅ Native momentum scrolling
- ✅ No bouncing or rubber-banding outside drawer
- ✅ `scroll-smooth` CSS applied
- ✅ No layout shifts during scroll

**Pass Criteria:**
- Scrolling feels native
- No performance issues (fps drops)
- Drawer height constrained (max 70vh)

---

### Test 6.3: Drawer Close Gestures (Mobile)
**Objective:** Verify multiple ways to close drawer on mobile

**Steps:**
1. Open drawer
2. Method 1: Tap backdrop (outside drawer)
3. Drawer closes
4. Open drawer again
5. Method 2: Tap X close button
6. Drawer closes
7. Open drawer again
8. Method 3: Swipe down (if implemented)

**Expected Results:**
- ✅ Tapping backdrop closes drawer
- ✅ Close button (X) closes drawer
- ✅ Smooth close animation
- ✅ Page becomes interactive after close
- ✅ No unintended page scrolling

**Pass Criteria:**
- All close methods work
- Animations smooth
- No stuck states

---

### Test 6.4: Mobile Popover (Should Not Appear)
**Objective:** Verify desktop hover popover doesn't show on mobile

**Steps:**
1. Open Grid View on mobile device
2. Tap and hold a day cell with events
3. Observe behavior

**Expected Results:**
- ✅ No popover appears on mobile
- ✅ Only drawer opens on tap
- ✅ No desktop-only UI elements visible
- ✅ Responsive detection works (window.innerWidth < 768px)

**Pass Criteria:**
- Mobile uses drawer exclusively
- No popover flashes or artifacts
- Responsive breakpoint accurate

---

## Test Suite 7: Performance

### Test 7.1: First Render Performance (Detailed Metrics)
**Objective:** Measure initial Grid View render time with concrete metrics

**Steps:**
1. Open Chrome DevTools → Performance tab
2. Enable "Screenshots" and "Web Vitals" checkboxes
3. Click red "Record" button (●)
4. Navigate to `/features/calendar?view=grid`
5. Wait for grid to fully render (all events visible)
6. Click "Stop" button (■) after 3 seconds
7. Analyze timeline in Performance panel

**Metric Collection:**
- **Total Blocking Time (TBT):** Look for "Total Blocking Time" in summary
- **First Contentful Paint (FCP):** Note timestamp when grid cells first appear
- **Largest Contentful Paint (LCP):** Note when largest element (grid) fully renders
- **DOM Content Loaded:** Blue line in timeline
- **Load Complete:** Red line in timeline
- **Main Thread Activity:** Expand "Main" track, look for long tasks (yellow/red bars)

**Expected Results:**
- ✅ Total render time < 500ms (from navigation to LCP)
- ✅ FCP < 200ms (first grid cells visible)
- ✅ LCP < 500ms (entire grid painted)
- ✅ Scripting time < 200ms (check "Bottom-Up" tab)
- ✅ Rendering/Painting time < 100ms
- ✅ No long tasks >50ms (no yellow/red bars)
- ✅ TBT < 200ms

**Pass Criteria:**
- FCP < 200ms AND LCP < 500ms
- Lighthouse Performance score > 90
- No blocking operations flagged in DevTools

---

### Test 7.2: DOM Node Count (Concrete Measurement)
**Objective:** Verify optimized DOM structure with exact node count

**Steps:**
1. Load Grid View
2. Open DevTools → Console tab
3. Run command: `document.querySelectorAll('*').length`
4. Note the number (should be ~600-800)
5. Open Elements tab → search for `role="gridcell"` (Ctrl+F)
6. Note count (should be exactly 42)
7. Search for `Popover` or `PopoverContent` in Elements
8. Note count (should be 0 initially)
9. Hover over a cell with events (desktop only)
10. Re-run: `document.querySelectorAll('*').length`
11. Note increase (should be +20-50 nodes for popover)
12. Move mouse away from cell
13. Re-run count after 100ms
14. Verify popover removed

**Expected Results:**
- ✅ Initial DOM nodes: 600-800 total
- ✅ Grid cells: exactly 42 (6 weeks × 7 days)
- ✅ Popovers on mount: 0
- ✅ After hover: +1 popover in DOM
- ✅ After mouse leave: popover removed (back to baseline)
- ✅ Total nodes never exceed 1000

**Pass Criteria:**
- Initial count < 1000 nodes
- Lazy mounting verified (0 popovers initially)
- Popover cleanup verified (count returns to baseline)

**Screenshot Requirements:**
- Take screenshot of console showing `document.querySelectorAll('*').length` output

---

### Test 7.3: Event Bucketing Performance (60-80 Events)
**Objective:** Test grid with realistic event volume

**Steps:**
1. Ensure test data has 60-80 events spread across month
2. Navigate to Grid View
3. Observe render time
4. Navigate to next month
5. Observe re-render time

**Expected Results:**
- ✅ Initial load < 500ms (even with 80 events)
- ✅ Month navigation < 300ms
- ✅ No frame drops during transitions
- ✅ Event bucketing memoized (no re-sort on re-render)

**Pass Criteria:**
- Handles 80+ events smoothly
- No performance degradation
- Memoization working (React DevTools Profiler)

---

### Test 7.4: No Layout Shift Warnings
**Objective:** Verify no Cumulative Layout Shift (CLS) issues

**Steps:**
1. Open Chrome DevTools → Console
2. Navigate to Grid View
3. Observe console for layout shift warnings
4. Hover over cells
5. Open/close drawer
6. Navigate months

**Expected Results:**
- ✅ No console warnings about layout shifts
- ✅ No CLS > 0.1 (Lighthouse metric)
- ✅ Grid cells remain stable size
- ✅ Popovers don't shift page layout
- ✅ Drawer opens without shifting grid

**Pass Criteria:**
- CLS score = 0 (or very close)
- No visible layout jumps
- Elements don't move unexpectedly

---

### Test 7.5: Memory Leaks (Long Session)
**Objective:** Verify no memory leaks during extended use

**Steps:**
1. Open Chrome DevTools → Performance Monitor
2. Navigate Grid View
3. Navigate months 20 times (back and forth)
4. Open/close drawer 10 times
5. Monitor memory usage

**Expected Results:**
- ✅ Memory usage stable (no continuous growth)
- ✅ Garbage collection frees old month data
- ✅ Event listeners cleaned up properly
- ✅ No detached DOM nodes accumulating

**Pass Criteria:**
- Memory usage plateaus (not climbing)
- Heap size reasonable (<50MB)
- No warnings in console

---

## Test Suite 8: Accessibility (a11y)

### Test 8.0: Loading and Error States
**Objective:** Verify accessible feedback during loading and errors

**Steps:**
1. Open DevTools → Network tab
2. Set throttling to "Slow 3G"
3. Navigate to Grid View
4. Observe loading state
5. Check for loading indicator and ARIA live region
6. (Optional) Simulate network error by going offline
7. Observe error state

**Expected Results:**
- ✅ Loading state visible during data fetch
- ✅ "Loading events..." or spinner shown
- ✅ Grid container has `aria-busy="true"` during load
- ✅ Loading announced by screen reader (ARIA live region)
- ✅ Error message shown if fetch fails
- ✅ Error message has appropriate ARIA role

**Pass Criteria:**
- Loading feedback visible within 100ms
- Screen reader announces loading state
- Error handling graceful (no blank screen)
- Retry mechanism available on error

### Test 8.1: ARIA Role Attributes
**Objective:** Verify semantic HTML and ARIA roles

**Steps:**
1. Open Grid View
2. Inspect grid container element
3. Inspect weekday header row
4. Inspect individual grid cells
5. Use DevTools Accessibility Tree

**Expected Results:**
- ✅ Grid container: `role="grid"`
- ✅ Weekday headers: `<div role="row">`
- ✅ Weekday labels: appropriate ARIA labels
- ✅ Grid rows: `<div role="row">`
- ✅ Grid cells: `<div role="gridcell">`
- ✅ Focused cell: `aria-selected="true"`

**Pass Criteria:**
- All role attributes present
- Accessible name for grid region
- Screen reader announces structure correctly

---

### Test 8.2: Importance Distinguished by Shape
**Objective:** Verify colorblind accessibility (shape-based design)

**Steps:**
1. Enable browser colorblind simulation (DevTools → Rendering)
2. Test Deuteranopia (red-green colorblind)
3. Test Protanopia (red-green colorblind)
4. Test Tritanopia (blue-yellow colorblind)
5. Verify event dots still distinguishable

**Expected Results:**
- ✅ High importance: Triangle icon visible (not just red)
- ✅ Medium importance: Info icon visible (not just orange)
- ✅ Low importance: Circle icon visible (not just yellow)
- ✅ Shapes clearly different even in grayscale
- ✅ Legend explains shape meanings

**Pass Criteria:**
- All importance levels distinguishable by shape
- No reliance on color alone
- WCAG 2.1 Level AA compliant

---

### Test 8.3: ARIA Labels Read Well (Screen Reader - Detailed)
**Objective:** Verify screen reader experience with specific role announcements

**Steps:**
1. Enable screen reader (NVDA/JAWS/VoiceOver)
2. Navigate to Grid View
3. Tab to grid region
4. **Listen for grid role announcement**
5. Arrow to first cell
6. **Listen for gridcell role announcement**
7. Arrow through 3-4 cells
8. **Listen for date and event announcements**
9. Focus cell with 1 event
10. **Listen for single event announcement**
11. Focus cell with 3+ events
12. **Listen for multiple events + overflow announcement**
13. Press Enter to open drawer
14. **Listen for drawer/dialog announcement**
15. Tab through drawer content
16. **Listen for event card announcements**

**Expected Results - Grid:**
- ✅ Grid announces role: "grid" or "calendar grid"
- ✅ Region label: "November 2025 calendar grid" (or similar)
- ✅ Cell announces role: "gridcell"
- ✅ Cell position announced: "row 1, column 1" (if supported)

**Expected Results - Cell Content:**
- ✅ Date announcement: "November 15, 2025" or "Friday, November 15"
- ✅ Event count: "3 events" (exact number)
- ✅ Event summary: "High importance: US CPI (YoY), Medium importance: Retail Sales, Low importance: Building Permits"
- ✅ Overflow: "+2 more events" (if >3 events)
- ✅ Interaction hint: "Press Enter to view details"

**Expected Results - Drawer:**
- ✅ Drawer announces role: "dialog" or "region"
- ✅ Drawer label: "Events for November 15, 2025"
- ✅ Event cards announce: "Event: US CPI (YoY), Time: 13:30 UTC, Importance: High"
- ✅ Close button: "Close" or "Close dialog"

**Pass Criteria:**
- All roles (grid, gridcell, dialog) announced correctly
- ARIA labels match expected format
- No redundant announcements (e.g., "button button")
- No missing information (event count, date, etc.)
- Screen reader user can complete full workflow

**Testing Tools:**
- **NVDA (Windows):** Free, use Insert+Down for reading mode
- **JAWS (Windows):** Premium, use Insert+Down for virtual cursor
- **VoiceOver (Mac/iOS):** Built-in, use VO+A for reading
- **TalkBack (Android):** Built-in, swipe to navigate

**Documentation:**
- Record audio of screen reader announcements
- Note any confusing or missing announcements
- Verify against ARIA Authoring Practices Guide (APG)

---

### Test 8.4: Keyboard-Only Navigation (No Mouse)
**Objective:** Complete full workflow using only keyboard

**Steps:**
1. **Disconnect mouse** (or don't use it)
2. Tab from page top to grid
3. Navigate to a day with events using arrows
4. Press Enter to open drawer
5. Tab through drawer content
6. Press Escape to close drawer
7. Navigate to "View in List" button in drawer (if accessible)
8. Press Enter to navigate

**Expected Results:**
- ✅ Entire workflow completable without mouse
- ✅ All interactive elements focusable
- ✅ Focus order logical
- ✅ Visual focus indicators always visible
- ✅ No keyboard traps

**Pass Criteria:**
- 100% keyboard accessible
- No dead ends or stuck focus
- Focus indicators meet WCAG contrast ratio (3:1)

---

### Test 8.5: Focus Indicator Contrast
**Objective:** Verify focus ring meets WCAG contrast requirements

**Steps:**
1. Focus a grid cell
2. Take screenshot of focus ring
3. Use color contrast analyzer tool
4. Measure contrast between focus ring and background

**Expected Results:**
- ✅ Focus ring uses `ring-primary` (gold color)
- ✅ Contrast ratio ≥ 3:1 (WCAG 2.1 Level AA for UI components)
- ✅ Ring width ≥ 2px
- ✅ Ring visible on all backgrounds (light/dark)

**Pass Criteria:**
- Contrast ratio passes WCAG AA
- Focus indicator clearly visible
- Works in dark/light mode (if applicable)

---

### Test 8.6: High Contrast Mode (Windows)
**Objective:** Verify usability in Windows High Contrast Mode

**Steps:**
1. Enable Windows High Contrast Mode
2. Load Grid View
3. Verify all elements visible
4. Test interactions (navigation, drawer, etc.)

**Expected Results:**
- ✅ Grid borders visible
- ✅ Text readable
- ✅ Focus indicators visible
- ✅ Buttons and controls distinguishable
- ✅ Event dots visible (shapes, not just colors)

**Pass Criteria:**
- All functionality works in high contrast
- No invisible elements
- Shapes visible even without color

---

## Test Results Summary

Use this checklist to track overall test completion:

### Suite 1: View Toggle & Layout
- [ ] 1.1: Grid View Activation
- [ ] 1.2: Weekday Header Alignment
- [ ] 1.3: Grid Cell Structure

### Suite 2: Month Navigation
- [ ] 2.1: Previous Month Button
- [ ] 2.2: Next Month Button
- [ ] 2.3: Today Button
- [ ] 2.4: Month Navigation with Keyboard

### Suite 3: Event Display & Time Zones
- [ ] 3.1: Events Appear on Correct UTC Day
- [ ] 3.2: Event Dot Display (Up to 3)
- [ ] 3.3: Event Shape Legend (Importance)
- [ ] 3.4: Hover Tooltip - Local Time Conversion (Desktop)
- [ ] 3.5: Tap Time - Local Time Conversion (Mobile)

### Suite 4: Overflow & Drill-Down
- [ ] 4.1: "+N more" Indicator Display
- [ ] 4.2: Drawer Shows All Events
- [ ] 4.3: Drawer Event Anatomy
- [ ] 4.4: "View in List" Deep Link

### Suite 5: Keyboard Navigation
- [ ] 5.1: Arrow Key Navigation
- [ ] 5.2: Home/End Key Navigation (Week)
- [ ] 5.3: Enter/Space Opens Drawer
- [ ] 5.4: Focus Restoration After Drawer Close
- [ ] 5.5: Tab Navigation (Focus Management)

### Suite 6: Mobile Interactions
- [ ] 6.1: Tap Day Opens Drawer
- [ ] 6.2: Drawer Scrolling (Smooth)
- [ ] 6.3: Drawer Close Gestures (Mobile)
- [ ] 6.4: Mobile Popover (Should Not Appear)

### Suite 7: Performance
- [ ] 7.1: First Render Performance
- [ ] 7.2: DOM Node Count
- [ ] 7.3: Event Bucketing Performance (60-80 Events)
- [ ] 7.4: No Layout Shift Warnings
- [ ] 7.5: Memory Leaks (Long Session)

### Suite 8: Accessibility
- [ ] 8.1: ARIA Role Attributes
- [ ] 8.2: Importance Distinguished by Shape
- [ ] 8.3: ARIA Labels Read Well (Screen Reader)
- [ ] 8.4: Keyboard-Only Navigation (No Mouse)
- [ ] 8.5: Focus Indicator Contrast
- [ ] 8.6: High Contrast Mode (Windows)

---

## Bug Reporting Template

When a test fails, document using this template:

**Test ID:** [e.g., 5.4 - Focus Restoration]
**Severity:** [Critical / High / Medium / Low]
**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Result:**

**Actual Result:**

**Screenshots/Videos:**

**Environment:**
- Browser: [Chrome 120 / Firefox 121 / Safari 17]
- OS: [Windows 11 / macOS 14 / iOS 17]
- Viewport: [1920×1080 / 375×667]

**Console Errors:**
```
[Paste any console errors here]
```

---

## Notes for QA Engineers

### Performance Tools
- **Chrome DevTools Performance:** Measure render times, identify long tasks
- **Lighthouse:** Overall performance/accessibility audit (target: >90)
- **React DevTools Profiler:** Verify memoization, identify unnecessary re-renders

### Accessibility Tools
- **axe DevTools:** Automated a11y scanning
- **WAVE:** Visual accessibility checker
- **Screen Readers:** NVDA (Windows), JAWS (Windows), VoiceOver (Mac/iOS)

### Test Data Requirements
- Minimum 58 events spread across current month
- Mix of High/Medium/Low importance events
- At least 3 days with 4+ events (to test overflow)
- Events across all 7 days of week

### Known Limitations
- Popover only appears on desktop (>768px width)
- Mobile uses drawer exclusively
- Maximum 3 event dots per day (by design)
- Times always displayed in UTC (with local conversion on hover/tap)

---

**Document Version:** 1.0
**Last Updated:** November 7, 2025
**Test Coverage:** Grid View (Economic Calendar feature)
