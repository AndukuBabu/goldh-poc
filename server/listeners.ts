import { db } from './firebase';
import { setFresh } from './umf/lib/cache';
import { umfSnapshotLiveSchema } from '@shared/schema';
import { CACHE_TTL_S } from './umf/config';

export async function setupCacheListeners() {
    console.log('[Cache] Initializing Firestore listeners...');

    // UMF Listener
    // We wrap this in a promise to wait for the FIRST snapshot (Hydration)
    // before resolving, so the server starts with fresh data.
    // If we don't wait, the first few requests might be slow (fallback to Firestore)
    // or return empty if Firestore is unreachable.
    // We timeout after 5 seconds to prevent blocking boot forever.

    let umfUnsubscribe: (() => void) | null = null;
    let retryDelay = 5000;

    async function startUmfListener(safeResolve: () => void) {
        if (umfUnsubscribe) {
            umfUnsubscribe();
        }

        umfUnsubscribe = db.collection('umf_snapshot_live').doc('latest')
            .onSnapshot(
                (doc) => {
                    if (!doc.exists) {
                        console.warn('[Cache] UMF snapshot missing in Firestore.');
                        safeResolve();
                        return;
                    }

                    try {
                        const data = doc.data();
                        const snapshot = umfSnapshotLiveSchema.parse(data);
                        setFresh('umf:snapshot', snapshot, CACHE_TTL_S);
                        console.log(`[Cache] UMF updated: ${snapshot.assets.length} assets, TS: ${snapshot.timestamp_utc}`);

                        // Reset retry delay on success
                        retryDelay = 5000;
                        safeResolve();
                    } catch (error) {
                        console.error('[Cache] Failed to parse UMF snapshot:', error);
                        safeResolve();
                    }
                },
                (error) => {
                    console.error('[Cache] Firestore listener error:', error);

                    // If it's a backoff error or connection drop, attempt to reconnect after delay
                    console.log(`[Cache] Re-establishing listener in ${retryDelay / 1000}s...`);
                    setTimeout(() => {
                        startUmfListener(safeResolve);
                        // Exponential backoff up to 1 minute
                        retryDelay = Math.min(retryDelay * 2, 60000);
                    }, retryDelay);

                    safeResolve();
                }
            );
    }

    await new Promise<void>((resolve) => {
        let resolved = false;
        const safeResolve = () => {
            if (!resolved) {
                resolved = true;
                resolve();
            }
        };

        // Timeout safety for hydration
        setTimeout(() => {
            if (!resolved) {
                console.warn('[Cache] UMF listener hydration timed out (5s). Continuing without wait.');
                safeResolve();
            }
        }, 5000);

        startUmfListener(safeResolve);
    });

    console.log('[Cache] Listeners initialized.');
}
