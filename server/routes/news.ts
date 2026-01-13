import { Router, Request, Response } from "express";
import { getAllGuruDigest } from "../guru/lib/firestore";
const router = Router();

router.get("/guru-digest", async (req: Request, res: Response) => {
    try {
        const entries = await getAllGuruDigest(50);

        const articles = entries.map((entry, index) => ({
            id: `guru-${index}`,
            title: entry.title,
            publishedAt: entry.date,
            source: (entry.assets && entry.assets.length > 0) ? entry.assets.join(', ') : 'Crypto News',
            url: entry.link,
            link: entry.link,
            summary: entry.summary,
        }));

        console.log(`[News API] Returning ${articles.length} articles`);
        res.status(200).json(articles);
    } catch (error) {
        console.error("Guru Digest fetch error:", error);
        res.status(500).json({ error: "Failed to fetch Guru Digest" });
    }
});

// router.post("/update-guru-digest", async (req: Request, res: Response) => {
//     res.status(501).json({ error: "Manual update moved to Cloud Functions. Please use the Admin Dashboard." });
// });

export default router;
