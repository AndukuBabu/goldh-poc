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
- **Dashboard**: Truncated content previews.
- **Mobile Responsiveness**: All components are responsive.

### Technical Implementations
- **Authentication Flow**: Distinct sign-in/sign-up, comprehensive waitlist registration.
- **Session Management**: Database-backed session persistence with cleanup.
- **Validation**: Zod schemas for client-side and server-side validation.
- **Error Handling**: Graceful error handling for authentication and data.

### Feature Specifications
- **Real-time Market Intelligence**: Displays crypto macroeconomic events and market data.
- **Guru & Insider Digest**: Provides whale alerts, smart wallet movements, and institutional fund flows.
- **Universal Market Financials (UMF)**: Unified dashboard with live market snapshots (Top-20 crypto, indices, DXY), top movers, morning intelligence briefs, and market alerts. Features asset tiles, two-column responsive layout, and severity-based alert cards.
- **Economic Calendar**: Full-featured calendar with filtering and performance targets.
- **Educational Resources**: Content on cryptocurrency topics.
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
- Firebase/Firestore (for Guru & Insider Digest, UMF mock and live data)
- Hugging Face API (for AI summarization of news articles)
- CoinGecko API (for live UMF data, via scheduler)

### Font Resources
- Google Fonts (Inter, JetBrains Mono)

### Assets
- GOLDH logo
- Favicon