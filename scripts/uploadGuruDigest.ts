import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

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

// Mock digest entries
const mockDigestEntries = [
  {
    title: "Whale Wallet Moved $5M in ETH",
    summary: "Large ETH transaction observed from known whale wallet. Could signal market movement.",
    link: "https://etherscan.io/address/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    date: new Date().toISOString(),
  },
  {
    title: "Institutional BTC Purchase Detected",
    summary: "Major institutional investor acquired 150 BTC across multiple wallets. Bullish sentiment growing.",
    link: "https://blockchair.com/bitcoin/transaction/abc123",
    date: new Date().toISOString(),
  },
  {
    title: "DeFi Protocol Liquidity Spike",
    summary: "Uniswap V3 pool saw $10M liquidity injection in the last 24 hours. TVL at all-time high.",
    link: "https://info.uniswap.org/#/pools",
    date: new Date().toISOString(),
  },
  {
    title: "Smart Money Exit: Top Trader Sells",
    summary: "Known profitable trader dumped entire position in PEPE token. Potential warning signal for memecoin holders.",
    link: "https://etherscan.io/address/0x1234567890123456789012345678901234567890",
    date: new Date().toISOString(),
  },
  {
    title: "Exchange Outflow Surge",
    summary: "Binance reported massive ETH outflow to cold wallets. Possible accumulation phase beginning.",
    link: "https://www.blockchain.com/explorer/assets/eth",
    date: new Date().toISOString(),
  },
  {
    title: "Solana Validator Consolidation",
    summary: "Three major SOL validators merged operations, controlling 8% of network stake. Centralization concerns raised.",
    link: "https://explorer.solana.com/address/Vote111111111111111111111111111111111111111",
    date: new Date().toISOString(),
  },
  {
    title: "NFT Whale Dumps Blue Chip Collection",
    summary: "Legendary NFT collector offloaded 12 Bored Apes at floor price. Market sentiment turning bearish.",
    link: "https://opensea.io/collection/boredapeyachtclub",
    date: new Date().toISOString(),
  },
  {
    title: "Insider Accumulation: Layer 2 Token",
    summary: "Arbitrum core team members purchased $2M in ARB tokens on-chain. Development milestone expected soon.",
    link: "https://arbiscan.io/token/0x912ce59144191c1204e64559fe8253a0e49e6548",
    date: new Date().toISOString(),
  },
  {
    title: "Mystery Wallet Activates After 5 Years",
    summary: "Dormant Bitcoin address from 2018 moved 500 BTC worth $22M. Original Mt. Gox creditor suspected.",
    link: "https://blockchair.com/bitcoin/address/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    date: new Date().toISOString(),
  },
  {
    title: "Stablecoin Mint Explosion",
    summary: "USDC issuer minted $500M in new tokens overnight. Major institutional demand or exchange restocking likely.",
    link: "https://etherscan.io/token/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    date: new Date().toISOString(),
  },
  {
    title: "Crypto VC Firm Doubles Down on AI Tokens",
    summary: "a16z-backed fund allocated $50M to AI crypto projects. Fetch.ai and Render token pumped 15% on news.",
    link: "https://www.coingecko.com/en/categories/artificial-intelligence",
    date: new Date().toISOString(),
  },
  {
    title: "MEV Bot Profits Hit Record High",
    summary: "Ethereum MEV bot extracted $3.2M in a single block. Gas wars intensifying as network activity surges.",
    link: "https://eigenphi.io/",
    date: new Date().toISOString(),
  },
  {
    title: "OTC Desk Reports Billionaire BTC Buy",
    summary: "Galaxy Digital facilitated $100M Bitcoin purchase for undisclosed UHNW client. Price discovery moving off-exchange.",
    link: "https://www.galaxydigital.io/",
    date: new Date().toISOString(),
  },
  {
    title: "Cross-Chain Bridge Sees $20M Inflow",
    summary: "Wormhole bridge recorded massive ETH → Solana transfers. DeFi migration or arbitrage opportunity emerging.",
    link: "https://wormholescan.io/",
    date: new Date().toISOString(),
  },
  {
    title: "Insider Alert: Pre-Listing Accumulation",
    summary: "Unannounced altcoin seeing heavy buying from wallets linked to Binance listing team. Potential exchange listing imminent.",
    link: "https://dexscreener.com/ethereum",
    date: new Date().toISOString(),
  },
];

async function uploadDigestEntries() {
  console.log("🚀 Starting Guru Digest upload to Firestore...\n");

  try {
    const guruDigestCollection = collection(db, "guruDigest");

    for (let i = 0; i < mockDigestEntries.length; i++) {
      const entry = mockDigestEntries[i];
      
      const docRef = await addDoc(guruDigestCollection, entry);
      
      console.log(`✅ Entry ${i + 1}/${mockDigestEntries.length} uploaded successfully`);
      console.log(`   Title: ${entry.title}`);
      console.log(`   Document ID: ${docRef.id}\n`);
    }

    console.log("🎉 All entries uploaded successfully!");
    console.log(`📊 Total entries: ${mockDigestEntries.length}`);
    
  } catch (error) {
    console.error("❌ Error uploading entries:", error);
    process.exit(1);
  }

  process.exit(0);
}

// Run the upload
uploadDigestEntries();
