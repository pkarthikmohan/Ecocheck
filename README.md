# 🌿 EcoCheck AI

> **Scan any product. Know its true environmental cost.**  
> India-aware AI analysis powered by Groq — carbon, water, packaging, and real recyclability reality.

---

## What is EcoCheck?

EcoCheck is a full-stack AI web app that lets you instantly check the environmental impact of any consumer product. Search by name, pick from Open Food Facts data, or **scan a product photo** — and get a rich, opinionated sustainability report in seconds.

Unlike generic "eco score" apps, EcoCheck is **honest about India's recycling reality**. It knows that Tetra Paks and multi-layer pouches are not recycled in Indian cities, and it tells you so — bluntly.

---

## Features

| Feature | Details |
|---|---|
| 🔍 **Text Search** | One-shot query: type a product name, get instant AI analysis |
| 📦 **Open Food Facts** | Real product database with ingredients, categories, and nutri-scores |
| 📸 **Image Scanner** | Upload or drag-drop a product photo — AI identifies and scores it |
| 🌿 **Eco Score** | 0–100 score with A–F grade across Carbon, Water, Packaging, Recyclability |
| ♻️ **India Recyclability** | Dedicated card: PET #1 / HDPE #2 only — all others flagged as non-recyclable |
| 📊 **Session History** | Last 20 checked products saved locally, click to re-view |
| 🔗 **Share Results** | Native share / clipboard copy of your result |
| 🌱 **Greener Alternatives** | 3 AI-suggested eco-friendly alternatives per product |
| 📚 **Citations** | Real source links for every analysis |

---

## Tech Stack

### Frontend
- **React 19** + **TypeScript** — component-based UI
- **Vite 6** — dev server + production bundler
- **Tailwind CSS v4** — utility styling
- **Motion (Framer Motion v12)** — animations, score rings, staggered reveals
- **Lucide React** — icons (Leaf, Droplets, Package, Recycle, …)

### Backend
- **Express 4** — API server (`/api/analyze`, `/api/search`)
- **Groq SDK** — fast LLM inference (replaces Gemini)
- **Open Food Facts API** — real product data
- **esbuild** — bundles `server.ts` → `server.mjs` at dev start

### AI Models (Groq)
| Role | Primary | Fallback |
|---|---|---|
| Text analysis | `llama-3.3-70b-versatile` | `llama-3.1-8b-instant` |
| Vision / image scan | `meta-llama/llama-4-scout-17b-16e-instruct` | — |

> All deprecated models (`llama3-70b-8192`, `mixtral-8x7b-32768`, `llama-3.2-11b-vision-preview`) have been removed.

---

## Project Structure

```
ecocheck-improved/
├── server.ts              # Express + Groq server (TypeScript source)
├── server.mjs             # Compiled output — what Node actually runs
├── vite.config.js         # Vite SPA config with React plugin
├── index.html             # Entry point
└── src/
    ├── App.tsx            # Root: search, scan, history, routing state
    ├── types.ts           # EcoAnalysis, Product, AppStats interfaces
    ├── index.css          # Global styles
    ├── services/
    │   └── api.ts         # Client → /api/analyze proxy functions
    └── components/
        ├── AnalysisView.tsx   # Full result view (4 metric cards + more)
        ├── Scanner.tsx        # Drag-drop / file image scanner
        ├── SearchBar.tsx      # Search input
        ├── ProductList.tsx    # Open Food Facts result list
        ├── StatsBanner.tsx    # Session stats + history
        ├── EcoBadge.tsx       # A–F grade badge
        ├── ScoreBar.tsx       # Horizontal score bar
        └── Skeleton.tsx       # Loading skeleton
```

---

## Getting Started

### Prerequisites
- **Node.js 20+**
- A **[Groq API key](https://console.groq.com/keys)** (free tier available)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Add your Groq API key
echo "GROQ_API_KEY=your_key_here" > .env

# 3. Start the dev server
npm run dev
```

The app runs at **http://localhost:3000**.

> `npm run dev` uses esbuild to compile `server.ts → server.mjs` and then starts the Express + Vite server in a single command.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | ✅ Yes | Your Groq API key from [console.groq.com](https://console.groq.com/keys) |

---

## How It Works

### Analysis Flow

```
User types / uploads image
        │
        ▼
  POST /api/analyze
        │
        ▼
  Groq LLM (llama-3.3-70b or llama-4-scout for images)
        │
        ▼
  Structured JSON response (EcoAnalysis)
        │
        ▼
  AnalysisView renders 4 metric cards + concerns + alternatives
```

### Server-Side Prompt Engineering

The system prompt enforces **India-specific recyclability rules** on every call:
- ✅ PET #1 and HDPE #2 → commonly recycled in most Indian cities
- ❌ Tetra Pak, multi-layer, PP #5, PS #6, PVC #3, LDPE #4 → **not recycled in India**
- ❌ "Compostable" / "biodegradable" labels → misleading in India (no scale infrastructure)
- The AI is instructed to **never soften the verdict** with "check local facilities"

### Resilience

- **Model fallback**: if primary model hits a rate limit, automatically retries with next model
- **Retry logic**: up to 2 attempts per model with exponential backoff (3s → 8s)
- **Model-not-found detection**: skips decommissioned models silently

---

## The 4 Metric Cards

Every analysis shows 4 animated score-ring cards:

| Card | Color | Data fields |
|---|---|---|
| 🌿 **Carbon** | Emerald | `carbonScore`, `carbonFootprint`, `carbonExplanation` |
| 💧 **Water** | Blue | `waterScore`, `waterUsage`, `waterExplanation` |
| 📦 **Packaging** | Orange | `packagingScore`, `packagingExplanation` |
| ♻️ **Recyclability in India** | Purple | `recyclabilityIndia.score`, `.plasticCode`, `.reality` |

The recyclability card also carries `canBeRecycledInIndia` (boolean) and `tip` (consumer action).

---

## EcoAnalysis Type

```typescript
interface EcoAnalysis {
  ecoScore: number;           // 0–100 overall
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  carbonFootprint: string;
  carbonScore: number;
  carbonExplanation: string;
  waterUsage: string;
  waterScore: number;
  waterExplanation: string;
  packagingScore: number;
  packagingExplanation: string;
  concerns: string[];         // 3–5 specific concerns
  funFact: string;
  alternatives: { name: string; reason: string; ecoScore: number; url?: string }[];
  citations: { title: string; url: string }[];
  verdict: string;
  recyclabilityIndia: {
    score: number;
    plasticCode: string;          // e.g. "PET #1", "Multi-layer"
    canBeRecycledInIndia: boolean;
    reality: string;              // one blunt sentence
    tip: string;                  // what consumer should do
  };
}
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Compile server.ts + start Express + Vite (dev mode) |
| `npm run build` | Build frontend to `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | TypeScript type-check (`tsc --noEmit`) |

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Make your changes (keep India recyclability rules intact!)
4. Open a PR

---

## License

MIT © EcoCheck Contributors
