import { EcoAnalysis, Product } from "../types";

// ── Server-side AI proxy ──────────────────────────────────────────────────────
// All AI calls hit /api/analyze on the server (which uses Groq).
// The server handles model selection, fallback, and retries.

async function callAnalyze(body: Record<string, any>): Promise<string> {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json() as any;

  if (!res.ok) {
    const isQuota = res.status === 429;
    const msg = data?.error || `Server error ${res.status}`;
    const err = new Error(msg) as any;
    if (isQuota) err.isQuota = true;
    throw err;
  }

  if (!data.text) throw new Error("Empty response from server");
  return data.text;
}

// ONE-SHOT: search query → identify product + instant analysis
export async function analyzeQuery(query: string): Promise<EcoAnalysis & { productName: string; brand: string }> {
  const text = await callAnalyze({ type: "query", query });
  return JSON.parse(text);
}

// Analyze a specific product from Open Food Facts
export async function analyzeProduct(product: Product): Promise<EcoAnalysis> {
  const text = await callAnalyze({ type: "product", product });
  return JSON.parse(text) as EcoAnalysis;
}

// Analyze product from an uploaded image
export async function analyzeImage(
  base64Image: string,
  mimeType: string
): Promise<EcoAnalysis & { productName: string; brand: string; isProduct?: boolean; rejectionReason?: string }> {
  const text = await callAnalyze({ type: "image", imageBase64: base64Image, imageMimeType: mimeType });
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Invalid AI response format");
  }
}

// Search + merge: Open Food Facts + AI suggestions
export async function searchProducts(query: string): Promise<Product[]> {
  const offPromise = fetch(`/api/search?q=${encodeURIComponent(query)}`)
    .then(async r => {
      if (!r.ok) throw new Error(`OFF ${r.status}`);
      const data = await r.json() as any;
      return (data.products || []) as Product[];
    })
    .catch(() => null);

  const aiPromise = callAnalyze({ type: "search", query })
    .then(text => ((JSON.parse(text) as any).products || []) as Product[])
    .catch(() => [] as Product[]);

  const [offResults, aiResults] = await Promise.all([offPromise, aiPromise]);
  const results = (offResults && offResults.length > 0) ? offResults : aiResults;
  if (!results || results.length === 0) throw new Error("No products found");
  return results;
}
