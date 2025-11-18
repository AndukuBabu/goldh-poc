# GOLDH Crypto Intelligence Platform

## Overview
GOLDH is a crypto intelligence platform providing real-time market intelligence, secure wallet integration, and educational resources. It aims to simplify cryptocurrency navigation for both experienced traders and beginners with a premium fintech aesthetic, black-gold color scheme, and user-friendly language. The platform's core purpose is to build wealth and bridge worlds within the crypto space.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Frameworks**: React with TypeScript, Wouter for routing, Vite for bundling.
- **UI/UX**: shadcn/ui (New York style), Radix UI primitives, Tailwind CSS with custom design tokens. Premium black-gold aesthetic (`#0f0f0f`, `#C7AE6A`), Inter and JetBrains Mono typography, responsive design, interactive elements with hover effects, gold border glows, and shadows. All icons use lucide-react.
- **State Management**: TanStack Query for server state, React Context API for authentication.
- **Key Features**:
    - **Dashboard**: Asset-first grid layout for tracking crypto assets with live prices and news.
    - **Asset Detail Pages**: Dynamic routes (`/asset/:symbol`) unifying price data, news, and events.
    - **Landing Page**: Features `NewsScroller`, `PreviewWidgets` (Guru Digest, Market Financials, Economic Calendar), `ComingSoon` features, and `FOMABox`.
    - **Welcome Experience**: Includes `WelcomeAnimation` (first-visit overlay), `SignInPrompt` (modal for unauthenticated users), and `ExitIntentModal` (mouse-leave detection).
    - **Mobile Responsiveness**: Comprehensive design with mobile-first approach, including a hamburger menu with shadcn Sheet component.
    - **Authentication-Free Access**: Most feature pages are viewable without login, with dismissible sign-in prompts.

### Backend
- **Server**: Express.js on Node.js with TypeScript and ESM modules.
- **API**: RESTful API under `/api`, session-based authentication with bearer tokens.
- **Authentication**: Bcrypt for password hashing, database-backed session management, email/password authentication.
- **Admin System**: Role-based access managed via `ADMIN_EMAILS` environment variable, with dedicated admin routes (`/admin/guru-digest`) for content management (e.g., article entry, deletion, RSS refresh). Non-admin access to admin routes results in a 404.
- **Automated Data Refresh**: Schedulers for UMF (CoinGecko data every 60 mins) and Guru Digest (RSS feeds every 2.5 hours).

### Data Storage
- **Primary Database**: PostgreSQL using Drizzle ORM and Neon serverless driver.
- **Schema**: `Users` and `Sessions` tables, Zod schemas for validation.
- **Database Management**: Schema migrations via Drizzle.

### Feature Specifications
- **Real-time Market Intelligence**: Displays crypto macroeconomic events and market data.
- **Guru Talk**: Real-time crypto news from CoinDesk and Cointelegraph RSS feeds, with automated updates and asset tagging.
- **GOLDH Pulse**: Live market data dashboard displaying top 100 cryptocurrencies by market cap, dynamically fetched and updated via CoinGecko API.
- **Market Events**: Full-featured economic calendar with event filtering, impact levels, and admin-managed data upload via JSON files.
- **Learning Hub**: "Coming Soon" page showcasing planned educational content.

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
- **Firebase/Firestore**: Stores Guru Digest articles, UMF snapshots, and Economic Calendar events.
    - Collections: `guruDigest`, `umfSnapshots`, `econEvents`.
- **RSS Feeds**: CoinDesk (`https://www.coindesk.com/arc/outboundfeeds/rss/`) and Cointelegraph (`https://cointelegraph.com/rss`).
- **CoinGecko API**: Free tier for live cryptocurrency market data (UMF feature).
- **Zoho CRM**: Integrates to automatically create Leads from user sign-ups using Self Client OAuth 2.0.

### Font Resources
- Google Fonts (Inter, JetBrains Mono)