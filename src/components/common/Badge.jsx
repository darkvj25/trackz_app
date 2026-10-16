import React from 'react';

export const Badge = ({ children, variant = 'primary', className = '' }) => {
  const variants = {
    primary: 'bg-trakz-50 text-trakz-600 border border-trakz-200',
    secondary: 'bg-slate-100 text-slate-700 border border-slate-200',
    accent: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200',
    dark: 'bg-slate-900 text-white border border-slate-800'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant] || variants.primary} ${className}`}>
      {children}
    </span>
  );
};
