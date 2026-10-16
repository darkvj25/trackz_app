import React from 'react';
import { NavLink } from 'react-router-dom';
import { Store, Compass, ShoppingBag, Receipt, MapPin } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useOrders } from '../../hooks/useOrders';

export const BottomNav = () => {
  const { itemCount } = useCart();
  const { activeOrders } = useOrders();

  const activeTrackingPath = activeOrders && activeOrders.length > 0
    ? `/tracking/${activeOrders[0].id}`
    : '/tracking/TRK-89234';

  const navItems = [
    { label: 'Home', path: '/home', icon: Store },
    { label: 'Explore', path: '/merchants', icon: Compass },
    { label: 'Tray', path: '/cart', icon: ShoppingBag, badge: itemCount },
    { label: 'POS Log', path: '/orders', icon: Receipt },
    { label: 'Live Map', path: activeTrackingPath, icon: MapPin }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0b0f19]/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800/80 shadow-mobile sm:hidden transition-colors duration-200">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `relative flex flex-col items-center gap-1 py-1 px-2.5 rounded-2xl transition-all cursor-pointer ${
                  isActive
                    ? 'text-purple-600 dark:text-purple-400 font-extrabold scale-105'
                    : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800 dark:hover:text-slate-200'
                }`
              }
            >
              <div className="relative">
                <Icon size={21} />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-[16px] px-1 rounded-full bg-purple-600 text-white text-[9px] font-extrabold flex items-center justify-center border-2 border-white dark:border-[#0b0f19]">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
