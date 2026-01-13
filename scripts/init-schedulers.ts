import admin from 'firebase-admin';

// Initialize Firebase Admin
// This will use applicationDefault() which works with GOOGLE_APPLICATION_CREDENTIALS
// or FIRESTORE_EMULATOR_HOST.
if (admin.apps.length === 0) {
    if (process.env.FIRESTORE_EMULATOR_HOST) {
        admin.initializeApp({ projectId: 'demo-project' });
    } else {
        admin.initializeApp();
    }
}

const db = admin.firestore();

async function init() {
    console.log('--- Initializing Schedulers ---');

    const schedulers = ['umf', 'guru'];

    for (const id of schedulers) {
        const ref = db.collection('scheduler_control').doc(id);

        console.log(`[${id}] Force-initializing control record to ENABLED...`);
        await ref.set({
            enabled: true,
            status: 'ready',
            last_run_timestamp: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
    }

    console.log('--- Done ---');
    process.exit(0);
}

init().catch(err => {
    console.error('Failed:', err);
    process.exit(1);
});
