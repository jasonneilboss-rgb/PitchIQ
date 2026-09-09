var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
import_dotenv.default.config();
var aiClient = null;
function getGenAI() {
  const key = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_KEY;
  if (!key) return null;
  if (!aiClient) {
    aiClient = new import_genai.GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "GaffersEdge" });
  });
  app.post("/api/gemini", async (req, res) => {
    try {
      const ai = getGenAI();
      if (!ai) {
        return res.status(401).json({
          error: "No Gemini API key found on server. Please configure GEMINI_API_KEY or VITE_GEMINI_KEY."
        });
      }
      const { prompt, systemInstruction } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Missing prompt" });
      }
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: systemInstruction ? {
          systemInstruction
        } : void 0
      });
      const text = response.text || "";
      res.json({ text });
    } catch (err) {
      console.error("Server Gemini API error:", err);
      res.status(500).json({
        error: err.message || "Failed to generate AI response"
      });
    }
  });
  app.all("/api/football-data/*", async (req, res) => {
    try {
      const endpoint = req.url.replace(/^\/api\/football-data/, "");
      const targetUrl = `https://api.football-data.org/v4${endpoint}`;
      const token = process.env.VITE_FOOTBALL_DATA_KEY || process.env.FOOTBALL_DATA_KEY || "";
      const headers = {};
      if (token) {
        headers["X-Auth-Token"] = token;
      }
      const response = await fetch(targetUrl, {
        method: req.method,
        headers
      });
      const data = await response.json().catch(() => ({}));
      res.status(response.status).json(data);
    } catch (err) {
      console.error("Football Data proxy error:", err);
      res.status(502).json({ error: "Upstream football-data proxy error", details: err.message });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`GaffersEdge server running at http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
