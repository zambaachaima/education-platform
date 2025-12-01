// src/controllers/PurchaseController.js
import { db } from "../services/firebaseService";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

export default class PurchaseController {
  async addPurchase(userId, courseId) {
    return await addDoc(collection(db, "purchases"), {
      userId,
      courseId,
      status: "paid",
      createdAt: serverTimestamp(),
    });
  }

  async userOwnsCourse(userId, courseId) {
    const q = query(
      collection(db, "purchases"),
      where("userId", "==", userId),
      where("courseId", "==", courseId),
      where("status", "==", "paid")
    );

    const snap = await getDocs(q);
    return !snap.empty;
  }
}
