# UMF (Universal Market Financials) - Manual QA Checklist

**Feature:** Universal Market Financials UI MVP  
**Version:** 1.0  
**Last Updated:** November 7, 2025  
**Test Environment:** Development (Firestore mock data)

---

## Prerequisites

- [ ] Development server running (`npm run dev`)
- [ ] Browser console open (F12 → Console tab)
- [ ] Network tab open (F12 → Network tab)
- [ ] Test on modern browser (Chrome, Firefox, Safari, or Edge)
- [ ] Test on mobile viewport (DevTools responsive mode)

---

## Test Cases

### 1. Page Load Performance & Error-Free Rendering

**Objective:** Verify page loads quickly without console errors

**Steps:**
1. Navigate to `/features/umf`
2. Start timer when page begins loading
3. Observe page render completion
4. Check browser console for errors

**Expected Results:**
- [ ] Page loads in **< 2 seconds** (first contentful paint)
- [ ] All sections render without visual glitches
- [ ] **No console errors** (red text in console)
- [ ] **No console warnings** about missing data or failed requests
- [ ] Loading skeleton appears briefly, then transitions to content

**Pass/Fail:** ___________

**Notes:**
```
Load time: _______ seconds
Console errors (if any): 
_________________________________
```

---

### 2. Market Snapshot - Asset Display

**Objective:** Verify snapshot shows correct priority assets with prices and changes

**Steps:**
1. Locate the "Market Snapshot" card
2. Count the number of asset tiles displayed
3. Verify each tile shows: symbol, name, price, 24h % change
4. Check for presence of required assets

**Expected Results:**
- [ ] **BTC** (Bitcoin) tile present with price and %
- [ ] **ETH** (Ethereum) tile present with price and %
- [ ] **SOL** (Solana) tile present with price and %
- [ ] **SPX** (S&P 500) tile present with price and %
- [ ] **NDX** (NASDAQ) tile present with price and %
- [ ] **DXY** (US Dollar Index) tile present with price and %
- [ ] **GOLD** (Gold) tile present (if data available)
- [ ] **WTI** (Crude Oil) tile present (if data available)
- [ ] Each tile displays:
  - Symbol in bold
  - Asset name below symbol
  - Current price in large font
  - 24h % change with color coding (green/red)
  - **Icons + color** for positive/negative (not color alone)
  - Asset class badge (CRYPTO, INDEX, FOREX, COMMODITY)

**Pass/Fail:** ___________

**Notes:**
```
Number of tiles displayed: _______
Missing assets (if any): _________________________________
Visual issues: _________________________________
```

---

### 3. Top Movers - Gainers & Losers Lists

**Objective:** Verify movers section shows top gainers and losers correctly

**Steps:**
1. Locate the "Top Movers" card
2. Check "Top Gainers" section
3. Check "Top Losers" section
4. Verify data formatting

**Expected Results:**
- [ ] **Top Gainers** section visible with green circle indicator
- [ ] Shows **5 gainers** (or fewer if data unavailable)
- [ ] Each gainer shows:
  - Symbol and name
  - Current price
  - Positive % change badge with **ArrowUp icon + green color**
  - TrendingUp icon
- [ ] **Top Losers** section visible with red circle indicator
- [ ] Shows **5 losers** (or fewer if data unavailable)
- [ ] Each loser shows:
  - Symbol and name
  - Current price
  - Negative % change badge with **ArrowDown icon + red color**
  - TrendingDown icon
- [ ] Sections separated by horizontal divider
- [ ] If no data: displays "No gainers/losers data available"

**Pass/Fail:** ___________

**Notes:**
```
Gainers count: _______
Losers count: _______
Issues (if any): _________________________________
```

---

### 4. Morning Intelligence Brief - Content & Copy Function

**Objective:** Verify brief displays correctly and copy button works

**Steps:**
1. Locate the "Morning Intelligence" card (top of page)
2. Read the headline and bullet points
3. Check the date badge
4. Click the "Copy Brief" button
5. Paste into a text editor (Ctrl+V / Cmd+V)

**Expected Results:**
- [ ] Headline displayed in large, bold text
- [ ] **3-5 bullet points** visible below headline
- [ ] Bullet points have gold dot indicators
- [ ] Date badge shows current date with clock icon
- [ ] "Copy Brief" button visible in header
- [ ] Clicking "Copy Brief":
  - Button text changes to "Copied" with checkmark icon
  - Toast notification appears: "Brief copied!"
  - Button reverts to "Copy Brief" after 2 seconds
- [ ] Pasted text includes:
  ```
  Morning Intelligence - [Date]
  ==================================================
  
  [Headline]
  
  KEY MARKET DRIVERS:
  1. [Bullet 1]
  2. [Bullet 2]
  ...
  ```

**Pass/Fail:** ___________

**Notes:**
```
Headline word count: _______
Bullet points count: _______
Copy function works: Yes / No
Issues: _________________________________
```

---

### 5. Alert Cards - Severity Styling

**Objective:** Verify alerts display with correct severity-based styling

**Steps:**
1. Scroll to alerts section (below movers, if present)
2. Identify each alert's severity level
3. Check icon, color, and badge

**Expected Results:**
- [ ] **Info alerts** (if present):
  - Blue background tint
  - Info icon (circle with "i")
  - "Information" badge with icon
- [ ] **Warning alerts** (if present):
  - Yellow/orange background tint
  - AlertTriangle icon
  - "Warning" badge with icon
- [ ] **Critical alerts** (if present):
  - Red background tint
  - AlertCircle icon
  - "Critical" badge with icon
- [ ] Each alert shows:
  - Title in bold
  - Body text
  - Timestamp ("Posted at HH:MM")
  - Dismiss button (X) if dismissible
- [ ] Icons + colors used together (not color only)
- [ ] If no alerts: section not displayed

**Pass/Fail:** ___________

**Notes:**
```
Alerts present: Yes / No
Severity types seen: _________________________________
Issues: _________________________________
```

---

### 6. Tooltips - UTC & Local Time Display

**Objective:** Verify tooltips show correct timestamps in both UTC and local time

**Steps:**
1. Hover over a snapshot asset tile (e.g., BTC)
2. Wait for tooltip to appear
3. Read the "Last Updated" section
4. Click on a mover item to open detail drawer
5. Check "Last Updated" section in drawer

**Expected Results:**
- [ ] **Snapshot tile tooltip:**
  - Appears on hover within 1 second
  - Shows asset name and class
  - Shows market cap (if applicable)
  - Shows 24h volume (if applicable)
  - **Last Updated section** displays:
    - "UTC: [Month Day, HH:MM:SS AM/PM UTC]"
    - "Local: [Month Day, HH:MM:SS AM/PM EST/PST/etc]"
  - UTC and local times are **different** (unless you're in UTC timezone)
  - Times are **valid dates** (not "Invalid Date")
- [ ] **Mover detail drawer:**
  - "Last Updated" section visible
  - Shows UTC timestamp with full date
  - Shows local timestamp with full date
  - Clock icon present
  - Times match snapshot behavior

**Pass/Fail:** ___________

**Notes:**
```
UTC time format correct: Yes / No
Local time format correct: Yes / No
Time zone detected: _______
Issues: _________________________________
```

---

### 7. Keyboard Navigation - Focus Management

**Objective:** Verify full keyboard accessibility and focus management

**Steps:**
1. Refresh page at `/features/umf`
2. Press Tab repeatedly to navigate through page
3. Test Enter/Space on focusable elements
4. Test drawer focus management

**Expected Results:**

**Focus Order:**
- [ ] Tab key moves focus in logical order:
  1. Back button
  2. Copy Brief button
  3. Snapshot tiles (left to right, top to bottom)
  4. Gainer items (top to bottom)
  5. Loser items (top to bottom)
  6. Alert dismiss buttons (if present)

**Focus Indicators:**
- [ ] All focused elements show **gold focus ring** (#C7AE6A)
- [ ] Focus ring is clearly visible on dark backgrounds
- [ ] No focus ring on non-interactive elements

**Snapshot Tile Keyboard Interaction:**
- [ ] Pressing **Enter** on focused tile:
  - Tooltip appears
  - Tooltip shows timestamps
- [ ] Pressing **Space** on focused tile:
  - Tooltip appears
- [ ] Pressing **Tab** when tooltip open:
  - Tooltip closes
  - Focus moves to next element

**Mover Item Keyboard Interaction:**
- [ ] Pressing **Enter** on focused mover:
  - Detail drawer opens
  - Drawer shows full mover details
- [ ] Pressing **Space** on focused mover:
  - Detail drawer opens
- [ ] When drawer is open:
  - Focus trapped inside drawer
  - Tab cycles through drawer content
  - Pressing **Escape** closes drawer
  - Focus returns to mover item that opened it

**Pass/Fail:** ___________

**Notes:**
```
Focus order correct: Yes / No
Focus indicators visible: Yes / No
Drawer focus trap works: Yes / No
Issues: _________________________________
```

---

### 8. Mobile Layout - Responsive Design

**Objective:** Verify mobile layout is readable and properly responsive

**Steps:**
1. Open DevTools (F12)
2. Click "Toggle Device Toolbar" (Ctrl+Shift+M / Cmd+Shift+M)
3. Select "iPhone 12 Pro" or similar mobile device
4. Test viewport at 375px width
5. Scroll through entire page

**Expected Results:**

**General Layout:**
- [ ] All content fits within viewport width (no horizontal scroll)
- [ ] Text is readable without zooming
- [ ] Buttons and interactive elements are tappable (min 44x44px)
- [ ] No content clipped or cut off

**Morning Brief:**
- [ ] Card spans full width
- [ ] Header items wrap on small screens
- [ ] Copy button accessible
- [ ] Headline text wraps properly
- [ ] Bullet points readable

**Market Snapshot:**
- [ ] Tiles display in **2-wide grid** on mobile
- [ ] Each tile maintains aspect ratio
- [ ] Prices and percentages readable
- [ ] No tile content cut off
- [ ] Grid switches to 4-wide on desktop (>1280px)

**Top Movers:**
- [ ] Gainers and losers stack vertically
- [ ] Each mover item readable
- [ ] Badges don't overflow
- [ ] Price and percentage visible

**Mover Detail Drawer:**
- [ ] Drawer slides from right (or bottom on small screens)
- [ ] Takes full width on mobile
- [ ] All content visible without horizontal scroll
- [ ] Close button accessible
- [ ] "Market Context" text wraps properly

**Alerts:**
- [ ] Alert cards span full width
- [ ] Text wraps appropriately
- [ ] Icons and badges visible
- [ ] Dismiss button accessible

**Pass/Fail:** ___________

**Notes:**
```
Viewport width tested: _______ px
Snapshot grid columns on mobile: _______
Horizontal scroll: Yes / No
Clipped content: Yes / No
Issues: _________________________________
```

---

### 9. Accessibility - Icons, Shapes, & ARIA Labels

**Objective:** Verify accessibility features meet WCAG 2.1 AA standards

**Steps:**
1. Inspect page with browser DevTools (F12 → Elements/Inspector)
2. Check for ARIA attributes
3. Verify icon usage
4. Test with screen reader (optional but recommended)

**Expected Results:**

**Icon-Enhanced Badges (Not Color-Only):**
- [ ] Snapshot tile positive changes show:
  - **TrendingUp icon** + **ArrowUp icon** + green color + "+" percentage
- [ ] Snapshot tile negative changes show:
  - **TrendingDown icon** + **ArrowDown icon** + red color + "-" percentage
- [ ] Mover gainer badges show:
  - **ArrowUp icon** + green color + percentage
- [ ] Mover loser badges show:
  - **ArrowDown icon** + red color + percentage
- [ ] Alert severity badges show:
  - **Icon (Info/Warning/Critical)** + color + text label

**ARIA Labels & Regions:**
- [ ] Morning Brief has:
  - `role="region"`
  - `aria-label="Morning market intelligence brief section"`
  - Headline has `aria-live="polite"`
- [ ] Market Snapshot has:
  - `role="region"`
  - `aria-label` describing section
  - Each tile has descriptive `aria-label` (e.g., "Bitcoin, Cryptocurrency, price X, up Y%...")
- [ ] Top Movers has:
  - `role="region"`
  - Gainers section: `aria-labelledby="gainers-heading"`
  - Losers section: `aria-labelledby="losers-heading"`
  - Each mover has descriptive `aria-label`
- [ ] Alerts have:
  - `role="alert"`
  - `aria-live="polite"`
  - `aria-labelledby` and `aria-describedby`
- [ ] Page structure uses:
  - `<main>` element with `role="main"`
  - `<header>` element with `role="banner"`
  - Proper semantic HTML

**Interactive Elements:**
- [ ] All buttons have descriptive `aria-label` or text
- [ ] All icons have appropriate `aria-label` or `aria-hidden="true"`
- [ ] All `data-testid` attributes present

**Pass/Fail:** ___________

**Notes:**
```
Icons present on all badges: Yes / No
ARIA regions found: Yes / No
Missing ARIA labels: _________________________________
Issues: _________________________________
```

---

## Test Summary

**Date Tested:** _______________  
**Tester Name:** _______________  
**Browser:** _______________ (version: _______)  
**Device/OS:** _______________

### Results Overview

| Test Case | Pass | Fail | Notes |
|-----------|------|------|-------|
| 1. Page Load Performance | ☐ | ☐ | |
| 2. Market Snapshot | ☐ | ☐ | |
| 3. Top Movers | ☐ | ☐ | |
| 4. Morning Brief | ☐ | ☐ | |
| 5. Alert Cards | ☐ | ☐ | |
| 6. Tooltips | ☐ | ☐ | |
| 7. Keyboard Navigation | ☐ | ☐ | |
| 8. Mobile Layout | ☐ | ☐ | |
| 9. Accessibility | ☐ | ☐ | |

**Overall Status:** ☐ Pass ☐ Fail

**Critical Issues Found:**
```
_________________________________
_________________________________
_________________________________
```

**Minor Issues Found:**
```
_________________________________
_________________________________
_________________________________
```

**Recommendations:**
```
_________________________________
_________________________________
_________________________________
```

---

## Known Limitations (MVP)

- Mock data from Firestore (not live market data)
- Sparkline charts show placeholder icons
- No historical price data
- Alert dismiss functionality may not persist
- Data refresh requires page reload

---

## Additional Notes

**Performance Benchmarks:**
- Target load time: < 2s
- Target first paint: < 500ms
- Asset tile hover response: < 100ms
- Drawer open/close animation: < 300ms

**Supported Browsers:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Supported Viewports:**
- Mobile: 375px - 768px
- Tablet: 768px - 1024px
- Desktop: 1024px+

---

**End of Manual QA Checklist**
