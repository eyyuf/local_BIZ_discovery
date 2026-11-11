import apiClient from '@/api/client';

export const placesApi = {
  getPlace: async (slugOrId) => {
    const response = await apiClient.get(`/places/${slugOrId}`);
    return response.data?.data || response.data;
  },

  getPlaceMenu: async (placeId) => {
    const response = await apiClient.get(`/places/${placeId}/menu`);
    return response.data;
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
    const response = await apiClient.get(`/places/${slugOrId}/images`);
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
};

export default placesApi;

