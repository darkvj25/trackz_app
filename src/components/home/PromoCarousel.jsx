import React, { useState, useEffect } from 'react';
import { mockPromos } from '../../data/mockPromos';
import { ShieldCheck, Copy, Check } from 'lucide-react';

export const PromoCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mockPromos.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyCode = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const promo = mockPromos[currentIndex];

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-lg border border-purple-500/20 dark:border-purple-500/30 group my-2">
      <div className={`relative min-h-[160px] sm:min-h-[180px] bg-gradient-to-r ${promo.bgGradient} p-5 sm:p-6 flex flex-col justify-between text-white transition-all duration-500`}>
        {/* Background Overlay Glow */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-purple-500/20 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 flex justify-between items-start gap-4">
          <div className="space-y-1.5 max-w-xs sm:max-w-md">
            {/* Badge pill matching screenshot TRAKZ SAFETY EXPRESS */}
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/30 dark:bg-purple-900/50 backdrop-blur-md text-[10px] sm:text-xs font-bold uppercase tracking-wider text-purple-200 border border-purple-400/40">
              <ShieldCheck size={13} className="text-purple-300" />
              {promo.badge}
            </span>

            {/* Title with highlighted text */}
            <h3 className="text-lg sm:text-2xl font-black leading-tight tracking-tight text-white pt-0.5">
              {promo.title.includes('Rider Radar') ? (
                <>
                  Fast & Safe Delivery with <span className="text-indigo-300 font-extrabold">Rider Radar</span>
                </>
              ) : (
                promo.title
              )}
            </h3>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-slate-200/90 font-medium leading-relaxed">
              {promo.subtitle}
            </p>
          </div>

          {/* Right illustration / food icon matching screenshot drumstick */}
          <div className="shrink-0 text-4xl sm:text-5xl transform group-hover:scale-110 transition-transform duration-300 p-2 bg-white/10 dark:bg-slate-800/40 rounded-2xl border border-white/10 backdrop-blur-sm">
            {promo.icon || '🍗'}
          </div>
        </div>

        {/* Bottom controls & Promo Code Copy Pill */}
        <div className="relative z-10 flex items-center justify-between pt-3 mt-2 border-t border-white/10">
          <button
            onClick={() => handleCopyCode(promo.code)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/15 hover:bg-white/25 dark:bg-slate-900/60 dark:hover:bg-slate-800/80 text-white text-xs font-semibold border border-white/20 transition-all active:scale-95 cursor-pointer"
          >
            {copiedCode === promo.code ? (
              <>
                <Check size={13} className="text-emerald-400" />
                <span className="text-emerald-300 font-bold">Copied: {promo.code}</span>
              </>
            ) : (
              <>
                <Copy size={13} className="text-purple-300" />
                <span>Code: <span className="text-purple-200 font-bold">{promo.code}</span></span>
              </>
            )}
          </button>

          {/* Carousel Dots */}
          <div className="flex gap-1.5">
            {mockPromos.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentIndex ? 'w-5 bg-purple-400' : 'w-2 bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
