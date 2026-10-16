import React from 'react';
import { mockCategories } from '../../data/mockCategories';

export const CategoryList = ({ selectedCategory, onSelectCategory }) => {
  return (
    <div className="py-2">
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
          FOOD CATEGORIES
        </h2>
        <button
          onClick={() => onSelectCategory('all')}
          className="text-xs font-bold text-trakz-500 dark:text-purple-400 hover:underline"
        >
          View All
        </button>
      </div>

      <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-2 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        {mockCategories.map((cat) => {
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs sm:text-sm shrink-0 transition-all cursor-pointer active:scale-95 ${
                isSelected
                  ? 'bg-purple-600 dark:bg-purple-600 text-white shadow-md shadow-purple-500/25 ring-2 ring-purple-400/50'
                  : 'bg-white dark:bg-[#151d2c] text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-[#1b2538]'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
