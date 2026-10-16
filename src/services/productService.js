import { apiClient } from './apiClient';
import { mockProducts } from '../data/mockProducts';

const getDeletedProductIds = () => {
  try {
    return JSON.parse(localStorage.getItem('trakz_deleted_products') || '[]');
  } catch (e) {
    return [];
  }
};

const getLocalCustomProducts = (merchantId) => {
  let customProds = [];
  try {
    const stored = JSON.parse(localStorage.getItem('trakz_custom_products') || '[]');
    if (Array.isArray(stored)) {
      if (!merchantId) return stored;
      const target = String(merchantId).toLowerCase();
      customProds = stored.filter(p =>
        String(p.merchantId).toLowerCase() === target ||
        (p.merchantName && p.merchantName.toLowerCase() === target)
      );
    }
  } catch (e) {}
  return customProds;
};

const getMatchedMockProducts = (merchantId) => {
  if (!merchantId) return mockProducts;
  const target = String(merchantId).toLowerCase();
  return mockProducts.filter(p =>
    String(p.merchantId).toLowerCase() === target ||
    (p.merchantName && p.merchantName.toLowerCase() === target)
  );
};

export const productService = {
  async getProductsByMerchant(merchantId, category) {
    const deletedIds = new Set(getDeletedProductIds());
    const localCustoms = getLocalCustomProducts(merchantId);
    const mockProds = getMatchedMockProducts(merchantId);

    const map = new Map();

    if (!apiClient.useMock) {
      try {
        const params = {};
        if (category && category !== 'All') {
          params.category = category;
        }
        const serverProds = await apiClient.get(`/merchants/${merchantId}/products`, params);
        if (Array.isArray(serverProds)) {
          serverProds.forEach(p => {
            if (!deletedIds.has(p.id)) {
              map.set(p.id, p);
            }
          });
        }
      } catch (err) {
        console.warn('Failed to fetch merchant products from API:', err);
      }
    }

    // Merge mock products if map is empty
    if (map.size === 0) {
      mockProds.forEach(p => {
        if (!deletedIds.has(p.id)) {
          map.set(p.id, p);
        }
      });
    }

    // Always override with local custom/updated products
    localCustoms.forEach(p => {
      if (!deletedIds.has(p.id)) {
        map.set(p.id, { ...(map.get(p.id) || {}), ...p });
      }
    });

    let products = Array.from(map.values()).filter(p => !deletedIds.has(p.id));

    if (category && category !== 'All') {
      products = products.filter(p => p.category === category);
    }
    return products;
  },

  async createProduct(productData) {
    // Persist to localStorage first for instant client availability
    try {
      const stored = JSON.parse(localStorage.getItem('trakz_custom_products') || '[]');
      const filtered = stored.filter(p => p.id !== productData.id);
      localStorage.setItem('trakz_custom_products', JSON.stringify([productData, ...filtered]));

      // Clear from deleted set if it was deleted previously
      const deleted = getDeletedProductIds().filter(dId => dId !== productData.id);
      localStorage.setItem('trakz_deleted_products', JSON.stringify(deleted));
    } catch (e) {}

    if (apiClient.useMock) {
      await apiClient.mockDelay(300);
      return { success: true, id: productData.id, product: productData };
    }

    try {
      return await apiClient.post('/products', productData);
    } catch (err) {
      console.warn('API createProduct failed, fallback to local storage:', err);
      return { success: true, id: productData.id, product: productData };
    }
  },

  async updateProduct(id, productData) {
    // Always update in localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('trakz_custom_products') || '[]');
      const index = stored.findIndex(p => p.id === id);
      if (index > -1) {
        stored[index] = { ...stored[index], ...productData, id };
      } else {
        stored.push({ id, ...productData });
      }
      localStorage.setItem('trakz_custom_products', JSON.stringify(stored));

      // Remove from deleted list if present
      const deleted = getDeletedProductIds().filter(dId => dId !== id);
      localStorage.setItem('trakz_deleted_products', JSON.stringify(deleted));
    } catch (e) {}

    if (apiClient.useMock) {
      await apiClient.mockDelay(300);
      return { success: true, id, product: productData };
    }

    try {
      return await apiClient.put(`/products/${id}`, productData);
    } catch (err) {
      console.warn('API updateProduct failed, updated locally:', err);
      return { success: true, id, product: productData };
    }
  },

  async deleteProduct(id) {
    // Remove from custom list and add to deleted list
    try {
      const stored = JSON.parse(localStorage.getItem('trakz_custom_products') || '[]');
      const filtered = stored.filter(p => p.id !== id);
      localStorage.setItem('trakz_custom_products', JSON.stringify(filtered));

      const deleted = getDeletedProductIds();
      if (!deleted.includes(id)) {
        deleted.push(id);
        localStorage.setItem('trakz_deleted_products', JSON.stringify(deleted));
      }
    } catch (e) {}

    if (apiClient.useMock) {
      await apiClient.mockDelay(300);
      return { success: true, id };
    }

    try {
      return await apiClient.delete(`/products/${id}`);
    } catch (err) {
      console.warn('API deleteProduct failed, removed locally:', err);
      return { success: true, id };
    }
  },

  async getPopularProducts() {
    if (apiClient.useMock) {
      await apiClient.mockDelay(250);
      return mockProducts.filter(p => p.isPopular);
    }

    try {
      return await apiClient.get('/products/popular');
    } catch (err) {
      return mockProducts.filter(p => p.isPopular);
    }
  },

  async searchProducts(query) {
    if (apiClient.useMock) {
      await apiClient.mockDelay(300);
      const q = query.toLowerCase();
      return mockProducts.filter(p =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.merchantName && p.merchantName.toLowerCase().includes(q))
      );
    }

    try {
      return await apiClient.get('/products/search', { q: query });
    } catch (err) {
      const q = query.toLowerCase();
      return mockProducts.filter(p =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.merchantName && p.merchantName.toLowerCase().includes(q))
      );
    }
  }
};
