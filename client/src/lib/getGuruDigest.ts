// client/lib/getGuruDigest.ts
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

export const getGuruDigest = async () => {
  const snapshot = await getDocs(collection(db, "guruDigest"));
  return snapshot.docs.map(doc => doc.data());
};
