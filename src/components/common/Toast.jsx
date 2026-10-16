import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ message, type = 'success', onClose }) => {
  if (!message) return null;

  const typeStyles = {
    success: {
      bg: 'bg-[#0a1c36] text-white border border-[#ffb100]/40',
      icon: <CheckCircle2 className="text-[#ffb100] shrink-0" size={22} />
    },
    error: {
      bg: 'bg-rose-900 text-white border border-rose-500/50',
      icon: <AlertCircle className="text-rose-400 shrink-0" size={22} />
    },
    info: {
      bg: 'bg-[#0a1c36] text-white border border-sky-500/40',
      icon: <Info className="text-sky-400 shrink-0" size={22} />
    },
    warning: {
      bg: 'bg-amber-950 text-white border border-amber-500/50',
      icon: <AlertCircle className="text-amber-400 shrink-0" size={22} />
    }
  };

  const currentStyle = typeStyles[type] || typeStyles.success;

  return (
    <div className={`fixed top-5 right-5 z-[9999] flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-2xl max-w-sm sm:max-w-md w-auto ${currentStyle.bg} backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-4`}>
      {currentStyle.icon}
      <p className="text-xs sm:text-sm font-bold flex-1 leading-snug">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
