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
- **Component Design**: Interactive elements with hover, gold glows, shadows.
- **Feature Pages**: Dedicated full-screen pages for Guru & Insider Digest, Universal Market Financials, Economic Calendar.
- **Dashboard**: Asset-first grid layout showing tracked crypto assets with live prices, 24h changes, and news counts.
- **Asset Detail Pages**: Dynamic `/asset/:symbol` routes providing unified views of price data, news articles, and economic events.
- **Mobile Responsiveness**: All components are responsive.

### Technical Implementations
- **Authentication Flow**: Distinct sign-in/sign-up, comprehensive waitlist registration.
- **Session Management**: Database-backed session persistence with cleanup.
- **Validation**: Zod schemas for client-side and server-side validation.
- **Error Handling**: Graceful error handling for authentication and data.
- **Automated Data Refresh**:
  - **UMF Scheduler**: Updates every 60 minutes (±15s jitter) via CoinGecko API. Enabled by `UMF_SCHEDULER=1` env var.
  - **Guru Digest Scheduler**: Updates every 2.5 hours (±30s jitter) via RSS feeds from CoinDesk & Cointelegraph. Enabled by `GURU_SCHEDULER=1` env var. Clears old entries and fetches fresh articles automatically.
  - Both schedulers have rate limit guards and performance logging.

### Feature Specifications
- **Asset-First Dashboard**: Home page displays grid of tracked assets (BTC, ETH, SOL, BNB, ADA, MATIC, TRX, LINK, TON, DOGE, DOT, LTC, NEAR, APT, AVAX) with live prices from UMF, 24h change indicators, and news count badges. Asset cards are clickable and navigate to dedicated asset detail pages.
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

### CLI Scripts
- **Guru Digest Manual Update**: `tsx server/updateGuruDigest.ts` (adds new articles) or `tsx server/updateGuruDigest.ts --clear` (clears old entries first).

### Font Resources
- Google Fonts (Inter, JetBrains Mono)

### Assets
- GOLDH logo
- Favicon