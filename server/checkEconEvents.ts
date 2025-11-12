import { collection, getDocs } from 'firebase/firestore';
import { getDb } from './guru/lib/firebase';

async function checkEvents() {
  const db = getDb();
  const snapshot = await getDocs(collection(db, 'econEvents'));
  console.log('Total events in Firestore:', snapshot.size);

  // Group by date to see distribution
  const dateMap = new Map();
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    const date = data.date ? data.date.split('T')[0] : 'no-date';
    dateMap.set(date, (dateMap.get(date) || 0) + 1);
  });

  console.log('\nEvents by date:');
  Array.from(dateMap.entries()).sort().forEach(([date, count]) => {
    console.log(`  ${date}: ${count} events`);
  });
  
  // Check the actual date range
  const dates = snapshot.docs
    .map(doc => doc.data().date)
    .filter(Boolean)
    .sort();
  console.log(`\nDate range: ${dates[0]} to ${dates[dates.length - 1]}`);
}

checkEvents().catch(console.error);
