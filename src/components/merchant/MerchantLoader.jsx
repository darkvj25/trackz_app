import React from 'react';
import { Store, Utensils } from 'lucide-react';

export const MerchantLoader = ({ count = 3, message = 'Discovering top merchants nearby...' }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white dark:bg-[#121927] rounded-3xl p-4 border border-slate-100 dark:border-slate-800/80 shadow-card flex flex-col gap-3 animate-pulse"
        >
          {/* Banner Cover Image Placeholder with Centered Loading Store Icon */}
          <div className="relative w-full h-40 bg-slate-100 dark:bg-slate-800/70 rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-2 border border-slate-200/50 dark:border-slate-700/40">
            <div className="relative flex items-center justify-center">
              <span className="absolute w-10 h-10 rounded-full bg-purple-500/30 animate-ping"></span>
              <div className="p-2.5 rounded-2xl bg-purple-600 text-white shadow-md flex items-center justify-center">
                <Store size={20} className="animate-bounce" />
              </div>
            </div>
            {idx === 0 && (
              <span className="text-[11px] font-extrabold text-purple-600 dark:text-purple-300 animate-pulse text-center px-2">
                {message}
              </span>
            )}
          </div>

          {/* Merchant Info Lines */}
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-3/4" />
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/2" />
          </div>

          {/* Bottom Badges Line */}
          <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3" />
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-xl w-20" />
          </div>
        </div>
      ))}
    </div>
  );
};
