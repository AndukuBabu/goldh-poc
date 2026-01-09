import { Router, Request, Response } from "express";
import { getFresh, setFresh } from "../umf/lib/cache";
import { readLiveSnapshot } from "../umf/lib/firestoreUmf";
import { CACHE_TTL_S } from "../umf/config";
import type { UmfSnapshotLive, UmfAssetLive } from "@shared/schema";

const router = Router();

router.get("/snapshot", async (req: Request, res: Response) => {
    try {
        const cached = getFresh<UmfSnapshotLive>('umf:snapshot');

        if (cached) {
            res.setHeader('x-umf-source', 'cache');
            return res.json(cached);
        }

        const start = Date.now();
        const firestore = await readLiveSnapshot();
        const end = Date.now();
        console.log(`[UMF Snapshot] Firestore read took ${end - start}ms`);

        if (firestore) {
            // Lazy pre-warm: populate cache so next request is faster
            setFresh('umf:snapshot', firestore, CACHE_TTL_S);

            const dataAgeMs = Date.now() - new Date(firestore.timestamp_utc).getTime();
            const isStale = dataAgeMs > (90 * 60 * 1000); // 90 minutes buffer

            res.setHeader('x-umf-source', 'firestore');
            console.log(`[UMF Snapshot] Returning from Firestore (${firestore.assets.length} assets)`);
            return res.json({
                ...firestore,
                degraded: isStale,
            });
        }

        res.setHeader('x-umf-source', 'empty');
        return res.json({
            timestamp_utc: new Date().toISOString(),
            assets: [],
            degraded: true,
        });
    } catch (error) {
        console.error("UMF snapshot error:", error);
        res.status(500).json({ error: "Failed to fetch market snapshot" });
    }
});

router.get("/movers", async (req: Request, res: Response) => {
    try {
        let snapshot: UmfSnapshotLive | null = null;
        let source: 'cache' | 'firestore' | 'empty' = 'empty';
        let degraded = true;

        const cached = getFresh<UmfSnapshotLive>('umf:snapshot');

        if (cached) {
            snapshot = cached;
            source = 'cache';
            degraded = false;
        } else {
            const firestore = await readLiveSnapshot();
            if (firestore) {
                snapshot = firestore;
                source = 'firestore';
                degraded = true;
            }
        }

        let gainers: UmfAssetLive[] = [];
        let losers: UmfAssetLive[] = [];

        if (snapshot && snapshot.assets.length > 0) {
            const assetsWithChange = snapshot.assets.filter(
                (asset) => asset.changePct24h !== null
            );

            const sorted = [...assetsWithChange].sort(
                (a, b) => (b.changePct24h || 0) - (a.changePct24h || 0)
            );

            gainers = sorted.slice(0, 5);
            losers = sorted.slice(-5).reverse();
        }

        res.setHeader('x-umf-source', source);
        return res.json({ gainers, losers, degraded });
    } catch (error) {
        console.error("UMF movers error:", error);
        res.status(500).json({ error: "Failed to fetch market movers" });
    }
});

export default router;
