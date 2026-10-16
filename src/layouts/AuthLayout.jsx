import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { TrakzEmblemLogo } from '../components/common/TrakzEmblemLogo';

export const AuthLayout = () => {
  const location = useLocation();
  const isLogin = location.pathname.includes('/login');

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col justify-between p-4 sm:p-6 text-white relative overflow-hidden transition-colors font-sans">
      {/* Background Radial Glow Circles matching Logo Gold */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-[#ffb100]/15 blur-3xl pointer-events-none animate-pulse-subtle" />
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 rounded-full bg-[#ffb100]/10 blur-3xl pointer-events-none animate-pulse-subtle" />

      {/* Top Header Logo */}
      <div className="relative z-10 max-w-md mx-auto w-full flex justify-between items-center py-2">
        <Link to="/" className="flex items-center gap-2.5 group active:scale-95 transition-transform">
          <TrakzEmblemLogo size="sm" showGalaxyHalo={false} className="group-hover:scale-105 transition-transform" />
          <div className="flex flex-col">
            <span className="font-extrabold text-xl text-white tracking-tight leading-none">
              TRAK<span className="text-[#ffb100]">Z</span>
            </span>
            <span className="text-[9px] font-extrabold tracking-widest text-[#ffb100] uppercase leading-none mt-0.5">
              DELIVERIES
            </span>
          </div>
        </Link>
      </div>

      {/* Main Form Box */}
      <div className="relative z-10 max-w-md w-full mx-auto my-auto py-6">
        <div className="bg-white dark:bg-[#0d1628] text-slate-800 dark:text-slate-100 rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 dark:border-slate-800/80 transition-all duration-300">

          {/* Smooth Sliding Pill Tab Switcher */}
          <div className="relative flex bg-slate-100 dark:bg-[#051020] p-1.5 rounded-2xl mb-6 border border-slate-200/80 dark:border-slate-800/80 shadow-inner overflow-hidden">
            {/* Sliding Highlight Background Pill */}
            <div
              className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-xl transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1) shadow-md ${
                isLogin
                  ? 'left-1.5 bg-[#0a1c36] dark:bg-[#0f2342]'
                  : 'left-[calc(50%+3px)] bg-[#ffb100]'
              }`}
            />

            {/* Log In Tab Button */}
            <Link
              to="/login"
              className={`relative z-10 flex-1 text-center py-2 text-xs font-black rounded-xl transition-colors duration-200 active:scale-95 ${
                isLogin
                  ? 'text-[#ffb100]'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Log In
            </Link>

            {/* Sign Up Tab Button */}
            <Link
              to="/signup"
              className={`relative z-10 flex-1 text-center py-2 text-xs font-black rounded-xl transition-colors duration-200 active:scale-95 ${
                !isLogin
                  ? 'text-[#0a1c36]'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Sign Up
            </Link>
          </div>

          {/* Animated Page Content */}
          <div key={location.pathname} className="animate-tab-slide">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center py-4 text-xs font-semibold text-slate-400">
        <p>© {new Date().getFullYear()} Trakz Deliveries • Customer Portal</p>
      </div>
    </div>
  );
};
