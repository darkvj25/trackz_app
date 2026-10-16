import React, { createContext, useState, useEffect } from 'react';
import { cartService } from '../services/cartService';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartMerchant, setCartMerchant] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [voucher, setVoucher] = useState(null);
  const [cartConflictModal, setCartConflictModal] = useState({ isOpen: false, pendingItem: null, pendingMerchant: null });

  // Load persisted cart on startup
  useEffect(() => {
    const saved = cartService.getStoredCart();
    if (saved) {
      setCartMerchant(saved.merchant);
      setCartItems(saved.items || []);
      setVoucher(saved.voucher || null);
    }
  }, []);

  // Persist whenever cart changes
  useEffect(() => {
    cartService.saveCart({
      merchant: cartMerchant,
      items: cartItems,
      voucher
    });
  }, [cartMerchant, cartItems, voucher]);

  // Add item with single merchant constraint check & store status check
  const addItem = (item, merchant) => {
    // Prevent adding items if store is closed
    if (merchant && merchant.isOpen === false) {
      return false;
    }

    if (cartMerchant && cartMerchant.id !== merchant.id && cartItems.length > 0) {
      // Trigger conflict modal
      setCartConflictModal({
        isOpen: true,
        pendingItem: item,
        pendingMerchant: merchant
      });
      return false;
    }

    if (!cartMerchant) {
      setCartMerchant(merchant);
    }

    // Check if identical item (same product ID + variant ID + same add-ons) already exists
    const itemKey = `${item.id}-${item.selectedVariant ? item.selectedVariant.id : 'def'}-${(item.selectedAddOns || []).map(a => a.id).sort().join('-')}`;

    setCartItems(prev => {
      const existingIndex = prev.findIndex(i => i.itemKey === itemKey);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += item.quantity || 1;
        return updated;
      } else {
        return [...prev, { ...item, itemKey, quantity: item.quantity || 1 }];
      }
    });

    return true;
  };

  const confirmClearAndAdd = () => {
    if (cartConflictModal.pendingItem && cartConflictModal.pendingMerchant) {
      setCartMerchant(cartConflictModal.pendingMerchant);
      setCartItems([{
        ...cartConflictModal.pendingItem,
        itemKey: `${cartConflictModal.pendingItem.id}-${cartConflictModal.pendingItem.selectedVariant ? cartConflictModal.pendingItem.selectedVariant.id : 'def'}-${(cartConflictModal.pendingItem.selectedAddOns || []).map(a => a.id).sort().join('-')}`,
        quantity: cartConflictModal.pendingItem.quantity || 1
      }]);
      setVoucher(null);
    }
    setCartConflictModal({ isOpen: false, pendingItem: null, pendingMerchant: null });
  };

  const cancelCartConflict = () => {
    setCartConflictModal({ isOpen: false, pendingItem: null, pendingMerchant: null });
  };

  const updateQuantity = (itemKey, delta) => {
    setCartItems(prev => {
      const updated = prev.map(item => {
        if (item.itemKey === itemKey) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);

      if (updated.length === 0) {
        setCartMerchant(null);
        setVoucher(null);
      }

      return updated;
    });
  };

  const removeItem = (itemKey) => {
    setCartItems(prev => {
      const updated = prev.filter(item => item.itemKey !== itemKey);
      if (updated.length === 0) {
        setCartMerchant(null);
        setVoucher(null);
      }
      return updated;
    });
  };

  const applyVoucher = (voucherObj) => {
    setVoucher(voucherObj);
  };

  const removeVoucher = () => {
    setVoucher(null);
  };

  const clearCart = () => {
    setCartMerchant(null);
    setCartItems([]);
    setVoucher(null);
  };

  // Subtotal calculation
  const subtotal = cartItems.reduce((sum, item) => sum + (item.itemTotal * item.quantity), 0);
  const deliveryFee = cartMerchant ? cartMerchant.deliveryFee : 0;

  let discount = 0;
  if (voucher) {
    if (voucher.discountAmount) {
      discount = voucher.discountAmount;
    } else if (voucher.discountPercent) {
      discount = Math.min((subtotal * voucher.discountPercent) / 100, voucher.maxDiscount || 100);
    }
  }

  const taxAndFees = subtotal > 0 ? 15 : 0; // standard platform fee ₱15
  const total = Math.max(0, subtotal + deliveryFee + taxAndFees - discount);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartMerchant,
        cartItems,
        voucher,
        subtotal,
        deliveryFee,
        taxAndFees,
        discount,
        total,
        itemCount,
        addItem,
        updateQuantity,
        removeItem,
        applyVoucher,
        removeVoucher,
        clearCart,
        cartConflictModal,
        confirmClearAndAdd,
        cancelCartConflict
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
