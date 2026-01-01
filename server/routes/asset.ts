import { Router, Request, Response } from "express";
import { getFresh, setFresh } from "../umf/lib/cache";
import { readLiveSnapshot } from "../umf/lib/firestoreUmf";
import { getGuruDigestByAsset } from "../guru/lib/firestore";
import { CANONICAL_SYMBOLS, ASSET_DISPLAY_NAMES, ASSET_CLASSES } from "@shared/constants";
import { assetOverviewSchema, type AssetOverview, type UmfSnapshotLive } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.get("/:symbol", async (req: Request, res: Response) => {
    try {
        const symbol = req.params.symbol.toUpperCase();

        if (!CANONICAL_SYMBOLS.includes(symbol as any)) {
            return res.status(404).json({ error: `Asset not found: ${symbol}` });
        }

        const cacheKey = `asset:overview:${symbol}`;
        const cached = getFresh<AssetOverview>(cacheKey);

        if (cached) {
            return res.json(cached);
        }

        console.log(`[Asset API] Aggregating data for ${symbol}...`);

        // 1. UMF Price Data
        let priceSummary: AssetOverview['priceSummary'] = null;
        let priceDegraded = true;

        try {
            const snapshot = getFresh<UmfSnapshotLive>('umf:snapshot') || await readLiveSnapshot();

            if (snapshot) {
                const asset = snapshot.assets.find(a => a.symbol === symbol);

                if (asset) {
                    priceSummary = {
                        price: asset.price,
                        changePct24h: asset.changePct24h ?? 0,
                        volume24h: asset.volume24h ?? null,
                        marketCap: asset.marketCap ?? null,
                        updatedAt_utc: snapshot.timestamp_utc,
                    };
                    priceDegraded = snapshot.degraded || false;
                }
            }
        } catch (error) {
            console.error(`[Asset API] UMF data error for ${symbol}:`, error);
        }

        // 2. Guru Digest News
        let news: AssetOverview['news'] = [];
        let newsDegraded = false;

        try {
            const guruEntries = await getGuruDigestByAsset(symbol);
            news = guruEntries.map(entry => ({
                title: entry.title,
                summary: entry.summary,
                link: entry.link,
                date: entry.date,
            }));
        } catch (error) {
            console.error(`[Asset API] Guru Digest error for ${symbol}:`, error);
            newsDegraded = true;
        }

        const overview: AssetOverview = {
            symbol,
            name: ASSET_DISPLAY_NAMES[symbol] || symbol,
            class: ASSET_CLASSES[symbol] || 'crypto',
            image: null,
            priceSummary,
            news,
            events: [],
            degraded: {
                price: priceDegraded,
                news: newsDegraded,
                events: true, // Always degraded for MVP
            },
        };

        const validated = assetOverviewSchema.parse(overview);
        setFresh(cacheKey, validated, 90);

        res.json(validated);
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error("[Asset API] Schema validation error:", error.errors);
            return res.status(500).json({ error: "Invalid response format", details: error.errors });
        }
        console.error("[Asset API] Unexpected error:", error);
        res.status(500).json({ error: "Failed to fetch asset overview" });
    }
});

export default router;
