import { Router, Request, Response } from "express";
import { ZohoClient } from "../zoho/client";
import { integrationConfig, config } from "../config";
import { db } from "../firebase";

const router = Router();

router.get("/zoho", async (req: Request, res: Response) => {
    try {
        const zohoClient = new ZohoClient();

        if (!integrationConfig.zoho.clientId) {
            return res.json({
                configured: false,
                message: "Zoho CRM credentials not configured",
            });
        }

        console.log('[Zoho Test] Testing access token...');
        const accessToken = await zohoClient.getAccessToken();

        console.log('[Zoho Test] Testing API request...');
        const response = await zohoClient.makeRequest('GET', '/crm/v2/settings/modules');

        res.json({
            configured: true,
            authenticated: true,
            message: "Zoho CRM connection successful",
            hasAccessToken: !!accessToken,
            apiResponse: response
        });
    } catch (error: any) {
        console.error('[Zoho Test] Error:', error);
        res.status(500).json({
            configured: true,
            authenticated: false,
            error: error.message,
            details: error.response?.data || null
        });
    }
});

router.get("/db", async (_req: Request, res: Response) => {
    try {
        const { db } = await import("../db");
        const { users } = await import("@shared/schema");
        const { sql } = await import("drizzle-orm");

        console.log('[DB Test] Testing connection...');
        const result = await db.select({ count: sql<number>`count(*)` }).from(users);

        res.json({
            connected: true,
            message: "Neon PostgreSQL connection successful",
            userCount: Number(result[0].count),
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('[DB Test] Error:', error);
        res.status(500).json({
            connected: false,
            error: error.message,
            stack: config.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

router.get("/trigger-umf", async (_req: Request, res: Response) => {
    try {
        const { getSchedulerStatus } = await import("../umf/scheduler");
        const status = getSchedulerStatus();

        res.json({
            message: "UMF scheduler status retrieved. Check logs for tick activity.",
            status,
            hint: "If you just deployed, wait 30s for the first automatic tick."
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/status", async (_req: Request, res: Response) => {
    try {
        const { schedulerConfig, config } = await import("../config");

        const { getFresh } = await import("../umf/lib/cache");
        const { readLiveSnapshot } = await import("../umf/lib/firestoreUmf");
        const { integrationConfig: intConfig } = await import("../config");

        const cachedData = getFresh<any>('umf:snapshot');
        const firestoreData = await readLiveSnapshot();



        // Sanitize sensitive info
        const sanitizedConfig = {
            VERSION: "1.1.2", // Manual increment to verify deployment
            NODE_ENV: config.NODE_ENV,
            GH_PORT: config.GH_PORT,
            UMF_SCHEDULER: process.env.UMF_SCHEDULER,
            GURU_SCHEDULER: process.env.GURU_SCHEDULER,
            HAS_COINGECKO_KEY: !!intConfig.coingecko.apiKey,
            // Check if secrets exist without showing values
            HAS_DATABASE_URL: !!process.env.GH_CORE_DATABASE_URL || !!process.env.DATABASE_URL,
            HAS_FB_PROJECT_ID: !!process.env.GH_FB_PROJECT_ID || !!process.env.FB_PROJECT_ID,
            HAS_FB_CLIENT_EMAIL: !!process.env.GH_FB_CLIENT_EMAIL || !!process.env.FB_CLIENT_EMAIL,
            HAS_FB_PRIVATE_KEY: !!process.env.GH_FB_PRIVATE_KEY || !!process.env.FB_PRIVATE_KEY,
            PROJECT_ID_CLIP: (process.env.GH_FB_PROJECT_ID || process.env.FB_PROJECT_ID || "not-set").substring(0, 5) + "...",
        };

        const { getAllGuruDigest } = await import("../guru/lib/firestore");
        let guruEntries: any[] = [];
        try {
            guruEntries = await getAllGuruDigest(3);
        } catch (e) { }

        let econSamples: any[] = [];
        try {
            const snap = await db.collection("econEvents").limit(3).get();
            econSamples = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (e) { }

        res.json({
            status: "ready",
            config: sanitizedConfig,
            data_counts: {
                cache_assets: cachedData?.assets?.length || 0,
                firestore_assets: firestoreData?.assets?.length || 0,
                firestore_timestamp: firestoreData?.timestamp_utc || null,
                guru_entries: guruEntries.length, // use length of what we fetched
                econ_events: (await db.collection("econEvents").get()).size
            },
            samples: {
                raw_guru_first: guruEntries[0] || null,
                raw_econ_first: econSamples[0] || null,
                guru: guruEntries.map(e => ({ title: e.title, date: e.date })),
                econ: econSamples.map(e => ({ title: e.title, date: e.date, datetime_utc: e.datetime_utc }))
            },
            scheduler: {
                umfEnabled: schedulerConfig.umfEnabled,
                guruEnabled: schedulerConfig.guruEnabled,
            },
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        res.status(500).json({ status: "error", error: error.message });
    }
});

export default router;
