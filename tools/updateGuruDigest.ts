/**
 * Guru & Insider Digest Updater - CLI Script
 * 
 * Fetches live crypto news from RSS feeds (CoinDesk, Cointelegraph),
 * and stores the results in Firebase Firestore under the guruDigest collection.
 * 
 * Usage:
 *   tsx server/updateGuruDigest.ts           # Add new articles
 *   tsx server/updateGuruDigest.ts --clear   # Clear old entries first
 * 
 * Note: Uses modular updater functions from server/guru/updater.ts
 */

import { updateGuruDigest } from './guru/updater';

/**
 * CLI Entry Point
 * 
 * Usage:
 *   tsx server/updateGuruDigest.ts           # Add new articles (keeps existing)
 *   tsx server/updateGuruDigest.ts --clear   # Clear old entries first, then add new
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const clearFirst = process.argv.includes('--clear');
  
  updateGuruDigest({ 
    clearFirst,
    logPrefix: '[CLI]'
  })
    .then((result) => {
      console.log('\n✅ Script completed successfully');
      console.log(`   Total articles: ${result.totalArticles}`);
      console.log(`   Successfully saved: ${result.successfulEntries}`);
      if (clearFirst) {
        console.log(`   Deleted old entries: ${result.deletedEntries}`);
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}
