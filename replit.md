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
- Black-gold color palette defined in CSS variables
- Professional fintech aesthetic targeting beginner-friendly UX
- Responsive design with mobile-first approach
- Custom spacing primitives and elevation classes (hover-elevate, active-elevate-2)

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
- Custom session management using in-memory Map storage
- 7-day session expiration
- Bearer token authentication via Authorization headers
- Support for both email/password and wallet-based authentication

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
- Users table: id (UUID), email (unique), password (hashed), walletAddress (nullable), isPremium (boolean), createdAt (timestamp)
- Interface definitions for NewsArticle and LearningTopic entities
- Zod schemas for runtime validation of user inputs

**Storage Strategy**
- In-memory storage implementation (`MemStorage`) for development/testing
- Interface-based storage abstraction (`IStorage`) for easy migration to PostgreSQL
- Session storage in-memory Map (suitable for single-instance deployment)

**Migration to PostgreSQL**
The application is currently using in-memory storage but is architecturally prepared for PostgreSQL:
- Drizzle configuration points to PostgreSQL dialect
- Schema defined in `shared/schema.ts` using Drizzle pg-core
- Storage interface allows swapping implementations without changing business logic
- Migration scripts configured to output to `./migrations` directory

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