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
    link: "https://etherscan.io/address/0x123...",
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
    summary: "Known profitable trader dumped entire position in XYZ token. Potential warning signal.",
    link: "https://etherscan.io/address/0x456...",
    date: new Date().toISOString(),
  },
  {
    title: "Exchange Outflow Surge",
    summary: "Binance reported massive ETH outflow to cold wallets. Possible accumulation phase beginning.",
    link: "https://www.blockchain.com/explorer",
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
