import apiClient from '@/api/client';

export const placesApi = {
  getPlace: async (slugOrId) => {
    const response = await apiClient.get(`/places/${slugOrId}`);
    return response.data?.data || response.data;
  },

  getPlaceRating: async (placeId) => {
    const response = await apiClient.get(`/places/${placeId}/rating`);
    return response.data;
  },

  getPlaceReviews: async (placeId) => {
    const response = await apiClient.get(`/places/${placeId}/reviews`);
    return response.data;
  },

  getPlaceImages: async (slugOrId) => {
    // If slugOrId is numeric, try owner endpoint first or public endpoint
    const endpoint = typeof slugOrId === 'number' || /^\d+$/.test(String(slugOrId))
      ? `/owner/places/${slugOrId}/images`
      : `/places/${slugOrId}/images`;
    const response = await apiClient.get(endpoint).catch(() => apiClient.get(`/places/${slugOrId}/images`));
    return response.data?.data || response.data || [];
  },

  uploadPlaceImage: async (placeId, fileOrUrl, isCover = false, displayOrder = null) => {
    let payload;
    let headers = {};

    if (fileOrUrl instanceof File) {
      payload = new FormData();
      payload.append('image', fileOrUrl);
      if (isCover) payload.append('is_cover', '1');
      if (displayOrder !== null) payload.append('display_order', String(displayOrder));
      headers['Content-Type'] = 'multipart/form-data';
    } else {
      payload = {
        image_url: fileOrUrl,
        is_cover: isCover,
        display_order: displayOrder,
      };
    }

    const response = await apiClient.post(`/owner/places/${placeId}/images`, payload, { headers });
    return response.data?.data || response.data;
  },

  setCoverImage: async (placeId, imageId) => {
    const response = await apiClient.post(`/owner/places/${placeId}/images/${imageId}/cover`);
    return response.data?.data || response.data;
  },

  deletePlaceImage: async (placeId, imageId) => {
    const response = await apiClient.delete(`/owner/places/${placeId}/images/${imageId}`);
    return response.data;
  },

  getOwnerPlaces: async (page = 1) => {
    const response = await apiClient.get('/owner/places', { params: { page } });
    return response.data;
  },

  getOwnerPlace: async (placeId) => {
    const response = await apiClient.get(`/owner/places/${placeId}`);
    return response.data?.data || response.data;
  },

  createOwnerPlace: async (payload) => {
    const response = await apiClient.post('/owner/places', payload);
    return response.data?.data || response.data;
  },

  updateOwnerPlace: async (placeId, payload) => {
    const response = await apiClient.put(`/owner/places/${placeId}`, payload);
    return response.data?.data || response.data;
  },

  deleteOwnerPlace: async (placeId) => {
    const response = await apiClient.delete(`/owner/places/${placeId}`);
    return response.data;
  },

  // Operating Hours Management
  updateOperatingHours: async (placeId, hours) => {
    const response = await apiClient.put(`/owner/places/${placeId}/operating-hours`, { hours });
    return response.data?.data || response.data;
  },

  // Menu Management
  getPlaceMenu: async (placeIdOrSlug) => {
    const response = await apiClient.get(`/owner/places/${placeIdOrSlug}/menu`).catch(() =>
      apiClient.get(`/places/${placeIdOrSlug}/menu`)
    );
    return response.data?.data || response.data || [];
  },

  createMenuSection: async (placeId, payload) => {
    const response = await apiClient.post(`/owner/places/${placeId}/menu/sections`, payload);
    return response.data?.data || response.data;
  },

  updateMenuSection: async (placeId, sectionId, payload) => {
    const response = await apiClient.put(`/owner/places/${placeId}/menu/sections/${sectionId}`, payload);
    return response.data?.data || response.data;
  },

  deleteMenuSection: async (placeId, sectionId) => {
    const response = await apiClient.delete(`/owner/places/${placeId}/menu/sections/${sectionId}`);
    return response.data;
  },

  createMenuItem: async (placeId, payload) => {
    const response = await apiClient.post(`/owner/places/${placeId}/menu/items`, payload);
    return response.data?.data || response.data;
  },

  updateMenuItem: async (itemId, payload) => {
    const response = await apiClient.put(`/owner/places/menu/items/${itemId}`, payload);
    return response.data?.data || response.data;
  },

  deleteMenuItem: async (itemId) => {
    const response = await apiClient.delete(`/owner/places/menu/items/${itemId}`);
    return response.data;
  },

  // Generic Media Upload (for menu item photos, etc.)
  uploadMedia: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await apiClient.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.url || response.data;
  },
};

export default placesApi;
