import { motion } from "motion/react";
import { Leaf, Droplets, Package, Wrench, Recycle, Zap } from "lucide-react";
import { EcoAnalysis } from "../types";

interface ComparisonChartProps {
  analysis: EcoAnalysis;
  selectedAlternative: EcoAnalysis['alternatives'][0];
}

export function ComparisonChart({ analysis, selectedAlternative: alt }: ComparisonChartProps) {
  if (!alt) return null;
  
  // Compute primary product scores from analysis object.
  // Using the fallback math from MetricCards if values are missing
  const primaryScores = {
    carbonScore: analysis.carbonScore ?? Math.max(20, analysis.ecoScore - 10),
    waterScore: analysis.waterScore ?? Math.max(30, analysis.ecoScore - 5),
    packagingScore: analysis.packagingScore || 0,
    repairabilityScore: analysis.repairabilityScore || 0,
    recyclabilityScore: analysis.recyclabilityScore || 0,
    energyScore: analysis.energyScore || 0,
  };

  const metrics = [
    { label: "Carbon", icon: <Leaf className="w-4 h-4" />, primary: primaryScores.carbonScore, alt: alt.carbonScore, color: "bg-emerald-500", light: "bg-emerald-100", text: "text-emerald-700" },
    { label: "Water", icon: <Droplets className="w-4 h-4" />, primary: primaryScores.waterScore, alt: alt.waterScore, color: "bg-blue-500", light: "bg-blue-100", text: "text-blue-700" },
    { label: "Packaging", icon: <Package className="w-4 h-4" />, primary: primaryScores.packagingScore, alt: alt.packagingScore, color: "bg-orange-500", light: "bg-orange-100", text: "text-orange-700" },
    { label: "Repairability", icon: <Wrench className="w-4 h-4" />, primary: primaryScores.repairabilityScore, alt: alt.repairabilityScore, color: "bg-purple-500", light: "bg-purple-100", text: "text-purple-700" },
    { label: "Recyclability", icon: <Recycle className="w-4 h-4" />, primary: primaryScores.recyclabilityScore, alt: alt.recyclabilityScore, color: "bg-teal-500", light: "bg-teal-100", text: "text-teal-700" },
    { label: "Energy", icon: <Zap className="w-4 h-4" />, primary: primaryScores.energyScore, alt: alt.energyScore, color: "bg-yellow-500", light: "bg-yellow-100", text: "text-yellow-700" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      className="mt-12 bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h3 className="text-xl font-display font-bold text-slate-900">Direct Comparison</h3>
          <p className="text-sm text-slate-500 mt-1">Selected Product vs <span className="font-bold text-emerald-600">{alt.name}</span></p>
        </div>
        <div className="flex gap-4 text-xs font-bold">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-md bg-slate-300" /> Current</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-md bg-emerald-500" /> Alternative</div>
        </div>
      </div>

      <div className="space-y-5">
        {metrics.map((m, i) => (
          <div key={i} className="grid grid-cols-[100px_1fr] md:grid-cols-[140px_1fr] items-center gap-4">
            <div className={`flex items-center gap-2 text-sm font-bold ${m.text}`}>
              <div className={`p-1.5 rounded-lg ${m.light}`}>{m.icon}</div>
              {m.label}
            </div>
            
            <div className="relative h-10 flex flex-col justify-center gap-1.5 w-full">
              {/* Primary Bar */}
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} 
                  whileInView={{ width: `${m.primary}%` }}
                  transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                  className="h-full bg-slate-400 rounded-full"
                />
              </div>
              {/* Alternative Bar */}
              <div className="h-3 w-full bg-emerald-50 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} 
                  whileInView={{ width: `${m.alt}%` }}
                  transition={{ duration: 1, delay: i * 0.1 + 0.2, ease: "easeOut" }}
                  className={`h-full ${m.color} rounded-full z-10 relative shadow-sm`}
                />
              </div>
              
              {/* Number tooltips essentially embedded in design */}
              <span className="absolute -top-1 -translate-y-full right-0 text-[10px] font-bold text-slate-400">
                {m.primary} vs <span className={m.text}>{m.alt}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
