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
    const response = await apiClient.post('/auth/profile', payload);
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
};

export default identityApi;

