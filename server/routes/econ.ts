import { Router, Request, Response } from "express";
import { db } from "../firebase";
import { econEventSchema } from "@shared/schema";

const router = Router();

/**
 * Get Economic Events
 * GET /api/econ/events?from=...&to=...&country=...&impact=...
 */
router.get("/events", async (req: Request, res: Response) => {
    try {
        const { from, to, country, impact } = req.query;

        // Helper to fetch documents for a specific field
        const fetchByField = async (fieldName: string) => {
            let q = db.collection("econEvents").where(fieldName, ">=", from).where(fieldName, "<=", to);
            // We order by the field to ensure we use the single-field index efficiently
            q = q.orderBy(fieldName, "asc");
            return q.get();
        };

        // Run both queries in parallel
        const [snapDate, snapDatetime] = await Promise.all([
            fetchByField("date"),
            fetchByField("datetime_utc")
        ]);

        // Merge and normalize results
        const seenIds = new Set();
        let events: any[] = [];

        [...snapDate.docs, ...snapDatetime.docs].forEach((doc: any) => {
            if (!seenIds.has(doc.id)) {
                seenIds.add(doc.id);
                const data = doc.data();
                // Ensure every event has a 'date' field for sorting/validation
                const normalizedEvent = {
                    id: doc.id,
                    ...data,
                    date: data.date || data.datetime_utc
                };
                events.push(normalizedEvent);
            }
        });

        // Sort merged results by date in memory
        events.sort((a, b) => a.date.localeCompare(b.date));

        // Secondary filtering in memory (Impact & Country)
        if (country) {
            const countries = Array.isArray(country) ? country : [country];
            events = events.filter((e: any) => countries.includes(e.country));
        }

        if (impact) {
            const impacts = Array.isArray(impact) ? impact : [impact];
            events = events.filter((e: any) => impacts.includes(e.impact));
        }

        // Validate entries
        const validatedEvents = events.filter((event: any) => {
            try {
                // Pre-process defaults for incomplete data
                const sanitized = {
                    ...event,
                    country: event.country || "Global",
                    impact: event.impact || "Medium",
                    forecast: event.forecast ?? "",
                    previous: event.previous ?? "",
                };
                econEventSchema.parse(sanitized);
                return true;
            } catch (e) {
                console.warn(`[Econ API] Event ${event.id} failed validation:`, e);
                return false;
            }
        });

        if (validatedEvents.length === 0 && events.length > 0) {
            console.warn(`[Econ API] All ${events.length} events were filtered out due to validation failures.`);
        }

        res.json(validatedEvents);
    } catch (error: any) {
        console.error("[Econ API] Error fetching events:", error);
        res.status(500).json({ error: "Failed to fetch economic events" });
    }
});

export default router;
