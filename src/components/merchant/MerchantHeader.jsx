import React, { useState } from 'react';
import { Star, Clock, Bike, Heart, Share2, MapPin } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const MerchantHeader = ({ merchant, onOpenReviews }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="relative bg-white dark:bg-[#0b0f19] border-b border-slate-100 dark:border-slate-800/80 pb-6 transition-colors">
      {/* Cover Backdrop */}
      <div className="relative h-48 sm:h-64 w-full bg-slate-900 overflow-hidden">
        <img
          src={merchant.coverImage}
          alt={merchant.name}
          className="w-full h-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent" />

        {/* Favorite & Share Buttons */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="p-2.5 rounded-full bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 backdrop-blur-md transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Heart size={18} className={isFavorite ? 'fill-rose-500 text-rose-500' : ''} />
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: merchant.name, url: window.location.href });
              }
            }}
            className="p-2.5 rounded-full bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 backdrop-blur-md transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* Main Info Box overlaying Cover */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="bg-white dark:bg-[#121927] rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between transition-colors">
          <div className="flex gap-4 items-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white dark:bg-slate-800 p-1 border-2 border-slate-100 dark:border-slate-800 shadow-md overflow-hidden shrink-0">
              <img
                src={merchant.logo}
                alt={merchant.name}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                  {merchant.name}
                </h1>
                {merchant.isOpen ? (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    OPEN
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 text-[10px] font-extrabold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    CLOSED
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {merchant.description}
              </p>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                {merchant.categoryName} • {merchant.priceRange} • Min. order {formatCurrency(merchant.minOrderAmount)}
              </p>
              {merchant.address && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 pt-0.5">
                  <MapPin size={14} className="text-amber-500 shrink-0" />
                  <span className="truncate">{merchant.address}, {merchant.city || 'Taguig City'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center justify-around sm:justify-end gap-4 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 text-center sm:text-right">
            <button
              onClick={onOpenReviews}
              className="flex flex-col items-center sm:items-end group cursor-pointer"
            >
              <div className="flex items-center gap-1 text-slate-900 dark:text-slate-100 font-extrabold text-base group-hover:text-purple-600 dark:group-hover:text-purple-400">
                <Star size={18} className="fill-amber-400 text-amber-400" />
                <span>{merchant.rating}</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-400 underline">
                {merchant.reviewCount} reviews
              </span>
            </button>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />

            <div className="flex flex-col items-center sm:items-end">
              <div className="flex items-center gap-1 text-slate-900 dark:text-slate-100 font-extrabold text-base">
                <Clock size={16} className="text-slate-400" />
                <span>{merchant.estimatedDeliveryTime}</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">
                Delivery Time
              </span>
            </div>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />

            <div className="flex flex-col items-center sm:items-end">
              <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-extrabold text-base">
                <Bike size={16} />
                <span>{formatCurrency(merchant.deliveryFee)}</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">
                Delivery Fee
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
