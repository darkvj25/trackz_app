import { apiClient } from './apiClient';
import { MOCK_USER_STORAGE_KEY } from '../utils/constants';

export const authService = {
  // Get current user session from storage
  getCurrentUser() {
    const stored = localStorage.getItem(MOCK_USER_STORAGE_KEY);
    if (stored) {
      try {
        const user = JSON.parse(stored);
        if (user) {
          let updated = false;
          if (!user.fullName || user.fullName === 'John Doe') {
            user.fullName = 'Default User';
            updated = true;
          }
          if (!user.email || user.email === 'john@example.com') {
            user.email = 'user@example.com';
            updated = true;
          }
          if (updated) {
            localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(user));
          }
          return user;
        }
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  async login(emailOrPhone, password) {
    if (apiClient.useMock) {
      await apiClient.mockDelay(500);
      if (!emailOrPhone || !password) {
        throw new Error('Please enter valid login credentials.');
      }
      const isEmail = emailOrPhone.includes('@');
      const cleanInput = (emailOrPhone || '').toLowerCase();

      // Check persistent registered users list
      let registeredUsers = [];
      try {
        registeredUsers = JSON.parse(localStorage.getItem('trakz_registered_users') || '[]');
      } catch (e) {}

      const foundUser = registeredUsers.find(
        u => (u.email && u.email.toLowerCase() === cleanInput) ||
             (u.phone && u.phone.toLowerCase() === cleanInput)
      );

      if (foundUser) {
        if (foundUser.role === 'rider' && (foundUser.status === 'pending_approval' || !foundUser.isApproved)) {
          throw new Error('Your rider account is pending admin approval. You will be able to log in once an administrator approves your application.');
        }
        localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(foundUser));
        apiClient.setAuthToken(`mock-jwt-token-${foundUser.id}`);
        return { success: true, user: foundUser, token: `mock-jwt-token-${foundUser.id}` };
      }

      let role = 'customer';
      if (cleanInput.includes('admin')) {
        role = 'admin';
      } else if (cleanInput.includes('merchant')) {
        role = 'merchant';
      } else if (cleanInput.includes('rider') || cleanInput.includes('driver')) {
        role = 'rider';
      }

      // If user typed pending rider login
      if (role === 'rider' && cleanInput.includes('pending')) {
        throw new Error('Your rider account is pending admin approval. You will be able to log in once an administrator approves your application.');
      }

      const derivedName = isEmail
        ? emailOrPhone.split('@')[0].replace(/[._-]/g, ' ')
        : 'User';
      const formattedName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);
      const idPrefix = role === 'admin' ? 'admin' : role === 'merchant' ? 'merch' : role === 'rider' ? 'rider' : 'cust';

      const user = {
        id: `${idPrefix}-${Date.now()}`,
        fullName: role === 'admin' ? 'System Super Admin' : role === 'merchant' ? 'Merchant Partner Owner' : formattedName,
        email: isEmail ? emailOrPhone : `${emailOrPhone}@example.com`,
        phone: !isEmail ? emailOrPhone : '+63 917 000 0000',
        role: role,
        status: role === 'rider' ? 'active' : 'active',
        isApproved: true,
        avatar: role === 'merchant'
          ? 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        createdAt: new Date().toISOString()
      };

      localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(user));
      apiClient.setAuthToken('mock-jwt-token-trakz-12345');
      return { success: true, user, token: 'mock-jwt-token-trakz-12345' };
    }

    const response = await apiClient.post('/auth/login', { login: emailOrPhone, password });

    if (response.user && response.user.role === 'rider' && (response.user.status === 'pending_approval' || !response.user.isApproved)) {
      throw new Error('Your rider account is pending admin approval. You will be able to log in once an administrator approves your application.');
    }

    if (response.token) {
      apiClient.setAuthToken(response.token);
      localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(response.user));
    }
    return response;
  },

  async signUp(fullName, email, phone, password, role = 'customer', extraDetails = null) {
    if (apiClient.useMock) {
      await apiClient.mockDelay(600);
      const isMerchant = role === 'merchant';
      const isRider = role === 'rider';
      const idPrefix = isMerchant ? 'merch' : isRider ? 'rider' : 'cust';

      const newUser = {
        id: `${idPrefix}-${Date.now()}`,
        fullName,
        email,
        phone,
        role: isMerchant ? 'merchant' : isRider ? 'rider' : 'customer',
        status: isRider ? 'pending_approval' : 'active',
        isApproved: !isRider,
        storeName: isMerchant ? (extraDetails?.storeName || `${fullName}'s Store`) : null,
        category: isMerchant ? (extraDetails?.category || 'General') : null,
        storeAddress: isMerchant ? (extraDetails?.storeAddress || '') : null,
        vehicleType: isRider ? (extraDetails?.vehicleType || 'Motorcycle') : null,
        plateNumber: isRider ? (extraDetails?.plateNumber || '') : null,
        operatingCity: isRider ? (extraDetails?.operatingCity || 'Metro Manila') : null,
        avatar: isMerchant
          ? 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80'
          : isRider
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        createdAt: new Date().toISOString()
      };

      // Store in persistent registered users array
      try {
        const storedUsers = JSON.parse(localStorage.getItem('trakz_registered_users') || '[]');
        localStorage.setItem('trakz_registered_users', JSON.stringify([newUser, ...storedUsers]));
      } catch (e) {}

      // If registering a rider, DO NOT log them in automatically!
      if (isRider) {
        return {
          success: true,
          pendingApproval: true,
          message: 'Rider application submitted! Waiting for admin approval.',
          user: newUser
        };
      }

      localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(newUser));

      if (isMerchant) {
        const storeName = extraDetails?.storeName || `${fullName}'s Store`;
        const newMerchant = {
          id: newUser.id,
          name: storeName,
          description: 'Delicious products & fresh local store delivery',
          logo: newUser.avatar,
          coverImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
          category: extraDetails?.category || 'burgers',
          categoryName: (extraDetails?.category || 'BURGERS').toUpperCase(),
          isOpen: true,
          rating: 5.0,
          reviewCount: 1,
          deliveryFee: 49,
          promoBadge: 'NEW STORE 🎁',
          estimatedDeliveryTime: '20-30 min',
          distanceKm: '1.2 km',
          priceRange: '$$',
          minOrderAmount: 100,
          isFeatured: true,
          isPopular: true,
          tags: ['New Store', 'Local Favorite'],
          menuCategories: ['Main Courses', 'Beverages & Drinks']
        };
        try {
          const stored = JSON.parse(localStorage.getItem('trakz_registered_merchants') || '[]');
          localStorage.setItem('trakz_registered_merchants', JSON.stringify([newMerchant, ...stored]));
        } catch (e) {}
      }

      apiClient.setAuthToken(`mock-token-${Date.now()}`);
      return { success: true, user: newUser, token: `mock-token-${Date.now()}` };
    }

    const response = await apiClient.post('/auth/register', {
      fullName,
      email,
      phone,
      password,
      role,
      extraDetails
    });

    if (role === 'rider' || response.pendingApproval) {
      // DO NOT set auth token or user session for pending rider!
      return response;
    }

    if (response.token) {
      apiClient.setAuthToken(response.token);
      localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(response.user));

      if (role === 'merchant') {
        const storeName = extraDetails?.storeName || response.user?.storeName || `${fullName}'s Store`;
        const newMerchant = {
          id: response.user?.id || `merch-${Date.now()}`,
          name: storeName,
          description: 'Delicious products & fresh local store delivery',
          logo: response.user?.avatar || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80',
          coverImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
          category: extraDetails?.category || 'burgers',
          categoryName: (extraDetails?.category || 'BURGERS').toUpperCase(),
          isOpen: true,
          rating: 5.0,
          reviewCount: 1,
          deliveryFee: 49,
          promoBadge: 'NEW STORE 🎁',
          estimatedDeliveryTime: '20-30 min',
          distanceKm: '1.2 km',
          priceRange: '$$',
          minOrderAmount: 100,
          isFeatured: true,
          isPopular: true,
          tags: ['New Store', 'Local Favorite'],
          menuCategories: ['Main Courses', 'Beverages & Drinks']
        };
        try {
          const stored = JSON.parse(localStorage.getItem('trakz_registered_merchants') || '[]');
          localStorage.setItem('trakz_registered_merchants', JSON.stringify([newMerchant, ...stored]));
        } catch (e) {}
      }
    }
    return response;
  },

  async approveRider(riderId) {
    const current = this.getCurrentUser() || {};
    if (apiClient.useMock) {
      await apiClient.mockDelay(400);

      // Update in registered users list
      try {
        const registeredUsers = JSON.parse(localStorage.getItem('trakz_registered_users') || '[]');
        const updatedUsers = registeredUsers.map(u => (u.id === riderId ? { ...u, status: 'active', isApproved: true } : u));
        localStorage.setItem('trakz_registered_users', JSON.stringify(updatedUsers));
      } catch (e) {}

      const updated = {
        ...current,
        id: riderId || current.id,
        status: 'active',
        isApproved: true
      };
      if (current.id === riderId || !current.id) {
        localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(updated));
      }
      return { success: true, user: updated, message: 'Rider account approved successfully.' };
    }
    const response = await apiClient.post(`/admin/riders/${riderId}/approve`, {});
    if (response.user) {
      if (current.id === response.user.id) {
        localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(response.user));
      }
    }
    return response;
  },

  async requestPasswordReset(emailOrPhone) {
    if (apiClient.useMock) {
      await apiClient.mockDelay(400);
      return { success: true, message: 'Password reset code sent to your phone/email.' };
    }
    return apiClient.post('/auth/forgot-password', { emailOrPhone });
  },

  async updateProfile(updates) {
    const current = this.getCurrentUser() || {};
    const payload = { id: current.id || 'cust-101', ...updates };

    if (apiClient.useMock) {
      await apiClient.mockDelay(400);
      const updated = { ...current, ...updates };
      localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(updated));
      return { success: true, user: updated };
    }
    const response = await apiClient.put('/auth/profile', payload);
    if (response.user) {
      localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(response.user));
    }
    return response;
  },

  logout() {
    localStorage.removeItem(MOCK_USER_STORAGE_KEY);
    apiClient.setAuthToken(null);
  }
};
