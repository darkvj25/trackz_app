import React from 'react';

export const CategoryTabs = ({ categories = [], activeCategory, onSelect }) => {
  return (
    <div className="sticky top-[61px] z-30 bg-white/95 dark:bg-[#0b0f19]/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/80 shadow-sm py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelect(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20 scale-105'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
};
