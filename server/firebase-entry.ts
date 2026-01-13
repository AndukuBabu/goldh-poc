import { onRequest } from "firebase-functions/v2/https";
import { createApp } from "./app";
// import { startScheduler } from "./umf/scheduler"; // Deleted
// import { startGuruScheduler } from "./guru/scheduler"; // Deleted
import { config } from "./config"; // removed schedulerConfig from import
import { log } from "./utils/logger";
import { setupCacheListeners } from "./listeners";

/**
 * Firebase Cloud Function Entry Point
 * 
 * This file wraps the monolithic Express application as a single https.onRequest function.
 * It also initializes internal schedulers to maintain the in-memory cache as requested.
 * 
 * Deployment Note: Ensure Firebase Blaze plan is active.
 */

// Singleton app instance for lazy initialization
let appInstance: any = null;

// Export the "api" function
export const api = onRequest({
    concurrency: 80, // Allow multiple concurrent requests per instance to maximize memory cache hits
    memory: "512MiB",
    region: "us-central1", // Adjust to your preferred region
    secrets: [
        "GH_CORE_DATABASE_URL",
        "GH_CORE_SESSION_SECRET",
        "GH_FB_PROJECT_ID",
        "GH_FB_CLIENT_EMAIL",
        "GH_FB_PRIVATE_KEY",
        "GH_EXT_ZOHO_CLIENT_ID",
        "GH_EXT_ZOHO_CLIENT_SECRET",
        "GH_EXT_ZOHO_REFRESH_TOKEN",
        "GH_EXT_COINGECKO_API_KEY",
        "GH_EXT_FINNHUB_API_KEY",
        "GH_EXT_HUGGINGFACE_API_KEY"
    ],
    // Note: minInstances: 1 is recommended for production to keep the cache warm
}, async (req, res) => {
    // Log path for routing debug
    log(`[Firebase Request] ${req.method} ${req.path}`);

    // Fast-path health check
    if (req.path === "/api/health") {
        return res.json({ status: "ok", message: "Firebase Function is alive", timestamp: new Date().toISOString() });
    }

    // Lazy initialization on first request
    if (!appInstance) {
        log("[Firebase] Cold start: Initializing Express app...");
        try {
            const { app } = await createApp();
            log(`[Firebase] Express app instance created (NODE_ENV=${config.NODE_ENV})`);

            // Initialize Cache Listeners (Hydration)
            // Critical for serving fresh data on cold start
            await setupCacheListeners();
            log('[Firebase] Cache listeners initialized');

            appInstance = app;
        } catch (error) {
            log(`[Firebase] Critical error during initialization: ${error}`, "error");
            return res.status(500).send("Internal Server Error during initialization");
        }
    }

    return appInstance(req, res);
});
