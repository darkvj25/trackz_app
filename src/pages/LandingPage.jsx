import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Store, Bike } from 'lucide-react';
import { Button } from '../components/common/Button';
import { TrakzEmblemLogo } from '../components/common/TrakzEmblemLogo';
import { useAuth } from '../hooks/useAuth';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const handleExplore = () => {
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        navigate('/admin');
      } else if (user?.role === 'merchant') {
        navigate('/merchant/dashboard');
      } else if (user?.role === 'rider') {
        navigate('/rider');
      } else {
        navigate('/home');
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#051020] text-slate-800 dark:text-slate-100 font-sans selection:bg-[#ffb100] selection:text-[#0a1c36] flex flex-col justify-between overflow-x-hidden">

      {/* Header Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0a1c36]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-8 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo Branding */}
          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <TrakzEmblemLogo size="sm" showGalaxyHalo={false} className="group-hover:scale-105 transition-transform" />
            <div className="flex flex-col">
              <span className="font-extrabold text-xl text-[#0a1c36] dark:text-white tracking-tight leading-none">
                TRAK<span className="text-[#ffb100]">Z</span>
              </span>
              <span className="text-[9px] font-extrabold tracking-widest text-[#ffb100] uppercase leading-none mt-0.5">
                DELIVERIES
              </span>
            </div>
          </Link>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/signup?type=merchant"
              className="text-xs font-black text-[#ffb100] hover:underline flex items-center gap-1 hidden sm:flex"
            >
              <Store size={14} />
              <span>Merchant Sign Up</span>
            </Link>

            {isAuthenticated ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (user?.role === 'admin') {
                    navigate('/admin');
                  } else if (user?.role === 'merchant') {
                    navigate('/merchant/dashboard');
                  } else if (user?.role === 'rider') {
                    navigate('/rider');
                  } else {
                    navigate('/home');
                  }
                }}
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Link to="/login" className="text-xs font-extrabold text-[#0a1c36] dark:text-slate-200 hover:text-[#ffb100] px-3 py-2 rounded-xl transition-colors">
                  Log In
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative py-12 sm:py-16 px-4 sm:px-8 max-w-4xl mx-auto w-full text-center space-y-8 my-auto">
        {/* Background Radial Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-[500px] h-80 sm:h-[500px] bg-[#ffb100]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Central Logo Emblem - Matches Logo Style */}
        <div className="relative inline-flex flex-col items-center justify-center group">
          <div className="relative p-1 rounded-full bg-white dark:bg-[#0a1c36] shadow-2xl ring-4 ring-[#ffb100]/50 border-4 border-[#0a1c36] dark:border-[#ffb100] overflow-visible group-hover:scale-105 transition-all duration-300 flex items-center justify-center">
            <TrakzEmblemLogo size="xl" animated={true} />
          </div>

          <span className="mt-4 px-4 py-1.5 rounded-full bg-[#0a1c36] dark:bg-[#0a1c36] text-[#ffb100] border border-[#ffb100]/40 text-xs font-black uppercase tracking-widest flex items-center gap-1.5 shadow-md">
            <Sparkles size={13} className="text-[#ffb100] animate-pulse" />
            DELIVERING MORE. EVERYDAY.
          </span>
        </div>

        {/* Hero Headline & Subtitle */}
        <div className="max-w-2xl mx-auto space-y-3 relative z-10">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0a1c36] dark:text-white leading-tight">
            Fast, Fresh Food & Store Delivery <br />
            <span className="text-[#ffb100]">
              Right To Your Doorstep.
            </span>
          </h1>
          <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-xl mx-auto">
            Order delicious meals, beverages, and daily essentials from your favorite local merchants with live GPS rider map tracking.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto relative z-10 pt-2">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleExplore}
            icon={ArrowRight}
            className="shadow-xl"
          >
            Explore Food & Stores
          </Button>

          <Link to="/signup?type=merchant" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" fullWidth icon={Store}>
              Register Store
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 px-4 sm:px-8 bg-white dark:bg-[#051020] text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <TrakzEmblemLogo size="sm" showGalaxyHalo={false} />
          <span className="font-extrabold text-lg text-[#0a1c36] dark:text-white">
            TRAK<span className="text-[#ffb100]">Z</span> DELIVERIES
          </span>
        </div>

        <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
          © {new Date().getFullYear()} Trakz Deliveries. Fast, fresh food & product delivery.
        </p>

        {/* Merchant & Rider Partner Quick Links */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 pt-2 max-w-xl mx-auto">
          <Link
            to="/signup?type=merchant"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-[#ffb100] border border-[#ffb100]/30 text-xs font-black transition-all active:scale-95 text-center"
          >
            <Store size={15} className="shrink-0 text-[#ffb100]" />
            <span>Own a store? Register as Merchant</span>
          </Link>

          <Link
            to="/signup?type=rider"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-black transition-all active:scale-95 text-center"
          >
            <Bike size={15} className="shrink-0 text-purple-400" />
            <span>Apply as Delivery Rider</span>
          </Link>
        </div>
      </footer>

    </div>
  );
};
