import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const AI_SEARCH_URL = import.meta.env.VITE_AI_SEARCH_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const aiApi = axios.create({
  baseURL: AI_SEARCH_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('shopwise_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401s globally — clear auth state
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('shopwise_token');
      localStorage.removeItem('shopwise_user');
    }
    return Promise.reject(error);
  }
);

// ---------- Auth ----------
export const authApi = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
};

// ---------- Products ----------
export const productApi = {
  getAll: (params) => api.get('/api/products', { params }),
  getFeatured: () => api.get('/api/products/featured'),
  getById: (id) => api.get(`/api/products/${id}`),
  getBySlug: (slug) => api.get(`/api/products/slug/${slug}`),
  keywordSearch: (q, params) => api.get('/api/products/search', { params: { q, ...params } }),
  create: (data) => api.post('/api/products', data),
  update: (id, data) => api.put(`/api/products/${id}`, data),
  delete: (id) => api.delete(`/api/products/${id}`),
};

// ---------- Categories ----------
export const categoryApi = {
  getAll: () => api.get('/api/categories'),
};

// ---------- Cart ----------
export const cartApi = {
  get: () => api.get('/api/cart'),
  addItem: (data) => api.post('/api/cart/items', data),
  updateItem: (productId, quantity) =>
    api.put(`/api/cart/items/${productId}`, null, { params: { quantity } }),
  removeItem: (productId) => api.delete(`/api/cart/items/${productId}`),
  clear: () => api.delete('/api/cart'),
};

// ---------- Orders ----------
export const orderApi = {
  create: (data) => api.post('/api/orders', data),
  getAll: (params) => api.get('/api/orders', { params }),
  getById: (id) => api.get(`/api/orders/${id}`),
};

// ---------- Admin ----------
export const adminApi = {
  getAllOrders: (params) => api.get('/api/admin/orders', { params }),
  updateOrderStatus: (orderId, status) =>
    api.patch(`/api/admin/orders/${orderId}/status`, null, { params: { status } }),
  reindex: () => api.post('/api/admin/reindex'),
};

// ---------- AI Semantic Search (direct to Node service) ----------
export const aiSearchApi = {
  semanticSearch: (query, limit = 12) =>
    aiApi.post('/ai/search', { query, limit }),
};
