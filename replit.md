# GOLDH Crypto Intelligence Platform

## Overview
GOLDH is a crypto intelligence platform designed to provide real-time market intelligence, secure wallet integration, and educational resources. It aims to simplify cryptocurrency navigation for both experienced traders and beginners. The platform features a premium fintech aesthetic with a black-gold color scheme and user-friendly language. Its core purpose is to build wealth and bridge worlds within the crypto space.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework & Routing**: React with TypeScript, Wouter for routing, Vite for bundling.
- **UI Component System**: shadcn/ui (New York style), Radix UI primitives, Tailwind CSS with custom design tokens.
- **State Management**: TanStack Query for server state, React Context API for authentication.
- **Design System**: Premium black-gold aesthetic (`#0f0f0f`, `#1a1a1a`, `#2a2a2a` backgrounds; `#C7AE6A` accents), Inter and JetBrains Mono typography, responsive design, interactive elements with hover effects, gold border glows, and shadows.

### Backend
- **Server Framework**: Express.js on Node.js with TypeScript and ESM modules.
- **API Design**: RESTful API under `/api`, session-based authentication with bearer tokens.
- **Authentication System**: Bcrypt for password hashing, database-backed session management, email/password, wallet-based, and magic link authentication.

### Data Storage
- **Primary Database**: PostgreSQL using Drizzle ORM and Neon serverless driver.
- **Schema Design**: `Users` and `Sessions` tables, Zod schemas for validation.
- **Database Management**: Schema migrations via Drizzle.

### UI/UX Decisions
- **Color Scheme**: Black and gold for a premium, luxurious feel.
- **Typography**: Inter for body, JetBrains Mono for monospace.
- **Component Design**: Interactive elements with hover, gold glows, shadows. No emojis - all icons use lucide-react library.
- **Feature Pages**: Dedicated full-screen pages for Guru & Insider Digest, Universal Market Financials, Economic Calendar.
- **Dashboard**: Asset-first grid layout showing tracked crypto assets with live prices, 24h changes, and news counts. Filters out assets with unavailable prices while preserving error states for failed queries.
- **Asset Detail Pages**: Dynamic `/asset/:symbol` routes providing unified views of price data, news articles, and economic events.
- **Logo**: SVG format for crisp rendering at all sizes. Responsive sizing: h-80 (mobile) → h-96 (tablet) → h-120 (desktop) = 320-480px.
- **Mobile Responsiveness**: Comprehensive responsive design with mobile-first approach. Landing page features controlled line breaks for tagline, responsive font scaling (text-3xl → text-6xl), adaptive spacing/padding, full-width buttons on mobile, and optimized layouts across all breakpoints (sm/md/lg).
- **Landing Page Components**:
  - **NewsScroller**: Horizontal scrolling ticker displaying latest crypto news from Guru & Insider Digest. Uses CSS animation for smooth infinite scroll. Fetches from `/api/guru-digest` endpoint with loading states. Shows top 10 articles with gradient fades on edges.
  - **PreviewWidgets**: Three-card preview section showing limited data for unauthenticated users (with blur overlays and "Sign In to View All" CTAs) and full preview for authenticated users (with "View All" navigation links). Cards include: Guru Digest (latest 3 news articles), Market Financials (top 4 assets with prices), and Economic Calendar (3 upcoming events).
  - **ComingSoon**: Feature showcase section with 9 upcoming features (Whale Tracker, Smart Token Screener, Risk Score Engine, Token Deep Dives, AI Smart Alerts, Smart Contract Scanner, Airdrop Finder, Pre-Token Detection, Portfolio Center) in responsive grid layout with hover effects.
- **Welcome Experience**:
  - **WelcomeAnimation**: First-visit overlay displaying "Congratulations, You've found Golden Horizon!!" with gold gradient text and blur/fade-out animation. Uses localStorage tracking to show only once.
  - **SignInPrompt**: Dismissable modal appearing on feature pages for unauthenticated users. Encourages sign-up with benefits list and dual CTAs. Session storage prevents repeated displays.
  - **ExitIntentModal**: Mouse-leave detection at viewport top triggers persuasive modal with benefits list and sign-up CTA. Session storage prevents repeated displays. Uses lucide-react icons only (no emojis).
- **Authentication-Free Access**: All feature pages (Dashboard, Guru Digest, UMF, Economic Calendar, Asset pages) viewable without authentication. Only Profile page requires login. Sign-in prompts are dismissable overlays, not hard blocks.

### Technical Implementations
- **Authentication Flow**: 
  - Distinct sign-in/sign-up with comprehensive waitlist registration
  - Auto-login after signup with 100ms state propagation delay
  - Signin redirect flow: captures intended destination, validates security, redirects after auth
  - Profile page with account management and password change capability
  - Auth-aware UI: Header shows Profile/Sign Out when logged in, Sign In when not
  - Landing page CTAs adapt based on auth state (Sign In → Dashboard when logged in)
  - **Soft Authentication**: Feature pages viewable without login. Dismissable sign-in prompts encourage registration without blocking content access.
- **Route Protection**: `ProtectedRoute` wrapper now only guards Profile page. All feature pages (Dashboard, Guru Digest, UMF, Economic Calendar, Asset pages) are accessible without authentication. Security validation prevents open redirect attacks (only internal paths allowed).
- **Session Management**: Database-backed session persistence with cleanup, bearer token authentication.
- **Validation**: Zod schemas for client-side and server-side validation.
- **Error Handling**: Graceful error handling with user-friendly messages for authentication and data operations.
- **Automated Data Refresh**:
  - **UMF Scheduler**: Updates every 60 minutes (±15s jitter) via CoinGecko API. Enabled by `UMF_SCHEDULER=1` env var.
  - **Guru Digest Scheduler**: Updates every 2.5 hours (±30s jitter) via RSS feeds from CoinDesk & Cointelegraph. Enabled by `GURU_SCHEDULER=1` env var. Clears old entries and fetches fresh articles automatically.
  - Both schedulers have rate limit guards and performance logging.

### Feature Specifications
- **Asset-First Dashboard**: Home page displays grid of 30 tracked crypto assets (BTC, ETH, SOL, BNB, XRP, ADA, DOGE, MATIC, TRX, LINK, TON, DOT, SHIB, LTC, UNI, AVAX, ATOM, NEAR, APT, ARB, OP, SUI, INJ, SEI, FTM, PEPE, WIF, RUNE, IMX, STX) with live prices from UMF, 24h change indicators, and news count badges. Shows 12 assets initially with "Show More" expansion. Asset cards are clickable and navigate to dedicated asset detail pages.
- **Asset Detail Pages**: Dynamic `/asset/:symbol` routes aggregate data from multiple sources (UMF prices, Guru Digest news, Economic Calendar events) into a unified view. Features tabbed interface for Price summary, News articles, and Events. Implements graceful degradation when data sources are unavailable.
- **Asset Tagging System**: Intelligent article tagging during RSS ingest using deterministic regex extraction. Canonical symbols (BTC, ETH, etc.) validated against whitelist and stored in Firestore for efficient filtering.
- **Asset API Endpoint**: `/api/asset/:symbol` provides aggregated data with 90-second caching, degraded flags for each data source, and Zod schema validation.
- **Real-time Market Intelligence**: Displays crypto macroeconomic events and market data.
- **Guru & Insider Digest**: Real-time crypto news from CoinDesk and Cointelegraph RSS feeds. Automated scheduler updates every 2.5 hours (10x per day) for fresh content. Articles auto-tagged with asset symbols during ingest. Manual CLI script also available. Stores articles in Firestore with 300-character excerpts and asset tags.
- **Universal Market Financials (UMF)**: Unified dashboard with live market snapshots (Top-20 crypto, indices, DXY), top movers, morning intelligence briefs, and market alerts. Features asset tiles, two-column responsive layout, and severity-based alert cards. Automated scheduler updates every 60 minutes via CoinGecko API. Data cached in Firestore for asset aggregation.
- **Economic Calendar**: Full-featured calendar with filtering and performance targets. Currently uses mock data.
- **Educational Resources**: Static Q&A content on cryptocurrency topics.
- **Premium Access**: Access to premium features via GOLDH tokens or subscription.

## External Dependencies

### Core Runtime
- Node.js
- TypeScript

### Database & ORM
- PostgreSQL
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
- shadcn/ui
- Tailwind CSS

### Authentication & Security
- bcryptjs

### Build Tools
- Vite
- esbuild
- PostCSS

### Cloud Services
- **Firebase/Firestore**: Stores Guru & Insider Digest articles and UMF live/historical snapshots. All credentials managed via environment variables for security.
- **RSS Feeds**: CoinDesk (`https://www.coindesk.com/arc/outboundfeeds/rss/`) and Cointelegraph (`https://cointelegraph.com/rss`) for Guru Digest news articles.
- **CoinGecko API**: Free tier for live cryptocurrency market data (UMF feature). Rate-limited scheduler prevents over-calling.
- **Zoho CRM**: Automatically creates Leads in CRM when users sign up. Uses Self Client OAuth 2.0 with refresh token authentication. Integration is non-blocking - sign-ups succeed even if CRM API fails. Credentials managed via environment variables (`ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`, `ZOHO_API_DOMAIN`).

### CLI Scripts
- **Guru Digest Manual Update**: `tsx server/updateGuruDigest.ts` (adds new articles) or `tsx server/updateGuruDigest.ts --clear` (clears old entries first).

### Font Resources
- Google Fonts (Inter, JetBrains Mono)

### Assets
- GOLDH logo
- Favicon