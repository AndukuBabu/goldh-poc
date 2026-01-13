"use strict";
/**
 * Firestore Operations for Guru Digest
 *
 * Handles all Firestore CRUD operations for the guruDigest collection.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGuruDigestEntry = exports.getAllGuruDigestWithIds = exports.getAllGuruDigest = exports.getGuruDigestByAsset = exports.addGuruDigestEntries = exports.addGuruDigestEntry = exports.clearGuruDigest = void 0;
const init_1 = require("../init");
const COLLECTION_NAME = 'guruDigest';
async function clearGuruDigest() {
    try {
        const snapshot = await init_1.db.collection(COLLECTION_NAME).get();
        const batch = init_1.db.batch();
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        return snapshot.size;
    }
    catch (error) {
        console.error('[Guru] Error clearing collection:', error);
        throw error;
    }
}
exports.clearGuruDigest = clearGuruDigest;
async function addGuruDigestEntry(entry) {
    try {
        const docRef = await init_1.db.collection(COLLECTION_NAME).add(entry);
        return docRef.id;
    }
    catch (error) {
        console.error('[Guru] Error adding entry:', error);
        throw error;
    }
}
exports.addGuruDigestEntry = addGuruDigestEntry;
async function addGuruDigestEntries(entries) {
    let successCount = 0;
    const promises = entries.map(async (entry) => {
        try {
            await addGuruDigestEntry(entry);
            successCount++;
        }
        catch (error) {
            console.error('[Guru] Failed to add entry:', entry.title.substring(0, 60), error);
        }
    });
    await Promise.all(promises);
    return successCount;
}
exports.addGuruDigestEntries = addGuruDigestEntries;
async function getGuruDigestByAsset(symbol) {
    const snapshot = await init_1.db.collection(COLLECTION_NAME)
        .where('assets', 'array-contains', symbol)
        .get();
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            title: data.title || '',
            summary: data.summary || '',
            link: data.link || '',
            date: data.date || new Date().toISOString(),
            assets: data.assets || [],
        };
    });
}
exports.getGuruDigestByAsset = getGuruDigestByAsset;
async function getAllGuruDigest(maxEntries = 50) {
    const snapshot = await init_1.db.collection(COLLECTION_NAME)
        .orderBy('date', 'desc')
        .limit(maxEntries)
        .get();
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            title: data.title || '',
            summary: data.summary || '',
            link: data.link || '',
            date: data.date || new Date().toISOString(),
            assets: data.assets || [],
        };
    });
}
exports.getAllGuruDigest = getAllGuruDigest;
async function getAllGuruDigestWithIds(maxEntries = 100) {
    const snapshot = await init_1.db.collection(COLLECTION_NAME)
        .orderBy('date', 'desc')
        .limit(maxEntries)
        .get();
    return snapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        return {
            id: docSnapshot.id,
            title: data.title || '',
            summary: data.summary || '',
            link: data.link || '',
            date: data.date || new Date().toISOString(),
            assets: data.assets || [],
        };
    });
}
exports.getAllGuruDigestWithIds = getAllGuruDigestWithIds;
async function deleteGuruDigestEntry(entryId) {
    try {
        await init_1.db.collection(COLLECTION_NAME).doc(entryId).delete();
        console.log(`[Guru] Deleted entry: ${entryId}`);
    }
    catch (error) {
        console.error('[Guru] Error deleting entry:', entryId, error);
        throw error;
    }
}
exports.deleteGuruDigestEntry = deleteGuruDigestEntry;
//# sourceMappingURL=firestore.js.map