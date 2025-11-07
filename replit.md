# GOLDH Crypto Intelligence Platform

## Overview
GOLDH is a crypto intelligence platform providing real-time market intelligence, secure wallet integration, and educational resources. It caters to both experienced traders and beginners, aiming to simplify cryptocurrency navigation. The platform features a modern tech stack (React, Express, PostgreSQL) and a premium fintech aesthetic with a distinctive black-gold color scheme and beginner-friendly language. Its vision is to build wealth and bridge worlds in the crypto space.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework & Routing**: React with TypeScript, Wouter for routing, Vite for bundling.
- **UI Component System**: shadcn/ui (New York style), Radix UI primitives, Tailwind CSS with custom design tokens.
- **State Management**: TanStack Query for server state, React Context API for authentication, local component state with React hooks.
- **Design System**: Black-gold color palette with premium fintech aesthetic:
  - Backgrounds: `#0f0f0f` (darkest), `#1a1a1a` (cards/tiles), `#2a2a2a` (borders)
  - Gold accents: `#C7AE6A` (primary), `#d5c28f`, `#b99a45`, `#e3d6b4`
  - Icon-enhanced badges (not color-only for accessibility)
  - Responsive design with custom spacing and elevation classes
  - Enhanced visual polish with shadows, gradients, and gold glow effects
  - Logo integrated with blend modes

### Backend Architecture
- **Server Framework**: Express.js on Node.js with TypeScript and ESM modules.
- **API Design**: RESTful API under `/api`, session-based authentication with bearer tokens, structured error handling, and request/response logging.
- **Authentication System**: Bcrypt for password hashing (10 salt rounds), database-backed session management (7-day expiration), bearer token authentication. Supports email/password and wallet-based authentication, and magic link functionality.

### Data Storage Solutions
- **Database Configuration**: PostgreSQL as the primary database using Drizzle ORM and Neon serverless driver.
- **Schema Design**: `Users` table (id, name, email, password, phone, experienceLevel, agreeToUpdates, walletAddress, isPremium, createdAt), `Sessions` table (id, userId, expiresAt, createdAt). Interface definitions for `NewsArticle` and `LearningTopic`. Zod schemas for runtime validation.
- **Storage Strategy**: PostgreSQL database storage implemented via Drizzle ORM, providing persistent data and session management with automatic cleanup.
- **Database Management**: Schema migrations managed through Drizzle with `npm run db:push`.

### UI/UX Decisions
- **Color Scheme**: Predominantly black and gold for a premium, luxurious feel.
- **Typography**: Inter for body text and JetBrains Mono for monospace content.
- **Component Design**: Interactive elements with hover effects, gold border glows, and shadows.
- **Feature Pages**: Dedicated full-screen pages for deep-dive feature exploration like Guru & Insider Digest, Universal Market Financials, and Economic Calendar.
- **Dashboard**: Truncated previews of content (e.g., Guru Digest) with options to view all entries.
- **Mobile Responsiveness**: All UI components are designed to be responsive and maintain readability across devices.

### Technical Implementations
- **Authentication Flow**: Distinct sign-in and sign-up pages. Sign-up includes comprehensive waitlist registration with extended user profile fields.
- **Session Management**: Database-backed session persistence with automatic cleanup of expired sessions.
- **Client-side Validation**: Zod schemas for form validation, separated from server-side validation.
- **Error Handling**: Graceful error handling for failed sign-in attempts and invalid data.

### Feature Specifications
- **Real-time Market Intelligence**: Display of crypto-relevant macroeconomic events and market data.
- **Guru & Insider Digest**: Provides whale alerts, smart wallet movements, and institutional fund flows. Data is stored in Firestore.
- **Universal Market Financials (UMF)**: A unified dashboard displaying live market snapshot (Top-20 crypto + indices + DXY), top movers (gainers/losers), morning intelligence briefs, and optional market alerts. UI-only MVP powered by Firestore mock data with planned migration to REST API. Features include asset tiles with prices/24h changes, two-column responsive layout, and severity-based alert cards. Located at `/features/umf`.
- **Economic Calendar**: Full-featured economic events calendar with grid/list views, filtering by country/category/importance, and performance monitoring (<500ms first paint target).
- **Educational Resources**: Content related to learning topics in cryptocurrency.
- **Premium Access**: Pathways to premium features through GOLDH tokens or subscription.

## External Dependencies

### Core Runtime
- Node.js
- TypeScript

### Database & ORM
- PostgreSQL (via `DATABASE_URL` environment variable)
- Drizzle Kit
- Drizzle ORM

### Frontend Libraries
- React 18+
- TanStack Query
- Wouter
- date-fns
- Lucide React

### UI Component Dependencies
- Radix UI primitives
- class-variance-authority
- clsx and tailwind-merge
- cmdk

### Authentication & Security
- bcryptjs (for password hashing)

### Build Tools
- Vite
- esbuild
- PostCSS with Tailwind CSS
- tsx

### Replit Integration
- Replit-specific Vite plugins (error overlay, Cartographer, dev banner)

### Font Resources
- Google Fonts (Inter, JetBrains Mono) via CDN

### Assets
- GOLDH logo (`goldh-logo_1762272901250.png`)
- Favicon

### Firebase/Firestore Integration
- Firebase SDK for Firestore database (client-side)
- `guruDigest` collection for Guru & Insider Digest feature data
- `umf_snapshot_mock` collection (25 assets: BTC, ETH, SOL, SPX, NDX, DXY, GOLD, WTI, etc.)
- `umf_movers_mock` collection (10 movers: 5 gainers, 5 losers)
- `umf_brief_mock` collection (daily morning intelligence briefs)
- `umf_alerts_mock` collection (market alerts with info/warn/high severity)

### Data Management Scripts
- `scripts/uploadGuruDigest.ts` - Populates Firestore with mock Guru Digest entries
- `scripts/uploadUmfMock.ts` - Seeds UMF Firestore collections with realistic mock market data

### Quality Assurance
- `qa/UMF-UI-Manual.md` - Comprehensive manual QA checklist for UMF feature with 9 test cases covering performance, functionality, accessibility, and responsive design

### Performance Documentation
- `docs/UMF-Perf-Notes.md` - Performance targets, optimization strategies, and observed bottlenecks. Targets: initial render < 2s, re-render < 300ms. Guards: memoized selectors, minimal DOM, lazy drawers, efficient caching. Bundle: ~88KB total.

### Deployment Documentation
- `docs/UMF-GoLive-UI-Only.md` - Production deployment checklist (150+ items) covering Firestore seeding, widget functionality, QA/a11y validation, API migration stubs, code quality, browser compatibility, and rollback procedures. Ensures UI-only MVP is production-ready.

### API Migration Placeholders (Future Implementation)
- `client/src/lib/umf.client.ts` - API client functions (currently TODOs) for future REST API migration
- `server/routes.ts` - Commented API endpoint stubs for GET /api/umf/snapshot, /movers, /brief, /alerts (lines 316-425)
- `server/openapi/umf.draft.yaml` - Complete OpenAPI 3.0 specification for UMF REST API endpoints
- `docs/UMF-UI-MVP.md` - Updated with detailed API migration guide (Section 17)

### UMF Feature Implementation
- **Data Layer**: 5 TypeScript/Zod schemas in `shared/schema.ts` (UmfAsset with 5 asset classes, UmfSnapshot, UmfMover, UmfBrief, UmfAlert)
- **React Hooks**: 4 TanStack Query hooks in `client/src/hooks/useUmf.ts` (useUmfSnapshot with 30s staleTime, useUmfMovers, useUmfBrief, useUmfAlerts) + 6 derived selectors
- **UI Components**: 
  - `UmfMorningBrief.tsx` - Displays headline, 3-5 bullets, timestamp, copy-to-clipboard button with toast feedback
  - `UmfSnapshot.tsx` - Asset grid with hover elevation, keyboard-accessible tooltips showing UTC/local timestamps, 2-wide mobile grid
  - `UmfTopMovers.tsx` - Clickable gainers/losers that open detail sheets/drawers with asset info, market context, and timestamps
  - `UmfAlertCard.tsx` - Severity-styled alert banners (info/warn/high) with optional dismiss functionality
- **Page**: `/features/umf` - Full-screen responsive layout (mobile stacked, desktop 2-column) with loading/empty states
- **Interactive Features**:
  - Copy morning brief to clipboard with formatted text
  - Enhanced tooltips with UTC/local timestamps on asset tiles
  - Clickable mover rows that open detail drawers (Sheet component)
  - Full keyboard navigation (Tab + Enter/Space) with visible focus rings
  - Hover elevation effects on all interactive elements
  - Mobile-responsive 2-column grid for snapshot tiles
- **Theming & Visual Design**:
  - Black-gold premium aesthetic (#0f0f0f, #1a1a1a, #2a2a2a backgrounds with #C7AE6A accents)
  - Icon-enhanced badges for all status indicators (positive/negative changes show icons + colors)
  - Consistent use of TrendingUp/TrendingDown/ArrowUp/ArrowDown icons alongside color coding
  - No inline styles or display: table usage
  - All data-testid attributes preserved for testing
- **Accessibility (WCAG 2.1 AA)**: 
  - Full keyboard support with Tab navigation and Enter/Space activation
  - ARIA regions (role="region") with descriptive labels on all sections
  - aria-live="polite" on dynamic content (morning brief headline, alerts)
  - Comprehensive aria-labels on interactive elements and asset tiles
  - Icon-enhanced badges ensure information not conveyed by color alone
  - Focus indicators with gold rings (#C7AE6A) for keyboard visibility
  - Screen reader friendly with proper semantic structure (main, header, section elements)
  - Tooltips accessible via keyboard focus
- **Performance**: First paint <2s target, optimized caching (30s for prices, 5min for briefs)
- **Future Migration**: Designed for seamless API migration from Firestore to `/api/umf/*` endpoints without UI refactor