"use client"; // This tells Next.js it's a client-side component.

import { useEffect, useState } from "react";
import { getGuruDigest } from "../lib/getGuruDigest"; // This is your Firestore fetch function

export default function GuruDigestList() {
  const [digests, setDigests] = useState<any[]>([]); 
  // This holds the list of digests we fetch from Firebase

  useEffect(() => {
    getGuruDigest().then(setDigests); 
    // When the component loads, fetch data and store it in state
  }, []); // The empty array means this only runs once (like "on mount")

  return (
    <div className="space-y-4 p-4">
      {digests.map((item, idx) => (
        <div key={idx} className="border border-gold p-4 rounded-md">
          <h3 className="text-lg font-bold text-gold">{item.title}</h3>
          <p className="text-sm text-white">{item.summary}</p>
        </div>
      ))}
    </div>
  );
}
