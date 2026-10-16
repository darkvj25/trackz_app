import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ORDER_STATUS_DETAILS, ORDER_STATUS } from '../../utils/constants';
import { ChevronRight, RotateCcw, Eye } from 'lucide-react';

const normalizeStatusKey = (statusStr) => {
  if (!statusStr) return 'Delivered';
  const s = String(statusStr).toLowerCase().trim();
  if (s === 'delivered') return ORDER_STATUS.DELIVERED;
  if (s === 'cancelled') return ORDER_STATUS.CANCELLED;
  const match = Object.values(ORDER_STATUS).find(v => v.toLowerCase() === s);
  return match || statusStr;
};

export const OrderItemCard = ({ order, onViewReceipt, onReorder }) => {
  const normStatus = normalizeStatusKey(order.orderStatus);
  const statusInfo = ORDER_STATUS_DETAILS[normStatus];
  const isDelivered = String(order.orderStatus || '').toLowerCase() === 'delivered';

  return (
    <div className="bg-white dark:bg-[#121927] rounded-3xl p-5 border border-slate-100 dark:border-slate-800/80 shadow-card hover:shadow-card-hover transition-all space-y-4">
      {/* Merchant Header & Status Badge */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 gap-3">
        <div className="flex items-center gap-3">
          <img
            src={order.merchantLogo}
            alt={order.merchantName}
            className="w-10 h-10 rounded-xl object-cover border border-slate-100 dark:border-slate-800 shadow-xs"
          />
          <div>
            <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm line-clamp-1">{order.merchantName}</h4>
            <span className="text-[11px] text-slate-400 dark:text-slate-400 font-medium">{formatDate(order.createdAt)}</span>
          </div>
        </div>

        <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold border shrink-0 ${statusInfo?.color || 'bg-emerald-100 text-emerald-800 border-emerald-300'}`}>
          {order.orderStatus}
        </span>
      </div>

      {/* Items Summary */}
      <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
        {order.items.slice(0, 2).map((item, idx) => (
          <div key={idx} className="space-y-0.5">
            <div className="flex justify-between items-center">
              <span className="font-medium text-slate-800 dark:text-slate-200 line-clamp-1">
                {item.quantity}x {item.name}
              </span>
              <span className="font-bold text-slate-900 dark:text-slate-100 shrink-0 ml-2">
                {formatCurrency((item.itemTotal || item.price || 0) * item.quantity)}
              </span>
            </div>
            {item.selectedAddOns && item.selectedAddOns.length > 0 && (
              <p className="text-[10px] text-slate-400 font-medium pl-3">
                + {item.selectedAddOns.map(a => a.name).join(', ')}
              </p>
            )}
          </div>
        ))}
        {order.items.length > 2 && (
          <p className="text-[11px] text-slate-400 font-bold">
            + {order.items.length - 2} more item(s)
          </p>
        )}
      </div>

      {/* Total & Action Buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Amount</span>
          <span className="font-extrabold text-slate-900 dark:text-slate-100 text-base">{formatCurrency(order.total)}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onViewReceipt(order)}
            icon={Eye}
          >
            Receipt
          </Button>

          {isDelivered ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onReorder(order)}
              icon={RotateCcw}
            >
              Reorder
            </Button>
          ) : (
            <Link to={`/tracking/${order.id}`}>
              <Button variant="primary" size="sm" icon={ChevronRight}>
                Track
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
