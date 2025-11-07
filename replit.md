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
- **Design System**: Black-gold color palette (`#C7AE6A`, `#d5c28f`, `#b99a45`, `#e3d6b4` on dark backgrounds like `#1a1a1a`, `#000000`), professional fintech aesthetic, responsive design, custom spacing, elevation classes, and enhanced visual polish with shadows and gradients. Logo integrated with blend modes and gold glow effects.

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
- **Performance**: First paint <2s target, optimized caching (30s for prices, 5min for briefs)
- **Accessibility**: Full keyboard support, ARIA labels, focus indicators (gold rings), screen reader friendly, tooltips on focus
- **Future Migration**: Designed for seamless API migration from Firestore to `/api/umf/*` endpoints without UI refactor