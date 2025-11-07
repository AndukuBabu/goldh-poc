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
