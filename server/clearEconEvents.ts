/**
 * Clear Economic Calendar Events - CLI Script
 * 
 * Deletes ALL events from the econEvents collection in Firestore.
 * Use this to clean up duplicate data before re-uploading.
 * 
 * Usage:
 *   tsx server/clearEconEvents.ts
 */

import { collection, getDocs, deleteDoc } from 'firebase/firestore';
import { getDb } from './guru/lib/firebase';

async function clearAllEconEvents() {
  console.log('\n🗑️  Starting Economic Calendar cleanup...\n');
  
  try {
    const db = getDb();
    const econEventsRef = collection(db, 'econEvents');
    const snapshot = await getDocs(econEventsRef);
    
    console.log(`📊 Found ${snapshot.size} events to delete`);
    
    if (snapshot.empty) {
      console.log('✅ No events to delete');
      return { deleted: 0 };
    }
    
    let deletedCount = 0;
    const deletePromises = snapshot.docs.map(async (doc) => {
      await deleteDoc(doc.ref);
      deletedCount++;
      if (deletedCount % 50 === 0) {
        console.log(`   Deleted ${deletedCount}/${snapshot.size} events...`);
      }
    });
    
    await Promise.all(deletePromises);
    
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
