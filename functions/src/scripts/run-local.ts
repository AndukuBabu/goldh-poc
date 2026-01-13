import { runUmfLogic, runGuruLogic } from '../index';
import * as admin from 'firebase-admin';

// Initialize Admin SDK - this will use GOOG_APPLICATION_CREDENTIALS or default to local emulator if configured
if (admin.apps.length === 0) {
    if (process.env.FIRESTORE_EMULATOR_HOST) {
        console.log(`[LocalRunner] Using Emulator: ${process.env.FIRESTORE_EMULATOR_HOST}`);
        admin.initializeApp({ projectId: 'demo-project' });
    } else {
        // Attempt to use default creds (requires successful `gcloud auth application-default login` OR `firebase login`)
        console.log(`[LocalRunner] Using Default Credentials (Production/Project)`);
        admin.initializeApp();
    }
}

const run = async () => {
    const target = process.argv[2]; // 'umf' or 'guru'
    const isManual = process.argv.includes('--manual');

    console.log(`[LocalRunner] Starting ${target || 'umf'}... (Manual Mode: ${isManual})`);

    try {
        if (target === 'guru') {
            await runGuruLogic(isManual);
        } else {
            // Default to umf
            await runUmfLogic(isManual);
        }
        console.log('[LocalRunner] Completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('[LocalRunner] Failed:', error);
        process.exit(1);
    }
};

run();
