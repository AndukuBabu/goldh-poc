import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import type { EconEvent } from "../shared/schema";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Generate a date offset from now
 * Positive days = future, Negative days = past
 */
function getDateOffset(daysOffset: number, hour: number = 13, minute: number = 30): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setUTCHours(hour, minute, 0, 0);
  return date.toISOString();
}

/**
 * Generate realistic mock events spanning past 7 days + next 21 days
 * Total: ~60 events with realistic distribution
 */
function generateMockEvents(): Omit<EconEvent, 'id'>[] {
  const events: Omit<EconEvent, 'id'>[] = [];

  // ==================== PAST EVENTS (Released) ====================
  // Past 7 days - events have 'actual' values filled

  // -7 days
  events.push({
    title: "US Non-Farm Payrolls (NFP)",
    country: "US",
    category: "Employment",
    datetime_utc: getDateOffset(-7, 13, 30),
    importance: "High",
    previous: 227000,
    forecast: 180000,
    actual: 199000,
    source: "Mock",
    status: "released",
    impactScore: 72,
    confidence: 88,
  });

  events.push({
    title: "US Unemployment Rate",
    country: "US",
    category: "Employment",
    datetime_utc: getDateOffset(-7, 13, 30),
    importance: "High",
    previous: 3.7,
    forecast: 3.8,
    actual: 3.7,
    source: "Mock",
    status: "released",
    impactScore: 45,
    confidence: 82,
  });

  // -6 days
  events.push({
    title: "China Manufacturing PMI",
    country: "CN",
    category: "Other",
    datetime_utc: getDateOffset(-6, 1, 0),
    importance: "High",
    previous: 49.5,
    forecast: 50.0,
    actual: 50.3,
    source: "Mock",
    status: "released",
    impactScore: 68,
    confidence: 79,
  });

  events.push({
    title: "EU Consumer Price Index (YoY)",
    country: "EU",
    category: "Inflation",
    datetime_utc: getDateOffset(-6, 10, 0),
    importance: "High",
    previous: 2.9,
    forecast: 2.7,
    actual: 2.8,
    source: "Mock",
    status: "released",
    impactScore: 55,
    confidence: 85,
  });

  // -5 days
  events.push({
    title: "US ISM Services PMI",
    country: "US",
    category: "Other",
    datetime_utc: getDateOffset(-5, 15, 0),
    importance: "Medium",
    previous: 52.7,
    forecast: 52.5,
    actual: 53.1,
    source: "Mock",
    status: "released",
    impactScore: 42,
    confidence: 76,
  });

  events.push({
    title: "UK BoE Rate Decision",
    country: "UK",
    category: "Rates",
    datetime_utc: getDateOffset(-5, 12, 0),
    importance: "High",
    previous: 5.25,
    forecast: 5.25,
    actual: 5.25,
    source: "Mock",
    status: "released",
    impactScore: 38,
    confidence: 91,
  });

  // -4 days
  events.push({
    title: "Japan BoJ Monetary Policy Statement",
    country: "JP",
    category: "Rates",
    datetime_utc: getDateOffset(-4, 3, 0),
    importance: "High",
    previous: -0.10,
    forecast: -0.10,
    actual: -0.10,
    source: "Mock",
    status: "released",
    impactScore: 35,
    confidence: 87,
  });

  events.push({
    title: "Singapore GDP (QoQ) Advance",
    country: "SG",
    category: "GDP",
    datetime_utc: getDateOffset(-4, 0, 30),
    importance: "Medium",
    previous: 0.8,
    forecast: 1.0,
    actual: 1.2,
    source: "Mock",
    status: "released",
    impactScore: 51,
    confidence: 73,
  });

  // -3 days
  events.push({
    title: "US Initial Jobless Claims",
    country: "US",
    category: "Employment",
    datetime_utc: getDateOffset(-3, 13, 30),
    importance: "Medium",
    previous: 210000,
    forecast: 215000,
    actual: 218000,
    source: "Mock",
    status: "released",
    impactScore: 28,
    confidence: 69,
  });

  events.push({
    title: "Coinbase Q4 Earnings Report",
    country: "US",
    category: "Earnings",
    datetime_utc: getDateOffset(-3, 21, 0),
    importance: "High",
    previous: 674000000,
    forecast: 700000000,
    actual: 953000000,
    source: "Mock",
    status: "released",
    impactScore: 84,
    confidence: 91,
  });

  // -2 days
  events.push({
    title: "EU Eurozone GDP (QoQ) Flash",
    country: "EU",
    category: "GDP",
    datetime_utc: getDateOffset(-2, 10, 0),
    importance: "High",
    previous: 0.0,
    forecast: 0.1,
    actual: 0.0,
    source: "Mock",
    status: "released",
    impactScore: 62,
    confidence: 80,
  });

  events.push({
    title: "UK Consumer Price Index (YoY)",
    country: "UK",
    category: "Inflation",
    datetime_utc: getDateOffset(-2, 7, 0),
    importance: "High",
    previous: 4.0,
    forecast: 3.8,
    actual: 3.9,
    source: "Mock",
    status: "released",
    impactScore: 47,
    confidence: 84,
  });

  // -1 day
  events.push({
    title: "US Core CPI (MoM)",
    country: "US",
    category: "Inflation",
    datetime_utc: getDateOffset(-1, 13, 30),
    importance: "High",
    previous: 0.3,
    forecast: 0.3,
    actual: 0.4,
    source: "Mock",
    status: "released",
    impactScore: 78,
    confidence: 89,
  });

  events.push({
    title: "US CPI (YoY)",
    country: "US",
    category: "Inflation",
    datetime_utc: getDateOffset(-1, 13, 30),
    importance: "High",
    previous: 3.1,
    forecast: 2.9,
    actual: 3.0,
    source: "Mock",
    status: "released",
    impactScore: 81,
    confidence: 92,
  });

  events.push({
    title: "MicroStrategy Bitcoin Holdings Update",
    country: "US",
    category: "Earnings",
    datetime_utc: getDateOffset(-1, 20, 0),
    importance: "Medium",
    previous: null,
    forecast: null,
    actual: null,
    source: "Mock",
    status: "released",
    impactScore: 65,
    confidence: 75,
  });

  // ==================== UPCOMING EVENTS (Next 21 days) ====================
  // Future events have no 'actual' values

  // +1 day
  events.push({
    title: "US Retail Sales (MoM)",
    country: "US",
    category: "Other",
    datetime_utc: getDateOffset(1, 13, 30),
    importance: "Medium",
    previous: 0.4,
    forecast: 0.3,
    actual: null,
    source: "Mock",
    status: "upcoming",
    impactScore: 52,
    confidence: 78,
  });

  events.push({
    title: "EU ECB Press Conference",
    country: "EU",
    category: "Rates",
    datetime_utc: getDateOffset(1, 13, 45),
    importance: "High",
    previous: null,
    forecast: null,
    actual: null,
    source: "Mock",
    status: "upcoming",
    impactScore: 87,
    confidence: 85,
  });

  // +2 days
  events.push({
    title: "US Producer Price Index (YoY)",
    country: "US",
    category: "Inflation",
    datetime_utc: getDateOffset(2, 13, 30),
    importance: "Medium",
    previous: 2.4,
    forecast: 2.2,
    actual: null,
    source: "Mock",
    status: "upcoming",
    impactScore: 59,
    confidence: 81,
  });

  events.push({
    title: "UK GDP (QoQ) Preliminary",
    country: "UK",
    category: "GDP",
    datetime_utc: getDateOffset(2, 7, 0),
    importance: "High",
    previous: -0.1,
    forecast: 0.2,
    actual: null,
    source: "Mock",
    status: "upcoming",
    impactScore: 71,
    confidence: 77,
  });

  // +3 days
  events.push({
    title: "US Industrial Production (MoM)",
    country: "US",
    category: "Other",
    datetime_utc: getDateOffset(3, 14, 15),
    importance: "Low",
    previous: 0.9,
    forecast: 0.3,
    actual: null,
    source: "Mock",
    status: "upcoming",
    impactScore: 32,
    confidence: 68,
  });

  events.push({
    title: "Singapore CPI (YoY)",
    country: "SG",
    category: "Inflation",
    datetime_utc: getDateOffset(3, 0, 30),
    importance: "Medium",
    previous: 3.6,
    forecast: 3.4,
    actual: null,
    source: "Mock",
    status: "upcoming",
    impactScore: 44,
    confidence: 72,
  });

  // +4 days
  events.push({
    title: "US Building Permits",
    country: "US",
    category: "Other",
    datetime_utc: getDateOffset(4, 13, 30),
    importance: "Low",
    previous: 1495000,
    forecast: 1500000,
    actual: null,
    source: "Mock",
    status: "upcoming",
    impactScore: 18,
    confidence: 65,
  });

  events.push({
    title: "China Retail Sales (YoY)",
    country: "CN",
    category: "Other",
    datetime_utc: getDateOffset(4, 2, 0),
    importance: "Medium",
    previous: 5.5,
    forecast: 5.8,
    actual: null,
    source: "Mock",
    status: "upcoming",
    impactScore: 48,
    confidence: 74,
  });

  // +5 days
  events.push({
    title: "US Housing Starts",
    country: "US",
    category: "Other",
    datetime_utc: getDateOffset(5, 13, 30),
    importance: "Low",
    previous: 1560000,
    forecast: 1580000,
    actual: null,
    source: "Mock",
    status: "upcoming",
    impactScore: 22,
    confidence: 63,
  });

  events.push({
    title: "EU Consumer Confidence Flash",
    country: "EU",
    category: "Other",
    datetime_utc: getDateOffset(5, 15, 0),
    importance: "Low",
    previous: -16.1,
    forecast: -15.5,
    actual: null,
    source: "Mock",
    status: "upcoming",
    impactScore: 25,
    confidence: 66,
  });

  // +6 days
  events.push({
    title: "US Durable Goods Orders (MoM)",
    country: "US",
    category: "Other",
    datetime_utc: getDateOffset(6, 13, 30),
    importance: "Medium",
    previous: 1.3,
    forecast: 0.5,
    actual: null,
    source: "Mock",
    status: "upcoming",
    impactScore: 41,
    confidence: 70,
  });

  events.push({
    title: "Japan Tokyo CPI (YoY)",
    country: "JP",
    category: "Inflation",
    datetime_utc: getDateOffset(6, 23, 30),
    importance: "Medium",
    previous: 2.6,
    forecast: 2.5,
    actual: null,
    source: "Mock",
    status: "upcoming",
    impactScore: 38,
    confidence: 71,
  });

  // +7 days (Week 2 begins)
  events.push({
    title: "US GDP (QoQ) Advance",
    country: "US",
    category: "GDP",
    datetime_utc: getDateOffset(7, 13, 30),
    importance: "High",
    previous: 2.8,
    forecast: 2.5,
    actual: null,
    source: "Mock",
    status: "upcoming",
    impactScore: 79,
    confidence: 83,
  });

  events.push({
    title: "US Core PCE Price Index (YoY)",
    country: "US",
    category: "Inflation",
    datetime_utc: getDateOffset(7, 13, 30),
    importance: "High",
    previous: 2.9,
    forecast: 2.8,
    actual: null,
    source: "Mock",
    status: "upcoming",
    impactScore: 76,
    confidence: 86,
  });

  // +8 days
  events.push({
    title: "US Personal Income (MoM)",
    country: "US",
    category: "Other",
    datetime_utc: getDateOffset(8, 13, 30),
    importance: "Low",
    previous: 0.3,
    forecast: 0.4,
    actual: null,
    source: "Mock",
    status: "upcoming",
    impactScore: 29,
    confidence: 67,
  });

  events.push({
    title: "UK Manufacturing PMI",
    country: "UK",
    category: "Other",
    datetime_utc: getDateOffset(8, 9, 30),
    importance: "Medium",
    previous: 47.1,
    forecast: 47.5,
    actual: null,
    source: "Mock",
    status: "upcoming",
    impactScore: 36,
    confidence: 69,
  });

  // +9 days
  events.push({
    title: "US ISM Manufacturing PMI",
    country: "US",
    category: "Other",
    datetime_utc: getDateOffset(9, 15, 0),
    importance: "High",
    previous: 47.4,
    forecast: 48.0,
    actual: null,
    source: "Mock",
    status: "upcoming",
    impactScore: 64,
    confidence: 80,
  });

  events.push({
    title: "EU Manufacturing PMI Final",
    country: "EU",
    category: "Other",
    datetime_utc: getDateOffset(9, 9, 0),
    importance: "Medium",
    previous: 44.2,
    forecast: 44.5,
    actual: null,
    source: "Mock",
    status: "upcoming",
    impactScore: 39,
    confidence: 73,
  });

  // +10 days
  events.push({
    title: "US ADP Employment Change",
    country: "US",
    category: "Employment",
    datetime_utc: getDateOffset(10, 13, 15),
    importance: "Medium",
    previous: 107000,
    forecast: 140000,
    actual: null,
    source: "Mock",
    status: "upcoming",
    impactScore: 56,
    confidence: 75,
  });

  events.push({
    title: "Singapore GDP (YoY) Advance",
    country: "SG",
    category: "GDP",
    datetime_utc: getDateOffset(10, 0, 30),
    importance: "Medium",
    previous: 1.0,
    forecast: 1.3,
    actual: null,
    source: "Mock",
    status: "upcoming",
    impactScore: 43,
    confidence: 71,
  });

  // +11 days
  events.push({
    title: "US Crude Oil Inventories",
    country: "US",
    category: "Other",
    datetime_utc: getDateOffset(11, 15, 30),
    importance: "Low",
    previous: 2500000,
    forecast: -1000000,
    actual: null,
    source: "Mock",
    status: "upcoming",
    impactScore: 31,
    confidence: 62,
  });

  events.push({
    title: "China Industrial Production (YoY)",
    country: "CN",
    category: "Other",
    datetime_utc: getDateOffset(11, 2, 0),
    importance: "Medium",
    previous: 6.6,
    forecast: 6.8,
    actual: null,
    source: "Mock",
    status: "upcoming",
    impactScore: 49,
    confidence: 76,
  });

  // +12 days
  events.push({
    title: "US Initial Jobless Claims",
    country: "US",
    category: "Employment",
    datetime_utc: getDateOffset(12, 13, 30),
    importance: "Medium",
    previous: 218000,
    forecast: 215000,
    actual: null,
    source: "Mock",
    status: "upcoming",
    impactScore: 34,
    confidence: 70,
  });

  events.push({
    title: "Japan Retail Sales (YoY)",
    country: "JP",
    category: "Other",
    datetime_utc: getDateOffset(12, 23, 50),
    importance: "Low",
    previous: 0.8,
    forecast: 1.2,
    actual: null,
    source: "Mock",
    status: "upcoming",
    impactScore: 26,
    confidence: 64,
  });

  // +13 days
  events.push({
    title: "EU ECB Rate Decision",
    country: "EU",
    category: "Rates",
    datetime_utc: getDateOffset(13, 13, 15),
    importance: "High",
    previous: 4.00,
    forecast: 3.75,
    actual: null,
    source: "Mock",
    status: "upcoming",
    impactScore: 92,
    confidence: 90,
  });

  events.push({
    title: "Crypto Regulation Hearing - US Senate",
    country: "US",
    category: "Other",
    datetime_utc: getDateOffset(13, 15, 0),
    importance: "High",
    previous: null,
    forecast: null,
    actual: null,
    source: "Mock",
    status: "upcoming",
    impactScore: 88,
    confidence: 82,
  });

  // +14 days (Week 3 begins)
  events.push({
    title: "US Non-Farm Payrolls (NFP)",
    country: "US",
    category: "Employment",
    datetime_utc: getDateOffset(14, 13, 30),
    importance: "High",
    previous: 199000,
    forecast: 185000,
    actual: null,
    source: "Mock",
    status: "upcoming",
    impactScore: 85,
    confidence: 88,
  });

  events.push({
    title: "US Unemployment Rate",
    country: "US",
    category: "Employment",
    datetime_utc: getDateOffset(14, 13, 30),
    importance: "High",
    previous: 3.7,
    forecast: 3.7,
    actual: null,
    source: "Mock",
    status: "upcoming",
    impactScore: 73,
    confidence: 84,
  });

  // +15 days
  events.push({
    title: "UK Services PMI",
    country: "UK",
    category: "Other",
    datetime_utc: getDateOffset(15, 9, 30),
    importance: "Medium",
    previous: 53.4,
    forecast: 53.0,
    actual: null,
    source: "Mock",
    status: "upcoming",
    impactScore: 37,
    confidence: 72,
  });

  events.push({
    title: "China CPI (YoY)",
    country: "CN",
    category: "Inflation",
    datetime_utc: getDateOffset(15, 1, 30),
    importance: "High",
    previous: -0.5,
    forecast: -0.2,
    actual: null,
    source: "Mock",
    status: "upcoming",
    impactScore: 67,
    confidence: 79,
  });

  // +16 days
  events.push({
    title: "US FOMC Meeting Minutes",
    country: "US",
    category: "Rates",
    datetime_utc: getDateOffset(16, 19, 0),
    importance: "High",
    previous: null,
    forecast: null,
    actual: null,
    source: "Mock",
    status: "upcoming",
    impactScore: 83,
    confidence: 87,
  });

  events.push({
    title: "Binance BNB Quarterly Burn Report",
    country: "Global",
    category: "Earnings",
    datetime_utc: getDateOffset(16, 8, 0),
    importance: "Medium",
    previous: null,
    forecast: null,
    actual: null,
    source: "Mock",
    status: "upcoming",
    impactScore: 61,
    confidence: 74,
  });

  // +17 days
  events.push({
    title: "US CPI (YoY)",
    country: "US",
    category: "Inflation",
    datetime_utc: getDateOffset(17, 13, 30),
    importance: "High",
    previous: 3.0,
    forecast: 2.9,
    actual: null,
    source: "Mock",
    status: "upcoming",
    impactScore: 89,
    confidence: 91,
  });

  events.push({
    title: "US Core CPI (MoM)",
    country: "US",
    category: "Inflation",
    datetime_utc: getDateOffset(17, 13, 30),
    importance: "High",
    previous: 0.4,
    forecast: 0.3,
    actual: null,
    source: "Mock",
    status: "upcoming",
    impactScore: 82,
    confidence: 89,
  });

  // +18 days
  events.push({
    title: "EU Industrial Production (MoM)",
    country: "EU",
    category: "Other",
    datetime_utc: getDateOffset(18, 10, 0),
    importance: "Low",
    previous: -0.3,
    forecast: 0.2,
    actual: null,
    source: "Mock",
    status: "upcoming",
    impactScore: 27,
    confidence: 68,
  });

  events.push({
    title: "Japan GDP (QoQ) Preliminary",
    country: "JP",
    category: "GDP",
    datetime_utc: getDateOffset(18, 23, 50),
    importance: "High",
    previous: -0.7,
    forecast: 0.3,
    actual: null,
    source: "Mock",
    status: "upcoming",
    impactScore: 75,
    confidence: 81,
  });

  // +19 days
  events.push({
    title: "US Retail Sales (MoM)",
    country: "US",
    category: "Other",
    datetime_utc: getDateOffset(19, 13, 30),
    importance: "Medium",
    previous: 0.3,
    forecast: 0.4,
    actual: null,
    source: "Mock",
    status: "upcoming",
    impactScore: 54,
    confidence: 77,
  });

  events.push({
    title: "Singapore Exports (MoM)",
    country: "SG",
    category: "Other",
    datetime_utc: getDateOffset(19, 0, 30),
    importance: "Low",
    previous: 1.7,
    forecast: 2.0,
    actual: null,
    source: "Mock",
    status: "upcoming",
    impactScore: 21,
    confidence: 61,
  });

  // +20 days
  events.push({
    title: "US Philadelphia Fed Manufacturing Index",
    country: "US",
    category: "Other",
    datetime_utc: getDateOffset(20, 13, 30),
    importance: "Low",
    previous: -5.2,
    forecast: -3.0,
    actual: null,
    source: "Mock",
    status: "upcoming",
    impactScore: 23,
    confidence: 64,
  });

  events.push({
    title: "UK CPI (YoY)",
    country: "UK",
    category: "Inflation",
    datetime_utc: getDateOffset(20, 7, 0),
    importance: "High",
    previous: 3.9,
    forecast: 3.7,
    actual: null,
    source: "Mock",
    status: "upcoming",
    impactScore: 69,
    confidence: 83,
  });

  // +21 days (Final day)
  events.push({
    title: "US Existing Home Sales",
    country: "US",
    category: "Other",
    datetime_utc: getDateOffset(21, 15, 0),
    importance: "Low",
    previous: 4030000,
    forecast: 4100000,
    actual: null,
    source: "Mock",
    status: "upcoming",
    impactScore: 19,
    confidence: 62,
  });

  events.push({
    title: "China Loan Prime Rate",
    country: "CN",
    category: "Rates",
    datetime_utc: getDateOffset(21, 1, 15),
    importance: "Medium",
    previous: 3.45,
    forecast: 3.45,
    actual: null,
    source: "Mock",
    status: "upcoming",
    impactScore: 46,
    confidence: 78,
  });

  events.push({
    title: "Grayscale Bitcoin Trust (GBTC) Quarterly Update",
    country: "US",
    category: "Earnings",
    datetime_utc: getDateOffset(21, 16, 0),
    importance: "Low",
    previous: null,
    forecast: null,
    actual: null,
    source: "Mock",
    status: "upcoming",
    impactScore: 33,
    confidence: 68,
  });

  return events;
}

/**
 * Display dry-run preview of events before uploading
 */
function displayDryRun(events: Omit<EconEvent, 'id'>[]): void {
  console.log("\n" + "=".repeat(80));
  console.log("📋 DRY RUN: Economic Events Mock Data Preview");
  console.log("=".repeat(80) + "\n");

  console.log(`📊 Total Events: ${events.length}\n`);

  // Count by status
  const released = events.filter(e => e.status === "released").length;
  const upcoming = events.filter(e => e.status === "upcoming").length;
  console.log(`   Released (past): ${released}`);
  console.log(`   Upcoming (future): ${upcoming}\n`);

  // Count by country
  const byCountry = events.reduce((acc, e) => {
    acc[e.country] = (acc[e.country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  console.log("📍 By Country:");
  Object.entries(byCountry).sort((a, b) => b[1] - a[1]).forEach(([country, count]) => {
    console.log(`   ${country}: ${count}`);
  });
  console.log();

  // Count by category
  const byCategory = events.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  console.log("🏷️  By Category:");
  Object.entries(byCategory).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count}`);
  });
  console.log();

  // Count by importance
  const byImportance = events.reduce((acc, e) => {
    acc[e.importance] = (acc[e.importance] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  console.log("⚡ By Importance:");
  ["High", "Medium", "Low"].forEach(imp => {
    console.log(`   ${imp}: ${byImportance[imp] || 0}`);
  });
  console.log();

  // Sample events
  console.log("📄 Sample Events (First 5):\n");
  events.slice(0, 5).forEach((event, i) => {
    console.log(`   ${i + 1}. ${event.title}`);
    console.log(`      Country: ${event.country} | Category: ${event.category} | Importance: ${event.importance}`);
    console.log(`      Date: ${event.datetime_utc}`);
    console.log(`      Status: ${event.status} | Impact: ${event.impactScore} | Confidence: ${event.confidence}%`);
    if (event.status === "released" && event.actual !== null) {
      console.log(`      Previous: ${event.previous} | Forecast: ${event.forecast} | Actual: ${event.actual}`);
    } else {
      console.log(`      Previous: ${event.previous} | Forecast: ${event.forecast} | Actual: (pending)`);
    }
    console.log();
  });

  console.log("=".repeat(80) + "\n");
}

/**
 * Upload events to Firestore
 */
async function uploadEconEvents(): Promise<void> {
  console.log("🚀 Starting Economic Events Mock Data Upload to Firestore...\n");

  const events = generateMockEvents();

  // Display dry-run preview
  displayDryRun(events);

  // Ask for confirmation (auto-proceed in script mode)
  console.log("⏳ Proceeding with upload in 2 seconds...\n");
  await new Promise(resolve => setTimeout(resolve, 2000));

  try {
    let uploadedCount = 0;

    console.log("📤 Uploading to Firestore...\n");

    for (let i = 0; i < events.length; i++) {
      const event = events[i];

      const docRef = await db.collection("econEvents_mock").add(event);

      uploadedCount++;
      if (uploadedCount % 10 === 0 || uploadedCount === events.length) {
        console.log(`   ✅ Uploaded ${uploadedCount}/${events.length} events...`);
      }
    }

    console.log("\n" + "=".repeat(80));
    console.log("🎉 Upload Complete!");
    console.log("=".repeat(80));
    console.log(`\n📊 Summary:`);
    console.log(`   Total events uploaded: ${uploadedCount}`);
    console.log(`   Collection: econEvents_mock`);
    console.log(`   Date range: ${events[0].datetime_utc.split('T')[0]} to ${events[events.length - 1].datetime_utc.split('T')[0]}\n`);

  } catch (error) {
    console.error("\n❌ Error uploading events:", error);
    process.exit(1);
  }

  process.exit(0);
}

// Run the upload
uploadEconEvents();
