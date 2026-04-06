import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Leaf, Info, Recycle, Globe, Zap } from 'lucide-react';
import { SearchBar } from './components/SearchBar';
import { ProductList } from './components/ProductList';
import { AnalysisView } from './components/AnalysisView';
import { Skeleton } from './components/Skeleton';
import { StatsBanner } from './components/StatsBanner';
import { Scanner } from './components/Scanner';
import { searchProducts, analyzeProduct, analyzeQuery, analyzeImage } from './services/api';
import { Product, EcoAnalysis, AppStats } from './types';

const EXAMPLE_SEARCHES = ["Coca Cola", "Lays chips", "Dove soap", "Nescafe coffee", "Maggi noodles"];

export default function App() {
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [analysis, setAnalysis] = useState<EcoAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false); // kept for SearchBar prop
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AppStats>(() => {
    const saved = localStorage.getItem('ecocheck_stats_v2');
    return saved ? JSON.parse(saved) : { productsChecked: 0, co2Saved: 0, productsHistory: [] };
  });

  useEffect(() => {
    localStorage.setItem('ecocheck_stats_v2', JSON.stringify(stats));
  }, [stats]);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setError(null);
    setSearchResults([]);
    setAnalysis(null);
    setSelectedProduct(null);

    // Background: fetch real product list from OFF (for "pick different" UX)
    searchProducts(query).then(setSearchResults).catch(() => {});

    // Main path: one-shot query → instant analysis, no product picking needed
    try {
      const result = await analyzeQuery(query);
      const p: Product = { product_name: result.productName, brands: result.brand, code: 'ai-' + Date.now() };
      setSelectedProduct(p);
      setAnalysis(result);
      updateStats(result, p);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const isQuota = message.includes("429") || message.includes("quota") || message.includes("RESOURCE_EXHAUSTED");
      setError(isQuota
        ? "All AI models are temporarily rate-limited. Please wait 1 minute and try again."
        : `Analysis failed: ${message}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectProduct = async (product: Product) => {
    setSearchResults([]);
    setSelectedProduct(product);
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const result = await analyzeProduct(product);
      setAnalysis(result);
      updateStats(result, product);
    } catch (err) {
      setError("AI analysis failed. Please try again.");
      setSelectedProduct(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScan = async (base64Image: string, mimeType: string) => {
    setIsLoading(true);
    setError(null);
    setSelectedProduct(null);
    setAnalysis(null);
    setSearchResults([]);
    try {
      const result = await analyzeImage(base64Image, mimeType);
      if (result.isProduct === false) {
        setError(result.rejectionReason || "Please upload an image of a consumer product.");
        setIsLoading(false);
        return;
      }
      setAnalysis(result);
      const p: Product = { product_name: result.productName, brands: result.brand, code: 'scanned-' + Date.now() };
      setSelectedProduct(p);
      updateStats(result, p);
    } catch (err) {
      setError("Failed to identify product from image. Try searching manually.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateStats = (result: EcoAnalysis, product: Product) => {
    const co2Saved = ['C', 'D', 'F'].includes(result.grade) ? 0.5 : 0;
    setStats(prev => ({
      productsChecked: prev.productsChecked + 1,
      co2Saved: prev.co2Saved + co2Saved,
      productsHistory: [
        ...(prev.productsHistory || []),
        {
          name: product.product_name,
          brand: product.brands || 'Unknown',
          grade: result.grade,
          ecoScore: result.ecoScore,
          timestamp: Date.now()
        }
      ].slice(-20)
    }));
  };

  const isEmpty = !analysis && !isLoading && !searchResults.length && !isSearching;

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="pt-12 pb-10 px-4 text-center space-y-5">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-700 rounded-full font-bold text-sm"
        >
          <Leaf className="w-4 h-4" />
          EcoCheck AI
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-6xl font-display font-black text-slate-900 tracking-tight"
        >
          Shop <span className="text-emerald-500">Sustainably</span>.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-slate-500 text-lg max-w-xl mx-auto"
        >
          Search or scan any product to see its environmental impact and find greener alternatives.
        </motion.p>
      </header>

      <main className="px-4 space-y-10">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Search + scan */}
          <SearchBar onSearch={handleSearch} isLoading={isSearching} />

          {/* Example chips */}
          {isEmpty && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-wrap justify-center gap-2"
            >
              <span className="text-xs text-slate-400 self-center mr-1">Try:</span>
              {EXAMPLE_SEARCHES.map(q => (
                <button
                  key={q}
                  onClick={() => handleSearch(q)}
                  className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-full text-slate-600 hover:border-emerald-400 hover:text-emerald-700 transition-all"
                >
                  {q}
                </button>
              ))}
            </motion.div>
          )}

          <div className="flex items-center gap-4 max-w-2xl mx-auto">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">or</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <Scanner onScan={handleScan} isLoading={isLoading} />

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-medium max-w-2xl mx-auto"
              >
                <Info className="w-5 h-5 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <ProductList products={searchResults} onSelect={handleSelectProduct} />
        </div>

        {/* Stats */}
        <div className="max-w-4xl mx-auto">
          <StatsBanner stats={stats} />
        </div>

        {/* Results */}
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <Skeleton />
          ) : analysis && selectedProduct ? (
            <AnalysisView product={selectedProduct} analysis={analysis} />
          ) : isEmpty && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="flex justify-center gap-6 mb-8 opacity-20">
                <Recycle className="w-12 h-12" />
                <Globe className="w-16 h-16" />
                <Zap className="w-12 h-12" />
              </div>
              <p className="text-2xl font-display font-bold text-slate-300">Start your eco-journey</p>
              <p className="text-slate-400 text-sm mt-2">Search any product above to see its impact</p>
            </motion.div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto mt-20 px-4 text-center">
        <div className="p-8 bg-slate-900 rounded-[2rem] text-white space-y-3">
          <h4 className="text-xl font-display font-bold">Why EcoCheck?</h4>
          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl mx-auto">
            Our AI analyzes supply chains, packaging materials, and manufacturing processes using Open Food Facts data and global sustainability benchmarks — giving you the most accurate impact assessment possible.
          </p>
        </div>
      </footer>
    </div>
  );
}
