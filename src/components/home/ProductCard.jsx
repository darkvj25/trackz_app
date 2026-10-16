import React from 'react';
import { Plus, Star } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const ProductCard = ({ product, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(product)}
      className="group bg-white dark:bg-[#121927] rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all duration-300 p-3 flex flex-col justify-between cursor-pointer"
    >
      <div className="relative h-32 sm:h-36 w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {product.rating && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-[11px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1 shadow-sm">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            <span>{product.rating}</span>
          </div>
        )}
      </div>

      <div className="space-y-1 flex-1">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block truncate">
          {product.merchantName}
        </span>
        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
          {product.name}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {product.description}
        </p>
      </div>

      <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 dark:border-slate-800/80">
        <span className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
          {formatCurrency(product.price)}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(product);
          }}
          className="p-2 rounded-2xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-300 hover:bg-purple-600 hover:text-white font-bold transition-all shadow-sm active:scale-95"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
};
