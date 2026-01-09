# Economic Calendar UI - Manual QA Test Plan

**Feature:** Economic Calendar with AI Impact (MVP Phase)  
**Version:** 1.0.0  
**Test Date:** _____________  
**Tester:** _____________  
**Environment:** Development (Firestore Mock Data)

---

## Prerequisites

- [ ] Application running on `http://localhost:5000`
- [ ] Workflow "Start application" is running without errors
- [ ] Browser: Chrome/Firefox/Safari (latest version)
- [ ] Screen reader available for accessibility tests (optional but recommended)
- [ ] Mobile device or Chrome DevTools responsive mode for mobile tests

---

## Test 1: Page Load Performance & Default State

**Objective:** Verify page loads quickly and displays default 14-day window

### Steps:
1. Navigate to `/features/calendar`
2. Start browser DevTools Performance tab
3. Reload the page
4. Observe loading behavior

### Expected Results:
- [ ] **Page loads in < 2 seconds** (measured from navigation to interactive)
- [ ] Beta preview banner is visible with amber/gold styling
- [ ] "Updated from Firestore" timestamp is displayed in the banner
- [ ] Summary KPIs show:
  - [ ] Total Events count (should be 58 for mock data)
  - [ ] High Impact count (events with score ≥ 70)
  - [ ] Next Release time (relative time like "in 2 hours")
- [ ] Filter bar is visible and expanded by default
- [ ] Legend is visible in left sidebar
- [ ] Event list shows events (default: 20 per page)
- [ ] Events are sorted by datetime_utc (earliest first)
- [ ] **Default date range:** Today → +14 days (UTC)
  - [ ] Check that events shown are within next 14 days
  - [ ] No date picker visible (uses default range)
- [ ] Pagination controls present if > 20 events
- [ ] No console errors in browser DevTools

### Performance Metrics:
- [ ] First Contentful Paint (FCP): < 1s
- [ ] Time to Interactive (TTI): < 2s
- [ ] No layout shifts during load

---

## Test 2: Filter Functionality

**Objective:** Verify all filters work individually and in combination

### 2A: Region Filter (Individual)

1. Click "US" button under Region/Country
2. Observe event list updates

**Expected:**
- [ ] Only US events are shown
- [ ] "US" button has active styling (default variant, not outline)
- [ ] Active filter count badge shows "1"
- [ ] Event count in summary updates
- [ ] Pagination resets to page 1

3. Click "EU" button (while US is active)
4. Observe event list

**Expected:**
- [ ] Both US and EU events are shown
- [ ] Both "US" and "EU" buttons are active
- [ ] Active filter count badge shows "1" (still 1 filter type)
- [ ] Event list includes events from both regions

5. Click "US" button again to deselect
6. Observe event list

**Expected:**
- [ ] Only EU events are shown
- [ ] "US" button returns to outline variant
- [ ] "EU" button remains active

### 2B: Category Filter (Individual)

1. Clear all filters (click Clear button)
2. Click "Inflation" button under Category
3. Observe event list

**Expected:**
- [ ] Only Inflation events are shown
- [ ] "Inflation" button has active styling
- [ ] Active filter count badge shows "1"
- [ ] Event titles relate to inflation (CPI, PPI, etc.)

4. Click "Employment" button (while Inflation is active)
5. Observe event list

**Expected:**
- [ ] Both Inflation and Employment events are shown
- [ ] Both buttons are active
- [ ] Event list includes both categories

### 2C: Importance Filter (Individual)

1. Clear all filters
2. Click "High" in Importance toggle group
3. Observe event list

**Expected:**
- [ ] Only High importance events are shown
- [ ] Each event has red "High" badge with triangle icon
- [ ] "High" toggle is active (pressed state)
- [ ] Active filter count badge shows "1"

4. Click "Medium" (while High is active)
5. Observe event list

**Expected:**
- [ ] Both High and Medium importance events are shown
- [ ] Both "High" and "Medium" toggles are active

### 2D: Status Filter (Individual)

1. Clear all filters
2. Open "Event Status" dropdown
3. Select "Upcoming Only"
4. Observe event list

**Expected:**
- [ ] Only upcoming events are shown
- [ ] Each event has blue "Upcoming" badge with clock icon
- [ ] Active filter count badge shows "1"

5. Select "Released Only"
6. Observe event list

**Expected:**
- [ ] Only released events are shown
- [ ] Each event has green "Released" badge with checkmark icon
- [ ] Events may show "Actual" values

### 2E: Combined Filters

1. Clear all filters
2. Apply the following combination:
   - Region: "US" + "EU"
   - Category: "Inflation"
   - Importance: "High"
   - Status: "Upcoming Only"

**Expected:**
- [ ] Only events matching ALL criteria are shown:
  - From US or EU
  - In Inflation category
  - High importance
  - Upcoming status
- [ ] All filter buttons show active state
- [ ] Active filter count badge shows "3" (Region, Category, Importance)
- [ ] Event list updates correctly
- [ ] If no matches, empty state is shown

3. Click "Clear" button

**Expected:**
- [ ] All filters reset to default
- [ ] All events are shown again (14-day window)
- [ ] Active filter count badge disappears
- [ ] Filter buttons return to default state

---

## Test 3: Released vs Upcoming Event Display

**Objective:** Verify released events show Actual values and sparkline placeholder

### Steps:

1. Filter to show "Released Only" events
2. Inspect a released event card

**Expected for Released Events:**
- [ ] Green "Released" badge with checkmark icon
- [ ] **Data Points Grid:**
  - [ ] "Previous" value displayed (or "—" if null)
  - [ ] "Forecast" value displayed (or "—" if null)
  - [ ] "Actual" value displayed (never "Pending")
  - [ ] If Actual > Forecast: **Green text** for Actual
  - [ ] If Actual < Forecast: **Red text** for Actual
  - [ ] If Actual = Forecast: **Normal text** for Actual
- [ ] **Sparkline Placeholder:**
  - [ ] Border-dashed box visible below data grid
  - [ ] Text: "📊 Price impact visualization (Phase 2)"
  - [ ] Placeholder has muted styling

3. Filter to show "Upcoming Only" events
4. Inspect an upcoming event card

**Expected for Upcoming Events:**
- [ ] Blue "Upcoming" badge with clock icon
- [ ] **Data Points Grid:**
  - [ ] "Previous" value displayed (or "—" if null)
  - [ ] "Forecast" value displayed (or "—" if null)
  - [ ] "Actual" shows **"Pending"** (not "—" or null)
  - [ ] "Actual" text is muted color
- [ ] **No sparkline placeholder** visible

---

## Test 4: Impact Pills & Confidence Badges

**Objective:** Verify every event shows impact score, confidence, and tooltips

### Steps:

1. View event list (any filter state)
2. Inspect each event card in the first 5 events

**Expected for Every Event:**

### Impact Score Badge:
- [ ] Badge visible with TrendingUp icon
- [ ] Text format: "Impact: XX" (0-100)
- [ ] **Color-coded by score range:**
  - [ ] 80-100: Red background (`bg-red-900/50 text-red-300`)
  - [ ] 60-79: Orange background (`bg-orange-900/50 text-orange-300`)
  - [ ] 40-59: Yellow background (`bg-yellow-900/50 text-yellow-300`)
  - [ ] 20-39: Blue background (`bg-blue-900/50 text-blue-300`)
  - [ ] 0-19: Gray/secondary variant
- [ ] ARIA label: "AI predicted impact score: XX out of 100"

### Confidence Badge:
- [ ] Badge visible with CheckCircle icon
- [ ] Text format: "XX%" (0-100)
- [ ] **Color-coded by confidence:**
  - [ ] 85-100%: Gold/primary color
  - [ ] 70-84%: Gold with reduced opacity
  - [ ] 50-69%: Muted/gray
  - [ ] <50%: Destructive/red (if any)
- [ ] Hover shows tooltip: "AI Model Confidence Level"
- [ ] ARIA label: "AI model confidence level: XX percent"

### Tooltips:
3. Hover over confidence badge
4. Wait 500ms

**Expected:**
- [ ] Tooltip appears with text "AI Model Confidence Level"
- [ ] Tooltip is readable (high contrast)
- [ ] Tooltip dismisses on mouse leave

5. Hover over time badge (clock icon + time)
6. Wait 500ms

**Expected:**
- [ ] Tooltip appears showing:
  - [ ] UTC time: "MMM d, HH:mm UTC"
  - [ ] Local time: Full date/time in local timezone
- [ ] Tooltip is readable

7. Hover over category badge
8. Wait 500ms

**Expected:**
- [ ] Tooltip appears with category description
- [ ] Example: "Inflation - Consumer price changes"

---

## Test 5: Mobile Responsiveness

**Objective:** Verify mobile layout, filter collapse, sticky behavior, and scrolling

### Setup:
- Use Chrome DevTools responsive mode
- Set viewport: 375px × 667px (iPhone SE)
- Or test on actual mobile device

### 5A: Layout Adaptation

1. Load `/features/calendar` on mobile viewport

**Expected:**
- [ ] Page header scales correctly
- [ ] Beta banner remains readable
- [ ] Summary KPIs stack vertically (1 column)
- [ ] Filter bar is visible
- [ ] Legend and event list stack vertically (not side-by-side)
- [ ] Event cards are full width
- [ ] Pagination buttons are touch-friendly (≥ 44px tap targets)
- [ ] No horizontal scrolling required
- [ ] Text remains readable (not cut off)

### 5B: Filter Collapse

2. Observe filter bar on mobile

**Expected:**
- [ ] Filter header visible with "Filter Events" title
- [ ] Active filter count badge visible (if any filters active)
- [ ] **Collapse button visible** (chevron icon) on mobile
- [ ] Collapse button has `md:hidden` class (only on mobile)

3. Click collapse button (chevron up)

**Expected:**
- [ ] Filter content collapses (disappears)
- [ ] Chevron icon changes to "down"
- [ ] Filter header remains visible
- [ ] ARIA expanded state changes to `false`

4. Click collapse button again (chevron down)

**Expected:**
- [ ] Filter content expands (reappears)
- [ ] Chevron icon changes to "up"
- [ ] All filter controls are accessible
- [ ] ARIA expanded state changes to `true`

### 5C: Sticky Behavior

5. Scroll down the event list slowly

**Expected:**
- [ ] Page header scrolls away normally
- [ ] **Filter bar becomes sticky** at top of viewport
- [ ] Filter bar has `sticky top-20 z-10` class
- [ ] Filter bar stays visible while scrolling
- [ ] Filter bar has backdrop blur effect (`backdrop-blur-sm`)
- [ ] Filter bar does NOT overlap page header when scrolling up

### 5D: Smooth Scrolling

6. Scroll through entire event list (all pages)

**Expected:**
- [ ] Scrolling is smooth (60fps, no jank)
- [ ] Event cards load instantly (no lazy loading delays)
- [ ] No layout shifts during scroll
- [ ] Images/icons render without flashing
- [ ] Hover states work correctly on touch (no sticky hover)

7. Navigate between pages using pagination

**Expected:**
- [ ] Page changes scroll to top of list smoothly
- [ ] New events render without jank
- [ ] Pagination controls remain accessible

---

## Test 6: Accessibility (a11y)

**Objective:** Verify keyboard navigation, ARIA labels, and icon shapes

### 6A: Keyboard Focus Order

1. Navigate to `/features/calendar`
2. Press **Tab** key repeatedly
3. Observe focus indicator progression

**Expected Tab Order:**
1. [ ] Back to Features button
2. [ ] Summary KPI card 1 (Total Events)
3. [ ] Summary KPI card 2 (High Impact)
4. [ ] Summary KPI card 3 (Next Release)
5. [ ] Filter collapse button (mobile only)
6. [ ] Clear filters button (if active)
7. [ ] Region buttons: US, EU, UK, CN, JP, SG, Global (in order)
8. [ ] Category buttons: Inflation, Employment, GDP, Rates, Earnings, Other
9. [ ] Importance toggles: High, Medium, Low
10. [ ] Status dropdown
11. [ ] First event card
12. [ ] Tooltip triggers within event (time, confidence)
13. [ ] Next event card
14. [ ] ... (continues through all events)
15. [ ] Pagination: Previous button
16. [ ] Pagination: Next button

**Verify:**
- [ ] Focus indicator is visible on every element
- [ ] Focus order is logical (top to bottom, left to right)
- [ ] No focus traps (can Tab through entire page)
- [ ] Shift+Tab reverses focus direction correctly

### 6B: Keyboard Interactions

1. Use **Tab** to focus "US" region button
2. Press **Space** or **Enter**

**Expected:**
- [ ] Filter activates (events filter to US only)
- [ ] Button visual state changes to active
- [ ] Focus remains on button

3. Use **Tab** to focus "High" importance toggle
4. Press **Space**

**Expected:**
- [ ] Toggle activates
- [ ] Filter applies
- [ ] Focus remains on toggle

5. Use **Tab** to focus "Event Status" dropdown
6. Press **Space** or **Enter**

**Expected:**
- [ ] Dropdown opens
- [ ] Can use Arrow keys to navigate options
- [ ] Enter selects option
- [ ] Escape closes dropdown

7. Use **Tab** to focus an event card
8. Press **Enter** (if card has click handler)

**Expected:**
- [ ] Event card is focusable (tabIndex={0})
- [ ] Focus outline visible around entire card
- [ ] Card may expand or navigate (if implemented)

### 6C: ARIA Labels

1. Open browser DevTools → Elements
2. Inspect event card element
3. Check for ARIA attributes

**Expected on Event Card:**
- [ ] `role="article"`
- [ ] `aria-label` includes: event title, importance, country, date
- [ ] `tabIndex="0"`

4. Inspect filter region buttons
5. Check for ARIA attributes

**Expected on Filter Buttons:**
- [ ] `aria-label="Filter by United States"` (or similar)
- [ ] `aria-pressed="true"` when active
- [ ] `aria-pressed="false"` when inactive

6. Inspect importance badges
7. Check for ARIA attributes

**Expected on Importance Badges:**
- [ ] `aria-label="Importance level: High"` (or Medium/Low)

8. Inspect impact score badges

**Expected:**
- [ ] `aria-label="AI predicted impact score: XX out of 100"`

9. Inspect confidence badges

**Expected:**
- [ ] `aria-label="AI model confidence level: XX percent"`

10. Inspect data values (Previous, Forecast, Actual)

**Expected:**
- [ ] `aria-label="Previous value: X.X"` (or "Not available")
- [ ] `aria-label="Forecast value: X.X"` (or "Not available")
- [ ] `aria-label="Actual value: X.X, beat forecast"` (with comparison)

### 6D: Screen Reader Test (Optional but Recommended)

**Setup:** Use NVDA (Windows), JAWS, or VoiceOver (Mac)

1. Navigate to page with screen reader active
2. Use screen reader navigation (arrow keys, heading navigation)

**Expected:**
- [ ] Page structure is announced correctly
- [ ] Headings are navigable (H1, H2, H3 hierarchy)
- [ ] Buttons announce their state (pressed/not pressed)
- [ ] Badges announce their values and meanings
- [ ] Event cards announce complete information
- [ ] Filter changes are announced
- [ ] Loading states are announced
- [ ] Error states are announced

### 6E: Icon Shapes for Importance

1. View event list
2. Find 3 events with different importance levels:
   - One High
   - One Medium
   - One Low

**Expected Visual Indicators:**

**High Importance:**
- [ ] **AlertTriangle icon** (filled triangle shape)
- [ ] Red/destructive color background
- [ ] Text: "High"
- [ ] Icon is clearly distinguishable from other importance levels
- [ ] **Works without color** (shape alone conveys meaning)

**Medium Importance:**
- [ ] **Info icon** (outlined circle with "i")
- [ ] Gold/primary color background
- [ ] Text: "Medium"
- [ ] Icon is clearly distinguishable from High and Low
- [ ] **Works without color** (shape alone conveys meaning)

**Low Importance:**
- [ ] **Circle icon** (small outlined circle)
- [ ] Gray/secondary color background
- [ ] Text: "Low"
- [ ] Icon is clearly distinguishable from High and Medium
- [ ] **Works without color** (shape alone conveys meaning)

**Colorblind Test:**
3. Use Chrome DevTools → Rendering → "Emulate vision deficiencies"
4. Test with: Protanopia, Deuteranopia, Tritanopia

**Expected:**
- [ ] Importance levels are still distinguishable by icon shape
- [ ] Text labels are readable
- [ ] High/Medium/Low are identifiable without relying on color alone

---

## Test 7: Performance with 60+ Events

**Objective:** Verify no performance degradation with full dataset

### 7A: Rendering Performance

1. Clear all filters (show all 58 mock events)
2. Open Chrome DevTools → Performance
3. Start recording
4. Navigate between pages (pagination)
5. Stop recording after 3 page changes

**Expected:**
- [ ] **No frame drops** (should maintain 60fps)
- [ ] **No jank** during page transitions
- [ ] **No layout shifts** (CLS = 0)
- [ ] **CPU usage**: < 50% during interactions
- [ ] **Memory usage**: Stable (no memory leaks)

**Metrics:**
- [ ] Frame rate: Solid 60fps
- [ ] Long tasks: None > 50ms
- [ ] Main thread: < 100ms for interactions

### 7B: Filtering Performance

1. Open Performance tab
2. Start recording
3. Click "US" filter button
4. Wait for list to update
5. Click "EU" filter button
6. Wait for list to update
7. Stop recording

**Expected:**
- [ ] **Filter response**: < 100ms (instant feel)
- [ ] **No blocking**: UI remains responsive
- [ ] **Smooth transitions**: No stuttering
- [ ] **Event count updates**: Immediately

### 7C: Scroll Performance

1. Clear all filters (show all events, paginated)
2. Open Performance tab → Enable FPS meter
3. Scroll through entire event list slowly
4. Observe FPS counter

**Expected:**
- [ ] **Maintains 60fps** during scroll
- [ ] **No dropped frames**
- [ ] **Smooth rendering** of all event cards
- [ ] **Hover effects**: Render smoothly (no delay)

### 7D: Memory Leaks

1. Open DevTools → Memory → Heap snapshot
2. Take initial snapshot
3. Navigate between filters 10 times:
   - Apply US filter → Clear → Apply EU filter → Clear → Repeat
4. Take second snapshot
5. Compare snapshots

**Expected:**
- [ ] **Memory increase**: < 5MB
- [ ] **No detached DOM nodes** accumulating
- [ ] **No event listeners** leaking
- [ ] **Heap size**: Stable (returns to baseline after interactions)

### 7E: Console Warnings

1. Open DevTools → Console
2. Refresh page
3. Interact with all features (filters, pagination, tooltips)
4. Observe console output

**Expected Clean Logs:**
- [ ] **No errors** (red messages)
- [ ] **No React warnings**:
  - [ ] No "key" prop warnings
  - [ ] No "useEffect" dependency warnings
  - [ ] No "setState on unmounted component" warnings
- [ ] **No accessibility warnings**:
  - [ ] No missing ARIA labels
  - [ ] No invalid ARIA attributes
  - [ ] No duplicate IDs
- [ ] **Acceptable warnings** (non-blocking):
  - [ ] Browserslist outdated (cosmetic only)
  - [ ] PostCSS `from` option (Vite build warning, safe to ignore)

**Unacceptable Warnings:**
- ❌ Any React error or warning
- ❌ Any Firestore errors (401, 403, network failures)
- ❌ Any TanStack Query errors
- ❌ Any missing data-testid warnings (if implemented)
- ❌ Any CSS errors (invalid properties)

---

## Test Results Summary

**Date Tested:** _____________  
**Tester:** _____________  
**Browser/Version:** _____________  
**OS:** _____________  

### Overall Results

- [ ] **All tests passed** ✅
- [ ] **Some tests failed** ⚠️ (list failures below)
- [ ] **Critical failures** ❌ (blocks release)

### Failures / Issues Found

| Test # | Description | Severity | Notes |
|--------|-------------|----------|-------|
|        |             |          |       |
|        |             |          |       |
|        |             |          |       |

**Severity Levels:**
- **Critical**: Blocks MVP release (app crashes, data loss, major accessibility failure)
- **High**: Major feature broken (filters don't work, events don't load)
- **Medium**: Minor feature issue (tooltip missing, styling off)
- **Low**: Cosmetic issue (spacing inconsistent, text wrapping odd)

---

## Sign-Off

**QA Tester:** _____________________________ **Date:** _____________

**Developer:** _____________________________ **Date:** _____________

**Product Owner:** _____________________________ **Date:** _____________

---

## Notes

- This QA plan covers **UI/UX functionality only** (no backend API testing)
- **Mock data** from Firestore is used (58 events in `econEvents_mock` collection)
- **Phase 2 features** (real-time APIs, ML models, notifications) are NOT tested
- Focus is on **visual polish, accessibility, and performance** of MVP
- Recommend automated E2E tests (Playwright) for regression coverage

---

## Appendix: Common Issues & Solutions

### Issue: Page loads slowly (> 2s)
**Check:**
- Network tab: Firestore queries taking > 500ms
- Performance: Large bundle size
- Solution: Optimize images, reduce bundle, check network throttling

### Issue: Filters don't work
**Check:**
- Console errors: Check for TanStack Query errors
- State updates: Log filter state changes
- Solution: Verify useEconEvents hook logic

### Issue: Events not sorted correctly
**Check:**
- Event datetime_utc values
- Sort function in EconList component
- Solution: Verify date parsing and sort logic

### Issue: Accessibility failures
**Check:**
- Missing ARIA labels: Use axe DevTools
- Keyboard navigation: Test with Tab key only
- Solution: Add missing attributes, fix focus order

### Issue: Mobile layout broken
**Check:**
- Viewport meta tag present
- Responsive classes: md:, lg:
- Solution: Adjust breakpoints, test on real device

---

**End of QA Manual**
