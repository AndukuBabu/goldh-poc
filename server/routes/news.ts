import { Router, Request, Response } from "express";
import { getAllGuruDigest } from "../guru/lib/firestore";
import { updateGuruDigest } from "../guru/updater";

const router = Router();

router.get("/guru-digest", async (req: Request, res: Response) => {
    try {
        const entries = await getAllGuruDigest(50);

        const articles = entries.map((entry, index) => ({
            id: `guru-${index}`,
            title: entry.title,
            publishedAt: entry.date,
            source: entry.assets.length > 0 ? entry.assets.join(', ') : 'Crypto News',
            url: entry.link,
            summary: entry.summary,
        }));

        res.status(200).json(articles);
    } catch (error) {
        console.error("Guru Digest fetch error:", error);
        res.status(500).json({ error: "Failed to fetch Guru Digest" });
    }
});

router.post("/update-guru-digest", async (req: Request, res: Response) => {
    try {
        const result = await updateGuruDigest({
            clearFirst: req.body?.clearFirst || false,
            logPrefix: '[API]',
        });
        res.status(200).json({
            success: true,
            ...result,
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error("Guru Digest update error:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
