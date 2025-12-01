// src/controllers/PaymentController.js
import { db } from "../services/firebaseService";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { createPayment, checkPaymentStatus } from "../services/paymeeService";

export default class PaymentController {
  constructor() {
    this.collectionRef = collection(db, "payments");
  }

  async createPaymentRecord(userId, courseId, amount) {
    const paymeeRes = await createPayment(amount, courseId);

    const docRef = await addDoc(this.collectionRef, {
      userId,
      courseId,
      transactionId: paymeeRes.transactionId || "sandbox-" + Date.now(),
      amount,
      status: "pending",
      createdAt: new Date(),
    });

    return { id: docRef.id, ...paymeeRes };
  }

  async startPayment(amount, courseId, userId) {
    try {
      const payment = await this.createPaymentRecord(userId, courseId, amount);

      // simulate immediate success for sandbox
      await updateDoc(doc(db, "payments", payment.id), {
        status: "paid",
        updatedAt: new Date(),
      });

      return { status: "success", transactionId: payment.transactionId };
    } catch (err) {
      console.error("PaymentController.startPayment error:", err);
      return { status: "failed" };
    }
  }
}
