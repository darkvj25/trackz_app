import React from 'react';
import { Phone, MessageSquare, Star, ShieldCheck } from 'lucide-react';

export const RiderInfoCard = ({ rider }) => {
  if (!rider) return null;

  return (
    <div className="bg-white dark:bg-[#121927] rounded-3xl p-5 border border-slate-100 dark:border-slate-800/80 shadow-card flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src={rider.photo}
            alt={rider.name}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-200 dark:border-purple-900 shadow-sm"
          />
          <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-emerald-500 text-white">
            <ShieldCheck size={12} />
          </div>
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">{rider.name}</h4>
            <div className="flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
              <Star size={10} className="fill-amber-400 text-amber-400" />
              <span>{rider.rating}</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {rider.vehicle} • <span className="font-bold text-slate-700 dark:text-slate-300">{rider.plateNumber}</span>
          </p>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block">
            Verified Trakz Delivery Rider
          </span>
        </div>
      </div>

      {/* Call / Message buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <a
          href={`tel:${rider.phone}`}
          className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors shadow-xs active:scale-95 cursor-pointer"
          title="Call Rider"
        >
          <Phone size={18} />
        </a>
        <a
          href={`sms:${rider.phone}`}
          className="p-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white transition-colors shadow-md shadow-purple-500/20 active:scale-95 cursor-pointer"
          title="Message Rider"
        >
          <MessageSquare size={18} />
        </a>
      </div>
    </div>
  );
};
