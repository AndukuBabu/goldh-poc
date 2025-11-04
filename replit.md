# GOLDH Crypto Intelligence Platform

## Overview

GOLDH is a crypto intelligence platform designed for both experienced traders and crypto-curious beginners. The application provides real-time market intelligence, secure wallet integration, and educational resources to help users navigate the cryptocurrency space. Built with a modern tech stack featuring React, Express, and PostgreSQL, the platform emphasizes a premium fintech aesthetic with a distinctive black-gold color scheme and beginner-friendly language.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Routing**
- React with TypeScript as the primary UI framework
- Wouter for lightweight client-side routing
- Vite as the build tool and development server
- Component-based architecture following React best practices

**UI Component System**
- shadcn/ui (New York style variant) as the foundational component library
- Radix UI primitives for accessible, unstyled components
- Tailwind CSS for utility-first styling with custom design tokens
- Custom theme extending shadcn defaults with GOLDH brand colors (gold #C7AE6A on black backgrounds)

**State Management**
- TanStack Query (React Query) for server state management and caching
- React Context API for authentication state via `AuthProvider`
- Local component state using React hooks

**Design System**
- Black-gold color palette (#C7AE6A, #d5c28f, #b99a45, #e3d6b4) with dark backgrounds (#1a1a1a, #000000)
- Professional fintech aesthetic targeting beginner-friendly UX
- Responsive design with mobile-first approach
- Custom spacing primitives and elevation classes (hover-elevate, active-elevate-2)
- Enhanced visual polish with shadows, gradients, and hover effects throughout
- Logo integration using blend modes (mix-blend-lighten) with layered gold glow effects

### Backend Architecture

**Server Framework**
- Express.js running on Node.js
- TypeScript for type safety
- ESM module system
- Custom middleware for authentication and request logging

**API Design**
- RESTful API endpoints under `/api` prefix
- Session-based authentication with bearer token headers
- Structured error handling with appropriate HTTP status codes
- Request/response logging middleware for debugging

**Authentication System**
- Bcrypt for password hashing (10 salt rounds)
- Database-backed session management using PostgreSQL sessions table
- 7-day session expiration
- Bearer token authentication via Authorization headers
- Support for both email/password and wallet-based authentication
- Magic link functionality that validates account existence before sending links

**Development Environment**
- Vite middleware integration for HMR in development
- Replit-specific plugins for error overlay and dev tools
- Separate development and production build processes

### Data Storage Solutions

**Database Configuration**
- PostgreSQL as the primary database (configured via Drizzle)
- Neon serverless PostgreSQL driver (`@neondatabase/serverless`)
- Drizzle ORM for type-safe database queries and migrations
- Schema-first approach with TypeScript types generated from schema

**Schema Design**
- Users table: id (varchar UUID), email (unique), password (hashed), walletAddress (nullable), isPremium (boolean), createdAt (timestamp)
- Sessions table: id (varchar), userId (foreign key to users.id), expiresAt (timestamp), createdAt (timestamp)
- Interface definitions for NewsArticle and LearningTopic entities
- Zod schemas for runtime validation of user inputs

**Storage Strategy**
- PostgreSQL database storage implementation (`DatabaseStorage`) for persistent data
- Interface-based storage abstraction (`IStorage`) for consistent API across storage backends
- Database-backed session management using sessions table with automatic cleanup
- All user data and sessions persisted to PostgreSQL via Drizzle ORM

**Database Management**
- Active PostgreSQL database connected via DATABASE_URL environment variable
- Schema migrations managed through Drizzle with `npm run db:push`
- Database-first approach with type safety from Drizzle schema
- Automatic session cleanup for expired sessions

### External Dependencies

**Core Runtime**
- Node.js runtime environment
- TypeScript compiler for type checking and development

**Database & ORM**
- PostgreSQL database (via DATABASE_URL environment variable)
- Drizzle Kit for migrations and schema management
- Drizzle ORM for query building

**Frontend Libraries**
- React 18+ for UI components
- TanStack Query for data fetching and caching
- Wouter for routing
- date-fns for date manipulation
- Lucide React for icon components

**UI Component Dependencies**
- Radix UI primitives (accordion, dialog, dropdown, etc.)
- class-variance-authority for component variant management
- clsx and tailwind-merge for className utilities
- cmdk for command menu functionality

**Authentication & Security**
- bcryptjs for password hashing
- Custom session management (no external auth providers currently integrated)

**Build Tools**
- Vite for bundling and development server
- esbuild for server-side bundling in production
- PostCSS with Tailwind CSS for styling
- tsx for TypeScript execution in development

**Replit Integration**
- Replit-specific Vite plugins for development experience
- Runtime error modal overlay
- Cartographer for code navigation
- Dev banner for environment awareness

**Font Resources**
- Google Fonts (Inter and JetBrains Mono) loaded via CDN
- Inter for body text (weights 300-800)
- JetBrains Mono for monospace content (weights 400-700)

**Assets**
- GOLDH logo stored in attached_assets directory
- Design guidelines documenting brand colors and component patterns
- Favicon configured in HTML

## Recent Changes

**Logo Update (Latest)**
- **Brand Refresh**: Updated to new official logo (goldh-logo_1762272901250.png)
  - Features "golden horizon" text with "BUILDING WEALTH, BRIDGING WORLDS" tagline
  - Black/transparent background blends seamlessly with dark theme
  - Applied across Landing page hero and Header component
  - Maintains proper proportions with responsive sizing (h-auto, w-auto)
  - Verified visually with no white box or stretching issues

**Database & Authentication Migration (Previous)**
- **PostgreSQL Integration**: Migrated from in-memory storage to PostgreSQL database
  - Created users table with id, email, password, walletAddress, isPremium, createdAt
  - Created sessions table with id, userId (foreign key), expiresAt, createdAt
  - Updated DatabaseStorage implementation with Drizzle ORM for all CRUD operations
  - All user accounts and sessions now persist across server restarts
- **Session Management**: Database-backed session storage with automatic cleanup
  - SessionManager now uses PostgreSQL sessions table instead of in-memory Map
  - All session methods converted to async operations
  - 7-day session expiration maintained
- **Authentication Flow Updates**:
  - Restructured sign-in/sign-up page: removed MetaMask wallet connection from sign-in
  - Moved wallet connection to dashboard (only displays when wallet not connected)
  - Implemented magic link account validation: checks if account exists before sending
    - Existing users: Shows success message "Check your email for the sign-in link"
    - Non-existent users: Shows error "No account found with this email. Please sign up with a password first."
  - Added TypeScript type guards for window.ethereum to prevent LSP errors
- **Premium Access Messaging**: Updated all premium-related copy across platform
  - Landing page: Added "Premium Access Coming Soon" promotional box
  - Dashboard: Updated teaser to mention "tokens OR subscription"
  - FAQ: Updated to reflect dual pathway (5000+ GOLDH tokens OR subscription)
  - Flexible access pathways for all users

**Landing Page Enhancements (Earlier)**
- **Logo Update**: Switched to transparent PNG (goldh-logo_1761896683515.png) for cleaner integration, removed all glow effects (now superseded by latest logo update)
- **Vertical Depth**: Increased spacing around Features section (py-24, gap-8, mb-20) with strategic dark backgrounds
- **Enhanced CTA Section**: Added gradient backgrounds, dual action buttons, trust indicators, and "Limited Time Offer" badge
- **FAQ Section**: New section with 6 frequently asked questions, hover effects, and support CTA
- **Visual Polish**: 
  - FeatureCard components with gradient borders, icon scaling on hover, and enhanced shadows
  - FOMABox components with gold gradients, shadow effects, and animated sparkle icons
  - Expanded footer with multi-column navigation links
  - Strategic use of dark backgrounds (#1a1a1a, #000000) for contrast
  - Gold accents (#C7AE6A, #b99a45) throughout for premium feel

**Authentication System (Earlier)**
- Fixed session persistence bug by properly parsing API responses (.json())
- Unified signin/signup flow that auto-creates accounts for new users
- Session management with localStorage and automatic fallback