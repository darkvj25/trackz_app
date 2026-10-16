import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Bell, ChevronDown, ShoppingCart, User, Sun, Moon, CloudRain, Shield, Bike } from 'lucide-react';
import { useLocation } from '../../hooks/useLocation';
import { useNotifications } from '../../hooks/useNotifications';
import { useCart } from '../../hooks/useCart';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { AddressSelectorModal } from '../home/AddressSelectorModal';
import { TrakzEmblemLogo } from './TrakzEmblemLogo';

export const Header = () => {
  const navigate = useNavigate();
  const { selectedAddress } = useLocation();
  const { unreadCount } = useNotifications();
  const { itemCount } = useCart();
  const { theme, toggleTheme, isDark } = useTheme();
  const { user } = useAuth();
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0b0f19]/90 backdrop-blur-md border-b border-slate-100 dark:border-trakz-borderDark/80 shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-2 sm:gap-3">

          {/* Brand Logo & Mobile Location Bar */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Link to="/home" className="flex items-center gap-2 group">
              <TrakzEmblemLogo size="sm" showGalaxyHalo={false} className="group-hover:scale-105 transition-transform" />
              <div className="hidden xs:flex flex-col">
                <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight leading-none">
                  TRAK<span className="text-[#ffb100]">Z</span>
                </span>
                <span className="text-[9px] font-extrabold tracking-widest text-[#ffb100] uppercase leading-none mt-0.5">
                  DELIVERIES
                </span>
              </div>
            </Link>

            {/* Location Selector Pill */}
            <button
              onClick={() => setIsAddressModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-slate-100/90 hover:bg-slate-200/90 dark:bg-[#1a2336] dark:hover:bg-[#202b42] dark:border dark:border-slate-800/80 transition-all cursor-pointer group max-w-[125px] xs:max-w-[170px] sm:max-w-xs"
            >
              <div className="w-5 h-5 rounded-full bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <MapPin size={12} className="group-hover:bounce-light" />
              </div>
              <div className="flex flex-col text-left truncate leading-tight">
                <div className="flex items-center gap-0.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {selectedAddress?.label || 'BGC, Taguig'}
                  </span>
                  <ChevronDown size={11} className="text-slate-400 shrink-0" />
                </div>
                <span className="text-[9.5px] text-slate-500 dark:text-slate-400 truncate">
                  {selectedAddress?.street || 'Bonifacio High Street'}
                </span>
              </div>
            </button>
          </div>

          {/* Action Tools & Status Widgets */}
          <div className="flex items-center gap-1 sm:gap-1.5">

            {/* Live Weather Telemetry Widget */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-100 dark:bg-[#161e2f] border border-slate-200/50 dark:border-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-200">
              <CloudRain size={15} className="text-indigo-500 dark:text-indigo-400" />
              <span>28.4°C</span>
            </div>

            {/* Theme Switcher Toggle (Light Mode / Dark Mode) */}
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1a2336] transition-colors relative"
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            >
              {isDark ? (
                <Sun size={19} className="text-amber-400 hover:rotate-45 transition-transform duration-300" />
              ) : (
                <Moon size={19} className="text-indigo-600 hover:-rotate-12 transition-transform duration-300" />
              )}
            </button>



            {/* Admin / Merchant / Rider Control Panel HQ Button */}
            {(user?.role === 'admin' || user?.role === 'merchant' || user?.role === 'rider') && (
              <Link
                to={user?.role === 'rider' ? '/rider' : user?.role === 'merchant' ? '/merchant/dashboard' : '/admin'}
                title={user?.role === 'rider' ? 'Rider Delivery App' : user?.role === 'merchant' ? 'Merchant Control Portal' : 'Admin Control HQ'}
                className="px-2.5 py-1.5 bg-[#0a1c36] text-[#ffb100] hover:bg-slate-800 rounded-2xl transition-colors hidden lg:flex items-center gap-1.5 text-xs font-extrabold shadow-xs"
              >
                {user?.role === 'rider' ? <Bike size={15} /> : <Shield size={15} />}
                <span>{user?.role === 'rider' ? 'Rider App' : user?.role === 'merchant' ? 'Merchant Portal' : 'Admin HQ'}</span>
              </Link>
            )}

            {/* Notification Bell */}
            <Link
              to="/notifications"
              className="relative p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-2xl hover:bg-slate-100 dark:hover:bg-[#1a2336] transition-colors"
              title="Notifications"
            >
              <Bell size={19} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center border-2 border-white dark:border-[#0b0f19] shadow-xs">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* Cart Shortcut */}
            <Link
              to="/cart"
              className="relative p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 hover:text-purple-600 rounded-2xl hover:bg-purple-50 dark:hover:bg-[#1a2336] transition-colors"
              title="Cart"
            >
              <ShoppingCart size={19} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-purple-600 text-white text-[9px] font-extrabold flex items-center justify-center border-2 border-white dark:border-[#0b0f19] shadow-xs">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Account Profile Shortcut */}
            <Link
              to="/profile"
              className="flex items-center p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-2xl hover:bg-slate-100 dark:hover:bg-[#1a2336] transition-colors"
              title="Account Profile & Settings"
            >
              <User size={19} />
            </Link>
          </div>
        </div>
      </header>

      {/* Address Picker Modal */}
      <AddressSelectorModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
      />
    </>
  );
};
