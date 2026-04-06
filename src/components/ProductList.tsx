import { Product } from "../types";

interface ProductListProps {
  products: Product[];
  onSelect: (product: Product) => void;
}

export function ProductList({ products, onSelect }: ProductListProps) {
  if (products.length === 0) return null;

  return (
    <div className="max-w-2xl mx-auto mt-4 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden divide-y divide-slate-50">
      {products.map((product) => (
        <button
          key={product.code}
          onClick={() => onSelect(product)}
          className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors text-left"
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
      ))}
    </div>
  );
}
