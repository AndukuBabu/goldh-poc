/**
 * Guru & Insider Digest Updater
 * 
 * Fetches live crypto news from RSS feeds (CoinDesk, Cointelegraph),
 * summarizes each article using Hugging Face's facebook/bart-large-cnn model,
 * and stores the results in Firebase Firestore under the guruDigest collection.
 * 
 * Usage:
 *   tsx server/updateGuruDigest.ts
 * 
 * Environment Variables:
 *   HUGGINGFACE_API_KEY - Required for AI summarization
 */

import { XMLParser } from 'fast-xml-parser';
import { db } from './firebase.js';

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
 * Main function to update Guru Digest with latest news
 */
export async function updateGuruDigest(): Promise<void> {
  console.log('🚀 Starting Guru Digest update...');
  
  const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
  if (!HUGGINGFACE_API_KEY) {
    throw new Error('HUGGINGFACE_API_KEY is not set in environment variables.');
  }

  let totalArticles = 0;
  let successfulSummaries = 0;

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
          // Summarize the article
          const summary = await summarizeText(item.description, HUGGINGFACE_API_KEY);
          
          if (!summary) {
            console.warn(`⚠️  Empty summary received, skipping article`);
            continue;
          }

          // Store in Firestore
          const entry: GuruDigestEntry = {
            title: item.title,
            summary,
            link: item.link,
            date: new Date().toISOString(),
          };

          await db.collection('guruDigest').add(entry);
          successfulSummaries++;
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
  console.log(`   Successfully summarized: ${successfulSummaries}`);
}

/**
 * Summarize text using Hugging Face's BART model
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
 * Run this script directly with: tsx server/updateGuruDigest.ts
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  updateGuruDigest()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}
