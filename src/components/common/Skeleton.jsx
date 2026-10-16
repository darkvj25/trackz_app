import React from 'react';

export const Skeleton = ({ className = '', variant = 'text' }) => {
  const baseClasses = 'animate-pulse bg-slate-200 dark:bg-slate-800 rounded-xl';

  if (variant === 'circle') {
    return <div className={`${baseClasses} rounded-full ${className}`} />;
  }

  if (variant === 'card') {
    return (
      <div className={`bg-white dark:bg-[#121927] rounded-3xl p-4 border border-slate-100 dark:border-slate-800/80 shadow-card flex flex-col gap-3 ${className}`}>
        <div className="w-full h-36 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4 animate-pulse" />
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2 animate-pulse" />
        <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/4 animate-pulse" />
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-20 animate-pulse" />
        </div>
      </div>
    );
  }

  return <div className={`${baseClasses} ${className}`} />;
};
