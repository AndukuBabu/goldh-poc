/**
 * Guru & Insider Digest Updater
 * 
 * Fetches live crypto news from RSS feeds (CoinDesk, Cointelegraph),
 * and stores the results in Firebase Firestore under the guruDigest collection.
 * 
 * Usage:
 *   tsx server/updateGuruDigest.ts           # Add new articles
 *   tsx server/updateGuruDigest.ts --clear   # Clear old entries first
 * 
 * Note: Uses client-side Firebase SDK for compatibility with Replit environment
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { XMLParser } from 'fast-xml-parser';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Validate required environment variables
const requiredEnvVars = [
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_APP_ID'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * RSS Feed Sources
 */
const RSS_FEEDS = [
  'https://www.coindesk.com/arc/outboundfeeds/rss/',
  'https://cointelegraph.com/rss'
];

/**
 * Hugging Face API Configuration
 */
const HF_MODEL_URL = 'https://api-inference.huggingface.co/models/facebook/bart-large-cnn';

/**
 * RSS Feed Item
 */
interface RSSItem {
  title: string;
  link: string;
  description: string;
}

/**
 * Guru Digest Entry (stored in Firestore)
 */
interface GuruDigestEntry {
  title: string;
  summary: string;
  link: string;
  date: string;
}

/**
 * Clear all existing entries from the guruDigest collection
 * Use this to remove mock data or old entries before fetching new ones
 */
export async function clearGuruDigest(): Promise<void> {
  console.log('🧹 Clearing existing Guru Digest entries...');
  
  try {
    const querySnapshot = await getDocs(collection(db, 'guruDigest'));
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    console.log(`✅ Deleted ${querySnapshot.docs.length} existing entries`);
  } catch (error) {
    console.error('❌ Error clearing collection:', error);
    throw error;
  }
}

/**
 * Main function to update Guru Digest with latest news
 * 
 * NOTE: Currently using article description excerpts instead of AI summarization
 * for immediate data availability. AI summarization can be re-enabled later.
 */
export async function updateGuruDigest(clearFirst: boolean = false): Promise<void> {
  console.log('🚀 Starting Guru Digest update...');
  console.log('📝 Using article excerpts (AI summarization disabled for now)');

  // Clear old entries if requested
  if (clearFirst) {
    await clearGuruDigest();
  }

  let totalArticles = 0;
  let successfulEntries = 0;

  for (const feedUrl of RSS_FEEDS) {
    console.log(`\n📡 Fetching RSS feed: ${feedUrl}`);
    
    try {
      const response = await fetch(feedUrl);
      if (!response.ok) {
        console.error(`❌ Failed to fetch ${feedUrl}: ${response.statusText}`);
        continue;
      }

      const xml = await response.text();
      const items = extractItemsFromXML(xml);
      console.log(`✅ Found ${items.length} articles`);

      for (const item of items) {
        totalArticles++;
        console.log(`\n📰 Processing: ${item.title.substring(0, 60)}...`);
        
        try {
          // Create summary from description (skip AI for now)
          const summary = createExcerpt(item.description);
          
          if (!summary) {
            console.warn(`⚠️  No description available, skipping article`);
            continue;
          }

          // Store in Firestore
          const entry: GuruDigestEntry = {
            title: item.title,
            summary,
            link: item.link,
            date: new Date().toISOString(),
          };

          await addDoc(collection(db, 'guruDigest'), entry);
          successfulEntries++;
          console.log(`✅ Saved to Firestore`);
        } catch (error) {
          console.error(`❌ Error processing article:`, error);
        }
      }
    } catch (error) {
      console.error(`❌ Error fetching feed ${feedUrl}:`, error);
    }
  }

  console.log(`\n✨ Update complete!`);
  console.log(`   Total articles processed: ${totalArticles}`);
  console.log(`   Successfully saved: ${successfulEntries}`);
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
function createExcerpt(text: string): string {
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
 * Summarize text using Hugging Face's BART model
 * 
 * NOTE: Currently disabled - using createExcerpt() instead for immediate data.
 * This function remains for future re-enablement of AI summarization.
 * 
 * Includes retry logic for handling cold starts and temporary API issues.
 * The Hugging Face Inference API may take 10-20s to load models on cold start.
 * 
 * @param text - Text to summarize (article description)
 * @param apiKey - Hugging Face API key
 * @returns Summarized text
 */
async function summarizeText(text: string, apiKey: string): Promise<string> {
  if (!text || text.trim().length === 0) {
    return '';
  }

  const MAX_RETRIES = 3;
  const RETRY_DELAYS = [2000, 5000, 10000]; // 2s, 5s, 10s

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(HF_MODEL_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          inputs: text.substring(0, 1024), // Limit to 1024 tokens (model constraint)
          parameters: {
            max_length: 130,
            min_length: 30,
            do_sample: false
          }
        }),
      });

      if (response.ok) {
        const data = await response.json() as Array<{ summary_text?: string }>;
        return data[0]?.summary_text || '';
      }

      // Handle specific error codes
      if (response.status === 503) {
        // Model is loading (cold start)
        console.warn(`⏳ Model loading (attempt ${attempt + 1}/${MAX_RETRIES})...`);
        if (attempt < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS[attempt]));
          continue;
        }
      } else if (response.status === 410) {
        // Model endpoint deprecated or moved
        console.error(`❌ Model endpoint returned 410 Gone - please check Hugging Face model status`);
        return '';
      }

      console.error(`Hugging Face API error: ${response.status} ${response.statusText}`);
      return '';
    } catch (error) {
      console.error(`Error on attempt ${attempt + 1}:`, error);
      if (attempt < MAX_RETRIES - 1) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS[attempt]));
      }
    }
  }

  return '';
}

/**
 * Extract items from RSS XML
 * 
 * @param xml - Raw RSS XML string
 * @returns Array of RSS items
 */
function extractItemsFromXML(xml: string): RSSItem[] {
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
 * CLI Entry Point
 * 
 * Usage:
 *   tsx server/updateGuruDigest.ts           # Add new articles (keeps existing)
 *   tsx server/updateGuruDigest.ts --clear   # Clear old entries first, then add new
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const clearFirst = process.argv.includes('--clear');
  
  updateGuruDigest(clearFirst)
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}
