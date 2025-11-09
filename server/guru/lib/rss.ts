/**
 * RSS Feed Fetcher for Guru Digest
 * 
 * Fetches and parses RSS feeds from crypto news sources.
 * Supports both RSS 2.0 and Atom feed formats.
 */

import { XMLParser } from 'fast-xml-parser';

/**
 * RSS Feed Sources
 */
export const RSS_FEEDS = [
  'https://www.coindesk.com/arc/outboundfeeds/rss/',
  'https://cointelegraph.com/rss'
];

/**
 * RSS Feed Item
 */
export interface RSSItem {
  title: string;
  link: string;
  description: string;
}

/**
 * Guru Digest Entry (stored in Firestore)
 */
export interface GuruDigestEntry {
  title: string;
  summary: string;
  link: string;
  date: string;
  assets: string[]; // Canonical asset symbols (e.g., ['BTC', 'ETH'])
}

/**
 * Extract items from RSS XML
 * 
 * Parses RSS/Atom XML and extracts article items.
 * Handles both RSS 2.0 (item) and Atom (entry) formats.
 * 
 * @param xml - Raw RSS XML string
 * @returns Array of RSS items
 */
export function extractItemsFromXML(xml: string): RSSItem[] {
  const parser = new XMLParser();
  const parsed = parser.parse(xml);
  
  // Handle both RSS 2.0 and Atom feeds
  const items = parsed.rss?.channel?.item || parsed.feed?.entry || [];
  
  if (!Array.isArray(items)) {
    return [items].filter(Boolean);
  }

  return items.map((entry: any) => ({
    title: entry.title || 'Untitled',
    link: entry.link?.href || entry.link || '',
    description: entry.description || entry.summary || entry.content || '',
  }));
}

/**
 * Create excerpt from article description
 * 
 * Extracts the first ~300 characters of meaningful text from the description,
 * stripping HTML tags and ensuring clean sentence breaks.
 * 
 * @param text - Article description or content
 * @returns Excerpt string (max ~300 chars)
 */
export function createExcerpt(text: string): string {
  if (!text || text.trim().length === 0) {
    return '';
  }

  // Strip HTML tags
  let clean = text.replace(/<[^>]*>/g, ' ');
  
  // Normalize whitespace
  clean = clean.replace(/\s+/g, ' ').trim();
  
  // Limit to ~300 characters, breaking at sentence or word boundary
  const maxLength = 300;
  if (clean.length <= maxLength) {
    return clean;
  }
  
  // Try to break at sentence end
  const sentenceEnd = clean.substring(0, maxLength).lastIndexOf('. ');
  if (sentenceEnd > 200) {
    return clean.substring(0, sentenceEnd + 1);
  }
  
  // Otherwise break at last space
  const lastSpace = clean.substring(0, maxLength).lastIndexOf(' ');
  return clean.substring(0, lastSpace > 0 ? lastSpace : maxLength) + '...';
}

/**
 * Fetch RSS Feed
 * 
 * Fetches and parses a single RSS feed URL.
 * Returns empty array on error (fails gracefully).
 * 
 * @param feedUrl - RSS feed URL
 * @returns Array of RSS items (empty on error)
 */
export async function fetchRSSFeed(feedUrl: string): Promise<RSSItem[]> {
  try {
    const response = await fetch(feedUrl);
    
    if (!response.ok) {
      console.error(`[Guru] Failed to fetch ${feedUrl}: ${response.statusText}`);
      return [];
    }

    const xml = await response.text();
    const items = extractItemsFromXML(xml);
    
    return items;
  } catch (error) {
    console.error(`[Guru] Error fetching feed ${feedUrl}:`, error);
    return [];
  }
}

/**
 * Fetch All RSS Feeds
 * 
 * Fetches and combines articles from all configured RSS feeds.
 * Continues fetching even if individual feeds fail.
 * 
 * @returns Array of all RSS items from all feeds
 */
export async function fetchAllRSSFeeds(): Promise<RSSItem[]> {
  const allItems: RSSItem[] = [];
  
  for (const feedUrl of RSS_FEEDS) {
    const items = await fetchRSSFeed(feedUrl);
    allItems.push(...items);
  }
  
  return allItems;
}
