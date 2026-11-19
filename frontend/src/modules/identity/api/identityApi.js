import apiClient from '@/api/client';

export const identityApi = {
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  updateProfile: async (payload) => {
    const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData;
    const response = await apiClient.post('/auth/profile', payload, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return response.data;
  },

  getBookmarks: async () => {
    const response = await apiClient.get('/discovery/bookmarks');
    return response.data;
  },

  toggleBookmark: async (placeId) => {
    const response = await apiClient.post(`/discovery/bookmarks/${placeId}`);
    return response.data;
  },

  getGoogleAuthUrl: async () => {
    const response = await apiClient.get('/auth/google/redirect');
    return response.data?.url || '/api/v1/auth/google/redirect';
  },

  forgotPassword: async (email) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async ({ token, email, password, password_confirmation }) => {
    const response = await apiClient.post('/auth/reset-password', {
      token,
      email,
      password,
      password_confirmation,
    });
    return response.data;
  },
};

export default identityApi;

