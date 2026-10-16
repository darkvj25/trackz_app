const getBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
  }

  const defaultUrl = 'http://localhost/trackz_app/api';
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const currentHost = window.location.hostname;
    if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
      return defaultUrl.replace(/localhost|127\.0\.0\.1/g, currentHost);
    }
  }
  return defaultUrl;
};

export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

class ApiClient {
  constructor() {
    this.useMock = USE_MOCK_DATA;
    this.authToken = localStorage.getItem('trakz_auth_token') || null;
  }

  get baseUrl() {
    return getBaseUrl();
  }

  setAuthToken(token) {
    this.authToken = token;
    if (token) {
      localStorage.setItem('trakz_auth_token', token);
    } else {
      localStorage.removeItem('trakz_auth_token');
    }
  }

  getHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...customHeaders
    };
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    return headers;
  }

  // Simulated latency for smooth loading states in mock mode
  async mockDelay(ms = 350) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    const headers = this.getHeaders(options.headers);

    const config = {
      method: options.method || 'GET',
      headers,
      ...options
    };

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const text = await response.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (jsonErr) {
        const cleanMessage = text.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
        throw new Error(cleanMessage || 'Server returned invalid JSON response');
      }

      if (!response.ok) {
        throw {
          status: response.status,
          message: data.message || `Request failed with status ${response.status}`,
          data
        };
      }

      return data;
    } catch (error) {
      console.warn(`[Trakz API Client] Network request to ${url} failed or offline.`, error.message);
      throw error;
    }
  }

  async get(endpoint, params = {}) {
    const cleanParams = {};
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        cleanParams[key] = params[key];
      }
    });
    const queryString = new URLSearchParams(cleanParams).toString();
    const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(fullEndpoint, { method: 'GET' });
  }

  async post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body });
  }

  async put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body });
  }

  async patch(endpoint, body) {
    return this.request(endpoint, { method: 'PATCH', body });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
