import { Search, Loader2, Zap } from "lucide-react";
import { useRef } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = inputRef.current?.value.trim();
    if (query) onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <input
          ref={inputRef}
          name="query"
          type="text"
          placeholder="Search any product — e.g. Coca Cola, Lays, Dove soap..."
          className="w-full h-14 pl-12 pr-32 bg-white border-2 border-slate-200 rounded-2xl focus:border-emerald-400 focus:ring-0 transition-all outline-none text-base shadow-sm placeholder:text-slate-400"
          disabled={isLoading}
          autoFocus
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {isLoading
            ? <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
            : <Search className="w-5 h-5" />
          }
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all active:scale-95"
        >
          {isLoading ? (
            <span className="text-xs">Analyzing...</span>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5" />
              Analyze
            </>
          )}
        </button>
      </div>
    </form>
  );
}
