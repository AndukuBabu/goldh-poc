import { Router, Request, Response } from "express";
import { requireAdmin } from "../middleware";
import { getAllGuruDigestWithIds, deleteGuruDigestEntry, addGuruDigestEntry } from "../guru/lib/firestore";
// import { updateGuruDigest } from "../guru/updater"; // Deleted
import { CANONICAL_SYMBOLS, extractAssetSymbols } from "@shared/constants";
import { econEventSchema } from "@shared/schema";
import { db } from "../firebase";
import admin from "firebase-admin";
// import { getSchedulerStatus as getUmfStatus, triggerTick as triggerUmfTick } from "../umf/scheduler"; // Deleted
// import { getGuruSchedulerStatus as getGuruStatus } from "../guru/scheduler"; // Deleted
import { integrationConfig, config } from "../config";
import { getFresh } from "../umf/lib/cache";
import { readLiveSnapshot, writeLiveSnapshot, appendHistorySnapshot, trimHistory } from "../umf/lib/firestoreUmf";
import { fetchTopCoinsByMarketCap } from '../umf/providers/coingecko';
import { updateGuruDigest } from '../guru/updater';
import { logSchedulerEvent, updateSchedulerStatus } from '../lib/schedulerUtils';

const router = Router();

// Helper to serialize Firestore timestamps to ISO strings
function serializeTimestamp(ts: any): string {
    if (!ts) return new Date().toISOString();

    // Handle rich Timestamp objects
    if (typeof ts.toDate === 'function') return ts.toDate().toISOString();

    // Handle plain emulator/JSON objects
    const seconds = ts._seconds ?? ts.seconds ?? ts.secondsValue;
    if (seconds !== undefined) return new Date(Number(seconds) * 1000).toISOString();

    // Handle strings
    if (typeof ts === 'string') {
        const d = new Date(ts);
        return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
    }

    // Fallback
    try {
        const d = new Date(ts);
        return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
    } catch {
        return new Date().toISOString();
    }
}

// Helper to get remote scheduler status from Firestore
async function getRemoteSchedulerStatus(schedulerId: string) {
    try {
        const doc = await db.collection("scheduler_control").doc(schedulerId).get();
        const data = doc.exists ? doc.data() : { enabled: true, status: "unknown" };

        // Also fetch recent logs
        let recentEvents: any[] = [];
        try {
            const logsSnapshot = await db.collection("scheduler_audit_log")
                .where("scheduler", "==", schedulerId)
                .orderBy("timestamp", "desc")
                .limit(10)
                .get();

            recentEvents = logsSnapshot.docs.map(d => {
                const docData = d.data();
                const ts = docData.timestamp || docData.created_at || docData.date;
                return {
                    message: docData.message || "No message",
                    type: docData.type || "info",
                    timestamp: serializeTimestamp(ts)
                };
            });
        } catch (queryError: any) {
            // Handle missing index error by sorting in memory as fallback
            if (queryError.message?.includes('requires an index') || queryError.code === 9) {
                console.warn(`[Admin] Index missing for scheduler_audit_log, falling back to in-memory sort.`);
                const fallbackSnapshot = await db.collection("scheduler_audit_log")
                    .where("scheduler", "==", schedulerId)
                    .get();

                recentEvents = fallbackSnapshot.docs
                    .map(d => {
                        const docData = d.data() as any;
                        const ts = docData.timestamp || docData.created_at || docData.date;
                        const isoStr = serializeTimestamp(ts);
                        return {
                            ...docData,
                            timestampStr: isoStr,
                            timestampMillis: new Date(isoStr).getTime()
                        };
                    })
                    .sort((a: any, b: any) => b.timestampMillis - a.timestampMillis)
                    .slice(0, 10)
                    .map(e => ({
                        message: e.message || "No message",
                        type: e.type || "info",
                        scheduler: e.scheduler || schedulerId,
                        timestamp: e.timestampStr
                    }));
            } else {
                throw queryError;
            }
        }

        return {
            ...data,
            recentEvents
        };
    } catch (e) {
        console.error(`[Admin] Error reading scheduler ${schedulerId}:`, e);
        return {
            enabled: false,
            status: "error",
            error: e instanceof Error ? e.message : String(e)
        };
    }
}

// Currency to Country Code mapping
function currencyToCountryCode(currencyCode: string): string {
    const mapping: Record<string, string> = {
        'USD': 'US', 'EUR': 'EU', 'GBP': 'UK', 'JPY': 'JP',
        'CNY': 'CN', 'CNH': 'CN', 'AUD': 'AU', 'CAD': 'CA',
        'CHF': 'CH', 'SGD': 'SG', 'NZD': 'NZ', 'HKD': 'HK',
        'KRW': 'KR', 'MXN': 'MX', 'BRL': 'BR', 'INR': 'IN',
        'RUB': 'RU', 'ZAR': 'ZA', 'TRY': 'TR', 'SEK': 'SE',
        'NOK': 'NO', 'DKK': 'DK', 'PLN': 'PL',
    };
    return mapping[currencyCode.toUpperCase()] || currencyCode;
}

// Applying requireAdmin to all routes in this router
router.use(requireAdmin);

router.get("/guru-digest", async (req: Request, res: Response) => {
    try {
        const entries = await getAllGuruDigestWithIds(100);
        res.json(entries);
    } catch (error) {
        console.error("[Admin] Failed to fetch GID entries:", error);
        res.status(500).json({ error: "Failed to fetch entries" });
    }
});

router.post("/guru-digest", async (req: Request, res: Response) => {
    try {
        const { title, summary, link, assets } = req.body;
        if (!title || !summary || !link) {
            return res.status(400).json({ error: "Title, summary, and link are required" });
        }

        let assetSymbols: string[] = [];
        if (assets && Array.isArray(assets)) {
            assetSymbols = assets.filter(symbol => CANONICAL_SYMBOLS.includes(symbol as any));
        } else if (typeof assets === 'string') {
            assetSymbols = extractAssetSymbols(assets);
        }

        const entryId = await addGuruDigestEntry({
            title: title.trim(),
            summary: summary.trim(),
            link: link.trim(),
            date: new Date().toISOString(),
            assets: assetSymbols,
        });

        res.status(201).json({ success: true, entryId, message: "Entry added successfully" });
    } catch (error) {
        console.error("[Admin] Failed to add GID entry:", error);
        res.status(500).json({ error: "Failed to add entry" });
    }
});

router.delete("/guru-digest/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await deleteGuruDigestEntry(id);
        res.json({ success: true, message: "Entry deleted successfully" });
    } catch (error) {
        console.error("[Admin] Failed to delete GID entry:", error);
        res.status(500).json({ error: "Failed to delete entry" });
    }
});

router.post("/guru-digest/refresh", async (req: Request, res: Response) => {
    try {
        // Run logic synchronously (client waits)
        await logSchedulerEvent('guru', 'info', `Manual refresh triggered by admin`);

        const result = await updateGuruDigest({
            clearFirst: req.body?.clearFirst || false,
            logPrefix: '[Admin Manual]',
        });

        await logSchedulerEvent('guru', 'success', `Manual refresh: ${result.successfulEntries} items`);
        await updateSchedulerStatus('guru', 'success', `manual_${Date.now()}`);

        res.json({ success: true, ...result, message: "News feed refreshed successfully" });
    } catch (error: any) {
        console.error("[Admin] Failed to refresh news:", error);
        await logSchedulerEvent('guru', 'error', `Manual refresh failed: ${error.message}`);
        res.status(500).json({ error: "Failed to refresh news feed" });
    }
});

router.post("/scheduler/toggle", async (req: Request, res: Response) => {
    try {
        const { schedulerId, enabled } = req.body;
        if (!schedulerId || typeof enabled !== 'boolean') {
            return res.status(400).json({ error: "schedulerId and enabled (boolean) are required" });
        }

        if (!['umf', 'guru'].includes(schedulerId)) {
            return res.status(400).json({ error: "Invalid schedulerId" });
        }

        await db.collection("scheduler_control").doc(schedulerId).set({
            enabled,
            updated_at: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        // Log the event
        await db.collection("scheduler_audit_log").add({
            scheduler: schedulerId,
            type: "info",
            message: `Automation ${enabled ? 'ENABLED' : 'DISABLED'} via Admin Dashboard`,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({ success: true, schedulerId, enabled, message: `Scheduler ${enabled ? 'started' : 'stopped'} successfully` });
    } catch (error: any) {
        console.error("[Admin] Failed to toggle scheduler:", error);
        res.status(500).json({ error: error.message });
    }
});

router.post("/umf/refresh", async (req: Request, res: Response) => {
    const runId = `manual_${Date.now()}`;
    try {
        await logSchedulerEvent('umf', 'info', `Manual refresh triggered by admin`, { runId });

        const apiKey = integrationConfig.coingecko.apiKey;
        const result = await fetchTopCoinsByMarketCap(100, apiKey);

        const snapshot = {
            timestamp_utc: result.timestamp_utc,
            assets: result.assets,
            degraded: false
        };

        // Write to Firestore
        await writeLiveSnapshot(snapshot);
        await appendHistorySnapshot(snapshot);
        const trimmed = await trimHistory(48); // Keep 48 hours

        const message = `Updated ${result.assets.length} assets. Trimmed ${trimmed} history docs.`;
        await logSchedulerEvent('umf', 'success', message, {
            items: result.assets.length,
            runId
        });
        await updateSchedulerStatus('umf', 'success', runId);

        res.json({ success: true, count: result.assets.length, message });
    } catch (error: any) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error(`[Admin] UMF Manual Failed: ${msg}`);
        await logSchedulerEvent('umf', 'error', `Manual run failed: ${msg}`, { error: msg });
        res.status(500).json({ error: msg });
    }
});

router.post("/econ-events/upload", async (req: Request, res: Response) => {
    try {
        const { events } = req.body;
        if (!Array.isArray(events) || events.length === 0) {
            return res.status(400).json({ error: "Invalid request: events array is required" });
        }

        const validatedEvents = events.map((event, index) => {
            const { id, ...eventData } = event as any;
            if (eventData.country) {
                eventData.country = currencyToCountryCode(eventData.country);
            }
            return econEventSchema.parse(eventData);
        });

        // Cleanup old events (2 months)
        const twoMonthsAgo = new Date();
        twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
        const cutoffDateISO = twoMonthsAgo.toISOString();

        const oldEventsSnapshot = await db.collection("econEvents")
            .where("date", "<", cutoffDateISO)
            .get();

        let deletedCount = 0;
        if (!oldEventsSnapshot.empty) {
            const batch = db.batch();
            oldEventsSnapshot.docs.forEach((docSnap) => {
                batch.delete(docSnap.ref);
                deletedCount++;
            });
            await batch.commit();
        }

        // Add new events
        const addBatch = db.batch();
        validatedEvents.forEach(event => {
            const docRef = db.collection("econEvents").doc();
            addBatch.set(docRef, event);
        });
        await addBatch.commit();

        const allEventsSnapshot = await db.collection("econEvents").get();

        res.json({
            success: true,
            uploaded: validatedEvents.length,
            deleted: deletedCount,
            total: allEventsSnapshot.size,
            message: `Successfully uploaded ${validatedEvents.length} events`
        });
    } catch (error: any) {
        console.error("[Admin] Failed to upload Economic Calendar events:", error);
        res.status(500).json({ error: `Failed to upload events: ${error.message}` });
    }
});

router.get("/health", async (req: Request, res: Response) => {
    try {
        // 1. Database Health (Drizzle/Neon)
        let dbHealth = { status: "unknown", userCount: 0, error: null as string | null };
        try {
            const { db: postgresDb } = await import("../db");
            const { users } = await import("@shared/schema");
            const { sql } = await import("drizzle-orm");
            const result = await postgresDb.select({ count: sql<number>`count(*)` }).from(users);
            dbHealth = { status: "connected", userCount: Number(result[0].count), error: null };
        } catch (e: any) {
            dbHealth = { status: "error", userCount: 0, error: e.message };
        }

        // 2. Integration Health (Zoho)
        let zohoHealth = { status: "unknown", authenticated: false, error: null as string | null };
        try {
            const { ZohoClient } = await import("../zoho/client");
            if (integrationConfig.zoho.clientId) {
                const client = new ZohoClient();
                await client.getAccessToken();
                zohoHealth = { status: "connected", authenticated: true, error: null };
            } else {
                zohoHealth = { status: "not_configured", authenticated: false, error: "Missing Client ID" };
            }
        } catch (e: any) {
            zohoHealth = { status: "error", authenticated: false, error: e.message };
        }

        // 3. Data Freshness (UMF & News)
        const cachedUmf = getFresh<any>('umf:snapshot');
        const firestoreUmf = await readLiveSnapshot();

        const guruSnapshot = await db.collection("guruDigest").orderBy("date", "desc").limit(1).get();
        const lastGuruEntry = guruSnapshot.empty ? null : guruSnapshot.docs[0].data();

        const econSnapshot = await db.collection("econEvents").orderBy("date", "desc").limit(1).get();
        const lastEconEntry = econSnapshot.empty ? null : econSnapshot.docs[0].data();

        // 4. Scheduler Status (Remote via Firestore)
        const umfScheduler = await getRemoteSchedulerStatus('umf');
        const guruScheduler = await getRemoteSchedulerStatus('guru');

        // 5. Config Verification
        const secretsStatus = {
            DATABASE_URL: !!process.env.GH_CORE_DATABASE_URL || !!process.env.DATABASE_URL,
            FB_PROJECT_ID: !!process.env.GH_FB_PROJECT_ID || !!process.env.FB_PROJECT_ID,
            FB_CLIENT_EMAIL: !!process.env.GH_FB_CLIENT_EMAIL || !!process.env.FB_CLIENT_EMAIL,
            FB_PRIVATE_KEY: !!process.env.GH_FB_PRIVATE_KEY || !!process.env.FB_PRIVATE_KEY,
            ZOHO_CLIENT_ID: !!integrationConfig.zoho.clientId,
            COINGECKO_KEY: !!integrationConfig.coingecko.apiKey,
        };

        res.json({
            status: "ready",
            timestamp: new Date().toISOString(),
            version: "1.2.0-cloud",
            node_env: config.NODE_ENV,
            db: dbHealth,
            zoho: zohoHealth,
            data: {
                umf: {
                    cache_assets: cachedUmf?.assets?.length || 0,
                    firestore_assets: firestoreUmf?.assets?.length || 0,
                    last_update: firestoreUmf?.timestamp_utc || null,
                },
                news: {
                    total_entries: (await db.collection("guruDigest").get()).size,
                    last_update: lastGuruEntry?.date || null,
                },
                events: {
                    total_entries: (await db.collection("econEvents").get()).size,
                    last_update: lastEconEntry?.date || null,
                }
            },
            schedulers: {
                umf: umfScheduler,
                news: guruScheduler,
            },
            secrets: secretsStatus
        });
    } catch (error: any) {
        console.error("[Admin Health] Global error:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
