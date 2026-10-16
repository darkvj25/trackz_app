import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CheckCircle2, Printer } from 'lucide-react';

export const ReceiptModal = ({ isOpen, onClose, order }) => {
  if (!order) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Receipt #${order.id}`} maxWidth="max-w-md">
      <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
        {/* Header Status */}
        <div className="flex flex-col items-center text-center p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800 gap-1">
          <CheckCircle2 className="text-emerald-500" size={32} />
          <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg">Order Summary</h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{formatDate(order.createdAt)}</p>
          <span className="mt-1 px-3 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold text-[10px]">
            {order.paymentStatus} via {order.paymentMethod}
          </span>
        </div>

        {/* Merchant Info */}
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Merchant</span>
          <p className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">{order.merchantName}</p>
        </div>

        {/* Itemized list */}
        <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Items Ordered</span>
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-start">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-800 dark:text-slate-200">{item.quantity}x {item.name}</span>
                {item.variantName && <p className="text-[10px] text-slate-500 dark:text-slate-400">Variant: {item.variantName}</p>}
                {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Add-ons: {item.selectedAddOns.map(a => a.name).join(', ')}
                  </p>
                )}
              </div>
              <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(item.itemTotal * item.quantity)}</span>
            </div>
          ))}
        </div>

        {/* Financial Breakdown */}
        <div className="space-y-1.5 border-b border-slate-100 dark:border-slate-800 pb-3 font-medium">
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Delivery Fee</span>
            <span>{formatCurrency(order.deliveryFee)}</span>
          </div>
          {order.taxAndFees > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Platform & Service Fee</span>
              <span>{formatCurrency(order.taxAndFees)}</span>
            </div>
          )}
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
              <span>Voucher Discount</span>
              <span>-{formatCurrency(order.discount)}</span>
            </div>
          )}
        </div>

        {/* Total */}
        <div className="flex justify-between items-center text-base font-extrabold text-slate-900 dark:text-slate-100 pt-1">
          <span>Total Paid</span>
          <span className="text-purple-600 dark:text-purple-400">{formatCurrency(order.total)}</span>
        </div>

        {/* Address */}
        <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Delivered To</span>
          <p className="font-bold text-slate-800 dark:text-slate-200">{order.deliveryAddress?.label} - {order.deliveryAddress?.street}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">{order.deliveryAddress?.barangay}, {order.deliveryAddress?.city}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="secondary" fullWidth icon={Printer} onClick={() => window.print()}>
            Print
          </Button>
          <Button variant="primary" fullWidth onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
