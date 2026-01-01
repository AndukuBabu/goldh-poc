import { Router, Request, Response } from "express";
import { requireAdmin } from "../middleware";
import { getAllGuruDigestWithIds, deleteGuruDigestEntry, addGuruDigestEntry } from "../guru/lib/firestore";
import { updateGuruDigest } from "../guru/updater";
import { CANONICAL_SYMBOLS, extractAssetSymbols } from "@shared/constants";
import { econEventSchema } from "@shared/schema";
import { db } from "../firebase";
import admin from "firebase-admin";

const router = Router();

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
        const result = await updateGuruDigest({
            clearFirst: req.body?.clearFirst || false,
            logPrefix: '[Admin]',
        });
        res.json({ success: true, ...result, message: "RSS feed refreshed successfully" });
    } catch (error) {
        console.error("[Admin] Failed to refresh RSS feed:", error);
        res.status(500).json({ error: "Failed to refresh RSS feed" });
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
            return econEventSchema.omit({ id: true }).parse(eventData);
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

export default router;
