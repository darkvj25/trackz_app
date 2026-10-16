import { apiClient } from './apiClient';
import { mockAddresses } from '../data/mockAddresses';
import { SAVED_ADDRESSES_KEY } from '../utils/constants';

export const addressService = {
  getStoredAddresses() {
    try {
      const stored = localStorage.getItem(SAVED_ADDRESSES_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(SAVED_ADDRESSES_KEY, JSON.stringify(mockAddresses));
      return mockAddresses;
    } catch (e) {
      return mockAddresses;
    }
  },

  async getAddresses() {
    if (apiClient.useMock) {
      await apiClient.mockDelay(250);
      return this.getStoredAddresses();
    }
    try {
      const response = await apiClient.get('/addresses');
      return Array.isArray(response) ? response : (response.data || []);
    } catch (e) {
      console.warn('Backend addresses fetch failed, falling back to local storage:', e);
      return this.getStoredAddresses();
    }
  },

  async addAddress(addressData) {
    if (apiClient.useMock) {
      await apiClient.mockDelay(350);
      const addresses = this.getStoredAddresses();
      const newAddr = {
        id: `addr-${Date.now()}`,
        customerId: 'cust-101',
        isDefault: addresses.length === 0,
        ...addressData
      };
      const updated = [newAddr, ...addresses];
      localStorage.setItem(SAVED_ADDRESSES_KEY, JSON.stringify(updated));
      return newAddr;
    }

    return apiClient.post('/addresses', addressData);
  },

  async setDefaultAddress(addressId) {
    if (apiClient.useMock) {
      await apiClient.mockDelay(200);
      const addresses = this.getStoredAddresses().map(a => ({
        ...a,
        isDefault: a.id === addressId
      }));
      localStorage.setItem(SAVED_ADDRESSES_KEY, JSON.stringify(addresses));
      return addresses;
    }

    return apiClient.put(`/addresses/${addressId}/default`);
  },

  async deleteAddress(addressId) {
    if (apiClient.useMock) {
      await apiClient.mockDelay(200);
      const addresses = this.getStoredAddresses().filter(a => a.id !== addressId);
      localStorage.setItem(SAVED_ADDRESSES_KEY, JSON.stringify(addresses));
      return { success: true };
    }

    return apiClient.delete(`/addresses/${addressId}`);
  }
};
