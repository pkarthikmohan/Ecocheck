import { Product } from "../types";
import { motion, Variants } from "motion/react";

interface ProductListProps {
  products: Product[];
  onSelect: (product: Product) => void;
}

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const item: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export function ProductList({ products, onSelect }: ProductListProps) {
  if (products.length === 0) return null;

  return (
    <motion.ul 
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-2xl mx-auto mt-4 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-100 overflow-hidden divide-y divide-slate-50"
    >
      {products.map((product) => (
        <motion.li key={product.code} variants={item}>
          <button
            onClick={() => onSelect(product)}
            className="w-full p-4 flex items-center gap-4 hover:bg-emerald-50/50 transition-colors text-left group"
          >
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.product_name}
              className="w-12 h-12 object-contain rounded-lg bg-slate-50"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs text-center p-1">
              No Image
            </div>
          )}
          <div>
            <h4 className="font-bold text-slate-900 line-clamp-1">{product.product_name}</h4>
            <p className="text-sm text-slate-500">{product.brands || 'Unknown Brand'}</p>
          </div>
          </button>
        </motion.li>
      ))}
    </motion.ul>
  );
}
