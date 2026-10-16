import { apiClient } from './apiClient';
import { mockMerchants } from '../data/mockMerchants';
import { MOCK_USER_STORAGE_KEY } from '../utils/constants';

// Helper to format clean store name without duplicate "'s Store"
const formatCleanStoreName = (fullName, storeName) => {
  if (storeName && storeName.trim()) {
    const sName = storeName.trim();
    if (/('s\s*store)+$/i.test(sName)) {
      return sName.replace(/('s\s*store)+$/i, "'s Store");
    }
    return sName;
  }
  if (!fullName || !fullName.trim()) return 'My Store';
  const name = fullName.trim();
  if (/\bstore\b/i.test(name)) {
    return name;
  }
  return `${name}'s Store`;
};

// Helper to get local custom merchants (enforcing SINGLE merchant store per account)
const getLocalCustomMerchants = () => {
  let customMerchants = [];
  try {
    const stored = JSON.parse(localStorage.getItem('trakz_registered_merchants') || '[]');
    if (Array.isArray(stored) && stored.length > 0) {
      // Keep only the single most recently saved custom store
      customMerchants = [stored[0]];
    }
  } catch (e) {}

  // Include current logged in user if they are a merchant
  try {
    const userStored = localStorage.getItem(MOCK_USER_STORAGE_KEY);
    if (userStored) {
      const user = JSON.parse(userStored);
      if (user && user.role === 'merchant' && user.id) {
        const storeId = user.merchantId || user.id;
        const storeName = user.storeName || user.fullName || 'My Store';

        const userMerchantObj = {
          id: storeId,
          name: storeName,
          description: user.description || 'Delicious products & fresh local store delivery',
          logo: user.avatar || user.logo || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80',
          coverImage: user.coverImage || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
          category: user.category || 'burgers',
          categoryName: (user.category || 'BURGERS').toUpperCase(),
          isOpen: true,
          rating: 5.0,
          reviewCount: 1,
          deliveryFee: user.deliveryFee !== undefined ? user.deliveryFee : 49,
          estimatedDeliveryTime: user.estimatedDeliveryTime || '20-30 min',
          minOrderAmount: user.minOrderAmount !== undefined ? user.minOrderAmount : 100,
          promoBadge: user.promoBadge || 'NEW STORE 🎁',
          priceRange: '$$',
          isFeatured: true,
          isPopular: true,
          tags: ['New Store', 'Local Favorite'],
          menuCategories: ['Main Courses', 'Beverages & Drinks'],
          address: user.address || 'Bonifacio High Street',
          city: user.city || 'Taguig City',
          latitude: user.latitude !== undefined && user.latitude !== null ? parseFloat(user.latitude) : 14.5515,
          longitude: user.longitude !== undefined && user.longitude !== null ? parseFloat(user.longitude) : 121.0505
        };

        if (customMerchants.length > 0) {
          customMerchants[0] = { ...userMerchantObj, ...customMerchants[0] };
        } else {
          customMerchants = [userMerchantObj];
        }

        try {
          localStorage.setItem('trakz_registered_merchants', JSON.stringify(customMerchants));
        } catch (e) {}
      }
    }
  } catch (e) {}

  return customMerchants;
};

export const merchantService = {
  async getMerchants(filters = {}) {
    const customMerchants = getLocalCustomMerchants();

    let list = [];

    if (apiClient.useMock) {
      await apiClient.mockDelay(300);
      list = [...customMerchants, ...mockMerchants];
    } else {
      try {
        const serverMerchants = await apiClient.get('/merchants', filters);
        const map = new Map();
        if (Array.isArray(serverMerchants)) {
          serverMerchants.forEach(m => map.set(m.id, m));
        }
        customMerchants.forEach(m => {
          if (!map.has(m.id)) {
            map.set(m.id, m);
          } else {
            map.set(m.id, { ...map.get(m.id), ...m });
          }
        });
        list = Array.from(map.values());
      } catch (err) {
        list = [...customMerchants, ...mockMerchants];
      }
    }

    // Apply Client-Side Filtering & Sorting
    if (filters.category && filters.category !== 'all') {
      const catQuery = filters.category.toLowerCase();
      list = list.filter(m =>
        m.category?.toLowerCase() === catQuery ||
        m.categoryName?.toLowerCase() === catQuery
      );
    }
    if (filters.search) {
      const query = filters.search.toLowerCase();
      list = list.filter(m =>
        m.name?.toLowerCase().includes(query) ||
        m.description?.toLowerCase().includes(query) ||
        m.categoryName?.toLowerCase().includes(query)
      );
    }
    if (filters.openOnly) {
      list = list.filter(m => m.isOpen);
    }
    if (filters.minRating) {
      list = list.filter(m => m.rating >= filters.minRating);
    }
    if (filters.sortBy) {
      if (filters.sortBy === 'rating') {
        list.sort((a, b) => b.rating - a.rating);
      } else if (filters.sortBy === 'fastest') {
        list.sort((a, b) => parseInt(a.estimatedDeliveryTime || '20') - parseInt(b.estimatedDeliveryTime || '20'));
      } else if (filters.sortBy === 'deliveryFee') {
        list.sort((a, b) => (a.deliveryFee || 0) - (b.deliveryFee || 0));
      }
    }

    return list;
  },

  async getMerchantById(id) {
    const customMerchants = getLocalCustomMerchants();
    const targetId = String(id).toLowerCase();

    let localFound = customMerchants.find(m =>
      String(m.id).toLowerCase() === targetId ||
      m.name?.toLowerCase() === targetId ||
      targetId.includes(m.name?.toLowerCase()) ||
      m.name?.toLowerCase().includes(targetId)
    );

    if (!localFound && customMerchants.length > 0) {
      localFound = customMerchants[0];
    }

    if (apiClient.useMock) {
      await apiClient.mockDelay(250);
      if (localFound) return localFound;
      const merchant = mockMerchants.find(m => String(m.id).toLowerCase() === targetId || m.name?.toLowerCase() === targetId);
      if (!merchant) {
        throw new Error('Merchant not found.');
      }
      return merchant;
    }

    try {
      const serverMerchant = await apiClient.get(`/merchants/${id}`);
      if (serverMerchant) {
        return {
          ...serverMerchant,
          ...(localFound || {}),
          coverImage: localFound?.coverImage || serverMerchant.coverImage,
          logo: localFound?.logo || serverMerchant.logo,
          name: localFound?.name || serverMerchant.name,
          address: localFound?.address || serverMerchant.address,
          city: localFound?.city || serverMerchant.city,
          latitude: localFound?.latitude !== undefined && localFound.latitude !== null ? parseFloat(localFound.latitude) : (serverMerchant.latitude !== undefined ? parseFloat(serverMerchant.latitude) : 14.5515),
          longitude: localFound?.longitude !== undefined && localFound.longitude !== null ? parseFloat(localFound.longitude) : (serverMerchant.longitude !== undefined ? parseFloat(serverMerchant.longitude) : 121.0505)
        };
      }
      return localFound || serverMerchant;
    } catch (err) {
      if (localFound) return localFound;
      const fallback = mockMerchants.find(m => String(m.id).toLowerCase() === targetId);
      if (fallback) return fallback;
      throw err;
    }
  },

  async createMerchant(merchantData) {
    const id = merchantData.id || `merch-${Date.now()}`;
    const newMerch = { ...merchantData, id, isOpen: true, rating: 5.0 };

    if (apiClient.useMock) {
      await apiClient.mockDelay(200);
      try {
        localStorage.setItem('trakz_registered_merchants', JSON.stringify([newMerch]));
      } catch (e) {}
      return { success: true, id };
    }
    return apiClient.post('/merchants', newMerch);
  },

  async updateMerchant(id, merchantData) {
    const updatedMerch = { ...merchantData, id };

    // 1. Overwrite trakz_registered_merchants to maintain strictly ONE custom merchant store
    try {
      localStorage.setItem('trakz_registered_merchants', JSON.stringify([updatedMerch]));
    } catch (e) {}

    // 2. Also update logged in user in localStorage
    try {
      const userStored = localStorage.getItem(MOCK_USER_STORAGE_KEY);
      if (userStored) {
        const user = JSON.parse(userStored);
        if (user) {
          user.storeName = merchantData.name || user.storeName;
          user.fullName = merchantData.name || user.fullName;
          user.merchantId = id;
          if (merchantData.logo) user.avatar = merchantData.logo;
          if (merchantData.coverImage) user.coverImage = merchantData.coverImage;
          if (merchantData.description) user.description = merchantData.description;
          if (merchantData.deliveryFee !== undefined) user.deliveryFee = merchantData.deliveryFee;
          if (merchantData.estimatedDeliveryTime) user.estimatedDeliveryTime = merchantData.estimatedDeliveryTime;
          if (merchantData.minOrderAmount !== undefined) user.minOrderAmount = merchantData.minOrderAmount;
          if (merchantData.promoBadge !== undefined) user.promoBadge = merchantData.promoBadge;
          if (merchantData.address) user.address = merchantData.address;
          if (merchantData.city) user.city = merchantData.city;
          if (merchantData.latitude !== undefined) user.latitude = merchantData.latitude;
          if (merchantData.longitude !== undefined) user.longitude = merchantData.longitude;
          localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(user));
        }
      }
    } catch (e) {}

    // 3. Update all existing local orders in trakz_local_orders to reflect the single updated store name & map location
    try {
      const ordersStored = localStorage.getItem('trakz_local_orders');
      if (ordersStored) {
        const orders = JSON.parse(ordersStored);
        if (Array.isArray(orders)) {
          const updatedOrders = orders.map(o => ({
            ...o,
            merchantId: id,
            merchantName: merchantData.name || o.merchantName,
            merchantLat: merchantData.latitude !== undefined ? merchantData.latitude : o.merchantLat,
            merchantLng: merchantData.longitude !== undefined ? merchantData.longitude : o.merchantLng,
            merchantLogo: merchantData.logo || o.merchantLogo
          }));
          localStorage.setItem('trakz_local_orders', JSON.stringify(updatedOrders));
        }
      }
    } catch (e) {}

    if (apiClient.useMock) {
      await apiClient.mockDelay(300);
      return { success: true, id, merchant: updatedMerch };
    }

    try {
      return await apiClient.put(`/merchants/${id}`, updatedMerch);
    } catch (err) {
      console.warn('API updateMerchant failed, updated locally:', err);
      return { success: true, id, merchant: updatedMerch };
    }
  },

  async toggleMerchantStatus(merchantId, explicitIsOpen) {
    let result = { success: true };

    if (apiClient.useMock) {
      await apiClient.mockDelay(200);
      const customMerchants = getLocalCustomMerchants();
      const m = customMerchants.find(item => item.id === merchantId) || mockMerchants.find(item => item.id === merchantId);
      if (m) {
        m.isOpen = explicitIsOpen !== undefined ? Boolean(explicitIsOpen) : !m.isOpen;
        result.isOpen = m.isOpen;
      }
      return result;
    }

    try {
      const payload = explicitIsOpen !== undefined ? { isOpen: Boolean(explicitIsOpen) } : {};
      result = await apiClient.post(`/merchants/${merchantId}/toggle`, payload);
    } catch (err) {
      console.warn('Backend toggle status error, falling back in memory:', err);
    }

    const customMerchants = getLocalCustomMerchants();
    const m = customMerchants.find(item => item.id === merchantId) || mockMerchants.find(item => item.id === merchantId);
    if (m) {
      m.isOpen = result.isOpen !== undefined ? Boolean(result.isOpen) : (explicitIsOpen !== undefined ? Boolean(explicitIsOpen) : !m.isOpen);
    }

    return result;
  }
};
