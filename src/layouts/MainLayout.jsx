import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { BottomNav } from '../components/common/BottomNav';
import { ClearCartModal } from '../components/common/ClearCartModal';
import { Code } from 'lucide-react';

export const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 dark:bg-trakz-dark dark:text-slate-100 transition-colors duration-200">
      {/* Top Application Header */}
      <Header />

      {/* Main Page Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-24 sm:pb-12">
        <Outlet />
      </main>

      {/* Clear Cart Conflict Modal */}
      <ClearCartModal />

      {/* Desktop Footer */}
      <footer className="bg-white border-t border-slate-100 dark:bg-trakz-cardDark dark:border-trakz-borderDark py-8 hidden sm:block transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-trakz-500 text-white flex items-center justify-center font-extrabold text-lg">
              T
            </div>
            <span className="font-extrabold text-slate-900 dark:text-white text-base">trakz.</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              • Professional Food & Product Delivery Platform
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Link to="/merchants" className="hover:text-trakz-500 dark:hover:text-trakz-400 transition-colors">Discover Merchants</Link>
            <Link to="/orders" className="hover:text-trakz-500 dark:hover:text-trakz-400 transition-colors">My Orders</Link>
            <Link to="/api-docs" className="hover:text-trakz-500 dark:hover:text-trakz-400 transition-colors flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
              <Code size={14} className="text-trakz-500" />
              <span>Backend API Documentation</span>
            </Link>
          </div>

          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            © {new Date().getFullYear()} Trakz App. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Mobile Navigation Tab Bar */}
      <BottomNav />
    </div>
  );
};
