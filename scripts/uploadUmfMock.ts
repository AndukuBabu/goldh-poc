import { initializeApp } from "firebase/app";
import { getFirestore, collection, setDoc, doc } from "firebase/firestore";
import type { UmfAsset, UmfSnapshot, UmfMover, UmfBrief, UmfAlert } from "../shared/schema";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCjEmAnHmKLZ8msjNeovJBF3ssg-OHzz0M",
  authDomain: "goldh-c78ca.firebaseapp.com",
  projectId: "goldh-c78ca",
  storageBucket: "goldh-c78ca.firebasestorage.app",
  messagingSenderId: "1050639201481",
  appId: "1:1050639201481:web:71c433ebb31ccb2e6b4918",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Get current UTC timestamp
const now = new Date().toISOString();
const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

/**
 * UMF Market Snapshot Mock Data
 * ~25 assets: Top-20 crypto + major indices (SPX, NDX) + DXY + commodities (Gold, Oil)
 */
const mockAssets: UmfAsset[] = [
  // Top 20 Cryptocurrencies
  {
    id: "btc-usd",
    symbol: "BTC",
    name: "Bitcoin",
    class: "crypto",
    price: 45678.90,
    changePct24h: 3.45,
    volume24h: 28500000000,
    marketCap: 890000000000,
    updatedAt_utc: now,
  },
  {
    id: "eth-usd",
    symbol: "ETH",
    name: "Ethereum",
    class: "crypto",
    price: 2435.67,
    changePct24h: 2.87,
    volume24h: 15200000000,
    marketCap: 292000000000,
    updatedAt_utc: now,
  },
  {
    id: "sol-usd",
    symbol: "SOL",
    name: "Solana",
    class: "crypto",
    price: 98.45,
    changePct24h: 8.92,
    volume24h: 3400000000,
    marketCap: 43500000000,
    updatedAt_utc: now,
  },
  {
    id: "xrp-usd",
    symbol: "XRP",
    name: "Ripple",
    class: "crypto",
    price: 0.6234,
    changePct24h: -1.23,
    volume24h: 2100000000,
    marketCap: 35200000000,
    updatedAt_utc: now,
  },
  {
    id: "bnb-usd",
    symbol: "BNB",
    name: "BNB",
    class: "crypto",
    price: 312.45,
    changePct24h: 1.56,
    volume24h: 1800000000,
    marketCap: 46700000000,
    updatedAt_utc: now,
  },
  {
    id: "ada-usd",
    symbol: "ADA",
    name: "Cardano",
    class: "crypto",
    price: 0.5678,
    changePct24h: 4.32,
    volume24h: 890000000,
    marketCap: 20100000000,
    updatedAt_utc: now,
  },
  {
    id: "avax-usd",
    symbol: "AVAX",
    name: "Avalanche",
    class: "crypto",
    price: 36.78,
    changePct24h: 6.45,
    volume24h: 780000000,
    marketCap: 14200000000,
    updatedAt_utc: now,
  },
  {
    id: "doge-usd",
    symbol: "DOGE",
    name: "Dogecoin",
    class: "crypto",
    price: 0.0845,
    changePct24h: -2.34,
    volume24h: 1200000000,
    marketCap: 12400000000,
    updatedAt_utc: now,
  },
  {
    id: "ton-usd",
    symbol: "TON",
    name: "Toncoin",
    class: "crypto",
    price: 2.34,
    changePct24h: 3.67,
    volume24h: 340000000,
    marketCap: 8100000000,
    updatedAt_utc: now,
  },
  {
    id: "dot-usd",
    symbol: "DOT",
    name: "Polkadot",
    class: "crypto",
    price: 7.23,
    changePct24h: 2.12,
    volume24h: 420000000,
    marketCap: 9800000000,
    updatedAt_utc: now,
  },
  {
    id: "matic-usd",
    symbol: "MATIC",
    name: "Polygon",
    class: "crypto",
    price: 0.8945,
    changePct24h: 5.78,
    volume24h: 560000000,
    marketCap: 8500000000,
    updatedAt_utc: now,
  },
  {
    id: "link-usd",
    symbol: "LINK",
    name: "Chainlink",
    class: "crypto",
    price: 14.67,
    changePct24h: 1.89,
    volume24h: 670000000,
    marketCap: 8900000000,
    updatedAt_utc: now,
  },
  {
    id: "ltc-usd",
    symbol: "LTC",
    name: "Litecoin",
    class: "crypto",
    price: 84.56,
    changePct24h: -0.67,
    volume24h: 520000000,
    marketCap: 6300000000,
    updatedAt_utc: now,
  },
  {
    id: "uni-usd",
    symbol: "UNI",
    name: "Uniswap",
    class: "crypto",
    price: 6.78,
    changePct24h: 3.45,
    volume24h: 280000000,
    marketCap: 5100000000,
    updatedAt_utc: now,
  },
  {
    id: "atom-usd",
    symbol: "ATOM",
    name: "Cosmos",
    class: "crypto",
    price: 10.34,
    changePct24h: 4.12,
    volume24h: 310000000,
    marketCap: 4100000000,
    updatedAt_utc: now,
  },
  {
    id: "icp-usd",
    symbol: "ICP",
    name: "Internet Computer",
    class: "crypto",
    price: 12.45,
    changePct24h: -3.21,
    volume24h: 190000000,
    marketCap: 5700000000,
    updatedAt_utc: now,
  },
  {
    id: "apt-usd",
    symbol: "APT",
    name: "Aptos",
    class: "crypto",
    price: 8.92,
    changePct24h: 7.34,
    volume24h: 240000000,
    marketCap: 3400000000,
    updatedAt_utc: now,
  },
  {
    id: "arb-usd",
    symbol: "ARB",
    name: "Arbitrum",
    class: "crypto",
    price: 1.23,
    changePct24h: 2.56,
    volume24h: 380000000,
    marketCap: 4800000000,
    updatedAt_utc: now,
  },
  {
    id: "op-usd",
    symbol: "OP",
    name: "Optimism",
    class: "crypto",
    price: 2.67,
    changePct24h: 1.78,
    volume24h: 220000000,
    marketCap: 3200000000,
    updatedAt_utc: now,
  },
  {
    id: "near-usd",
    symbol: "NEAR",
    name: "NEAR Protocol",
    class: "crypto",
    price: 3.45,
    changePct24h: 5.23,
    volume24h: 180000000,
    marketCap: 3700000000,
    updatedAt_utc: now,
  },
  
  // Major Stock Indices
  {
    id: "spx",
    symbol: "SPX",
    name: "S&P 500",
    class: "index",
    price: 4789.34,
    changePct24h: 0.82,
    volume24h: null,
    marketCap: null,
    updatedAt_utc: now,
  },
  {
    id: "ndx",
    symbol: "NDX",
    name: "NASDAQ 100",
    class: "index",
    price: 16834.56,
    changePct24h: 1.15,
    volume24h: null,
    marketCap: null,
    updatedAt_utc: now,
  },
  
  // Forex
  {
    id: "dxy",
    symbol: "DXY",
    name: "US Dollar Index",
    class: "forex",
    price: 103.45,
    changePct24h: -0.34,
    volume24h: null,
    marketCap: null,
    updatedAt_utc: now,
  },
  
  // Commodities
  {
    id: "gold",
    symbol: "GOLD",
    name: "Gold Spot",
    class: "commodity",
    price: 2067.80,
    changePct24h: -1.12,
    volume24h: null,
    marketCap: null,
    updatedAt_utc: now,
  },
  {
    id: "oil",
    symbol: "WTI",
    name: "Crude Oil WTI",
    class: "commodity",
    price: 72.34,
    changePct24h: 2.45,
    volume24h: null,
    marketCap: null,
    updatedAt_utc: now,
  },
];

const mockSnapshot: UmfSnapshot = {
  timestamp_utc: now,
  assets: mockAssets,
};

/**
 * UMF Top Movers Mock Data
 * Top 5 gainers + Top 5 losers
 */
const mockMovers: UmfMover[] = [
  // Top 5 Gainers
  {
    symbol: "SOL",
    name: "Solana",
    class: "crypto",
    direction: "gainer",
    changePct24h: 8.92,
    price: 98.45,
    updatedAt_utc: now,
  },
  {
    symbol: "APT",
    name: "Aptos",
    class: "crypto",
    direction: "gainer",
    changePct24h: 7.34,
    price: 8.92,
    updatedAt_utc: now,
  },
  {
    symbol: "AVAX",
    name: "Avalanche",
    class: "crypto",
    direction: "gainer",
    changePct24h: 6.45,
    price: 36.78,
    updatedAt_utc: now,
  },
  {
    symbol: "MATIC",
    name: "Polygon",
    class: "crypto",
    direction: "gainer",
    changePct24h: 5.78,
    price: 0.8945,
    updatedAt_utc: now,
  },
  {
    symbol: "NEAR",
    name: "NEAR Protocol",
    class: "crypto",
    direction: "gainer",
    changePct24h: 5.23,
    price: 3.45,
    updatedAt_utc: now,
  },
  
  // Top 5 Losers
  {
    symbol: "ICP",
    name: "Internet Computer",
    class: "crypto",
    direction: "loser",
    changePct24h: -3.21,
    price: 12.45,
    updatedAt_utc: now,
  },
  {
    symbol: "DOGE",
    name: "Dogecoin",
    class: "crypto",
    direction: "loser",
    changePct24h: -2.34,
    price: 0.0845,
    updatedAt_utc: now,
  },
  {
    symbol: "XRP",
    name: "Ripple",
    class: "crypto",
    direction: "loser",
    changePct24h: -1.23,
    price: 0.6234,
    updatedAt_utc: now,
  },
  {
    symbol: "GOLD",
    name: "Gold Spot",
    class: "commodity",
    direction: "loser",
    changePct24h: -1.12,
    price: 2067.80,
    updatedAt_utc: now,
  },
  {
    symbol: "LTC",
    name: "Litecoin",
    class: "crypto",
    direction: "loser",
    changePct24h: -0.67,
    price: 84.56,
    updatedAt_utc: now,
  },
];

/**
 * UMF Morning Intelligence Brief
 * Today's market summary with headline + bullets
 */
const mockBrief: UmfBrief = {
  date_utc: today,
  headline: "Crypto rallies on institutional inflows as Fed signals dovish stance",
  bullets: [
    "Bitcoin +3.5% driven by spot ETF inflows totaling $850M in 24 hours",
    "Solana leads altcoin rally with +8.9%, breaking $100 resistance on DeFi growth",
    "S&P 500 and NASDAQ gain 0.8% and 1.2% respectively on tech sector optimism",
    "DXY falls -0.3% following dovish Fed commentary, supporting risk assets",
    "Gold consolidates below $2,070 as rate cut expectations shift to Q2 2025",
  ],
};

/**
 * UMF Alerts Mock Data (Optional)
 * ≤3 active alerts for significant market events
 */
const mockAlerts: UmfAlert[] = [
  {
    id: "alert-20250107-001",
    title: "BTC Volatility Spike Detected",
    body: "Bitcoin volatility increased 45% in the last hour following ETF inflow data. Consider reviewing stop-loss levels for leveraged positions.",
    severity: "warn",
    createdAt_utc: now,
  },
  {
    id: "alert-20250107-002",
    title: "SOL Breaks $100 Resistance",
    body: "Solana successfully breached the $100 psychological level with strong volume. Watch for potential pullback to $95 support zone.",
    severity: "info",
    createdAt_utc: now,
  },
  {
    id: "alert-20250107-003",
    title: "DXY Approaching Key Support",
    body: "US Dollar Index testing critical support at 103.00. Break below could accelerate crypto and equity rally. High conviction setup.",
    severity: "high",
    createdAt_utc: now,
  },
];

/**
 * Dry-run mode flag
 * Set to false to actually write to Firestore
 */
const DRY_RUN = process.argv.includes('--dry-run');

/**
 * Upload UMF Mock Data to Firestore
 */
async function uploadUmfMockData() {
  console.log("🚀 Starting UMF Mock Data Upload to Firestore...\n");
  console.log(`📌 Mode: ${DRY_RUN ? '🔍 DRY RUN (no writes)' : '✍️  LIVE (writing to Firestore)'}\n`);
  
  const summary = {
    snapshot: 0,
    movers: 0,
    brief: 0,
    alerts: 0,
  };

  try {
    // 1. Upload Market Snapshot
    console.log("📊 [1/4] Uploading Market Snapshot...");
    if (DRY_RUN) {
      console.log(`   → Would create: umf_snapshot_mock/current`);
      console.log(`   → Assets: ${mockSnapshot.assets.length}`);
      console.log(`   → Timestamp: ${mockSnapshot.timestamp_utc}`);
    } else {
      await setDoc(doc(db, "umf_snapshot_mock", "current"), mockSnapshot);
      summary.snapshot = 1;
      console.log(`   ✅ Snapshot uploaded successfully`);
      console.log(`   → Document ID: current`);
      console.log(`   → Assets: ${mockSnapshot.assets.length}`);
    }
    console.log("");

    // 2. Upload Top Movers
    console.log("📈 [2/4] Uploading Top Movers...");
    if (DRY_RUN) {
      console.log(`   → Would create ${mockMovers.length} mover documents`);
      mockMovers.forEach((mover, idx) => {
        console.log(`   → ${idx + 1}. ${mover.symbol} (${mover.direction}): ${mover.changePct24h > 0 ? '+' : ''}${mover.changePct24h.toFixed(2)}%`);
      });
    } else {
      for (let i = 0; i < mockMovers.length; i++) {
        const mover = mockMovers[i];
        const docId = `${mover.direction}-${mover.symbol.toLowerCase()}`;
        await setDoc(doc(db, "umf_movers_mock", docId), mover);
        summary.movers++;
        console.log(`   ✅ ${i + 1}/${mockMovers.length}: ${mover.symbol} (${mover.direction}) ${mover.changePct24h > 0 ? '+' : ''}${mover.changePct24h.toFixed(2)}%`);
      }
    }
    console.log("");

    // 3. Upload Morning Intelligence Brief
    console.log("📰 [3/4] Uploading Morning Intelligence...");
    if (DRY_RUN) {
      console.log(`   → Would create: umf_brief_mock/today`);
      console.log(`   → Headline: "${mockBrief.headline}"`);
      console.log(`   → Bullets: ${mockBrief.bullets.length}`);
    } else {
      await setDoc(doc(db, "umf_brief_mock", "today"), mockBrief);
      summary.brief = 1;
      console.log(`   ✅ Brief uploaded successfully`);
      console.log(`   → Document ID: today`);
      console.log(`   → Headline: "${mockBrief.headline}"`);
    }
    console.log("");

    // 4. Upload Alerts (Optional)
    console.log("🔔 [4/4] Uploading Alerts (Optional)...");
    if (DRY_RUN) {
      console.log(`   → Would create ${mockAlerts.length} alert documents`);
      mockAlerts.forEach((alert, idx) => {
        console.log(`   → ${idx + 1}. [${alert.severity.toUpperCase()}] ${alert.title}`);
      });
    } else {
      for (let i = 0; i < mockAlerts.length; i++) {
        const alert = mockAlerts[i];
        await setDoc(doc(db, "umf_alerts_mock", alert.id), alert);
        summary.alerts++;
        console.log(`   ✅ ${i + 1}/${mockAlerts.length}: [${alert.severity.toUpperCase()}] ${alert.title}`);
      }
    }
    console.log("");

    // Summary
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("📋 UPLOAD SUMMARY");
    console.log("═══════════════════════════════════════════════════════════════");
    if (DRY_RUN) {
      console.log("🔍 DRY RUN - No data was written to Firestore");
      console.log("");
      console.log("Preview of what would be created:");
      console.log(`   • umf_snapshot_mock: 1 document (${mockSnapshot.assets.length} assets)`);
      console.log(`   • umf_movers_mock: ${mockMovers.length} documents (5 gainers + 5 losers)`);
      console.log(`   • umf_brief_mock: 1 document (${mockBrief.bullets.length} bullets)`);
      console.log(`   • umf_alerts_mock: ${mockAlerts.length} documents`);
      console.log("");
      console.log("💡 Run without --dry-run flag to write to Firestore");
    } else {
      console.log("✅ All data uploaded successfully!");
      console.log("");
      console.log("Collections created:");
      console.log(`   ✅ umf_snapshot_mock: ${summary.snapshot} document (${mockSnapshot.assets.length} assets)`);
      console.log(`   ✅ umf_movers_mock: ${summary.movers} documents (${mockMovers.filter(m => m.direction === 'gainer').length} gainers + ${mockMovers.filter(m => m.direction === 'loser').length} losers)`);
      console.log(`   ✅ umf_brief_mock: ${summary.brief} document (${mockBrief.bullets.length} bullets)`);
      console.log(`   ✅ umf_alerts_mock: ${summary.alerts} documents`);
      console.log("");
      console.log("📊 Asset Breakdown:");
      const assetsByClass = mockSnapshot.assets.reduce((acc, asset) => {
        acc[asset.class] = (acc[asset.class] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      Object.entries(assetsByClass).forEach(([cls, count]) => {
        console.log(`   • ${cls}: ${count} assets`);
      });
    }
    console.log("═══════════════════════════════════════════════════════════════");
    
  } catch (error) {
    console.error("❌ Error uploading UMF mock data:", error);
    process.exit(1);
  }

  process.exit(0);
}

// Run the upload
console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║           UMF Mock Data Seeding Script                         ║
║           Universal Market Financials                          ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`);

uploadUmfMockData();
