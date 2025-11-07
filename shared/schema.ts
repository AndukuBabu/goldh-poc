import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name"),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone"),
  experienceLevel: text("experience_level"),
  agreeToUpdates: boolean("agree_to_updates").default(false),
  walletAddress: text("wallet_address"),
  isPremium: boolean("is_premium").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Full insert schema for creating users with all fields
const fullInsertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Basic insert schema for simple auth (just email and password)
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
});

// Client-side sign up schema with validation (includes confirmPassword)
export const signUpSchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  experienceLevel: z.string().optional(),
  agreeToUpdates: z.boolean().optional().default(false),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Server-side sign up schema (omits confirmPassword for database insertion)
export const serverSignUpSchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  experienceLevel: z.string().optional(),
  agreeToUpdates: z.boolean().optional().default(false),
});

export type InsertUser = z.infer<typeof fullInsertUserSchema>;
export type SignUpData = z.infer<typeof signUpSchema>;
export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;

export interface NewsArticle {
  id: string;
  title: string;
  url: string;
  publishedAt: string;
}

export interface LearningTopic {
  id: string;
  title: string;
  question: string;
  answer: string;
  relatedTopics: string[];
}

/**
 * Economic Calendar Event Schema
 * 
 * Represents a macroeconomic event with AI-powered impact predictions.
 * Used for the Economic Calendar feature to display global macro events
 * (CPI, NFP, FOMC, etc.) with estimated market impact scores.
 * 
 * MVP: Stored in Firestore collection 'econEvents_mock' with mock data
 * Future: Fetched from /api/econ/events via external macro APIs
 * 
 * Field Descriptions:
 * - id: Unique identifier (Firestore doc ID or API event ID)
 * - title: Event name (e.g., "US CPI Report", "FOMC Minutes")
 * - country: ISO-2 country code or region (US, EU, SG, UK, JP, CN, Global)
 * - category: Event classification for filtering and impact modeling
 * - datetime_utc: Event scheduled time in ISO 8601 format (UTC timezone)
 * - importance: Editorial importance level (High/Medium/Low)
 * - previous: Prior period value (null if not applicable or first release)
 * - forecast: Consensus forecast value (null if not available)
 * - actual: Actual reported value (null if event not yet released)
 * - source: Data source identifier (MVP: 'Mock', Future: 'AlphaVantage', 'TradingEconomics')
 * - status: Event status ('upcoming' before release, 'released' after)
 * - impactScore: AI-predicted market impact magnitude (0-100, higher = stronger impact)
 * - confidence: AI model confidence level (0-100, higher = more certain prediction)
 * 
 * Impact Score Scale:
 * 0-20: Minimal impact
 * 21-40: Low impact
 * 41-60: Moderate impact
 * 61-80: High impact
 * 81-100: Critical impact
 * 
 * @see docs/EC-UI-MVP.md for full specification
 */
export const econEventSchema = z.object({
  // Core identification
  id: z.string().min(1, "Event ID is required"),
  
  // Event metadata
  title: z.string().min(1, "Event title is required"),
  
  // Geographic classification
  // Supports common regions and flexible string for future expansion
  country: z.string().min(1, "Country/region is required"),
  
  // Event classification
  category: z.enum([
    "Inflation",      // CPI, PPI, PCE
    "Employment",     // NFP, Jobless Claims, Unemployment Rate
    "GDP",            // GDP Growth, GDP Deflator
    "Rates",          // FOMC, ECB, BoJ rate decisions
    "Earnings",       // Corporate earnings (e.g., Coinbase, MicroStrategy)
    "Other",          // Regulatory announcements, misc events
  ], {
    errorMap: () => ({ message: "Invalid event category" }),
  }),
  
  // Temporal data
  datetime_utc: z.string()
    .datetime({ message: "Must be valid ISO 8601 datetime in UTC" })
    .describe("Event scheduled time in UTC (ISO 8601 format)"),
  
  // Editorial importance
  importance: z.enum(["High", "Medium", "Low"], {
    errorMap: () => ({ message: "Importance must be High, Medium, or Low" }),
  }),
  
  // Economic data points (nullable for non-numeric events)
  previous: z.number().nullable()
    .describe("Previous period value (null if N/A)"),
  
  forecast: z.number().nullable()
    .describe("Consensus forecast (null if N/A)"),
  
  actual: z.number().nullable()
    .describe("Actual released value (null if not yet released)"),
  
  // Data provenance
  source: z.string()
    .min(1, "Source is required")
    .describe("Data provider (e.g., 'Mock', 'AlphaVantage', 'TradingEconomics')"),
  
  // Event lifecycle status
  status: z.enum(["upcoming", "released"], {
    errorMap: () => ({ message: "Status must be 'upcoming' or 'released'" }),
  }),
  
  // AI predictions (0-100 scale)
  impactScore: z.number()
    .int("Impact score must be an integer")
    .min(0, "Impact score cannot be negative")
    .max(100, "Impact score cannot exceed 100")
    .describe("AI-predicted market impact magnitude (0-100)"),
  
  confidence: z.number()
    .int("Confidence must be an integer")
    .min(0, "Confidence cannot be negative")
    .max(100, "Confidence cannot exceed 100")
    .describe("AI model confidence level (0-100)"),
});

/**
 * TypeScript type inferred from econEventSchema
 * Use this for type-safe EconEvent handling throughout the application
 */
export type EconEvent = z.infer<typeof econEventSchema>;

/**
 * Insert schema for creating new economic events
 * (Currently not used in MVP as events come from Firestore/external APIs,
 *  but included for future server-side event creation endpoints)
 */
export const insertEconEventSchema = econEventSchema;

/**
 * UMF (Universal Market Financials) Schemas
 * 
 * These schemas define the data structures for the UMF feature,
 * which provides a unified dashboard for crypto, indices, commodities,
 * forex, and ETFs with real-time prices and market intelligence.
 * 
 * MVP: Stored in Firestore collections with mock data
 * Future: Fetched from /api/umf/* endpoints via external market APIs
 * 
 * @see docs/UMF-UI-MVP.md for full specification
 */

/**
 * UMF Asset Schema
 * 
 * Represents a single tradeable asset (crypto, index, commodity, etc.)
 * with current price, 24h change, volume, and market cap data.
 * 
 * Field Descriptions:
 * - id: Unique identifier (Firestore doc ID or ticker symbol)
 * - symbol: Ticker symbol (BTC, ETH, SPY, GC=F, DXY)
 * - name: Full asset name (Bitcoin, Ethereum, S&P 500)
 * - class: Asset classification for filtering and categorization
 * - price: Current spot price in USD
 * - changePct24h: 24-hour percentage change (e.g., 3.45 for +3.45%)
 * - volume24h: 24-hour trading volume in USD (null for indices/forex)
 * - marketCap: Total market capitalization in USD (null for forex/commodities)
 * - updatedAt_utc: Last price update timestamp in ISO 8601 format (UTC)
 * 
 * Allowed Asset Classes:
 * - 'crypto': Cryptocurrencies (BTC, ETH, SOL, XRP, etc.)
 * - 'index': Stock indices (S&P 500, NASDAQ, DAX, etc.)
 * - 'forex': Currency pairs and indices (DXY, EUR/USD, etc.)
 * - 'commodity': Physical commodities (Gold, Silver, Crude Oil, etc.)
 * - 'etf': Exchange-traded funds (SPY, QQQ, ARKK, etc.)
 * 
 * @example
 * {
 *   id: "btc-usd",
 *   symbol: "BTC",
 *   name: "Bitcoin",
 *   class: "crypto",
 *   price: 45678.90,
 *   changePct24h: 3.45,
 *   volume24h: 28500000000,
 *   marketCap: 890000000000,
 *   updatedAt_utc: "2025-01-07T14:30:00.000Z"
 * }
 */
export const umfAssetSchema = z.object({
  // Core identification
  id: z.string().min(1, "Asset ID is required"),
  symbol: z.string().min(1, "Symbol is required")
    .describe("Ticker symbol (e.g., BTC, SPY, GC=F)"),
  name: z.string().min(1, "Asset name is required")
    .describe("Full asset name (e.g., Bitcoin, S&P 500)"),
  
  // Asset classification
  class: z.enum(["crypto", "index", "forex", "commodity", "etf"], {
    errorMap: () => ({ 
      message: "Asset class must be: crypto, index, forex, commodity, or etf" 
    }),
  }).describe("Asset classification for filtering and categorization"),
  
  // Price data
  price: z.number()
    .positive("Price must be positive")
    .describe("Current spot price in USD"),
  
  changePct24h: z.number()
    .describe("24-hour percentage change (e.g., 3.45 for +3.45%)"),
  
  // Volume and market cap (nullable for indices/forex)
  volume24h: z.number()
    .positive("Volume must be positive")
    .nullable()
    .describe("24-hour trading volume in USD (null for indices/forex)"),
  
  marketCap: z.number()
    .positive("Market cap must be positive")
    .nullable()
    .describe("Total market capitalization in USD (null for forex/commodities)"),
  
  // Temporal data
  updatedAt_utc: z.string()
    .datetime({ message: "Must be valid ISO 8601 datetime in UTC" })
    .describe("Last price update timestamp in UTC (ISO 8601 format)"),
});

/**
 * TypeScript type for UmfAsset
 */
export type UmfAsset = z.infer<typeof umfAssetSchema>;

/**
 * UMF Snapshot Schema
 * 
 * Represents a complete market snapshot containing all tracked assets
 * at a specific point in time. Used to display the Live Market Overview.
 * 
 * Field Descriptions:
 * - timestamp_utc: Snapshot creation time in ISO 8601 format (UTC)
 * - assets: Array of all tracked assets (crypto, indices, commodities, etc.)
 * 
 * @example
 * {
 *   timestamp_utc: "2025-01-07T14:30:00.000Z",
 *   assets: [
 *     { id: "btc-usd", symbol: "BTC", name: "Bitcoin", class: "crypto", ... },
 *     { id: "spy", symbol: "SPY", name: "S&P 500", class: "index", ... },
 *     ...
 *   ]
 * }
 */
export const umfSnapshotSchema = z.object({
  timestamp_utc: z.string()
    .datetime({ message: "Must be valid ISO 8601 datetime in UTC" })
    .describe("Snapshot creation timestamp in UTC (ISO 8601 format)"),
  
  assets: z.array(umfAssetSchema)
    .min(1, "Snapshot must contain at least one asset")
    .describe("Array of all tracked assets"),
});

/**
 * TypeScript type for UmfSnapshot
 */
export type UmfSnapshot = z.infer<typeof umfSnapshotSchema>;

/**
 * UMF Mover Schema
 * 
 * Represents a top gainer or loser in the market for the "Top Movers" widget.
 * Shows assets with the largest positive or negative 24h percentage changes.
 * 
 * Field Descriptions:
 * - symbol: Ticker symbol (BTC, ETH, SPY, etc.)
 * - name: Full asset name (Bitcoin, Ethereum, S&P 500)
 * - class: Asset classification (crypto, index, forex, commodity, etf)
 * - direction: Whether this is a top gainer or loser
 * - changePct24h: 24-hour percentage change (positive for gainers, negative for losers)
 * - price: Current spot price in USD
 * - updatedAt_utc: Last update timestamp in ISO 8601 format (UTC)
 * 
 * Allowed Directions:
 * - 'gainer': Top positive performer (largest +% change)
 * - 'loser': Top negative performer (largest -% change)
 * 
 * @example
 * {
 *   symbol: "BTC",
 *   name: "Bitcoin",
 *   class: "crypto",
 *   direction: "gainer",
 *   changePct24h: 8.45,
 *   price: 47200.00,
 *   updatedAt_utc: "2025-01-07T14:30:00.000Z"
 * }
 */
export const umfMoverSchema = z.object({
  symbol: z.string().min(1, "Symbol is required")
    .describe("Ticker symbol (e.g., BTC, SPY)"),
  
  name: z.string().min(1, "Asset name is required")
    .describe("Full asset name (e.g., Bitcoin, S&P 500)"),
  
  class: z.enum(["crypto", "index", "forex", "commodity", "etf"], {
    errorMap: () => ({ 
      message: "Asset class must be: crypto, index, forex, commodity, or etf" 
    }),
  }).describe("Asset classification"),
  
  direction: z.enum(["gainer", "loser"], {
    errorMap: () => ({ message: "Direction must be 'gainer' or 'loser'" }),
  }).describe("Whether this is a top gainer or loser"),
  
  changePct24h: z.number()
    .describe("24-hour percentage change (positive for gainers, negative for losers)"),
  
  price: z.number()
    .positive("Price must be positive")
    .describe("Current spot price in USD"),
  
  updatedAt_utc: z.string()
    .datetime({ message: "Must be valid ISO 8601 datetime in UTC" })
    .describe("Last update timestamp in UTC (ISO 8601 format)"),
});

/**
 * TypeScript type for UmfMover
 */
export type UmfMover = z.infer<typeof umfMoverSchema>;

/**
 * UMF Brief Schema
 * 
 * Represents the "Morning Intelligence" daily brief - an AI-generated
 * summary of market conditions, key themes, and actionable insights.
 * 
 * Field Descriptions:
 * - date_utc: Brief publication date in ISO 8601 format (UTC, date-only)
 * - headline: Single-sentence market summary (e.g., "Risk-on sentiment as markets rally")
 * - bullets: Array of 3-5 key points explaining market movements
 * 
 * @example
 * {
 *   date_utc: "2025-01-07",
 *   headline: "Crypto rallies on institutional inflows as Fed signals dovish stance",
 *   bullets: [
 *     "Bitcoin +4.2% driven by spot ETF inflows totaling $850M",
 *     "Ethereum breaks $2,500 resistance on L2 scaling optimism",
 *     "DXY falls -0.8% following Fed dovish commentary"
 *   ]
 * }
 */
export const umfBriefSchema = z.object({
  date_utc: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .describe("Brief publication date in UTC (ISO 8601 date format)"),
  
  headline: z.string()
    .min(10, "Headline must be at least 10 characters")
    .max(200, "Headline must not exceed 200 characters")
    .describe("Single-sentence market summary"),
  
  bullets: z.array(z.string().min(10, "Bullet point must be at least 10 characters"))
    .min(1, "Brief must contain at least one bullet point")
    .max(5, "Brief should not exceed 5 bullet points")
    .describe("Array of 3-5 key insights explaining market movements"),
});

/**
 * TypeScript type for UmfBrief
 */
export type UmfBrief = z.infer<typeof umfBriefSchema>;

/**
 * UMF Alert Schema
 * 
 * Represents a market alert notification for significant price movements,
 * volatility spikes, or sentiment shifts. Displayed in the optional Alert Card.
 * 
 * Field Descriptions:
 * - id: Unique alert identifier
 * - title: Alert heading (e.g., "BTC Volatility Spike Detected")
 * - body: Alert message with context and details
 * - severity: Alert importance level for visual styling
 * - createdAt_utc: Alert creation timestamp in ISO 8601 format (UTC)
 * 
 * Allowed Severity Levels:
 * - 'info': Informational alert (blue/neutral styling)
 * - 'warn': Warning alert (yellow/orange styling)
 * - 'high': High-priority alert (red/critical styling)
 * 
 * @example
 * {
 *   id: "alert-20250107-001",
 *   title: "BTC Volatility Spike Detected",
 *   body: "Bitcoin volatility increased 45% in the last hour. Consider reviewing stop-loss levels.",
 *   severity: "warn",
 *   createdAt_utc: "2025-01-07T14:30:00.000Z"
 * }
 */
export const umfAlertSchema = z.object({
  id: z.string().min(1, "Alert ID is required")
    .describe("Unique alert identifier"),
  
  title: z.string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must not exceed 100 characters")
    .describe("Alert heading"),
  
  body: z.string()
    .min(10, "Body must be at least 10 characters")
    .max(500, "Body must not exceed 500 characters")
    .describe("Alert message with context and details"),
  
  severity: z.enum(["info", "warn", "high"], {
    errorMap: () => ({ message: "Severity must be: info, warn, or high" }),
  }).describe("Alert importance level (info=neutral, warn=caution, high=critical)"),
  
  createdAt_utc: z.string()
    .datetime({ message: "Must be valid ISO 8601 datetime in UTC" })
    .describe("Alert creation timestamp in UTC (ISO 8601 format)"),
});

/**
 * TypeScript type for UmfAlert
 */
export type UmfAlert = z.infer<typeof umfAlertSchema>;

/**
 * ============================================================================
 * UMF LIVE SCHEMAS (CoinGecko Integration)
 * ============================================================================
 * 
 * These schemas define the canonical live data structures for the UMF feature
 * when fetching from CoinGecko API. They differ from the mock schemas above
 * in several ways:
 * 
 * 1. Nullable fields: changePct24h, volume24h, marketCap can be null if
 *    CoinGecko doesn't provide them (e.g., for certain asset types)
 * 
 * 2. Degraded flag: Indicates when data is stale or from fallback sources
 *    (e.g., scheduler failed, serving from Firestore cache)
 * 
 * 3. Movers structure: Returns separate gainers/losers arrays instead of
 *    a mixed array with direction field
 * 
 * Data Flow:
 * - Scheduler fetches from CoinGecko hourly
 * - Transforms to these live schemas
 * - Stores in Firestore (umf_snapshot_live, umf_snapshot_history)
 * - API routes serve from cache/Firestore (never call CoinGecko directly)
 * 
 * @see docs/UMF-Live-Firestore.md for complete integration plan
 */

/**
 * UMF Asset Class Enum (Live)
 * 
 * Supported asset classifications for the live CoinGecko integration.
 * 
 * Note: CoinGecko primarily covers cryptocurrencies. For traditional assets
 * (indices, forex, commodities), we may need additional data providers or
 * limit the MVP to crypto-only assets.
 * 
 * @see docs/UMF-Live-Firestore.md Section "Traditional Assets"
 */
export const umfAssetClassEnum = z.enum([
  "crypto",      // Cryptocurrencies (BTC, ETH, SOL, etc.)
  "index",       // Stock indices (SPX, NDX, etc.) - requires additional provider
  "forex",       // Currency pairs (DXY, EUR/USD, etc.) - requires additional provider
  "commodity",   // Physical commodities (GOLD, WTI, etc.) - requires additional provider
  "etf",         // Exchange-traded funds (SPY, QQQ, etc.) - requires additional provider
]);

/**
 * TypeScript type for UmfAssetClass
 */
export type UmfAssetClass = z.infer<typeof umfAssetClassEnum>;

/**
 * UMF Asset Schema (Live)
 * 
 * Represents a single tradeable asset from CoinGecko API with nullable fields
 * for data that may not be available for all asset types.
 * 
 * Differences from mock schema:
 * - changePct24h is nullable (CoinGecko may not provide for all assets)
 * - volume24h is nullable (not applicable for indices/forex)
 * - marketCap is nullable (not applicable for forex/commodities)
 * 
 * Field Descriptions:
 * - id: CoinGecko asset ID (e.g., "bitcoin", "ethereum")
 * - symbol: Ticker symbol, uppercase (e.g., "BTC", "ETH")
 * - name: Full asset name (e.g., "Bitcoin", "Ethereum")
 * - class: Asset classification (crypto, index, forex, commodity, etf)
 * - price: Current spot price in USD (always present)
 * - changePct24h: 24-hour percentage change (null if unavailable)
 * - volume24h: 24-hour trading volume in USD (null if unavailable)
 * - marketCap: Total market capitalization in USD (null if unavailable)
 * - updatedAt_utc: Last price update timestamp (ISO 8601, UTC)
 * 
 * @example CoinGecko Bitcoin
 * {
 *   id: "bitcoin",
 *   symbol: "BTC",
 *   name: "Bitcoin",
 *   class: "crypto",
 *   price: 43250.50,
 *   changePct24h: 1.61,
 *   volume24h: 25678901234,
 *   marketCap: 846234567890,
 *   updatedAt_utc: "2025-11-07T10:00:00.000Z"
 * }
 * 
 * @example Asset with missing data
 * {
 *   id: "some-token",
 *   symbol: "TOKEN",
 *   name: "Some Token",
 *   class: "crypto",
 *   price: 1.23,
 *   changePct24h: null,
 *   volume24h: null,
 *   marketCap: null,
 *   updatedAt_utc: "2025-11-07T10:00:00.000Z"
 * }
 */
export const umfAssetLiveSchema = z.object({
  id: z.string().min(1, "Asset ID is required"),
  
  symbol: z.string().min(1, "Symbol is required")
    .describe("Ticker symbol, uppercase (e.g., BTC, ETH)"),
  
  name: z.string().min(1, "Asset name is required")
    .describe("Full asset name (e.g., Bitcoin, Ethereum)"),
  
  class: umfAssetClassEnum
    .describe("Asset classification"),
  
  price: z.number()
    .positive("Price must be positive")
    .describe("Current spot price in USD"),
  
  changePct24h: z.number()
    .nullable()
    .describe("24-hour percentage change (null if unavailable)"),
  
  volume24h: z.number()
    .positive("Volume must be positive")
    .nullable()
    .describe("24-hour trading volume in USD (null if unavailable)"),
  
  marketCap: z.number()
    .positive("Market cap must be positive")
    .nullable()
    .describe("Total market capitalization in USD (null if unavailable)"),
  
  updatedAt_utc: z.string()
    .datetime({ message: "Must be valid ISO 8601 datetime in UTC" })
    .describe("Last price update timestamp (ISO 8601, UTC)"),
});

/**
 * TypeScript type for UmfAsset (Live)
 */
export type UmfAssetLive = z.infer<typeof umfAssetLiveSchema>;

/**
 * UMF Snapshot Schema (Live)
 * 
 * Represents a complete market snapshot from the scheduler's hourly CoinGecko
 * API call. Includes all tracked assets and an optional degraded flag.
 * 
 * Differences from mock schema:
 * - degraded (optional): Indicates data is stale or from fallback source
 * 
 * Field Descriptions:
 * - timestamp_utc: Snapshot creation time (ISO 8601, UTC)
 * - assets: Array of all tracked assets from CoinGecko
 * - degraded: (Optional) true if data is stale/from fallback, false/omitted if fresh
 * 
 * Degraded Mode Scenarios:
 * 1. Scheduler failed to fetch from CoinGecko (API error, network timeout)
 * 2. Serving stale data from Firestore (cache expired, no recent update)
 * 3. Using mock data as last resort (Firestore empty, first-time setup)
 * 
 * Frontend should detect degraded=true and show warning banner.
 * 
 * @example Fresh snapshot
 * {
 *   timestamp_utc: "2025-11-07T10:00:00.000Z",
 *   assets: [
 *     { id: "bitcoin", symbol: "BTC", ... },
 *     { id: "ethereum", symbol: "ETH", ... }
 *   ],
 *   degraded: false // or omitted
 * }
 * 
 * @example Degraded snapshot
 * {
 *   timestamp_utc: "2025-11-07T08:00:00.000Z", // 2 hours old
 *   assets: [...],
 *   degraded: true // Scheduler failed at 09:00 and 10:00
 * }
 */
export const umfSnapshotLiveSchema = z.object({
  timestamp_utc: z.string()
    .datetime({ message: "Must be valid ISO 8601 datetime in UTC" })
    .describe("Snapshot creation timestamp (ISO 8601, UTC)"),
  
  assets: z.array(umfAssetLiveSchema)
    .min(1, "Snapshot must contain at least one asset")
    .describe("Array of all tracked assets from CoinGecko"),
  
  degraded: z.boolean()
    .optional()
    .describe("True if data is stale/from fallback, false/omitted if fresh"),
});

/**
 * TypeScript type for UmfSnapshot (Live)
 */
export type UmfSnapshotLive = z.infer<typeof umfSnapshotLiveSchema>;

/**
 * UMF Movers Schema (Live)
 * 
 * Represents the top gainers and losers calculated from the latest snapshot.
 * Unlike the mock schema (which uses a direction field), this schema returns
 * separate arrays for clarity and easier frontend consumption.
 * 
 * Differences from mock schema:
 * - Separate gainers/losers arrays (instead of mixed array with direction)
 * - timestamp_utc at top level (instead of per-mover)
 * - degraded (optional): Indicates data is stale or from fallback source
 * 
 * Field Descriptions:
 * - timestamp_utc: When movers were calculated (ISO 8601, UTC)
 * - gainers: Top 5 assets with largest positive 24h % change
 * - losers: Top 5 assets with largest negative 24h % change
 * - degraded: (Optional) true if data is stale/from fallback
 * 
 * Calculation Logic:
 * 1. Fetch latest snapshot
 * 2. Sort assets by changePct24h (descending)
 * 3. Take top 5 as gainers
 * 4. Take bottom 5 (reversed) as losers
 * 
 * Note: Movers are calculated on-demand from snapshot, not stored separately.
 * 
 * @example Fresh movers
 * {
 *   timestamp_utc: "2025-11-07T10:00:00.000Z",
 *   gainers: [
 *     { id: "bitcoin", symbol: "BTC", changePct24h: 8.45, ... },
 *     { id: "ethereum", symbol: "ETH", changePct24h: 5.20, ... },
 *     ...
 *   ],
 *   losers: [
 *     { id: "cardano", symbol: "ADA", changePct24h: -3.10, ... },
 *     { id: "ripple", symbol: "XRP", changePct24h: -2.85, ... },
 *     ...
 *   ],
 *   degraded: false // or omitted
 * }
 */
export const umfMoversLiveSchema = z.object({
  timestamp_utc: z.string()
    .datetime({ message: "Must be valid ISO 8601 datetime in UTC" })
    .describe("When movers were calculated (ISO 8601, UTC)"),
  
  gainers: z.array(umfAssetLiveSchema)
    .max(5, "Should return at most 5 gainers")
    .describe("Top 5 assets with largest positive 24h % change"),
  
  losers: z.array(umfAssetLiveSchema)
    .max(5, "Should return at most 5 losers")
    .describe("Top 5 assets with largest negative 24h % change"),
  
  degraded: z.boolean()
    .optional()
    .describe("True if data is stale/from fallback, false/omitted if fresh"),
});

/**
 * TypeScript type for UmfMovers (Live)
 */
export type UmfMoversLive = z.infer<typeof umfMoversLiveSchema>;
