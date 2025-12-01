// src/services/paymeeService.js

// Use your frontend .env variable for backend URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

/**
 * Crée un paiement via le backend
 * @param {number} amount - Montant à payer
 * @param {string|number} orderId - ID de la commande / cours
 * @returns {Promise<Object>} - Données retournées par le backend
 */
export async function createPayment(amount, orderId) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/payments/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        note: `Payment for course ${orderId}`,
        currency: "TND",
      }),
    });

    const text = await response.text(); // always read raw text first
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Backend returned invalid JSON: ${text}`);
    }

    if (!response.ok) {
      throw new Error(
        `Backend error ${response.status}: ${data?.error || text}`
      );
    }

    console.log("💡 Backend payment response:", data);
    return data;
  } catch (err) {
    console.error("Paymee createPayment error:", err);
    throw err;
  }
}

/**
 * Vérifie le statut d’un paiement via le backend
 * @param {string} transactionId - ID de la transaction
 * @returns {Promise<Object>} - Données retournées par le backend
 */
export async function checkPaymentStatus(transactionId) {
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/payments/${transactionId}`
    );

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Backend returned invalid JSON: ${text}`);
    }

    if (!response.ok) {
      throw new Error(
        `Backend error ${response.status}: ${data?.error || text}`
      );
    }

    console.log("💡 Backend checkStatus response:", data);
    return data;
  } catch (err) {
    console.error("Paymee checkPaymentStatus error:", err);
    throw err;
  }
}
