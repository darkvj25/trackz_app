import { apiClient } from './apiClient';
import { mockNotifications } from '../data/mockNotifications';

const NOTIFS_STORAGE_KEY = 'trakz_notifications';

export const notificationService = {
  getStoredNotifications() {
    try {
      const stored = localStorage.getItem(NOTIFS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(NOTIFS_STORAGE_KEY, JSON.stringify(mockNotifications));
      return mockNotifications;
    } catch (e) {
      return mockNotifications;
    }
  },

  async getNotifications() {
    if (apiClient.useMock) {
      await apiClient.mockDelay(200);
      return this.getStoredNotifications();
    }
    try {
      const response = await apiClient.get('/notifications');
      return Array.isArray(response) ? response : (response.data || []);
    } catch (e) {
      console.warn('Backend notifications fetch failed, falling back to local storage:', e);
      return this.getStoredNotifications();
    }
  },

  async markAsRead(id) {
    if (apiClient.useMock) {
      await apiClient.mockDelay(150);
      const list = this.getStoredNotifications().map(n => n.id === id ? { ...n, isRead: true } : n);
      localStorage.setItem(NOTIFS_STORAGE_KEY, JSON.stringify(list));
      return list;
    }
    return apiClient.put(`/notifications/${id}/read`);
  },

  async markAllAsRead() {
    if (apiClient.useMock) {
      await apiClient.mockDelay(150);
      const list = this.getStoredNotifications().map(n => ({ ...n, isRead: true }));
      localStorage.setItem(NOTIFS_STORAGE_KEY, JSON.stringify(list));
      return list;
    }
    return apiClient.put('/notifications/read-all');
  }
};
