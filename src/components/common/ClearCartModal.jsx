import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { ShoppingBag, AlertTriangle } from 'lucide-react';
import { useCart } from '../../hooks/useCart';

export const ClearCartModal = () => {
  const { cartConflictModal, confirmClearAndAdd, cancelCartConflict, cartMerchant } = useCart();

  if (!cartConflictModal.isOpen) return null;

  return (
    <Modal
      isOpen={cartConflictModal.isOpen}
      onClose={cancelCartConflict}
      title="Create new order?"
      maxWidth="max-w-md"
    >
      <div className="flex flex-col items-center text-center gap-4 py-2">
        <div className="p-3 bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-full">
          <AlertTriangle size={32} />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            You currently have items in your cart from:
          </p>
          <p className="font-bold text-slate-900 dark:text-slate-100 text-base">{cartMerchant?.name}</p>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Adding items from <span className="font-semibold text-slate-800 dark:text-slate-200">{cartConflictModal.pendingMerchant?.name}</span> will clear your existing cart items. Would you like to clear your cart and start fresh?
        </p>

        <div className="grid grid-cols-2 gap-3 w-full pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="secondary" onClick={cancelCartConflict}>
            Cancel
          </Button>
          <Button variant="primary" onClick={confirmClearAndAdd} icon={ShoppingBag}>
            Clear & Add
          </Button>
        </div>
      </div>
    </Modal>
  );
};
