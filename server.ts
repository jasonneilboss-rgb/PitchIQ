import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_KEY;
  if (!key) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "GaffersEdge" });
  });

  // Proxy Gemini requests securely
  app.post("/api/gemini", async (req, res) => {
    try {
      const ai = getGenAI();
      if (!ai) {
        return res.status(401).json({
          error: "No Gemini API key found on server. Please configure GEMINI_API_KEY or VITE_GEMINI_KEY.",
        });
      }

      const { prompt, systemInstruction } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Missing prompt" });
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: systemInstruction
          ? {
              systemInstruction: systemInstruction,
            }
          : undefined,
      });

      const text = response.text || "";
      res.json({ text });
    } catch (err: any) {
      console.error("Server Gemini API error:", err);
      res.status(500).json({
        error: err.message || "Failed to generate AI response",
      });
    }
  });

  // Proxy Football Data API to bypass browser CORS and keep key server-side when available
  app.all("/api/football-data/*", async (req, res) => {
    try {
      const endpoint = req.url.replace(/^\/api\/football-data/, "");
      const targetUrl = `https://api.football-data.org/v4${endpoint}`;
      const token = process.env.VITE_FOOTBALL_DATA_KEY || process.env.FOOTBALL_DATA_KEY || "";

      const headers: Record<string, string> = {};
      if (token) {
        headers["X-Auth-Token"] = token;
      }

      const response = await fetch(targetUrl, {
        method: req.method,
        headers,
      });

      const data = await response.json().catch(() => ({}));
      res.status(response.status).json(data);
    } catch (err: any) {
      console.error("Football Data proxy error:", err);
      res.status(502).json({ error: "Upstream football-data proxy error", details: err.message });
    }
  });

  // Vite middleware in dev, static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`GaffersEdge server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
