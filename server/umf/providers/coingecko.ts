/**
 * CoinGecko Provider (Server Port)
 * 
 * Fetches cryptocurrency market data from CoinGecko API.
 * Identical to functions/src/umf/coingecko.ts but adapted for Server imports.
 */

import { z } from 'zod';
import type { UmfAssetLive } from '@shared/schema';
import { umfAssetLiveSchema } from '@shared/schema';

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
const coinGeckoMarketItemSchema = z.object({
    id: z.string(),
    symbol: z.string(),
    name: z.string(),
    image: z.string().nullable().optional(),
    current_price: z.number(),
    price_change_percentage_24h: z.number().nullable(),
    total_volume: z.number().nullable(),
    market_cap: z.number().nullable(),
    market_cap_rank: z.number().nullable().optional(),
    high_24h: z.number().nullable().optional(),
    low_24h: z.number().nullable().optional(),
    circulating_supply: z.number().nullable().optional(),
    total_supply: z.number().nullable().optional(),
    max_supply: z.number().nullable().optional(),
    last_updated: z.string(),
});

const coinGeckoMarketsResponseSchema = z.array(coinGeckoMarketItemSchema);

type CoinGeckoMarketItem = z.infer<typeof coinGeckoMarketItemSchema>;

export interface FetchMarketsResult {
    assets: UmfAssetLive[];
    timestamp_utc: string; // ISO 8601 with 'Z' suffix
}

export async function fetchTopCoinsByMarketCap(
    topN: number = 50,
    key?: string
): Promise<FetchMarketsResult> {
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

    const headers: Record<string, string> = {
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
    const assets: UmfAssetLive[] = coinsData.map(transformCoinGeckoToUmfAsset);

    const validatedAssets: UmfAssetLive[] = [];
    assets.forEach((asset, index) => {
        try {
            umfAssetLiveSchema.parse(asset);
            validatedAssets.push(asset);
        } catch (error) {
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

function transformCoinGeckoToUmfAsset(item: CoinGeckoMarketItem): UmfAssetLive {
    return {
        id: item.id,
        symbol: item.symbol.toUpperCase(),
        name: item.name,
        class: 'crypto',
        image: item.image ?? null,
        price: item.current_price,
        changePct24h: item.price_change_percentage_24h ?? null,
        volume24h: item.total_volume ?? null,
        marketCap: item.market_cap ?? null,
        marketCapRank: item.market_cap_rank ?? null,
        high24h: item.high_24h ?? null,
        low24h: item.low_24h ?? null,
        circulatingSupply: item.circulating_supply ?? null,
        totalSupply: item.total_supply ?? null,
        maxSupply: item.max_supply ?? null,
        updatedAt_utc: ensureIsoWithZ(item.last_updated),
    };
}

function ensureIsoWithZ(timestamp: string): string {
    if (timestamp.endsWith('Z')) {
        return timestamp;
    }
    const date = new Date(timestamp);
    return date.toISOString();
}

async function fetchWithRetry(
    url: string,
    options: {
        method: string;
        headers: Record<string, string>;
        timeout: number;
    }
): Promise<Response> {
    let lastError: Error | null = null;
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

                throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`
                );
            }

            return response;
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));

            if (attempt < maxAttempts - 1) {
                console.warn(
                    `[CoinGecko] Attempt ${attempt + 1}/${maxAttempts} failed: ${lastError.message}. Retrying...`
                );
            }
        }
    }

    throw new Error(
        `CoinGecko API failed after ${maxAttempts} attempts: ${lastError?.message || 'Unknown error'}`
    );
}

async function fetchWithTimeout(
    url: string,
    options: {
        method: string;
        headers: Record<string, string>;
        timeout: number;
    }
): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout);

    try {
        const response = await fetch(url, {
            method: options.method,
            headers: options.headers,
            signal: controller.signal,
        });

        return response;
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error(`Request timeout after ${options.timeout}ms`);
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
