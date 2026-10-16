import { apiClient } from './apiClient';
import { mockOrders } from '../data/mockOrders';

const RIDER_DUTY_KEY = 'trakz_rider_on_duty';

export const riderService = {
  // Get rider duty state
  isRiderOnDuty() {
    const saved = localStorage.getItem(RIDER_DUTY_KEY);
    return saved !== null ? JSON.parse(saved) : true;
  },

  // Toggle rider duty status
  setRiderOnDuty(isOnDuty) {
    localStorage.setItem(RIDER_DUTY_KEY, JSON.stringify(isOnDuty));
    return isOnDuty;
  },

  // Get available unassigned delivery orders nearby
  async getAvailableOrders() {
    if (apiClient.useMock) {
      await apiClient.mockDelay(300);
      return mockOrders.filter(o => o.orderStatus === 'Pending' || o.orderStatus === 'Preparing' || o.orderStatus === 'Ready for Rider');
    }
    return apiClient.get('/rider/available');
  },

  // Get rider assigned trips and history
  async getRiderOrders() {
    if (apiClient.useMock) {
      await apiClient.mockDelay(300);
      return mockOrders;
    }
    return apiClient.get('/rider/orders');
  },

  // Accept / Claim a delivery request
  async acceptOrder(orderId, riderInfo) {
    if (apiClient.useMock) {
      await apiClient.mockDelay(400);
      const target = mockOrders.find(o => o.id === orderId);
      if (target) {
        target.orderStatus = 'Rider Assigned';
        target.rider = riderInfo || {
          name: 'Marco Santos',
          phone: '+63 919 444 8888',
          rating: 4.9,
          vehicle: 'Black Honda Click 150i',
          plateNumber: 'NKR 9102'
        };
      }
      return { success: true, orderId, orderStatus: 'Rider Assigned', rider: target?.rider };
    }
    return apiClient.post(`/rider/orders/${orderId}/accept`, { rider: riderInfo });
  },

  // Update trip status (e.g., "Picked Up", "On the Way", "Delivered")
  async updateOrderStatus(orderId, nextStatus) {
    if (apiClient.useMock) {
      await apiClient.mockDelay(300);
      const target = mockOrders.find(o => o.id === orderId);
      if (target) {
        target.orderStatus = nextStatus;
        if (nextStatus === 'Delivered') {
          target.paymentStatus = 'Paid';
        }
      }
      return { success: true, orderId, orderStatus: nextStatus };
    }
    return apiClient.patch(`/rider/orders/${orderId}/status`, { orderStatus: nextStatus });
  },

  // Get rider telemetry & earnings stats
  async getRiderStats() {
    if (apiClient.useMock) {
      await apiClient.mockDelay(200);
      const completed = mockOrders.filter(o => o.orderStatus === 'Delivered');
      const totalFees = completed.reduce((sum, o) => sum + (o.deliveryFee || 49), 0);
      const tips = completed.length * 25;

      return {
        todayEarnings: totalFees + tips,
        deliveryFees: totalFees,
        tips: tips,
        completedDeliveries: completed.length || 12,
        activeTripCount: mockOrders.filter(o => ['Rider Assigned', 'On the Way', 'Preparing'].includes(o.orderStatus)).length,
        rating: 4.9,
        acceptanceRate: 98
      };
    }
    return apiClient.get('/rider/stats');
  }
};
