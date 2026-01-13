"use strict";
/**
 * Guru Digest Updater
 *
 * Main update function for Guru Digest.
 * Fetches RSS feeds, processes articles, and stores in Firestore.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateGuruDigest = void 0;
const rss_1 = require("./rss");
const firestore_1 = require("./firestore");
const constants_1 = require("../shared/constants");
/**
 * Update Guru Digest with Latest News
 */
async function updateGuruDigest(options = {}) {
    const { clearFirst = false, logPrefix = '[Guru]' } = options;
    console.log(`${logPrefix} Starting update...`);
    let deletedEntries = 0;
    // Clear old entries if requested
    if (clearFirst) {
        console.log(`${logPrefix} Clearing existing entries...`);
        deletedEntries = await (0, firestore_1.clearGuruDigest)();
        console.log(`${logPrefix} Deleted ${deletedEntries} existing entries`);
    }
    // Fetch RSS feeds
    console.log(`${logPrefix} Fetching RSS feeds...`);
    const items = await (0, rss_1.fetchAllRSSFeeds)();
    const totalArticles = items.length;
    console.log(`${logPrefix} Found ${totalArticles} articles`);
    // Process articles
    const entries = [];
    for (const item of items) {
        // Create summary from description
        const summary = (0, rss_1.createExcerpt)(item.description);
        if (!summary) {
            console.warn(`${logPrefix} No description for: ${item.title.substring(0, 60)}...`);
            continue;
        }
        // Extract asset tags from title and summary
        const textToTag = `${item.title} ${summary}`;
        const assets = (0, constants_1.extractAssetSymbols)(textToTag);
        // Create entry
        const entry = {
            title: item.title,
            summary,
            link: item.link,
            date: new Date().toISOString(),
            assets, // Store canonical asset symbols
        };
        entries.push(entry);
    }
    // Store in Firestore
    console.log(`${logPrefix} Storing ${entries.length} entries in Firestore...`);
    const successfulEntries = await (0, firestore_1.addGuruDigestEntries)(entries);
    console.log(`${logPrefix} Update complete!`);
    console.log(`${logPrefix}   Total articles: ${totalArticles}`);
    console.log(`${logPrefix}   Successfully saved: ${successfulEntries}`);
    if (clearFirst) {
        console.log(`${logPrefix}   Deleted old entries: ${deletedEntries}`);
    }
    return {
        totalArticles,
        successfulEntries,
        deletedEntries,
    };
}
exports.updateGuruDigest = updateGuruDigest;
//# sourceMappingURL=updater.js.map