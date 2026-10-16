import { apiClient } from './apiClient';

export const adminService = {
  async getStats() {
    if (apiClient.useMock) {
      await apiClient.mockDelay(300);
      return {
        totalRevenue: 24850.50,
        totalOrdersCount: 28,
        activeOrdersCount: 4,
        deliveredOrdersCount: 22,
        totalMerchantsCount: 6,
        onlineMerchantsCount: 6,
        totalRidersCount: 0,
        activeRidersCount: 0,
        pendingRidersCount: 0
      };
    }
    return apiClient.get('/admin/stats');
  },

  async getRiders() {
    if (apiClient.useMock) {
      await apiClient.mockDelay(200);
      return [];
    }
    return apiClient.get('/admin/riders');
  },

  async approveRider(riderId) {
    if (apiClient.useMock) {
      await apiClient.mockDelay(350);
      return { success: true, message: 'Rider approved successfully.' };
    }
    return apiClient.post(`/admin/riders/${riderId}/approve`, {});
  },

  async getUsers() {
    if (apiClient.useMock) {
      await apiClient.mockDelay(200);
      return [];
    }
    return apiClient.get('/admin/users');
  },

  async getSettings() {
    if (apiClient.useMock) {
      await apiClient.mockDelay(200);
      return {
        commissionRate: 15,
        surgeMultiplier: 1.0,
        autoDispatch: true,
        rainMode: false
      };
    }
    return apiClient.get('/admin/settings');
  },

  async updateSettings(settings) {
    if (apiClient.useMock) {
      await apiClient.mockDelay(300);
      return { success: true, settings };
    }
    return apiClient.put('/admin/settings', settings);
  }
};
