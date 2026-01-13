/**
 * Shared Constants for Asset Tagging and Identification
 * Copied to Cloud Functions environment
 */

export const ASSET_SYMBOL_MAP: Record<string, string> = {
    // Bitcoin
    'BTC': 'BTC',
    'BITCOIN': 'BTC',
    'bitcoin': 'BTC',

    // Ethereum
    'ETH': 'ETH',
    'ETHEREUM': 'ETH',
    'ethereum': 'ETH',
    'ether': 'ETH',

    // Solana
    'SOL': 'SOL',
    'SOLANA': 'SOL',
    'solana': 'SOL',

    // Binance Coin
    'BNB': 'BNB',
    'BINANCE': 'BNB',
    'binance': 'BNB',

    // Cardano
    'ADA': 'ADA',
    'CARDANO': 'ADA',
    'cardano': 'ADA',

    // Polygon
    'MATIC': 'MATIC',
    'POLYGON': 'MATIC',
    'polygon': 'MATIC',

    // Tron
    'TRX': 'TRX',
    'TRON': 'TRX',
    'tron': 'TRX',

    // Chainlink
    'LINK': 'LINK',
    'CHAINLINK': 'LINK',
    'chainlink': 'LINK',

    // TON
    'TON': 'TON',
    'TONCOIN': 'TON',
    'toncoin': 'TON',
    'telegram': 'TON',

    // Dogecoin
    'DOGE': 'DOGE',
    'DOGECOIN': 'DOGE',
    'dogecoin': 'DOGE',

    // Polkadot
    'DOT': 'DOT',
    'POLKADOT': 'DOT',
    'polkadot': 'DOT',

    // Litecoin
    'LTC': 'LTC',
    'LITECOIN': 'LTC',
    'litecoin': 'LTC',

    // NEAR Protocol
    'NEAR': 'NEAR',
    'near': 'NEAR',

    // Aptos
    'APT': 'APT',
    'APTOS': 'APT',
    'aptos': 'APT',

    // Avalanche
    'AVAX': 'AVAX',
    'AVALANCHE': 'AVAX',
    'avalanche': 'AVAX',

    // Ripple
    'XRP': 'XRP',
    'RIPPLE': 'XRP',
    'ripple': 'XRP',

    // Shiba Inu
    'SHIB': 'SHIB',
    'SHIBA': 'SHIB',
    'shiba': 'SHIB',
    'shiba inu': 'SHIB',

    // Uniswap
    'UNI': 'UNI',
    'UNISWAP': 'UNI',
    'uniswap': 'UNI',

    // Cosmos
    'ATOM': 'ATOM',
    'COSMOS': 'ATOM',
    'cosmos': 'ATOM',

    // Arbitrum
    'ARB': 'ARB',
    'ARBITRUM': 'ARB',
    'arbitrum': 'ARB',

    // Optimism
    'OP': 'OP',
    'OPTIMISM': 'OP',
    'optimism': 'OP',

    // Sui
    'SUI': 'SUI',
    'sui': 'SUI',

    // Injective
    'INJ': 'INJ',
    'INJECTIVE': 'INJ',
    'injective': 'INJ',

    // Sei
    'SEI': 'SEI',
    'sei': 'SEI',

    // Fantom
    'FTM': 'FTM',
    'FANTOM': 'FTM',
    'fantom': 'FTM',

    // Pepe
    'PEPE': 'PEPE',
    'pepe': 'PEPE',

    // dogwifhat
    'WIF': 'WIF',
    'wif': 'WIF',
    'dogwifhat': 'WIF',

    // THORChain
    'RUNE': 'RUNE',
    'THORCHAIN': 'RUNE',
    'thorchain': 'RUNE',

    // Immutable X
    'IMX': 'IMX',
    'IMMUTABLE': 'IMX',
    'immutable': 'IMX',

    // Stacks
    'STX': 'STX',
    'STACKS': 'STX',
    'stacks': 'STX',

    // Traditional Assets
    'SPX': 'SPX',
    'S&P 500': 'SPX',
    'S&P500': 'SPX',
    'sp500': 'SPX',

    'NDX': 'NDX',
    'NASDAQ': 'NDX',
    'nasdaq': 'NDX',

    'DXY': 'DXY',
    'DOLLAR': 'DXY',
    'dollar index': 'DXY',

    'GOLD': 'GOLD',
    'gold': 'GOLD',

    'WTI': 'WTI',
    'OIL': 'WTI',
    'oil': 'WTI',
    'crude': 'WTI',
};

export const CANONICAL_SYMBOLS = [
    'BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'MATIC', 'TRX', 'LINK',
    'TON', 'DOT', 'SHIB', 'LTC', 'UNI', 'AVAX', 'ATOM', 'NEAR', 'APT', 'ARB',
    'OP', 'SUI', 'INJ', 'SEI', 'FTM', 'PEPE', 'WIF', 'RUNE', 'IMX', 'STX',
    'SPX', 'NDX', 'DXY', 'GOLD', 'WTI',
] as const;

export type CanonicalSymbol = typeof CANONICAL_SYMBOLS[number];

export const ASSET_DISPLAY_NAMES: Record<string, string> = {
    'BTC': 'Bitcoin',
    'ETH': 'Ethereum',
    'SOL': 'Solana',
    'BNB': 'Binance Coin',
    'XRP': 'Ripple',
    'ADA': 'Cardano',
    'DOGE': 'Dogecoin',
    'MATIC': 'Polygon',
    'TRX': 'Tron',
    'LINK': 'Chainlink',
    'TON': 'Toncoin',
    'DOT': 'Polkadot',
    'SHIB': 'Shiba Inu',
    'LTC': 'Litecoin',
    'UNI': 'Uniswap',
    'AVAX': 'Avalanche',
    'ATOM': 'Cosmos',
    'NEAR': 'NEAR Protocol',
    'APT': 'Aptos',
    'ARB': 'Arbitrum',
    'OP': 'Optimism',
    'SUI': 'Sui',
    'INJ': 'Injective',
    'SEI': 'Sei',
    'FTM': 'Fantom',
    'PEPE': 'Pepe',
    'WIF': 'dogwifhat',
    'RUNE': 'THORChain',
    'IMX': 'Immutable X',
    'STX': 'Stacks',
    'SPX': 'S&P 500',
    'NDX': 'Nasdaq 100',
    'DXY': 'US Dollar Index',
    'GOLD': 'Gold',
    'WTI': 'Crude Oil WTI',
};

export function extractAssetSymbols(text: string): string[] {
    const found = new Set<string>();

    for (const [key, canonicalSymbol] of Object.entries(ASSET_SYMBOL_MAP)) {
        // Use word boundaries for tickers and full names
        // Escape special characters in key if any (e.g. S&P)
        // Actually our keys are fairly safe but regex safety is good
        // Simplified since we trust our keys
        const pattern = new RegExp(`\\b${key}\\b`, 'gi');
        if (pattern.test(text)) {
            if (CANONICAL_SYMBOLS.includes(canonicalSymbol as any)) {
                found.add(canonicalSymbol);
            }
        }
    }

    return Array.from(found).sort();
}
