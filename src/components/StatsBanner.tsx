import { ShieldCheck, TrendingDown, History, X } from "lucide-react";
import { AppStats } from "../types";
import { useState } from "react";
import { EcoBadge } from "./EcoBadge";

interface StatsBannerProps {
  stats: AppStats;
}

export function StatsBanner({ stats }: StatsBannerProps) {
  const [showHistory, setShowHistory] = useState(false);
  const history = stats.productsHistory || [];

  return (
    <>
      <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 py-5 px-6 bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-slate-900">{stats.productsChecked}</p>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Products checked</p>
          </div>
        </div>

        <div className="w-px h-10 bg-slate-100 hidden md:block" />

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-slate-900">{stats.co2Saved.toFixed(1)}kg</p>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">CO₂ saved est.</p>
          </div>
        </div>

        {history.length > 0 && (
          <>
            <div className="w-px h-10 bg-slate-100 hidden md:block" />
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-100 transition-all"
            >
              <History className="w-4 h-4" />
              History ({history.length})
            </button>
          </>
        )}
      </div>

      {/* History modal */}
      {showHistory && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center p-4"
          onClick={() => setShowHistory(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-display font-bold text-slate-900">Checked products</h3>
              <button onClick={() => setShowHistory(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {[...history].reverse().map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                  <EcoBadge grade={item.grade as any} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">{item.name}</p>
                    <p className="text-xs text-slate-400">{item.brand} · Score {item.ecoScore}/100</p>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
