import { motion } from "motion/react";
import { EcoBadge } from "./EcoBadge";
import { AlertTriangle, Leaf, Droplets, Package, ArrowRight, Sparkles, Share2, ExternalLink } from "lucide-react";
import { EcoAnalysis, Product } from "../types";

interface AnalysisViewProps {
  product: Product;
  analysis: EcoAnalysis;
}

const gradeColors: Record<string, { bg: string; text: string; border: string; light: string }> = {
  A: { bg: "bg-emerald-500", text: "text-emerald-700", border: "border-emerald-200", light: "bg-emerald-50" },
  B: { bg: "bg-lime-500", text: "text-lime-700", border: "border-lime-200", light: "bg-lime-50" },
  C: { bg: "bg-yellow-500", text: "text-yellow-700", border: "border-yellow-200", light: "bg-yellow-50" },
  D: { bg: "bg-orange-500", text: "text-orange-700", border: "border-orange-200", light: "bg-orange-50" },
  F: { bg: "bg-red-500", text: "text-red-700", border: "border-red-200", light: "bg-red-50" },
};

function ScoreRing({ score, color, size = 80 }: { score: number; color: string; size?: number }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth="6" />
      <motion.circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={`${circ}`}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
    </svg>
  );
}

function MetricCard({ icon, label, value, score, explanation, color, strokeColor }: {
  icon: React.ReactNode; label: string; value: string; score: number;
  explanation: string; color: string; strokeColor: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>{icon}</div>
          <span className="font-bold text-slate-700 text-sm">{label}</span>
        </div>
        <div className="relative flex items-center justify-center">
          <ScoreRing score={score} color={strokeColor} size={52} />
          <span className="absolute text-xs font-bold text-slate-700">{score}</span>
        </div>
      </div>
      <div>
        <p className="font-bold text-slate-900 text-base">{value}</p>
        <p className="text-xs text-slate-500 leading-relaxed mt-1">{explanation}</p>
      </div>
    </motion.div>
  );
}

export function AnalysisView({ product, analysis }: AnalysisViewProps) {
  const colors = gradeColors[analysis.grade] || gradeColors.C;

  const handleShare = async () => {
    const text = `I checked ${product.product_name} on EcoCheck — it got a grade ${analysis.grade} (${analysis.ecoScore}/100). ${analysis.verdict}`;
    if (navigator.share) {
      await navigator.share({ title: "EcoCheck Result", text });
    } else {
      await navigator.clipboard.writeText(text);
      alert("Result copied to clipboard!");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Hero card */}
      <div className={`rounded-3xl p-6 md:p-8 border ${colors.border} ${colors.light}`}>
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="relative shrink-0">
            <EcoBadge grade={analysis.grade} size="lg" />
            <div className="absolute -bottom-2 -right-2 bg-white rounded-full px-2 py-0.5 shadow border border-slate-100">
              <span className="text-xs font-bold text-slate-600">{analysis.ecoScore}/100</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-display font-black text-slate-900 leading-tight">
                  {product.product_name}
                </h2>
                <p className={`text-sm font-semibold mt-1 ${colors.text}`}>{product.brands || 'Unknown Brand'}</p>
              </div>
              <button
                onClick={handleShare}
                className="shrink-0 p-2 rounded-xl bg-white/70 hover:bg-white border border-slate-200 transition-all"
                title="Share result"
              >
                <Share2 className="w-4 h-4 text-slate-600" />
              </button>
            </div>
            <p className={`mt-3 text-sm md:text-base leading-relaxed font-medium ${colors.text}`}>
              {analysis.verdict}
            </p>
          </div>
        </div>

        {/* Fun fact strip */}
        {analysis.funFact && (
          <div className="mt-5 flex items-start gap-3 p-4 bg-white/60 rounded-2xl border border-white/80">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
            <p className="text-sm text-slate-700 leading-relaxed">
              <span className="font-bold">Did you know? </span>{analysis.funFact}
            </p>
          </div>
        )}
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          icon={<Leaf className="w-4 h-4 text-emerald-600" />}
          label="Carbon"
          value={analysis.carbonFootprint}
          score={analysis.carbonScore ?? Math.max(20, analysis.ecoScore - 10)}
          explanation={analysis.carbonExplanation}
          color="bg-emerald-50"
          strokeColor="#22c55e"
        />
        <MetricCard
          icon={<Droplets className="w-4 h-4 text-blue-600" />}
          label="Water"
          value={analysis.waterUsage}
          score={analysis.waterScore ?? Math.max(30, analysis.ecoScore - 5)}
          explanation={analysis.waterExplanation}
          color="bg-blue-50"
          strokeColor="#3b82f6"
        />
        <MetricCard
          icon={<Package className="w-4 h-4 text-orange-600" />}
          label="Packaging"
          value={`Score ${analysis.packagingScore}/100`}
          score={analysis.packagingScore}
          explanation={analysis.packagingExplanation}
          color="bg-orange-50"
          strokeColor="#f97316"
        />
      </div>

      {/* Concerns */}
      {analysis.concerns.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Key environmental concerns
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {analysis.concerns.map((concern, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                <p className="text-sm text-slate-700 leading-relaxed">{concern}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Alternatives */}
      <div>
        <h3 className="text-xl font-display font-bold text-slate-900 mb-4">Greener alternatives</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analysis.alternatives.map((alt, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-900 text-sm leading-snug">{alt.name}</h4>
                  <span className="shrink-0 ml-2 text-xs font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                    {alt.ecoScore}/100
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{alt.reason}</p>
              </div>
              {alt.url && (
                <a
                  href={alt.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-800 transition-colors"
                >
                  View product <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Citations */}
      {analysis.citations && analysis.citations.length > 0 && (
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
          <h4 className="text-sm font-bold text-slate-600 mb-3">Sources</h4>
          <div className="flex flex-wrap gap-2">
            {analysis.citations.map((cite, i) => (
              <a
                key={i}
                href={cite.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-full text-slate-600 hover:text-emerald-700 hover:border-emerald-200 transition-all flex items-center gap-1"
              >
                {cite.title} <ArrowRight className="w-2.5 h-2.5" />
              </a>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
