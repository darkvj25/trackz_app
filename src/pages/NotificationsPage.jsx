import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Package, Tag } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { formatDate } from '../utils/formatters';

export const NotificationsPage = () => {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  const [filter, setFilter] = useState('all');

  const filteredNotifs = notifications.filter(n => {
    if (filter === 'orders') return n.type === 'order';
    if (filter === 'promos') return n.type === 'promo';
    return true;
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">Notifications</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Order status updates & promotional alerts</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <CheckCheck size={16} />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {['all', 'orders', 'promos'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold uppercase transition-all cursor-pointer ${
              filter === f
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filteredNotifs.length === 0 ? (
        <div className="bg-white dark:bg-[#121927] rounded-3xl p-8 text-center border border-slate-100 dark:border-slate-800/80 space-y-2">
          <Bell size={32} className="mx-auto text-slate-300 dark:text-slate-600" />
          <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">No notifications found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifs.map((n) => (
            <div
              key={n.id}
              onClick={() => markAsRead(n.id)}
              className={`p-4 rounded-3xl border transition-all cursor-pointer flex items-start gap-3 ${
                !n.isRead
                  ? 'bg-purple-50/40 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/60 shadow-xs'
                  : 'bg-white dark:bg-[#121927] border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700'
              }`}
            >
              <div className={`p-2.5 rounded-2xl shrink-0 ${
                n.type === 'order' ? 'bg-purple-600 text-white' : 'bg-amber-500 text-white'
              }`}>
                {n.type === 'order' ? <Package size={18} /> : <Tag size={18} />}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">{n.title}</h4>
                  <span className="text-[10px] text-slate-400 font-medium">{formatDate(n.timestamp)}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{n.message}</p>
                {n.link && (
                  <Link to={n.link} className="inline-block pt-1">
                    <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline">
                      View Details →
                    </span>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
