import fetch from 'node-fetch';
import admin from 'firebase-admin';
import { XMLParser } from 'fast-xml-parser';


// Firebase init (make sure admin is already initialized in another file you import here)
import { db } from './firebase'; // adjust this import if needed

export async function updateGuruDigest() {
  const rssFeeds = [
    'https://www.coindesk.com/arc/outboundfeeds/rss/',
    'https://cointelegraph.com/rss'
  ];

  const HUGGINGFACE_API = process.env.HUGGINGFACE_API_KEY;

  for (const feed of rssFeeds) {
    const res = await fetch(feed);
    const xml = await res.text();
    const items = extractItemsFromXML(xml); // you'll write this function

    for (const item of items) {
      const summary = await summarizeText(item.description, HUGGINGFACE_API);

      await db.collection('guruDigest').add({
        title: item.title,
        summary,
        link: item.link,
        date: new Date().toISOString(),
      });
    }
  }
}

async function summarizeText(text: string, apiKey: string) {
  const res = await fetch('https://api-inference.huggingface.co/models/facebook/bart-large-cnn', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inputs: text }),
  });
  const data = await res.json();
  return data[0]?.summary_text || '';
}

// Stub function to parse XML
function extractItemsFromXML(xml: string) {
  // You can use xml2js or fast-xml-parser to extract titles + links
  return []; // Return array of { title, link, description }
}
