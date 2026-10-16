import { apiClient } from './apiClient';
import { CART_STORAGE_KEY } from '../utils/constants';

export const cartService = {
  getStoredCart() {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : { merchant: null, items: [], voucher: null };
    } catch (e) {
      return { merchant: null, items: [], voucher: null };
    }
  },

  saveCart(cartData) {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
    } catch (e) {
      console.error('Failed to persist cart locally:', e);
    }
  },

  async validateCartWithBackend(cartData) {
    if (apiClient.useMock) {
      await apiClient.mockDelay(200);
      // In mock mode, calculate subtotals and fees cleanly
      const subtotal = cartData.items.reduce((sum, item) => sum + item.itemTotal * item.quantity, 0);
      const deliveryFee = cartData.merchant ? cartData.merchant.deliveryFee : 49;
      let discount = 0;

      if (cartData.voucher) {
        if (cartData.voucher.discountAmount) {
          discount = cartData.voucher.discountAmount;
        } else if (cartData.voucher.discountPercent) {
          discount = Math.min((subtotal * cartData.voucher.discountPercent) / 100, cartData.voucher.maxDiscount || 100);
        }
      }

      const total = Math.max(0, subtotal + deliveryFee - discount);

      return {
        isValid: true,
        merchantId: cartData.merchant ? cartData.merchant.id : null,
        subtotal,
        deliveryFee,
        discount,
        total
      };
    }

    return apiClient.post('/cart/validate', cartData);
  }
};
