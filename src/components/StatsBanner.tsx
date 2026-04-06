import { ShieldCheck, TrendingDown, History, X } from "lucide-react";
import { AppStats } from "../types";
import { useState } from "react";
import { EcoBadge } from "./EcoBadge";
import { motion, AnimatePresence } from "motion/react";

interface StatsBannerProps {
  stats: AppStats;
  onHistoryClick?: (item: any) => void;
}

export function StatsBanner({ stats, onHistoryClick }: StatsBannerProps) {
  const [showHistory, setShowHistory] = useState(false);
  const history = stats.productsHistory || [];

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap justify-center items-center gap-4 md:gap-8 py-5 px-6 bg-white/60 backdrop-blur-xl rounded-3xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
      >
        <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-slate-900 leading-none">{stats.productsChecked}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Products checked</p>
          </div>
        </motion.div>

        <div className="w-px h-10 bg-slate-200/50 hidden md:block" />

        <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-slate-900 leading-none">{stats.co2Saved.toFixed(1)}kg</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">CO₂ saved est.</p>
          </div>
        </motion.div>

        {history.length > 0 && (
          <>
            <div className="w-px h-10 bg-slate-200/50 hidden md:block" />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-2 px-4 h-10 rounded-xl bg-white/80 border border-slate-200/50 text-slate-600 text-sm font-bold shadow-sm hover:border-emerald-200 hover:text-emerald-600 transition-colors"
            >
              <History className="w-4 h-4" />
              History ({history.length})
            </motion.button>
          </>
        )}
      </motion.div>

      {/* History modal */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-end md:items-center justify-center p-4 md:p-0"
            onClick={() => setShowHistory(false)}
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-[2rem] w-full max-w-md p-6 shadow-2xl pb-10 md:pb-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-display font-black text-slate-900 tracking-tight">Activity History</h3>
                <motion.button 
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowHistory(false)} 
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {[...history].reverse().map((item, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    key={i} 
                    onClick={() => {
                      if (onHistoryClick) onHistoryClick(item);
                      setShowHistory(false);
                    }}
                    className="flex items-center gap-4 p-3.5 bg-white rounded-2xl border border-slate-100 shadow-sm cursor-pointer hover:border-emerald-200 transition-colors"
                  >
                    <EcoBadge grade={item.grade as any} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 text-sm truncate">{item.name}</p>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">{item.brand} · Score {item.ecoScore}</p>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
