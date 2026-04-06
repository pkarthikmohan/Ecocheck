import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { Leaf, Droplets, Package, Zap } from "lucide-react";

const MESSAGES = [
  { icon: Leaf, text: "Identifying product..." },
  { icon: Zap, text: "Analyzing carbon footprint..." },
  { icon: Droplets, text: "Calculating water usage..." },
  { icon: Package, text: "Scoring packaging..." },
];

export function Skeleton() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(s => (s + 1) % MESSAGES.length);
    }, 900);
    return () => clearInterval(interval);
  }, []);

  const { icon: Icon, text } = MESSAGES[step];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Live status indicator */}
      <div className="flex flex-col items-center gap-4 py-10">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.2 }}
              >
                <Icon className="w-7 h-7 text-emerald-500" />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="text-sm font-semibold text-slate-600"
          >
            {text}
          </motion.p>
        </AnimatePresence>

        {/* Progress dots */}
        <div className="flex gap-2">
          {MESSAGES.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${i <= step ? 'w-6 bg-emerald-500' : 'w-1.5 bg-slate-200'}`}
            />
          ))}
        </div>
      </div>

      {/* Skeleton cards */}
      <div className="animate-pulse space-y-6">
        <div className="bg-emerald-50/50 rounded-3xl p-8 h-36 border border-emerald-100/50" />
        <div className="grid grid-cols-3 gap-4">
          {[0,1,2].map(i => (
            <div key={i} className="bg-slate-100 rounded-2xl h-32" />
          ))}
        </div>
        <div className="bg-slate-100 rounded-2xl h-28" />
      </div>
    </div>
  );
}
