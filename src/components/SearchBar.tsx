import { Search, Loader2, Zap } from "lucide-react";
import { useRef, useState } from "react";
import { motion } from "motion/react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = inputRef.current?.value.trim();
    if (query) onSearch(query);
  };

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="relative w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div 
        className="relative"
        animate={{ scale: isFocused ? 1.02 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <input
          ref={inputRef}
          name="query"
          type="text"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search any product — e.g. Coca Cola, Lays, Dove soap..."
          className="w-full h-14 pl-12 pr-32 bg-white/80 backdrop-blur-md border-2 border-slate-200 rounded-2xl focus:border-emerald-400 focus:shadow-[0_0_20px_rgba(52,211,153,0.3)] focus:ring-0 transition-all outline-none text-base shadow-sm placeholder:text-slate-400 font-medium"
          disabled={isLoading}
          autoFocus
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {isLoading
            ? <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
            : <Search className={`w-5 h-5 transition-colors ${isFocused ? 'text-emerald-500' : ''}`} />
          }
        </div>
        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: isLoading ? 1 : 1.05 }}
          whileTap={{ scale: isLoading ? 1 : 0.95 }}
          className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-4 h-10 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
        >
          {isLoading ? (
            <span className="text-xs">Analyzing...</span>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5" />
              Analyze
            </>
          )}
        </motion.button>
      </motion.div>
    </motion.form>
  );
}
