"use strict";
/**
 * RSS Feed Fetcher for Guru Digest
 *
 * Fetches and parses RSS feeds from crypto news sources.
 * Supports both RSS 2.0 and Atom feed formats.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAllRSSFeeds = exports.fetchRSSFeed = exports.createExcerpt = exports.extractItemsFromXML = exports.RSS_FEEDS = void 0;
const fast_xml_parser_1 = require("fast-xml-parser");
/**
 * RSS Feed Sources
 */
exports.RSS_FEEDS = [
    'https://www.coindesk.com/arc/outboundfeeds/rss/',
    'https://cointelegraph.com/rss'
];
/**
 * Extract items from RSS XML
 */
function extractItemsFromXML(xml) {
    var _a, _b, _c;
    const parser = new fast_xml_parser_1.XMLParser();
    const parsed = parser.parse(xml);
    // Handle both RSS 2.0 and Atom feeds
    const items = ((_b = (_a = parsed.rss) === null || _a === void 0 ? void 0 : _a.channel) === null || _b === void 0 ? void 0 : _b.item) || ((_c = parsed.feed) === null || _c === void 0 ? void 0 : _c.entry) || [];
    if (!Array.isArray(items)) {
        return [items].filter(Boolean);
    }
    return items.map((entry) => {
        var _a;
        return ({
            title: entry.title || 'Untitled',
            link: ((_a = entry.link) === null || _a === void 0 ? void 0 : _a.href) || entry.link || '',
            description: entry.description || entry.summary || entry.content || '',
        });
    });
}
exports.extractItemsFromXML = extractItemsFromXML;
/**
 * Create excerpt from article description
 */
function createExcerpt(text) {
    if (!text || text.trim().length === 0) {
        return '';
    }
    // Strip HTML tags
    let clean = text.replace(/<[^>]*>/g, ' ');
    // Normalize whitespace
    clean = clean.replace(/\s+/g, ' ').trim();
    // Limit to ~300 characters, breaking at sentence or word boundary
    const maxLength = 300;
    if (clean.length <= maxLength) {
        return clean;
    }
    // Try to break at sentence end
    const sentenceEnd = clean.substring(0, maxLength).lastIndexOf('. ');
    if (sentenceEnd > 200) {
        return clean.substring(0, sentenceEnd + 1);
    }
    // Otherwise break at last space
    const lastSpace = clean.substring(0, maxLength).lastIndexOf(' ');
    return clean.substring(0, lastSpace > 0 ? lastSpace : maxLength) + '...';
}
exports.createExcerpt = createExcerpt;
/**
 * Fetch RSS Feed
 */
async function fetchRSSFeed(feedUrl) {
    try {
        const response = await fetch(feedUrl);
        if (!response.ok) {
            console.error(`[Guru] Failed to fetch ${feedUrl}: ${response.statusText}`);
            return [];
        }
        const xml = await response.text();
        const items = extractItemsFromXML(xml);
        return items;
    }
    catch (error) {
        console.error(`[Guru] Error fetching feed ${feedUrl}:`, error);
        return [];
    }
}
exports.fetchRSSFeed = fetchRSSFeed;
/**
 * Fetch All RSS Feeds
 */
async function fetchAllRSSFeeds() {
    const allItems = [];
    for (const feedUrl of exports.RSS_FEEDS) {
        const items = await fetchRSSFeed(feedUrl);
        allItems.push(...items);
    }
    return allItems;
}
exports.fetchAllRSSFeeds = fetchAllRSSFeeds;
//# sourceMappingURL=rss.js.map