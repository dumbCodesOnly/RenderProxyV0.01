import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// Universal proxy route
app.all("*", async (req, res) => {
  try {
    const toobitUrl = `https://api.toobit.com${req.originalUrl}`;

    // Forward the exact headers that ToobitClient sends
    const forwardHeaders = {
      "Content-Type": "application/json",
      "User-Agent": "TradingExpert/1.0"
    };

    // Forward Toobit authentication headers (TB-ACCESS-* format)
    if (req.headers["tb-access-key"]) {
      forwardHeaders["TB-ACCESS-KEY"] = req.headers["tb-access-key"];
    }
    if (req.headers["tb-access-sign"]) {
      forwardHeaders["TB-ACCESS-SIGN"] = req.headers["tb-access-sign"];
    }
    if (req.headers["tb-access-timestamp"]) {
      forwardHeaders["TB-ACCESS-TIMESTAMP"] = req.headers["tb-access-timestamp"];
    }
    if (req.headers["tb-access-passphrase"]) {
      forwardHeaders["TB-ACCESS-PASSPHRASE"] = req.headers["tb-access-passphrase"];
    }

    const response = await fetch(toobitUrl, {
      method: req.method,
      headers: forwardHeaders,
      body: req.method !== "GET" && req.body ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: "Proxy error", details: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Proxy running on port ${port}`));
