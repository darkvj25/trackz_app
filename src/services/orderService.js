import { apiClient } from './apiClient';
import { mockOrders } from '../data/mockOrders';
import { ORDER_STATUS } from '../utils/constants';

const LOCAL_ORDERS_KEY = 'trakz_local_orders';

export const orderService = {
  getStoredOrders() {
    try {
      const stored = localStorage.getItem(LOCAL_ORDERS_KEY);
      let registeredMerchant = null;
      try {
        const customMs = JSON.parse(localStorage.getItem('trakz_registered_merchants') || '[]');
        if (Array.isArray(customMs) && customMs.length > 0) {
          registeredMerchant = customMs[0];
        }
      } catch (e) {}

      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map(o => {
          const st = (o.orderStatus || '').toLowerCase();
          let orderObj = { ...o };
          if (st === 'pending' || st === 'preparing') {
            orderObj.rider = null;
          }

          // Enrich stored order with latest merchant store profile details if available
          if (registeredMerchant && (registeredMerchant.name || registeredMerchant.latitude !== undefined)) {
            if (registeredMerchant.name) orderObj.merchantName = registeredMerchant.name;
            if (registeredMerchant.latitude !== undefined) orderObj.merchantLat = registeredMerchant.latitude;
            if (registeredMerchant.longitude !== undefined) orderObj.merchantLng = registeredMerchant.longitude;
            if (registeredMerchant.logo) orderObj.merchantLogo = registeredMerchant.logo;
          }

          return orderObj;
        });
      }
      return [];
    } catch (e) {
      return [];
    }
  },

  async placeOrder(orderPayload) {
    if (apiClient.useMock) {
      await apiClient.mockDelay(700);
      const newOrder = {
        id: `TRK-${Math.floor(10000 + Math.random() * 90000)}`,
        customerId: orderPayload.customerId || 'cust-101',
        customerName: orderPayload.customerName || 'Default User',
        merchantId: orderPayload.merchant.id,
        merchantName: orderPayload.merchant.name,
        merchantLogo: orderPayload.merchant.logo,
        merchantPhone: '+63 918 888 7777',
        merchantLat: orderPayload.merchant.latitude !== undefined ? orderPayload.merchant.latitude : null,
        merchantLng: orderPayload.merchant.longitude !== undefined ? orderPayload.merchant.longitude : null,
        orderStatus: ORDER_STATUS.PENDING,
        paymentMethod: orderPayload.paymentMethod,
        paymentStatus: orderPayload.paymentMethod === 'Cash on Delivery' ? 'Unpaid' : 'Paid',
        items: orderPayload.items,
        subtotal: orderPayload.subtotal,
        deliveryFee: orderPayload.deliveryFee,
        discount: orderPayload.discount,
        taxAndFees: orderPayload.taxAndFees || 15,
        total: orderPayload.total,
        deliveryAddress: orderPayload.deliveryAddress,
        deliveryInstructions: orderPayload.deliveryInstructions,
        rider: null,
        createdAt: new Date().toISOString(),
        estimatedDeliveryTime: '20-30 mins'
      };

      const orders = this.getStoredOrders();
      const updated = [newOrder, ...orders];
      localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updated));

      return { success: true, order: newOrder };
    }

    return apiClient.post('/orders', orderPayload);
  },

  async getOrders() {
    if (apiClient.useMock) {
      await apiClient.mockDelay(300);
      return this.getStoredOrders();
    }

    try {
      const response = await apiClient.get('/orders');
      return Array.isArray(response) ? response : (response.data || []);
    } catch (e) {
      console.warn('Backend orders fetch failed, falling back to local storage:', e);
      return this.getStoredOrders();
    }
  },

  async getOrderById(orderId) {
    if (apiClient.useMock) {
      await apiClient.mockDelay(250);
      const orders = this.getStoredOrders();
      const match = orders.find(o => o.id === orderId);
      if (!match) {
        throw new Error(`Order #${orderId} not found.`);
      }
      return match;
    }

    return apiClient.get(`/orders/${orderId}`);
  },

  async updateOrderStatus(orderId, nextStatus) {
    if (apiClient.useMock) {
      return this.updateOrderStatusInMock(orderId, nextStatus);
    }
    return apiClient.patch(`/orders/${orderId}/status`, { orderStatus: nextStatus });
  },

  async updateOrderStatusInMock(orderId, nextStatus) {
    const orders = this.getStoredOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      orders[index].orderStatus = nextStatus;
      localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
      return orders[index];
    }
    return null;
  }
};
