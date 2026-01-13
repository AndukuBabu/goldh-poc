"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assetOverviewSchema = exports.umfMoversLiveSchema = exports.umfSnapshotLiveSchema = exports.umfAssetLiveSchema = exports.umfAssetClassEnum = exports.umfAlertSchema = exports.umfBriefSchema = exports.umfMoverSchema = exports.umfSnapshotSchema = exports.umfAssetSchema = exports.insertEconEventSchema = exports.econEventSchema = void 0;
const zod_1 = require("zod");
/**
 * Economic Calendar Event Schema
 */
exports.econEventSchema = zod_1.z.preprocess((val) => {
    if (!val || typeof val !== 'object')
        return val;
    // 1. Map datetime_utc to date if date is missing
    const date = val.date || val.datetime_utc;
    // 2. Normalize and default impact
    let impact = val.impact || "Medium";
    if (typeof impact === 'string' && !["Low", "Medium", "High", "Holiday"].includes(impact)) {
        const lowerImpact = impact.toLowerCase();
        if (lowerImpact.includes("high"))
            impact = "High";
        else if (lowerImpact.includes("low"))
            impact = "Low";
        else if (lowerImpact.includes("holiday") || lowerImpact.includes("bank"))
            impact = "Holiday";
        else
            impact = "Medium";
    }
    // 3. Normalize and default country
    const country = val.country || "Global";
    return Object.assign(Object.assign({}, val), { date,
        impact,
        country, 
        // Ensure numeric/null fields are strings
        forecast: (val.forecast !== undefined && val.forecast !== null) ? String(val.forecast) : "", previous: (val.previous !== undefined && val.previous !== null) ? String(val.previous) : "" });
}, zod_1.z.object({
    // Core identification
    id: zod_1.z.string().optional().default("unknown"),
    // Event metadata
    title: zod_1.z.string().min(1, "Event title is required"),
    // Geographic/currency classification
    country: zod_1.z.string().default("Global"),
    // Temporal data
    date: zod_1.z.string()
        .min(1, "Date is required")
        .describe("Event scheduled time in ISO 8601 format"),
    // Impact level
    impact: zod_1.z.enum(["Low", "Medium", "High", "Holiday"]).default("Medium"),
    // Economic data points (now guaranteed to be strings by preprocessor)
    forecast: zod_1.z.string().default(""),
    previous: zod_1.z.string().default(""),
}));
exports.insertEconEventSchema = exports.econEventSchema;
/**
 * UMF Asset Schema
 */
exports.umfAssetSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, "Asset ID is required"),
    symbol: zod_1.z.string().min(1, "Symbol is required"),
    name: zod_1.z.string().min(1, "Asset name is required"),
    class: zod_1.z.enum(["crypto", "index", "forex", "commodity", "etf"], {
        errorMap: () => ({
            message: "Asset class must be: crypto, index, forex, commodity, or etf"
        }),
    }),
    image: zod_1.z.string().url().nullable().optional(),
    price: zod_1.z.number().positive("Price must be positive"),
    changePct24h: zod_1.z.number(),
    volume24h: zod_1.z.number().positive().nullable(),
    marketCap: zod_1.z.number().positive().nullable(),
    updatedAt_utc: zod_1.z.string().datetime({ message: "Must be valid ISO 8601 datetime in UTC" }),
});
/**
 * UMF Snapshot Schema
 */
exports.umfSnapshotSchema = zod_1.z.object({
    timestamp_utc: zod_1.z.string().datetime(),
    assets: zod_1.z.array(exports.umfAssetSchema).min(1, "Snapshot must contain at least one asset"),
});
/**
 * UMF Mover Schema
 */
exports.umfMoverSchema = zod_1.z.object({
    symbol: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1),
    class: zod_1.z.enum(["crypto", "index", "forex", "commodity", "etf"]),
    image: zod_1.z.string().url().nullable().optional(),
    direction: zod_1.z.enum(["gainer", "loser"]),
    changePct24h: zod_1.z.number(),
    price: zod_1.z.number().positive(),
    marketCap: zod_1.z.number().nullable().optional(),
    volume24h: zod_1.z.number().nullable().optional(),
    updatedAt_utc: zod_1.z.string().datetime(),
});
/**
 * UMF Brief Schema
 */
exports.umfBriefSchema = zod_1.z.object({
    date_utc: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    headline: zod_1.z.string().min(10).max(200),
    bullets: zod_1.z.array(zod_1.z.string().min(10)).min(1).max(5),
});
/**
 * UMF Alert Schema
 */
exports.umfAlertSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    title: zod_1.z.string().min(5).max(100),
    body: zod_1.z.string().min(10).max(500),
    severity: zod_1.z.enum(["info", "warn", "high"]),
    createdAt_utc: zod_1.z.string().datetime(),
});
/**
 * UMF Live Schemas
 */
exports.umfAssetClassEnum = zod_1.z.enum([
    "crypto",
    "index",
    "forex",
    "commodity",
    "etf",
]);
exports.umfAssetLiveSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, "Asset ID is required"),
    symbol: zod_1.z.string().min(1, "Symbol is required"),
    name: zod_1.z.string().min(1, "Asset name is required"),
    class: exports.umfAssetClassEnum,
    image: zod_1.z.string().url().nullable().optional(),
    price: zod_1.z.number().positive(),
    changePct24h: zod_1.z.number().nullable(),
    volume24h: zod_1.z.number().nonnegative().nullable(),
    marketCap: zod_1.z.number().nonnegative().nullable(),
    marketCapRank: zod_1.z.number().int().positive().nullable().optional(),
    high24h: zod_1.z.number().nonnegative().nullable().optional(),
    low24h: zod_1.z.number().nonnegative().nullable().optional(),
    circulatingSupply: zod_1.z.number().nonnegative().nullable().optional(),
    totalSupply: zod_1.z.number().nonnegative().nullable().optional(),
    maxSupply: zod_1.z.number().nonnegative().nullable().optional(),
    updatedAt_utc: zod_1.z.string().datetime(),
});
exports.umfSnapshotLiveSchema = zod_1.z.object({
    timestamp_utc: zod_1.z.string().datetime(),
    assets: zod_1.z.array(exports.umfAssetLiveSchema).min(1),
    degraded: zod_1.z.boolean().optional(),
});
exports.umfMoversLiveSchema = zod_1.z.object({
    timestamp_utc: zod_1.z.string().datetime(),
    gainers: zod_1.z.array(exports.umfAssetLiveSchema).max(5),
    losers: zod_1.z.array(exports.umfAssetLiveSchema).max(5),
    degraded: zod_1.z.boolean().optional(),
});
exports.assetOverviewSchema = zod_1.z.object({
    symbol: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1),
    class: zod_1.z.enum(["crypto", "index", "forex", "commodity", "etf"]),
    image: zod_1.z.string().url().nullable().optional(),
    priceSummary: zod_1.z.object({
        price: zod_1.z.number().positive(),
        changePct24h: zod_1.z.number(),
        volume24h: zod_1.z.number().positive().nullable(),
        marketCap: zod_1.z.number().positive().nullable(),
        updatedAt_utc: zod_1.z.string().datetime(),
    }).nullable(),
    news: zod_1.z.array(zod_1.z.object({
        title: zod_1.z.string(),
        summary: zod_1.z.string(),
        link: zod_1.z.string().url(),
        date: zod_1.z.string().datetime(),
    })),
    events: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        title: zod_1.z.string(),
        datetime_utc: zod_1.z.string().datetime(),
        importance: zod_1.z.enum(["High", "Medium", "Low"]),
        category: zod_1.z.string(),
    })),
    degraded: zod_1.z.object({
        price: zod_1.z.boolean(),
        news: zod_1.z.boolean(),
        events: zod_1.z.boolean(),
    }),
});
//# sourceMappingURL=schema.js.map