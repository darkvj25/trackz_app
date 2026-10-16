import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  icon: Icon
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-bold rounded-2xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 shadow-sm cursor-pointer';

  const variants = {
    primary: 'bg-[#ffb100] hover:bg-[#e59e00] text-[#0a1c36] font-extrabold shadow-amber-500/20',
    secondary: 'bg-[#0a1c36] hover:bg-[#051020] text-white border border-slate-700',
    outline: 'bg-transparent border-2 border-[#0a1c36] dark:border-[#ffb100] text-[#0a1c36] dark:text-[#ffb100] hover:bg-amber-50 dark:hover:bg-[#0a1c36]/60',
    ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-[#0a1c36] text-[#0a1c36] dark:text-slate-200 shadow-none',
    dark: 'bg-[#0a1c36] hover:bg-[#051020] text-[#ffb100] border border-[#ffb100]/20'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-2.5 font-extrabold'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
      ) : null}
      <span>{children}</span>
    </button>
  );
};
