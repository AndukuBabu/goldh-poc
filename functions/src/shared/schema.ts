import { z } from "zod";

export interface NewsArticle {
    id: string;
    title: string;
    url: string;
    publishedAt: string;
}

export interface LearningTopic {
    id: string;
    title: string;
    question: string;
    answer: string;
    relatedTopics: string[];
}

/**
 * Economic Calendar Event Schema
 */
export const econEventSchema = z.preprocess((val: any) => {
    if (!val || typeof val !== 'object') return val;

    // 1. Map datetime_utc to date if date is missing
    const date = val.date || val.datetime_utc;

    // 2. Normalize and default impact
    let impact = val.impact || "Medium";
    if (typeof impact === 'string' && !["Low", "Medium", "High", "Holiday"].includes(impact)) {
        const lowerImpact = impact.toLowerCase();
        if (lowerImpact.includes("high")) impact = "High";
        else if (lowerImpact.includes("low")) impact = "Low";
        else if (lowerImpact.includes("holiday") || lowerImpact.includes("bank")) impact = "Holiday";
        else impact = "Medium";
    }

    // 3. Normalize and default country
    const country = val.country || "Global";

    return {
        ...val,
        date,
        impact,
        country,
        // Ensure numeric/null fields are strings
        forecast: (val.forecast !== undefined && val.forecast !== null) ? String(val.forecast) : "",
        previous: (val.previous !== undefined && val.previous !== null) ? String(val.previous) : "",
    };
}, z.object({
    // Core identification
    id: z.string().optional().default("unknown"),

    // Event metadata
    title: z.string().min(1, "Event title is required"),

    // Geographic/currency classification
    country: z.string().default("Global"),

    // Temporal data
    date: z.string()
        .min(1, "Date is required")
        .describe("Event scheduled time in ISO 8601 format"),

    // Impact level
    impact: z.enum(["Low", "Medium", "High", "Holiday"]).default("Medium"),

    // Economic data points (now guaranteed to be strings by preprocessor)
    forecast: z.string().default(""),
    previous: z.string().default(""),
}));

export type EconEvent = z.infer<typeof econEventSchema>;

export const insertEconEventSchema = econEventSchema;

/**
 * UMF Asset Schema
 */
export const umfAssetSchema = z.object({
    id: z.string().min(1, "Asset ID is required"),
    symbol: z.string().min(1, "Symbol is required"),
    name: z.string().min(1, "Asset name is required"),
    class: z.enum(["crypto", "index", "forex", "commodity", "etf"], {
        errorMap: () => ({
            message: "Asset class must be: crypto, index, forex, commodity, or etf"
        }),
    }),
    image: z.string().url().nullable().optional(),
    price: z.number().positive("Price must be positive"),
    changePct24h: z.number(),
    volume24h: z.number().positive().nullable(),
    marketCap: z.number().positive().nullable(),
    updatedAt_utc: z.string().datetime({ message: "Must be valid ISO 8601 datetime in UTC" }),
});

export type UmfAsset = z.infer<typeof umfAssetSchema>;

/**
 * UMF Snapshot Schema
 */
export const umfSnapshotSchema = z.object({
    timestamp_utc: z.string().datetime(),
    assets: z.array(umfAssetSchema).min(1, "Snapshot must contain at least one asset"),
});

export type UmfSnapshot = z.infer<typeof umfSnapshotSchema>;

/**
 * UMF Mover Schema
 */
export const umfMoverSchema = z.object({
    symbol: z.string().min(1),
    name: z.string().min(1),
    class: z.enum(["crypto", "index", "forex", "commodity", "etf"]),
    image: z.string().url().nullable().optional(),
    direction: z.enum(["gainer", "loser"]),
    changePct24h: z.number(),
    price: z.number().positive(),
    marketCap: z.number().nullable().optional(),
    volume24h: z.number().nullable().optional(),
    updatedAt_utc: z.string().datetime(),
});

export type UmfMover = z.infer<typeof umfMoverSchema>;

/**
 * UMF Brief Schema
 */
export const umfBriefSchema = z.object({
    date_utc: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    headline: z.string().min(10).max(200),
    bullets: z.array(z.string().min(10)).min(1).max(5),
});

export type UmfBrief = z.infer<typeof umfBriefSchema>;

/**
 * UMF Alert Schema
 */
export const umfAlertSchema = z.object({
    id: z.string().min(1),
    title: z.string().min(5).max(100),
    body: z.string().min(10).max(500),
    severity: z.enum(["info", "warn", "high"]),
    createdAt_utc: z.string().datetime(),
});

export type UmfAlert = z.infer<typeof umfAlertSchema>;

/**
 * UMF Live Schemas
 */

export const umfAssetClassEnum = z.enum([
    "crypto",
    "index",
    "forex",
    "commodity",
    "etf",
]);

export type UmfAssetClass = z.infer<typeof umfAssetClassEnum>;

export const umfAssetLiveSchema = z.object({
    id: z.string().min(1, "Asset ID is required"),
    symbol: z.string().min(1, "Symbol is required"),
    name: z.string().min(1, "Asset name is required"),
    class: umfAssetClassEnum,
    image: z.string().url().nullable().optional(),
    price: z.number().positive(),
    changePct24h: z.number().nullable(),
    volume24h: z.number().nonnegative().nullable(),
    marketCap: z.number().nonnegative().nullable(),
    marketCapRank: z.number().int().positive().nullable().optional(),
    high24h: z.number().nonnegative().nullable().optional(),
    low24h: z.number().nonnegative().nullable().optional(),
    circulatingSupply: z.number().nonnegative().nullable().optional(),
    totalSupply: z.number().nonnegative().nullable().optional(),
    maxSupply: z.number().nonnegative().nullable().optional(),
    updatedAt_utc: z.string().datetime(),
});

export type UmfAssetLive = z.infer<typeof umfAssetLiveSchema>;

export const umfSnapshotLiveSchema = z.object({
    timestamp_utc: z.string().datetime(),
    assets: z.array(umfAssetLiveSchema).min(1),
    degraded: z.boolean().optional(),
});

export type UmfSnapshotLive = z.infer<typeof umfSnapshotLiveSchema>;

export const umfMoversLiveSchema = z.object({
    timestamp_utc: z.string().datetime(),
    gainers: z.array(umfAssetLiveSchema).max(5),
    losers: z.array(umfAssetLiveSchema).max(5),
    degraded: z.boolean().optional(),
});

export type UmfMoversLive = z.infer<typeof umfMoversLiveSchema>;

export const assetOverviewSchema = z.object({
    symbol: z.string().min(1),
    name: z.string().min(1),
    class: z.enum(["crypto", "index", "forex", "commodity", "etf"]),
    image: z.string().url().nullable().optional(),
    priceSummary: z.object({
        price: z.number().positive(),
        changePct24h: z.number(),
        volume24h: z.number().positive().nullable(),
        marketCap: z.number().positive().nullable(),
        updatedAt_utc: z.string().datetime(),
    }).nullable(),
    news: z.array(z.object({
        title: z.string(),
        summary: z.string(),
        link: z.string().url(),
        date: z.string().datetime(),
    })),
    events: z.array(z.object({
        id: z.string(),
        title: z.string(),
        datetime_utc: z.string().datetime(),
        importance: z.enum(["High", "Medium", "Low"]),
        category: z.string(),
    })),
    degraded: z.object({
        price: z.boolean(),
        news: z.boolean(),
        events: z.boolean(),
    }),
});

export type AssetOverview = z.infer<typeof assetOverviewSchema>;
