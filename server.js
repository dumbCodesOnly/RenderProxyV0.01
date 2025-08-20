import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// Universal proxy route
app.all("*", async (req, res) => {
  try {
    const toobitUrl = `https://api.toobit.com${req.originalUrl}`;

    const response = await fetch(toobitUrl, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        "X-TOOBIT-APIKEY": process.env.TOOBIT_API_KEY,
        "X-TOOBIT-SIGN": req.headers["x-toobit-sign"] || "",
        "X-TOOBIT-TIMESTAMP": req.headers["x-toobit-timestamp"] || "",
      },
      body: req.method !== "GET" ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: "Proxy error", details: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Proxy running on port ${port}`));
