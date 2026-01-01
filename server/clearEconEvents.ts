/**
 * Clear Economic Calendar Events - CLI Script
 * 
 * Deletes ALL events from the econEvents collection in Firestore.
 * Use this to clean up duplicate data before re-uploading.
 * 
 * Usage:
 *   tsx server/clearEconEvents.ts
 */

import { db } from './firebase';

async function clearAllEconEvents() {
  console.log('\n🗑️  Starting Economic Calendar cleanup...\n');

  try {
    const snapshot = await db.collection('econEvents').get();

    console.log(`📊 Found ${snapshot.size} events to delete`);

    if (snapshot.empty) {
      console.log('✅ No events to delete');
      return { deleted: 0 };
    }

    let deletedCount = 0;
    const batch = db.batch();

    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
      deletedCount++;
    });

    await batch.commit();

    console.log(`\n✅ Successfully deleted ${deletedCount} events\n`);
    return { deleted: deletedCount };
  } catch (error) {
    console.error('\n❌ Failed to clear events:', error);
    throw error;
  }
}

// CLI Entry Point
if (import.meta.url === `file://${process.argv[1]}`) {
  clearAllEconEvents()
    .then((result) => {
      console.log('✅ Cleanup completed successfully');
      console.log(`   Deleted: ${result.deleted} events`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Cleanup failed:', error);
      process.exit(1);
    });
}
