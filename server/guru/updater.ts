/**
 * Guru Digest Updater
 * 
 * Main update function for Guru Digest.
 * Fetches RSS feeds, processes articles, and stores in Firestore.
 * 
 * Can be called:
 * - From CLI script (updateGuruDigest.ts)
 * - From scheduler (scheduler.ts)
 * - Manually via API endpoint (future)
 */

import { fetchAllRSSFeeds, createExcerpt, type GuruDigestEntry } from './lib/rss';
import { clearGuruDigest, addGuruDigestEntries } from './lib/firestore';

/**
 * Update Guru Digest Options
 */
export interface UpdateGuruDigestOptions {
  /** Clear old entries before adding new ones */
  clearFirst?: boolean;
  /** Log prefix for console output */
  logPrefix?: string;
}

/**
 * Update Guru Digest with Latest News
 * 
 * Fetches articles from RSS feeds and stores them in Firestore.
 * 
 * Flow:
 * 1. Optionally clear old entries
 * 2. Fetch RSS feeds from all sources
 * 3. Process articles (create excerpts)
 * 4. Store in Firestore
 * 5. Return statistics
 * 
 * @param options - Update options
 * @returns Statistics about the update
 */
export async function updateGuruDigest(
  options: UpdateGuruDigestOptions = {}
): Promise<{ totalArticles: number; successfulEntries: number; deletedEntries: number }> {
  const { clearFirst = false, logPrefix = '[Guru]' } = options;
  
  console.log(`${logPrefix} Starting update...`);
  
  let deletedEntries = 0;
  
  // Clear old entries if requested
  if (clearFirst) {
    console.log(`${logPrefix} Clearing existing entries...`);
    deletedEntries = await clearGuruDigest();
    console.log(`${logPrefix} Deleted ${deletedEntries} existing entries`);
  }
  
  // Fetch RSS feeds
  console.log(`${logPrefix} Fetching RSS feeds...`);
  const items = await fetchAllRSSFeeds();
  const totalArticles = items.length;
  console.log(`${logPrefix} Found ${totalArticles} articles`);
  
  // Process articles
  const entries: GuruDigestEntry[] = [];
  
  for (const item of items) {
    // Create summary from description
    const summary = createExcerpt(item.description);
    
    if (!summary) {
      console.warn(`${logPrefix} No description for: ${item.title.substring(0, 60)}...`);
      continue;
    }
    
    // Create entry
    const entry: GuruDigestEntry = {
      title: item.title,
      summary,
      link: item.link,
      date: new Date().toISOString(),
    };
    
    entries.push(entry);
  }
  
  // Store in Firestore
  console.log(`${logPrefix} Storing ${entries.length} entries in Firestore...`);
  const successfulEntries = await addGuruDigestEntries(entries);
  
  console.log(`${logPrefix} Update complete!`);
  console.log(`${logPrefix}   Total articles: ${totalArticles}`);
  console.log(`${logPrefix}   Successfully saved: ${successfulEntries}`);
  if (clearFirst) {
    console.log(`${logPrefix}   Deleted old entries: ${deletedEntries}`);
  }
  
  return {
    totalArticles,
    successfulEntries,
    deletedEntries,
  };
}
