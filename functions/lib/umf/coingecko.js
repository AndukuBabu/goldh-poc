"use strict";
/**
 * CoinGecko Provider
 *
 * Fetches cryptocurrency market data from CoinGecko API and transforms
 * it into the canonical UmfAssetLive schema.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchTopCoinsByMarketCap = void 0;
const zod_1 = require("zod");
const schema_1 = require("../shared/schema");
/**
 * CoinGecko API Configuration
 */
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
const COINGECKO_ENDPOINT = '/coins/markets';
const REQUEST_TIMEOUT_MS = 5000; // 5 seconds
const RETRY_DELAYS_MS = [2000, 5000, 10000]; // Retries: 2s, 5s, 10s
/**
 * CoinGecko API Response Schema (Single Coin)
 */
const coinGeckoMarketItemSchema = zod_1.z.object({
    id: zod_1.z.string(),
    symbol: zod_1.z.string(),
    name: zod_1.z.string(),
    image: zod_1.z.string().nullable().optional(),
    current_price: zod_1.z.number(),
    price_change_percentage_24h: zod_1.z.number().nullable(),
    total_volume: zod_1.z.number().nullable(),
    market_cap: zod_1.z.number().nullable(),
    market_cap_rank: zod_1.z.number().nullable().optional(),
    high_24h: zod_1.z.number().nullable().optional(),
    low_24h: zod_1.z.number().nullable().optional(),
    circulating_supply: zod_1.z.number().nullable().optional(),
    total_supply: zod_1.z.number().nullable().optional(),
    max_supply: zod_1.z.number().nullable().optional(),
    last_updated: zod_1.z.string(),
});
const coinGeckoMarketsResponseSchema = zod_1.z.array(coinGeckoMarketItemSchema);
async function fetchTopCoinsByMarketCap(topN = 50, key) {
    if (topN < 1 || topN > 250) {
        throw new Error('fetchTopCoinsByMarketCap: topN must be between 1 and 250');
    }
    const url = new URL(COINGECKO_BASE_URL + COINGECKO_ENDPOINT);
    url.searchParams.set('vs_currency', 'usd');
    url.searchParams.set('order', 'market_cap_desc');
    url.searchParams.set('per_page', topN.toString());
    url.searchParams.set('page', '1');
    url.searchParams.set('sparkline', 'false');
    url.searchParams.set('price_change_percentage', '24h');
    const headers = {
        'Accept': 'application/json',
    };
    if (key) {
        headers['x-cg-demo-api-key'] = key;
    }
    const response = await fetchWithRetry(url.toString(), {
        method: 'GET',
        headers,
        timeout: REQUEST_TIMEOUT_MS,
    });
    const json = await response.json();
    const coinsData = coinGeckoMarketsResponseSchema.parse(json);
    const assets = coinsData.map(transformCoinGeckoToUmfAsset);
    const validatedAssets = [];
    assets.forEach((asset, index) => {
        try {
            schema_1.umfAssetLiveSchema.parse(asset);
            validatedAssets.push(asset);
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            const logMsg = `Skipping invalid asset ${asset.symbol}: ${errorMsg}`;
            console.warn(`[CoinGecko] ${logMsg}`);
        }
    });
    if (validatedAssets.length === 0 && assets.length > 0) {
        throw new Error('All fetched assets failed validation');
    }
    return {
        assets: validatedAssets,
        timestamp_utc: new Date().toISOString(),
    };
}
exports.fetchTopCoinsByMarketCap = fetchTopCoinsByMarketCap;
function transformCoinGeckoToUmfAsset(item) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    return {
        id: item.id,
        symbol: item.symbol.toUpperCase(),
        name: item.name,
        class: 'crypto',
        image: (_a = item.image) !== null && _a !== void 0 ? _a : null,
        price: item.current_price,
        changePct24h: (_b = item.price_change_percentage_24h) !== null && _b !== void 0 ? _b : null,
        volume24h: (_c = item.total_volume) !== null && _c !== void 0 ? _c : null,
        marketCap: (_d = item.market_cap) !== null && _d !== void 0 ? _d : null,
        marketCapRank: (_e = item.market_cap_rank) !== null && _e !== void 0 ? _e : null,
        high24h: (_f = item.high_24h) !== null && _f !== void 0 ? _f : null,
        low24h: (_g = item.low_24h) !== null && _g !== void 0 ? _g : null,
        circulatingSupply: (_h = item.circulating_supply) !== null && _h !== void 0 ? _h : null,
        totalSupply: (_j = item.total_supply) !== null && _j !== void 0 ? _j : null,
        maxSupply: (_k = item.max_supply) !== null && _k !== void 0 ? _k : null,
        updatedAt_utc: ensureIsoWithZ(item.last_updated),
    };
}
function ensureIsoWithZ(timestamp) {
    if (timestamp.endsWith('Z')) {
        return timestamp;
    }
    const date = new Date(timestamp);
    return date.toISOString();
}
async function fetchWithRetry(url, options) {
    let lastError = null;
    const maxAttempts = 1 + RETRY_DELAYS_MS.length;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            if (attempt > 0) {
                const delayMs = RETRY_DELAYS_MS[attempt - 1];
                await sleep(delayMs);
            }
            const response = await fetchWithTimeout(url, options);
            if (!response.ok) {
                // If it's a 429, we should definitely wait longer if we can
                if (response.status === 429) {
                    const retryAfter = response.headers.get('retry-after');
                    if (retryAfter) {
                        const waitSeconds = parseInt(retryAfter, 10);
                        if (!isNaN(waitSeconds)) {
                            console.warn(`[CoinGecko] Hit 429. Waiting ${waitSeconds}s as requested...`);
                            await sleep(waitSeconds * 1000);
                        }
                    }
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return response;
        }
        catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            if (attempt < maxAttempts - 1) {
                console.warn(`[CoinGecko] Attempt ${attempt + 1}/${maxAttempts} failed: ${lastError.message}. Retrying...`);
            }
        }
    }
    throw new Error(`CoinGecko API failed after ${maxAttempts} attempts: ${(lastError === null || lastError === void 0 ? void 0 : lastError.message) || 'Unknown error'}`);
}
async function fetchWithTimeout(url, options) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout);
    try {
        const response = await fetch(url, {
            method: options.method,
            headers: options.headers,
            signal: controller.signal,
        });
        return response;
    }
    catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error(`Request timeout after ${options.timeout}ms`);
        }
        throw error;
    }
    finally {
        clearTimeout(timeoutId);
    }
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
//# sourceMappingURL=coingecko.js.map