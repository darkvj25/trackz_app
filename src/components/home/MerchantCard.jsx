import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Bike } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const MerchantCard = ({ merchant, compact = false }) => {
  const isClosed = merchant.isOpen === false || merchant.isOpen === 0;

  return (
    <Link
      to={`/merchants/${merchant.id}`}
      className={`group bg-white dark:bg-[#121927] rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all duration-300 p-3.5 flex items-center justify-between gap-3 cursor-pointer ${
        isClosed ? 'opacity-85 bg-slate-50/80 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800' : ''
      }`}
    >
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        {/* Merchant Brand Square Avatar */}
        <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl shrink-0 flex items-center justify-center p-0.5 overflow-hidden shadow-sm relative ${
          merchant.brandColor
            ? `bg-gradient-to-br ${merchant.brandColor}`
            : 'bg-slate-100 dark:bg-slate-800'
        }`}>
          {merchant.logo ? (
            <img
              src={merchant.logo}
              alt={merchant.name}
              className={`w-full h-full object-cover rounded-xl transition-all duration-300 ${
                isClosed ? 'grayscale opacity-70 contrast-90' : ''
              }`}
              loading="lazy"
            />
          ) : (
            <span className={`text-2xl font-black text-white ${isClosed ? 'opacity-50' : ''}`}>
              {merchant.brandLetter || merchant.name.charAt(0)}
            </span>
          )}

          {isClosed && (
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[1px] flex items-center justify-center rounded-2xl">
              <span className="text-[9px] font-black text-white bg-rose-600/90 px-1.5 py-0.5 rounded uppercase tracking-wider shadow-xs">
                CLOSED
              </span>
            </div>
          )}
        </div>

        {/* Merchant Main Info */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
                {merchant.name}
              </h3>
              {isClosed && (
                <span className="px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 text-[9px] font-black tracking-wider uppercase shrink-0">
                  CLOSED
                </span>
              )}
            </div>

            {/* Rating badge on right top */}
            <div className="flex items-center gap-1 shrink-0 text-xs font-bold text-slate-800 dark:text-slate-200">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              <span>{merchant.rating}</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
            {merchant.description}
          </p>

          {/* Time & Delivery Fee / Promo Tag */}
          <div className="flex items-center gap-2 pt-0.5 flex-wrap">
            {isClosed ? (
              <span className="px-2 py-0.5 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 text-[10px] font-extrabold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                Store Currently Closed
              </span>
            ) : (
              <>
                <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  <Clock size={12} className="text-slate-400" />
                  <span>{merchant.estimatedDeliveryTime}</span>
                </div>

                {merchant.promoBadge ? (
                  <span className="px-2 py-0.5 rounded-lg bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 text-[10px] font-bold">
                    {merchant.promoBadge}
                  </span>
                ) : merchant.deliveryFee === 0 ? (
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-[10px] font-bold">
                    Free Delivery
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    • {formatCurrency(merchant.deliveryFee)} delivery
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};
