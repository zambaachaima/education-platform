// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const PAYMEE_API_KEY = process.env.PAYMEE_API_KEY;
const PAYMEE_URL = process.env.PAYMEE_URL; // should end with /api/v1/

if (!PAYMEE_API_KEY || !PAYMEE_URL) {
  console.error("❌ PAYMEE_API_KEY or PAYMEE_URL is missing in .env");
  process.exit(1);
}

// Helper to parse JSON safely
function safeParseJSON(text) {
  try {
    return JSON.parse(text);
  } catch (err) {
    return null;
  }
}

// Route to create a payment
app.post("/api/payments/create", async (req, res) => {
  const { amount, note, currency = "TND" } = req.body;

  if (!amount || !note) {
    return res.status(400).json({ error: "Missing amount or note" });
  }

  // Log request for debugging
  console.log("💡 Creating Paymee payment with:", {
    amount,
    note,
    currency,
    sandbox: true,
  });

  try {
    const response = await fetch(`${PAYMEE_URL}payments/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PAYMEE_API_KEY}`, // ✅ correct
      },

      body: JSON.stringify({
        amount: Number(amount), // ensure it's a number
        note,
        currency,
        sandbox: true,
      }),
    });

    const text = await response.text();
    const data = safeParseJSON(text);

    console.log("💡 Paymee raw response:", text);

    if (!response.ok) {
      return res.status(response.status).json({ error: data?.error || text });
    }

    if (!data) {
      return res.status(500).json({ error: "Invalid JSON from Paymee" });
    }

    return res.json(data);
  } catch (err) {
    console.error("💥 Paymee API fetch error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Route to check payment status
app.get("/api/payments/:transactionId", async (req, res) => {
  const { transactionId } = req.params;

  if (!transactionId) {
    return res.status(400).json({ error: "Missing transactionId" });
  }

  console.log("💡 Checking Paymee payment status:", transactionId);

  try {
    const response = await fetch(`${PAYMEE_URL}payments/${transactionId}`, {
      headers: {
        "X-API-KEY": PAYMEE_API_KEY,
      },
    });

    const text = await response.text();
    const data = safeParseJSON(text);

    console.log("💡 Paymee status raw response:", text);

    if (!response.ok) {
      return res.status(response.status).json({ error: data?.error || text });
    }

    if (!data) {
      return res.status(500).json({ error: "Invalid JSON from Paymee" });
    }

    return res.json(data);
  } catch (err) {
    console.error("💥 Paymee API fetch error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});
