import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon: Icon,
  required = false,
  className = '',
  name,
  disabled = false
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center justify-between">
          <span>
            {label} {required && <span className="text-purple-600 dark:text-purple-400">*</span>}
          </span>
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
            <Icon size={18} />
          </div>
        )}
        <input
          name={name}
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full rounded-2xl border ${
            error
              ? 'border-rose-500 focus:ring-rose-200'
              : 'border-slate-200 dark:border-slate-800 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-purple-500/20'
          } bg-white dark:bg-[#121927] py-3 ${Icon ? 'pl-11' : 'pl-4'} ${
            isPassword ? 'pr-11' : 'pr-4'
          } text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:text-slate-500`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <span className="text-xs font-medium text-rose-500">{error}</span>}
    </div>
  );
};
