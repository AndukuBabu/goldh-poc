/**
 * Economic Calendar TanStack Query Hooks
 * 
 * Provides React hooks for fetching and managing economic event data
 * with client-side caching, automatic refetching, and memoized selectors.
 * 
 * MVP: Uses Firestore via getEconEventsMock()
 * Future: Will automatically use /api/econ/events when backend is ready
 * 
 * @see client/src/lib/econ.ts for data fetching implementation
 */

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getEconEventsMock, type EconEventFilters } from "@/lib/econ";
import type { EconEvent } from "@shared/schema";

/**
 * Parameters for useEconEvents hook
 * Extends EconEventFilters with query-specific options
 */
export interface UseEconEventsParams extends Omit<EconEventFilters, 'from' | 'to'> {
  /** Start date (ISO string or Date) - defaults to now */
  from?: string | Date;
  /** End date (ISO string or Date) - defaults to now + 14 days */
  to?: string | Date;
  /** Enable/disable query (default: true) */
  enabled?: boolean;
}

/**
 * Get default date range for economic events
 * Default: Today (00:00 UTC) to 14 days from now (23:59 UTC)
 * 
 * @returns { from: Date, to: Date } - Default date range in UTC
 */
function getDefaultDateRange(): { from: Date; to: Date } {
  const now = new Date();
  
  // Start from today at 00:00 UTC
  const from = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    0, 0, 0, 0
  ));
  
  // End at 14 days from now at 23:59 UTC
  const to = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 14,
    23, 59, 59, 999
  ));
  
  return { from, to };
}

/**
 * Fetch economic events with TanStack Query
 * 
 * Features:
 * - Automatic caching (5 min stale time, 10 min gc time)
 * - Default 14-day window from today
 * - Memoized selectors for derived data
 * - Type-safe query key for cache invalidation
 * 
 * @param params - Optional filters and date range
 * @returns TanStack Query result with events and loading states
 * 
 * @example
 * ```typescript
 * // Default 14-day window
 * const { data: events, isLoading } = useEconEvents();
 * 
 * // Custom date range
 * const { data: events } = useEconEvents({
 *   from: '2025-01-01',
 *   to: '2025-01-31'
 * });
 * 
 * // With filters
 * const { data: events } = useEconEvents({
 *   country: ['US', 'EU'],
 *   category: ['Inflation'],
 *   importance: ['High']
 * });
 * 
 * // Access memoized selectors
 * const { regions, categories, counts } = useEconEventSelectors(events);
 * ```
 * 
 * Future Migration:
 * When /api/econ/events endpoint is ready, this hook will automatically
 * use TanStack Query's default fetcher instead of getEconEventsMock.
 * No changes needed in components consuming this hook.
 */
export function useEconEvents(params: UseEconEventsParams = {}) {
  // Get default date range if not provided
  const defaultRange = useMemo(() => getDefaultDateRange(), []);
  
  // Normalize params with defaults
  const normalizedParams: EconEventFilters = useMemo(() => {
    const from = params.from || defaultRange.from;
    const to = params.to || defaultRange.to;
    
    return {
      from: typeof from === 'string' ? from : from.toISOString(),
      to: typeof to === 'string' ? to : to.toISOString(),
      country: params.country,
      category: params.category,
      importance: params.importance,
      status: params.status,
    };
  }, [
    params.from,
    params.to,
    params.country,
    params.category,
    params.importance,
    params.status,
    defaultRange,
  ]);

  return useQuery({
    // Query key includes params for automatic cache segmentation
    // When params change, query refetches automatically
    queryKey: ['/features/calendar', normalizedParams],
    
    // Query function: fetch from Firestore (MVP) or API (Phase 2)
    queryFn: async () => {
      const events = await getEconEventsMock(normalizedParams);
      return events;
    },
    
    // Cache configuration
    staleTime: 5 * 60 * 1000,    // 5 minutes (data stays fresh)
    gcTime: 10 * 60 * 1000,      // 10 minutes (garbage collection)
    
    // Enable/disable query
    enabled: params.enabled !== false,
    
    // Retry configuration
    retry: 2,                     // Retry failed queries twice
    retryDelay: 1000,            // 1 second between retries
  });
}

/**
 * Memoized selectors for economic events
 * Provides derived data from events array without recomputation
 * 
 * @param events - Array of economic events (from useEconEvents)
 * @returns Memoized selectors for regions, categories, and counts
 * 
 * @example
 * ```typescript
 * const { data: events } = useEconEvents();
 * const { regions, categories, importanceCounts } = useEconEventSelectors(events);
 * 
 * console.log(regions);           // ['US', 'EU', 'UK']
 * console.log(categories);        // ['Inflation', 'Employment']
 * console.log(importanceCounts);  // { High: 12, Medium: 8, Low: 5 }
 * ```
 */
export function useEconEventSelectors(events?: EconEvent[]) {
  // Get unique regions/countries present in events
  const regions = useMemo(() => {
    if (!events || events.length === 0) return [];
    
    const uniqueRegions = new Set(events.map(e => e.country));
    return Array.from(uniqueRegions).sort();
  }, [events]);

  // Get unique categories present in events
  const categories = useMemo(() => {
    if (!events || events.length === 0) return [];
    
    const uniqueCategories = new Set(events.map(e => e.category));
    return Array.from(uniqueCategories).sort();
  }, [events]);

  // Count events by importance level
  const importanceCounts = useMemo(() => {
    if (!events || events.length === 0) {
      return { High: 0, Medium: 0, Low: 0 };
    }
    
    return events.reduce((acc, event) => {
      acc[event.importance] = (acc[event.importance] || 0) + 1;
      return acc;
    }, {} as Record<'High' | 'Medium' | 'Low', number>);
  }, [events]);

  // Count events by category
  const categoryCounts = useMemo(() => {
    if (!events || events.length === 0) return {};
    
    return events.reduce((acc, event) => {
      acc[event.category] = (acc[event.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [events]);

  // Count events by region/country
  const regionCounts = useMemo(() => {
    if (!events || events.length === 0) return {};
    
    return events.reduce((acc, event) => {
      acc[event.country] = (acc[event.country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [events]);

  // Count events by status (upcoming vs released)
  const statusCounts = useMemo(() => {
    if (!events || events.length === 0) {
      return { upcoming: 0, released: 0 };
    }
    
    return events.reduce((acc, event) => {
      acc[event.status] = (acc[event.status] || 0) + 1;
      return acc;
    }, { upcoming: 0, released: 0 });
  }, [events]);

  // Get high-impact events (impact score >= 70)
  const highImpactEvents = useMemo(() => {
    if (!events || events.length === 0) return [];
    
    return events.filter(e => e.impactScore >= 70);
  }, [events]);

  // Get upcoming events only
  const upcomingEvents = useMemo(() => {
    if (!events || events.length === 0) return [];
    
    return events.filter(e => e.status === 'upcoming');
  }, [events]);

  // Get released events only
  const releasedEvents = useMemo(() => {
    if (!events || events.length === 0) return [];
    
    return events.filter(e => e.status === 'released');
  }, [events]);

  // Total event count
  const totalCount = events?.length || 0;

  return {
    // Unique values (for filter dropdowns)
    regions,
    categories,
    
    // Count aggregations
    importanceCounts,
    categoryCounts,
    regionCounts,
    statusCounts,
    totalCount,
    
    // Filtered subsets
    highImpactEvents,
    upcomingEvents,
    releasedEvents,
  };
}

/**
 * Get events for a specific date
 * Useful for calendar grid views
 * 
 * @param events - Array of economic events
 * @param date - Target date (ISO string or Date)
 * @returns Events occurring on the specified date
 */
export function useEventsForDate(events: EconEvent[] | undefined, date: string | Date) {
  return useMemo(() => {
    if (!events || events.length === 0) return [];
    
    const targetDate = typeof date === 'string' ? new Date(date) : date;
    const targetDateStr = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD
    
    return events.filter(event => {
      const eventDateStr = event.datetime_utc.split('T')[0];
      return eventDateStr === targetDateStr;
    });
  }, [events, date]);
}

/**
 * Group events by date
 * Returns a map of date strings to events on that date
 * 
 * @param events - Array of economic events
 * @returns Map of date (YYYY-MM-DD) to events
 */
export function useEventsByDate(events?: EconEvent[]) {
  return useMemo(() => {
    if (!events || events.length === 0) return new Map<string, EconEvent[]>();
    
    const grouped = new Map<string, EconEvent[]>();
    
    events.forEach(event => {
      const dateKey = event.datetime_utc.split('T')[0]; // YYYY-MM-DD
      
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      
      grouped.get(dateKey)!.push(event);
    });
    
    // Sort events within each date by time
    grouped.forEach((dateEvents) => {
      dateEvents.sort((a, b) => 
        new Date(a.datetime_utc).getTime() - new Date(b.datetime_utc).getTime()
      );
    });
    
    return grouped;
  }, [events]);
}
