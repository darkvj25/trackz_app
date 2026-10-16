import { apiClient } from './apiClient';
import { PAYMENT_METHODS } from '../utils/constants';

export const paymentService = {
  async getPaymentMethods() {
    if (apiClient.useMock) {
      await apiClient.mockDelay(150);
      return PAYMENT_METHODS;
    }
    return apiClient.get('/payment/methods');
  },

  async verifyPayment(paymentId, method) {
    if (apiClient.useMock) {
      await apiClient.mockDelay(400);
      return { status: 'SUCCESS', transactionId: `TXN-${Date.now()}` };
    }
    return apiClient.post('/payment/verify', { paymentId, method });
  }
};
