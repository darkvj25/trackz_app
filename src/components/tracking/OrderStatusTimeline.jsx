import React from 'react';
import { ORDER_STATUS, ORDER_STATUS_DETAILS } from '../../utils/constants';
import { Check, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';

// Case-insensitive & normalized status lookup helper
const normalizeStatus = (statusStr) => {
  if (!statusStr) return ORDER_STATUS.PENDING;
  const s = String(statusStr).toLowerCase().replace(/_/g, ' ').trim();
  if (s === 'delivered') return ORDER_STATUS.DELIVERED;
  if (s === 'cancelled') return ORDER_STATUS.CANCELLED;
  if (s === 'on the way' || s === 'ontheway') return ORDER_STATUS.ON_THE_WAY;
  if (s === 'picked up' || s === 'pickedup') return ORDER_STATUS.PICKED_UP;
  if (s === 'rider assigned' || s === 'riderassigned') return ORDER_STATUS.RIDER_ASSIGNED;
  if (s === 'ready for pickup' || s === 'readyforpickup') return ORDER_STATUS.READY_FOR_PICKUP;
  if (s === 'preparing' || s === 'kitchen preparing') return ORDER_STATUS.PREPARING;
  if (s === 'confirmed' || s === 'order confirmed') return ORDER_STATUS.CONFIRMED;
  if (s === 'pending' || s === 'order placed') return ORDER_STATUS.PENDING;

  const match = Object.values(ORDER_STATUS).find(val => val.toLowerCase() === s);
  return match || ORDER_STATUS.PENDING;
};

export const OrderStatusTimeline = ({ currentStatus }) => {
  const allStatuses = [
    ORDER_STATUS.PENDING,
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.PREPARING,
    ORDER_STATUS.READY_FOR_PICKUP,
    ORDER_STATUS.RIDER_ASSIGNED,
    ORDER_STATUS.PICKED_UP,
    ORDER_STATUS.ON_THE_WAY,
    ORDER_STATUS.DELIVERED
  ];

  const normalizedCurrentStatus = normalizeStatus(currentStatus);
  const currentStep = ORDER_STATUS_DETAILS[normalizedCurrentStatus]?.step || 1;
  const isDelivered = normalizedCurrentStatus === ORDER_STATUS.DELIVERED;
  const isCancelled = normalizedCurrentStatus === ORDER_STATUS.CANCELLED;

  if (isCancelled) {
    return (
      <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-3xl p-4 flex items-center gap-3">
        <AlertCircle className="text-rose-500 shrink-0" size={24} />
        <div>
          <h4 className="font-bold text-rose-900 dark:text-rose-200 text-sm">Order Cancelled</h4>
          <p className="text-xs text-rose-700 dark:text-rose-300">This order has been cancelled. If you have questions, please contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#121927] rounded-3xl p-5 border border-slate-100 dark:border-slate-800/80 shadow-card space-y-4">
      {/* Top Banner Status Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
          <span>Delivery Progress</span>
          {isDelivered && <Sparkles size={16} className="text-emerald-500" />}
        </h3>
        <span className={`px-3 py-1 rounded-full text-xs font-black border uppercase tracking-wider ${
          isDelivered
            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-xs'
            : ORDER_STATUS_DETAILS[normalizedCurrentStatus]?.color || 'bg-purple-100 text-purple-800 border-purple-300'
        }`}>
          {isDelivered ? 'DELIVERED 🟢' : normalizedCurrentStatus}
        </span>
      </div>

      {/* Delivered Success Highlight Card */}
      {isDelivered && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-md">
            <CheckCircle2 size={22} />
          </div>
          <div className="space-y-0.5">
            <div className="font-black text-sm text-emerald-800 dark:text-emerald-200">
              Order Completed & Delivered!
            </div>
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Enjoy your meal! Thank you for ordering with Trakz.
            </p>
          </div>
        </div>
      )}

      {/* Progress Timeline Steps */}
      <div className="space-y-4 relative pt-2">
        {allStatuses.map((statusName, index) => {
          const stepNum = index + 1;
          const isCompleted = isDelivered ? true : (stepNum < currentStep);
          const isCurrent = !isDelivered && (stepNum === currentStep);

          return (
            <div key={statusName} className="flex items-start gap-3 relative z-10">
              {/* Connector line */}
              {index < allStatuses.length - 1 && (
                <div
                  className={`absolute left-4 top-8 -bottom-4 w-0.5 -ml-px transition-colors duration-300 ${
                    isCompleted ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              )}

              {/* Status Circle Icon */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 transition-all ${
                  isCompleted
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 ring-2 ring-emerald-300 dark:ring-emerald-900'
                    : isCurrent
                    ? 'bg-purple-600 text-white ring-4 ring-purple-200 dark:ring-purple-950 animate-pulse'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
                }`}
              >
                {isCompleted ? <Check size={16} className="stroke-[3]" /> : stepNum}
              </div>

              {/* Status Text Info */}
              <div className="flex-1 pb-1">
                <p className={`text-sm font-extrabold transition-colors ${
                  isDelivered && statusName === ORDER_STATUS.DELIVERED
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : isCurrent
                    ? 'text-purple-600 dark:text-purple-400'
                    : isCompleted
                    ? 'text-slate-800 dark:text-slate-200'
                    : 'text-slate-400 dark:text-slate-500'
                }`}>
                  {statusName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  {ORDER_STATUS_DETAILS[statusName]?.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
