<<<<<<< HEAD
const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const crypto = require("crypto");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

// -------------------------
// Config (use .env file)
// -------------------------
const {
  SERVIS_AI_CLIENT_ID,
  SERVIS_AI_CLIENT_SECRET,
  ZOOM_CLIENT_ID,
  ZOOM_CLIENT_SECRET,
  ZOOM_ACCOUNT_ID,
  ZOOM_WEBHOOK_SECRET
} = process.env;

// -------------------------
// Helpers
// -------------------------
async function getZoomToken() {
  const resp = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`,
    {
      method: "POST",
      headers: {
        "Authorization":
          "Basic " +
          Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString("base64"),
      },
    }
  );
  const data = await resp.json();
  return data.access_token;
}

async function getServisToken() {
  const resp = await fetch("https://api.servis.ai/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: SERVIS_AI_CLIENT_ID,
      client_secret: SERVIS_AI_CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
  });
  const data = await resp.json();
  return data.access_token;
}

// -------------------------
// 1. Inbound: Zoom → Servis.ai
// -------------------------
app.post("/zoom-webhook", async (req, res) => {
  try {
    const body = req.body || {};
    const event = body.event;
    const payload = body.payload;

    // 🔹 Step 1: Handle Zoom validation
    if (payload?.plainToken) {
      const plainToken = payload.plainToken;
      const hmac = crypto.createHmac("sha256", ZOOM_WEBHOOK_SECRET);
      hmac.update(plainToken);
      const encryptedToken = hmac.digest("hex");
      return res.json({ plainToken, encryptedToken });
    }

    // 🔹 Step 2: Handle SMS events
    if (event === "phone.sms_message.received") {
      const { from, to, message, timestamp } = payload.object;

      console.log("📩 Incoming Zoom SMS:", from, message);

      const servisToken = await getServisToken();

      await fetch("https://api.servis.ai/messages", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${servisToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contact_number: from,
          message,
          direction: "inbound",
          channel: "Zoom SMS",
          timestamp,
        }),
      });
    }

    res.status(200).send("OK");
  } catch (err) {
    console.error("❌ Error handling Zoom webhook:", err);
    res.status(500).send("Error");
  }
});

// -------------------------
// 2. Outbound: Servis.ai → Zoom
// -------------------------
app.post("/servisai-webhook", async (req, res) => {
  try {
    const { to, message, from } = req.body;

    console.log("📤 Outbound SMS to Zoom:", to, message);

    const zoomToken = await getZoomToken();

    await fetch("https://api.zoom.us/v2/phone/sms/messages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${zoomToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from, // must be your Zoom number
        to,
        message,
      }),
    });

    res.status(200).send("OK");
  } catch (err) {
    console.error("❌ Error sending SMS via Zoom:", err);
    res.status(500).send("Error");
  }
});

// -------------------------
// Start Server
// -------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Middleware running on port ${PORT}`));
=======
const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const crypto = require("crypto");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

// -------------------------
// Config (use .env file)
// -------------------------
const {
  SERVIS_AI_CLIENT_ID,
  SERVIS_AI_CLIENT_SECRET,
  ZOOM_CLIENT_ID,
  ZOOM_CLIENT_SECRET,
  ZOOM_ACCOUNT_ID,
  ZOOM_WEBHOOK_SECRET
} = process.env;

// -------------------------
// Helpers
// -------------------------
async function getZoomToken() {
  const resp = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`,
    {
      method: "POST",
      headers: {
        "Authorization":
          "Basic " +
          Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString("base64"),
      },
    }
  );
  const data = await resp.json();
  return data.access_token;
}

async function getServisToken() {
  const resp = await fetch("https://api.servis.ai/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: SERVIS_AI_CLIENT_ID,
      client_secret: SERVIS_AI_CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
  });
  const data = await resp.json();
  return data.access_token;
}

// -------------------------
// 1. Inbound: Zoom → Servis.ai
// -------------------------
app.post("/zoom-webhook", async (req, res) => {
  try {
    const body = req.body || {};
    const event = body.event;
    const payload = body.payload;

    // 🔹 Step 1: Handle Zoom validation
    if (payload?.plainToken) {
      const plainToken = payload.plainToken;
      const hmac = crypto.createHmac("sha256", ZOOM_WEBHOOK_SECRET);
      hmac.update(plainToken);
      const encryptedToken = hmac.digest("hex");
      return res.json({ plainToken, encryptedToken });
    }

    // 🔹 Step 2: Handle SMS events
    if (event === "phone.sms_message.received") {
      const { from, to, message, timestamp } = payload.object;

      console.log("📩 Incoming Zoom SMS:", from, message);

      const servisToken = await getServisToken();

      await fetch("https://api.servis.ai/messages", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${servisToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contact_number: from,
          message,
          direction: "inbound",
          channel: "Zoom SMS",
          timestamp,
        }),
      });
    }

    res.status(200).send("OK");
  } catch (err) {
    console.error("❌ Error handling Zoom webhook:", err);
    res.status(500).send("Error");
  }
});

// -------------------------
// 2. Outbound: Servis.ai → Zoom
// -------------------------
app.post("/servisai-webhook", async (req, res) => {
  try {
    const { to, message, from } = req.body;

    console.log("📤 Outbound SMS to Zoom:", to, message);

    const zoomToken = await getZoomToken();

    await fetch("https://api.zoom.us/v2/phone/sms/messages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${zoomToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from, // must be your Zoom number
        to,
        message,
      }),
    });

    res.status(200).send("OK");
  } catch (err) {
    console.error("❌ Error sending SMS via Zoom:", err);
    res.status(500).send("Error");
  }
});

// -------------------------
// Start Server
// -------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Middleware running on port ${PORT}`));
>>>>>>> e984586 (Initial commit)
