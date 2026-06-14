import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - attach token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle token expiry and errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Token expired - attempt refresh
    if (error.response?.status === 401 && 
        (error.response?.data as any)?.code === 'TOKEN_EXPIRED' &&
        !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          handleLogout();
          return Promise.reject(error);
        }

        const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const { token, refreshToken: newRefreshToken } = response.data;

        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        handleLogout();
        return Promise.reject(refreshError);
      }
    }

    // Account locked
    if (error.response?.status === 423) {
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  window.location.href = '/login';
};

// Products API
export const productsAPI = {
  getAll: (params?: any) => api.get('/products', { params }),
  getById: (id: string) => api.get(`/products/${id}`),
  getFeatured: () => api.get('/products/featured/list'),
  getByCategory: (category: string) => api.get(`/products/category/${category}`),
};

// Items API
export const itemsAPI = {
  getAll: (params?: any) => api.get('/items', { params }),
  getById: (id: string) => api.get(`/items/${id}`),
  create: (data: any) => api.post('/items', data),
  update: (id: string, data: any) => api.put(`/items/${id}`, data),
  duplicate: (id: string) => api.post(`/items/${id}/duplicate`),
  archive: (id: string) => api.put(`/items/${id}/archive`),
  toggleSoldOut: (id: string) => api.put(`/items/${id}/soldout`),
  delete: (id: string) => api.delete(`/items/${id}`),
  bulkUpdatePrices: (data: any) => api.put('/items/bulk/prices', data),
  bulkUpdateCategories: (data: any) => api.put('/items/bulk/categories', data),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getById: (id: string) => api.get(`/categories/${id}`),
  create: (data: any) => api.post('/categories', data),
  update: (id: string, data: any) => api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// Modifiers API
export const modifiersAPI = {
  getAll: () => api.get('/modifiers'),
  getById: (id: string) => api.get(`/modifiers/${id}`),
  create: (data: any) => api.post('/modifiers', data),
  update: (id: string, data: any) => api.put(`/modifiers/${id}`, data),
  delete: (id: string) => api.delete(`/modifiers/${id}`),
};

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) => 
    api.post('/auth/login', credentials),
  register: (userData: { name: string; email: string; password: string; phone?: string }) => 
    api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/change-password', data),
  logout: () => api.post('/auth/logout'),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
};

// Orders API
export const ordersAPI = {
  create: (orderData: any) => api.post('/orders', orderData),
  getMyOrders: () => api.get('/orders/my-orders'),
  getById: (id: string) => api.get(`/orders/${id}`),
  cancel: (id: string) => api.post(`/orders/${id}/cancel`),
};

// Payments API
export const paymentsAPI = {
  processCard: (data: any) => api.post('/payments/process', data),
  processCash: (data: any) => api.post('/payments/cash', data),
  confirmCash: (paymentId: string) => api.post(`/payments/cash/${paymentId}/confirm`),
  refund: (data: any) => api.post('/payments/refund', data),
  getById: (id: string) => api.get(`/payments/${id}`),
  getByOrder: (orderId: string) => api.get(`/payments/order/${orderId}`),
  reconcile: (date: string) => api.get(`/payments/reconcile/daily?date=${date}`),
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getOrders: (params?: any) => api.get('/admin/orders', { params }),
  updateOrder: (id: string, data: any) => api.patch(`/admin/orders/${id}`, data),
  createProduct: (data: any) => api.post('/admin/products', data),
  updateProduct: (id: string, data: any) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/admin/products/${id}`),
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  getPaymentSummary: (params?: any) => api.get('/admin/payments/summary', { params }),
};

// Discounts API
export const discountsAPI = {
  validate: (code: string, orderAmount: number) => api.post('/discounts/validate', { code, orderAmount }),
  redeem: (code: string) => api.post('/discounts/redeem', { code }),
  getAll: () => api.get('/discounts'),
  create: (data: any) => api.post('/discounts', data),
  update: (id: string, data: any) => api.put(`/discounts/${id}`, data),
  delete: (id: string) => api.delete(`/discounts/${id}`),
};

// Loyalty API
export const loyaltyAPI = {
  getStatus: () => api.get('/loyalty/status'),
  earn: (data: any) => api.post('/loyalty/earn', data),
  redeem: (points: number) => api.post('/loyalty/redeem', { points }),
};

// Analytics API
export const analyticsAPI = {
  getRevenue: (period?: string) => api.get('/analytics/revenue', { params: { period } }),
  getTopProducts: (limit?: number) => api.get('/analytics/top-products', { params: { limit } }),
  getPeakHours: () => api.get('/analytics/peak-hours'),
  getCustomers: () => api.get('/analytics/customers'),
  getCategories: () => api.get('/analytics/categories'),
};

// Images API
export const imagesAPI = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/images/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  uploadBulk: (files: FileList) => {
    const formData = new FormData();
    Array.from(files).forEach(f => formData.append('images', f));
    return api.post('/images/upload/bulk', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  getAll: () => api.get('/images'),
  delete: (filename: string) => api.delete(`/images/${filename}`),
};

export default api;
