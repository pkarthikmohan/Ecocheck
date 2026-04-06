import { motion } from "motion/react";
import { cn } from "../lib/utils";

interface EcoBadgeProps {
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  size?: 'sm' | 'md' | 'lg';
}

const gradeColors = {
  A: 'bg-eco-a text-white',
  B: 'bg-eco-b text-white',
  C: 'bg-eco-c text-white',
  D: 'bg-eco-d text-white',
  F: 'bg-eco-f text-white',
};

export function EcoBadge({ grade, size = 'md' }: EcoBadgeProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-24 h-24 text-4xl',
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "flex items-center justify-center rounded-2xl font-display font-bold shadow-lg",
        gradeColors[grade],
        sizeClasses[size]
      )}
    >
      {grade}
    </motion.div>
  );
}
