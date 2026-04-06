import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import nodeFetch from "node-fetch";
import Groq from "groq-sdk";

// Use global fetch if available (Node 18+), otherwise use node-fetch
const fetch = (globalThis.fetch || nodeFetch) as unknown as typeof nodeFetch;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Groq model fallback chains ───────────────────────────────────────────────
const TEXT_MODELS = [
  "llama-3.3-70b-versatile",   // best quality
  // "llama3-70b-8192",           // stable fallback
  // "mixtral-8x7b-32768",        // another option
  "llama-3.1-8b-instant",      // fastest / most quota
];

const VISION_MODELS = [
  "meta-llama/llama-4-scout-17b-16e-instruct", // multimodal
  // "llama-3.2-11b-vision-preview",              // vision fallback
];

function getGroq() {
  const apiKey = process.env.GROQ_API_KEY || "";
  if (!apiKey) throw new Error("GROQ_API_KEY is not set in environment");
  return new Groq({ apiKey });
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// ── JSON schema description for the AI prompt ────────────────────────────────
const JSON_SCHEMA_DESCRIPTION = `
Return ONLY a valid JSON object with these exact fields:
{
  "ecoScore": number (0-100, overall eco score),
  "grade": "A" | "B" | "C" | "D" | "F",
  "carbonFootprint": string (e.g. "2.5 kg CO2e per unit"),
  "carbonScore": number (0-100),
  "carbonExplanation": string (1-2 sentences, specific numbers),
  "waterUsage": string (e.g. "150 liters per kg"),
  "waterScore": number (0-100),
  "waterExplanation": string (1-2 sentences, specific numbers),
  "packagingScore": number (0-100),
  "packagingExplanation": string (1-2 sentences),
  "repairabilityLabel": string (e.g. "Highly repairable vs single-use"),
  "repairabilityScore": number (0-100),
  "repairabilityExplanation": string (1-2 sentences),
  "recyclabilityLabel": string (e.g. "100% recyclable vs e-waste"),
  "recyclabilityScore": number (0-100),
  "recyclabilityExplanation": string (1-2 sentences),
  "energyUseLabel": string (e.g. "Energy intensive vs efficient"),
  "energyScore": number (0-100),
  "energyExplanation": string (1-2 sentences),
  "concerns": string[] (3-5 specific environmental concerns),
  "funFact": string (one memorable eco fact about the product),
  "alternatives": [
    { "name": string, "reason": string, "ecoScore": number, "carbonScore": number, "waterScore": number, "packagingScore": number, "repairabilityScore": number, "recyclabilityScore": number, "energyScore": number, "url": string }
  ] (3 greener alternatives),
  "citations": [
    { "title": string, "url": string }
  ] (2-3 real sources),
  "verdict": string (punchy 1-sentence verdict)
}`;

const QUERY_SCHEMA = `
Return ONLY a valid JSON object with these exact fields (in addition to the eco analysis):
{
  "productName": string (identified product name),
  "brand": string (identified brand),
  "ecoScore": number,
  "grade": "A" | "B" | "C" | "D" | "F",
  "carbonFootprint": string,
  "carbonScore": number,
  "carbonExplanation": string,
  "waterUsage": string,
  "waterScore": number,
  "waterExplanation": string,
  "packagingScore": number,
  "packagingExplanation": string,
  "repairabilityLabel": string,
  "repairabilityScore": number,
  "repairabilityExplanation": string,
  "recyclabilityLabel": string,
  "recyclabilityScore": number,
  "recyclabilityExplanation": string,
  "energyUseLabel": string,
  "energyScore": number,
  "energyExplanation": string,
  "concerns": string[],
  "funFact": string,
  "alternatives": [{ "name": string, "reason": string, "ecoScore": number, "carbonScore": number, "waterScore": number, "packagingScore": number, "repairabilityScore": number, "recyclabilityScore": number, "energyScore": number, "url": string }],
  "citations": [{ "title": string, "url": string }],
  "verdict": string
}`;

const IMAGE_SCHEMA = `
Return ONLY a valid JSON object:
{
  "isProduct": boolean (true if a consumer product is visible),
  "rejectionReason": string (only if isProduct is false, explain why),
  "productName": string,
  "brand": string,
  "ecoScore": number,
  "grade": "A" | "B" | "C" | "D" | "F",
  "carbonFootprint": string,
  "carbonScore": number,
  "carbonExplanation": string,
  "waterUsage": string,
  "waterScore": number,
  "waterExplanation": string,
  "packagingScore": number,
  "packagingExplanation": string,
  "repairabilityLabel": string,
  "repairabilityScore": number,
  "repairabilityExplanation": string,
  "recyclabilityLabel": string,
  "recyclabilityScore": number,
  "recyclabilityExplanation": string,
  "energyUseLabel": string,
  "energyScore": number,
  "energyExplanation": string,
  "concerns": string[],
  "funFact": string,
  "alternatives": [{ "name": string, "reason": string, "ecoScore": number, "carbonScore": number, "waterScore": number, "packagingScore": number, "repairabilityScore": number, "recyclabilityScore": number, "energyScore": number, "url": string }],
  "citations": [{ "title": string, "url": string }],
  "verdict": string
}`;

const SYSTEM_PROMPT = `You are a concise environmental impact analyst. Use specific numbers and be memorable. Output ONLY valid JSON, no markdown, no explanation.`;

// ── Text generation with fallback ────────────────────────────────────────────
async function generateText(messages: Groq.Chat.ChatCompletionMessageParam[]): Promise<string> {
  const groq = getGroq();
  let lastError: any;

  for (const model of TEXT_MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[AI] Trying model=${model} attempt=${attempt}`);
        const completion = await groq.chat.completions.create({
          model,
          messages,
          response_format: { type: "json_object" },
          temperature: 0.3,
          max_tokens: 2048,
        });
        const text = completion.choices[0]?.message?.content;
        if (text) {
          console.log(`[AI] Success with model=${model}`);
          return text;
        }
        throw new Error("Empty response from model");
      } catch (err: any) {
        const msg = err?.message || String(err);
        const isQuota = msg.includes("429") || msg.includes("rate_limit") || msg.includes("quota") || err?.status === 429;
        const isNotFound = msg.includes("404") || msg.includes("model_not_found") || err?.status === 404;
        lastError = err;

        if (isNotFound) {
          console.warn(`[AI] Model ${model} not found, skipping`);
          break;
        }
        if (isQuota) {
          const waitMs = attempt === 1 ? 3000 : 8000;
          console.warn(`[AI] Model ${model} rate-limited (attempt ${attempt}), waiting ${waitMs}ms...`);
          await sleep(waitMs);
          if (attempt === 2) break;
          continue;
        }
        console.error(`[AI] Non-retriable error on model ${model}:`, msg);
        throw err;
      }
    }
  }
  throw lastError;
}

// ── Vision generation with fallback ─────────────────────────────────────────
async function generateVision(base64Image: string, mimeType: string, prompt: string): Promise<string> {
  const groq = getGroq();
  let lastError: any;

  for (const model of VISION_MODELS) {
    try {
      console.log(`[AI Vision] Trying model=${model}`);
      const completion = await groq.chat.completions.create({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${base64Image.split(',')[1] || base64Image}` }
              },
              { type: "text", text: prompt }
            ] as any
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 2048,
      });
      const text = completion.choices[0]?.message?.content;
      if (text) {
        console.log(`[AI Vision] Success with model=${model}`);
        return text;
      }
      throw new Error("Empty vision response");
    } catch (err: any) {
      const msg = err?.message || String(err);
      const isQuota = msg.includes("429") || msg.includes("rate_limit") || err?.status === 429;
      lastError = err;
      if (isQuota) {
        console.warn(`[AI Vision] Model ${model} rate-limited, trying next...`);
        await sleep(4000);
        continue;
      }
      if (msg.includes("404") || msg.includes("model_not_found") || err?.status === 404) {
        console.warn(`[AI Vision] Model ${model} not found, skipping`);
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // ── Server-side AI analysis endpoint ─────────────────────────────────────
  app.post("/api/analyze", async (req, res) => {
    const { type, query, product, imageBase64, imageMimeType } = req.body;

    try {
      let text: string;

      if (type === "query") {
        // One-shot: search term → identify product + analyze
        text = await generateText([
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `The user searched for: "${query}". Identify the most likely consumer product they mean, then analyze its full environmental impact. Use specific numbers and real data.\n\n${QUERY_SCHEMA}`
          }
        ]);

      } else if (type === "product") {
        // Analyze a specific known product
        text = await generateText([
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Analyze the environmental impact of: "${product.product_name}" by ${product.brands || 'Unknown brand'}. Categories: ${product.categories || 'N/A'}. Ingredients: ${(product.ingredients_text || 'N/A').slice(0, 300)}. Use specific numbers.\n\n${JSON_SCHEMA_DESCRIPTION}`
          }
        ]);

      } else if (type === "image") {
        // Vision: identify product from image + analyze
        text = await generateVision(
          imageBase64,
          imageMimeType || "image/jpeg",
          `Identify the consumer product in this image and analyze its full environmental impact. If this is NOT a consumer product, set isProduct to false and provide a rejectionReason. Use specific numbers and real data.\n\n${IMAGE_SCHEMA}`
        );

      } else if (type === "search") {
        // AI product search suggestions
        text = await generateText([
          { role: "system", content: "You are a product database. Return ONLY valid JSON." },
          {
            role: "user",
            content: `List 5 real consumer products matching "${query}". Return JSON: { "products": [{ "product_name": string, "brands": string, "code": string, "categories": string, "ingredients_text": string }] }`
          }
        ]);

      } else {
        return res.status(400).json({ error: `Unknown analysis type: ${type}` });
      }

      res.json({ text });
    } catch (err: any) {
      const msg = err?.message || String(err);
      const isQuota = msg.includes("429") || msg.includes("rate_limit") || err?.status === 429;
      console.error("[AI] Analysis failed:", msg);
      res.status(isQuota ? 429 : 500).json({ error: msg });
    }
  });

  // ── Open Food Facts search proxy (CORS bypass) ────────────────────────────
  app.get("/api/search", async (req, res) => {
    const query = req.query.q as string;
    if (!query) return res.status(400).json({ error: "Missing query" });

    try {
      const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&json=1&page_size=5`;
      const response = await fetch(url, {
        headers: { 'User-Agent': 'EcoCheck/1.0 (https://github.com/yourusername/ecocheck)' }
      });

      if (response.ok) {
        const data = (await response.json()) as any;
        return res.json(data);
      }
      res.status(response.status).json({ error: `Open Food Facts returned ${response.status}` });
    } catch (error) {
      res.status(500).json({
        error: "Failed to fetch from Open Food Facts",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // ── Vite / Static serving ─────────────────────────────────────────────────
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Using Groq AI with models: ${TEXT_MODELS[0]} (primary)`);
  });
}

startServer();
