/**
 * Shared Constants for Asset Tagging and Identification
 * 
 * This file contains canonical asset symbols, aliases, and regex patterns
 * used across the application for tagging Guru Digest articles, linking assets,
 * and filtering content.
 */

/**
 * Asset Symbol Mapping
 * Maps various mentions (ticker, full name, common aliases) to canonical symbols
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

/**
 * Canonical Asset Symbols
 * Primary list of all tracked assets in the system
 */
export const CANONICAL_SYMBOLS = [
  // Top Cryptocurrencies (by market cap)
  'BTC',
  'ETH',
  'SOL',
  'BNB',
  'XRP',
  'ADA',
  'DOGE',
  'MATIC',
  'TRX',
  'LINK',
  'TON',
  'DOT',
  'SHIB',
  'LTC',
  'UNI',
  'AVAX',
  'ATOM',
  'NEAR',
  'APT',
  'ARB',
  'OP',
  'SUI',
  'INJ',
  'SEI',
  'FTM',
  'PEPE',
  'WIF',
  'RUNE',
  'IMX',
  'STX',
  
  // Traditional Indices
  'SPX',
  'NDX',
  
  // Forex
  'DXY',
  
  // Commodities
  'GOLD',
  'WTI',
] as const;

export type CanonicalSymbol = typeof CANONICAL_SYMBOLS[number];

/**
 * Asset Display Names
 * Maps symbols to their full display names
 */
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

/**
 * Asset Classes
 * Maps symbols to their asset class
 */
export const ASSET_CLASSES: Record<string, 'crypto' | 'index' | 'forex' | 'commodity'> = {
  'BTC': 'crypto',
  'ETH': 'crypto',
  'SOL': 'crypto',
  'BNB': 'crypto',
  'XRP': 'crypto',
  'ADA': 'crypto',
  'DOGE': 'crypto',
  'MATIC': 'crypto',
  'TRX': 'crypto',
  'LINK': 'crypto',
  'TON': 'crypto',
  'DOT': 'crypto',
  'SHIB': 'crypto',
  'LTC': 'crypto',
  'UNI': 'crypto',
  'AVAX': 'crypto',
  'ATOM': 'crypto',
  'NEAR': 'crypto',
  'APT': 'crypto',
  'ARB': 'crypto',
  'OP': 'crypto',
  'SUI': 'crypto',
  'INJ': 'crypto',
  'SEI': 'crypto',
  'FTM': 'crypto',
  'PEPE': 'crypto',
  'WIF': 'crypto',
  'RUNE': 'crypto',
  'IMX': 'crypto',
  'STX': 'crypto',
  'SPX': 'index',
  'NDX': 'index',
  'DXY': 'forex',
  'GOLD': 'commodity',
  'WTI': 'commodity',
};

/**
 * Extract asset symbols from text using deterministic regex matching
 * 
 * @param text - Text to search for asset mentions (title, summary, etc.)
 * @returns Array of canonical symbols found in the text
 * 
 * @example
 * extractAssetSymbols("Bitcoin rallies to $50k as ETH breaks resistance")
 * // Returns: ['BTC', 'ETH']
 */
export function extractAssetSymbols(text: string): string[] {
  const found = new Set<string>();
  
  // Check each mapping key against the text
  for (const [key, canonicalSymbol] of Object.entries(ASSET_SYMBOL_MAP)) {
    // Use word boundaries for tickers and full names
    const pattern = new RegExp(`\\b${key}\\b`, 'gi');
    if (pattern.test(text)) {
      // Safeguard: Only add if it's actually in CANONICAL_SYMBOLS
      if (CANONICAL_SYMBOLS.includes(canonicalSymbol as any)) {
        found.add(canonicalSymbol);
      } else {
        console.warn(`[Asset Tagging] Non-canonical symbol detected: ${canonicalSymbol} from key "${key}". Skipping.`);
      }
    }
  }
  
  return Array.from(found).sort();
}
