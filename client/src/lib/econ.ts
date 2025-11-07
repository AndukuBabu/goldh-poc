/**
 * Economic Calendar Data Layer (Client-Side Firestore Reader)
 * 
 * MVP Implementation: Reads mock economic events directly from Firestore
 * Future Migration: Swap to REST API endpoint /api/econ/events without changing consumers
 * 
 * Migration Strategy:
 * ─────────────────────────────────────────────────────────────────────────
 * Current (MVP):
 *   getEconEventsMock() → Firestore → econEvents_mock collection
 * 
 * Future (Phase 2):
 *   getEconEvents() → /api/econ/events → External API (cached in PostgreSQL)
 * 
 * To migrate:
 * 1. Create backend endpoint: GET /api/econ/events?from=...&to=...
 * 2. Replace this file's implementation with fetch() to API
 * 3. UI components remain unchanged (they only consume EconEvent[])
 * 4. TanStack Query hook (useEconEvents) abstracts the data source
 * ─────────────────────────────────────────────────────────────────────────
 * 
 * @see docs/EC-UI-MVP.md for full specification
 */

import { db } from "./firebase";
import { collection, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore";
import { econEventSchema, type EconEvent } from "@shared/schema";

/**
 * Filter options for economic events query
 */
export interface EconEventFilters {
  /** Start date (ISO string or Date) - defaults to 7 days ago */
  from?: string | Date;
  /** End date (ISO string or Date) - defaults to 14 days from now */
  to?: string | Date;
  /** Filter by country/region (optional) */
  country?: string[];
  /** Filter by event category (optional) */
  category?: string[];
  /** Filter by importance level (optional) */
  importance?: string[];
  /** Filter by status (optional) */
  status?: "upcoming" | "released";
}

/**
 * Fetch economic events from Firestore with optional filters
 * 
 * MVP: Reads from Firestore collection 'econEvents_mock'
 * Future: Will be replaced with API call to /api/econ/events
 * 
 * @param filters - Optional filters for date range, country, category, etc.
 * @returns Promise<EconEvent[]> - Array of validated economic events
 * 
 * @example
 * ```typescript
 * // Get all events in default 14-day window
 * const events = await getEconEventsMock();
 * 
 * // Get events for specific date range
 * const events = await getEconEventsMock({
 *   from: '2025-01-01',
 *   to: '2025-01-31'
 * });
 * 
 * // Get US inflation events only
 * const events = await getEconEventsMock({
 *   country: ['US'],
 *   category: ['Inflation']
 * });
 * ```
 * 
 * Future API Migration:
 * ```typescript
 * // This function will be replaced with:
 * const response = await fetch('/api/econ/events?from=...&to=...');
 * const events = await response.json();
 * // Validation remains the same
 * return events.map(e => econEventSchema.parse(e));
 * ```
 */
export async function getEconEventsMock(filters: EconEventFilters = {}): Promise<EconEvent[]> {
  try {
    // Default date range: 7 days ago to 14 days from now (21-day window)
    const defaultFrom = new Date();
    defaultFrom.setDate(defaultFrom.getDate() - 7);
    
    const defaultTo = new Date();
    defaultTo.setDate(defaultTo.getDate() + 14);

    const fromDate = filters.from 
      ? (typeof filters.from === 'string' ? new Date(filters.from) : filters.from)
      : defaultFrom;
    
    const toDate = filters.to
      ? (typeof filters.to === 'string' ? new Date(filters.to) : filters.to)
      : defaultTo;

    // Build Firestore query
    const eventsRef = collection(db, "econEvents_mock");
    
    // Start with date range query (Firestore requires orderBy field to match where clause)
    let q = query(
      eventsRef,
      where("datetime_utc", ">=", fromDate.toISOString()),
      where("datetime_utc", "<=", toDate.toISOString()),
      orderBy("datetime_utc", "asc")
    );

    // Execute query
    const snapshot = await getDocs(q);
    
    // Map documents to EconEvent objects
    let events: EconEvent[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      } as EconEvent;
    });

    // Client-side filtering (Firestore doesn't support multiple array contains)
    // Note: In Phase 2, these filters will be handled by backend API
    if (filters.country && filters.country.length > 0) {
      events = events.filter(e => filters.country!.includes(e.country));
    }

    if (filters.category && filters.category.length > 0) {
      events = events.filter(e => filters.category!.includes(e.category));
    }

    if (filters.importance && filters.importance.length > 0) {
      events = events.filter(e => filters.importance!.includes(e.importance));
    }

    if (filters.status) {
      events = events.filter(e => e.status === filters.status);
    }

    // Validate each event against Zod schema
    // This ensures type safety even if Firestore data is malformed
    const validatedEvents = events.map((event, index) => {
      try {
        return econEventSchema.parse(event);
      } catch (error) {
        console.error(`Invalid event at index ${index}:`, error);
        throw new Error(`Event validation failed for: ${event.title}`);
      }
    });

    return validatedEvents;

  } catch (error) {
    console.error("Error fetching economic events from Firestore:", error);
    throw error;
  }
}

// ==================== UTILITY EXPORTS ====================

/**
 * All supported countries/regions for economic events
 * Used for filter dropdowns and validation
 * 
 * Note: This list should match the most common regions in our data
 * Future: Can be fetched dynamically from /api/econ/countries endpoint
 */
export const ECON_COUNTRIES = [
  "US",      // United States
  "EU",      // European Union
  "UK",      // United Kingdom
  "CN",      // China
  "JP",      // Japan
  "SG",      // Singapore
  "Global",  // Global events (e.g., crypto regulation)
] as const;

/**
 * Human-readable country labels for UI display
 */
export const ECON_COUNTRY_LABELS: Record<typeof ECON_COUNTRIES[number], string> = {
  US: "United States",
  EU: "European Union",
  UK: "United Kingdom",
  CN: "China",
  JP: "Japan",
  SG: "Singapore",
  Global: "Global",
};

/**
 * All event categories
 * Used for filter dropdowns and category-based styling
 * 
 * These match the Zod schema enum in shared/schema.ts
 */
export const ECON_CATEGORIES = [
  "Inflation",
  "Employment",
  "GDP",
  "Rates",
  "Earnings",
  "Other",
] as const;

/**
 * Human-readable category labels with descriptions
 */
export const ECON_CATEGORY_LABELS: Record<typeof ECON_CATEGORIES[number], { label: string; description: string }> = {
  Inflation: {
    label: "Inflation",
    description: "CPI, PPI, PCE price indices",
  },
  Employment: {
    label: "Employment",
    description: "NFP, Jobless Claims, Unemployment Rate",
  },
  GDP: {
    label: "GDP",
    description: "GDP Growth, GDP Deflator",
  },
  Rates: {
    label: "Interest Rates",
    description: "FOMC, ECB, BoE rate decisions",
  },
  Earnings: {
    label: "Earnings",
    description: "Crypto company earnings reports",
  },
  Other: {
    label: "Other",
    description: "PMI, Retail Sales, Regulatory events",
  },
};

/**
 * Event importance levels
 * Used for filter toggles and badge styling
 * 
 * These match the Zod schema enum in shared/schema.ts
 */
export const ECON_IMPORTANCE_LEVELS = [
  "High",
  "Medium",
  "Low",
] as const;

/**
 * Importance level colors for badge styling
 */
export const ECON_IMPORTANCE_COLORS: Record<typeof ECON_IMPORTANCE_LEVELS[number], string> = {
  High: "destructive",      // Red/critical (uses shadcn destructive variant)
  Medium: "default",        // Gold/primary (uses shadcn default variant)
  Low: "secondary",         // Gray/muted (uses shadcn secondary variant)
};

/**
 * Get color class for impact score badge
 * Impact scores range from 0-100
 * 
 * @param score - Impact score (0-100)
 * @returns Tailwind color classes for background and text
 */
export function getImpactScoreColor(score: number): string {
  if (score >= 80) {
    return "bg-red-900/50 text-red-300 border-red-800"; // Critical impact
  } else if (score >= 60) {
    return "bg-orange-900/50 text-orange-300 border-orange-800"; // High impact
  } else if (score >= 40) {
    return "bg-yellow-900/50 text-yellow-300 border-yellow-800"; // Moderate impact
  } else if (score >= 20) {
    return "bg-blue-900/50 text-blue-300 border-blue-800"; // Low impact
  } else {
    return "bg-muted text-muted-foreground border-border"; // Minimal impact
  }
}

/**
 * Get color class for confidence badge
 * Confidence ranges from 0-100%
 * 
 * @param confidence - Confidence percentage (0-100)
 * @returns Tailwind color classes for background and text
 */
export function getConfidenceColor(confidence: number): string {
  if (confidence >= 85) {
    return "bg-primary/20 text-primary border-primary/40"; // High confidence (gold)
  } else if (confidence >= 70) {
    return "bg-primary/10 text-primary/80 border-primary/30"; // Medium-high confidence
  } else if (confidence >= 50) {
    return "bg-muted text-muted-foreground border-border"; // Medium confidence
  } else {
    return "bg-destructive/10 text-destructive border-destructive/30"; // Low confidence
  }
}

/**
 * Get country flag emoji
 * 
 * @param countryCode - ISO country code (US, EU, UK, CN, JP, SG, Global)
 * @returns Flag emoji or globe for Global
 */
export function getCountryFlag(countryCode: string): string {
  const flags: Record<string, string> = {
    US: "🇺🇸",
    EU: "🇪🇺",
    UK: "🇬🇧",
    CN: "🇨🇳",
    JP: "🇯🇵",
    SG: "🇸🇬",
    Global: "🌐",
  };
  return flags[countryCode] || "🌍";
}

/**
 * Format event date for display
 * 
 * @param dateString - ISO 8601 date string
 * @returns Formatted date string (e.g., "Jan 15, 2025 • 1:30 PM EST")
 */
export function formatEventDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    
    // Format: "Jan 15, 2025 • 1:30 PM EST"
    const dateFormatter = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    
    const timeFormatter = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    });
    
    return `${dateFormatter.format(date)} • ${timeFormatter.format(date)}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
}

/**
 * Check if event is in the past (already released)
 * 
 * @param dateString - ISO 8601 date string
 * @returns true if event date is in the past
 */
export function isEventPast(dateString: string): boolean {
  try {
    const eventDate = new Date(dateString);
    const now = new Date();
    return eventDate < now;
  } catch (error) {
    return false;
  }
}

/**
 * Get relative time label for event
 * 
 * @param dateString - ISO 8601 date string
 * @returns Relative time string (e.g., "2 days ago", "in 5 hours")
 */
export function getRelativeTime(dateString: string): string {
  try {
    const eventDate = new Date(dateString);
    const now = new Date();
    const diffMs = eventDate.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays < -7) {
      return `${Math.abs(diffDays)} days ago`;
    } else if (diffDays < 0) {
      return `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} ago`;
    } else if (diffDays === 0 && diffHours < 0) {
      return `${Math.abs(diffHours)} hour${Math.abs(diffHours) !== 1 ? 's' : ''} ago`;
    } else if (diffDays === 0 && diffHours >= 0) {
      return diffHours === 0 ? 'Now' : `in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    } else if (diffDays <= 7) {
      return `in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    } else {
      return `in ${diffDays} days`;
    }
  } catch (error) {
    return '';
  }
}
