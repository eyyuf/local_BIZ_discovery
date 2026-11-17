import apiClient from '@/api/client';

// Approved scope: food, drinks, hospitality, and cultural venues only (Section 1.2)
const EXCLUDED_SLUG_OR_NAME_PATTERNS = [
  'condom',
  'fabrica',
  'factory',
  'iron-performance',
  'athletic-center',
  'print-digital',
  'textiles',
  'goldsmiths',
  'kemis-weaving',
  'coworking',
  'leather',
];

function isPlaceInScope(place) {
  if (!place) return false;
  const slug = (place.slug || '').toLowerCase();
  const name = (place.name || '').toLowerCase();

  return !EXCLUDED_SLUG_OR_NAME_PATTERNS.some(
    (pattern) => slug.includes(pattern) || name.includes(pattern)
  );
}

function filterPlaces(places) {
  if (!Array.isArray(places)) return [];
  return places.filter(isPlaceInScope);
}

export const discoveryApi = {
  getExploreFeed: async (params = {}) => {
    const response = await apiClient.get('/discovery/explore', { params });
    const sections = response.data?.data || response.data || [];

    // Filter out-of-scope venues across all sections
    return sections.map((section) => ({
      ...section,
      places: filterPlaces(section.places || []),
    }));
  },

  getCategories: async () => {
    const response = await apiClient.get('/discovery/categories');
    return response.data?.data || response.data || [];
  },

  searchPlaces: async (params = {}) => {
    const response = await apiClient.get('/discovery/search', { params });
    const data = response.data;
    if (data?.data && Array.isArray(data.data)) {
      data.data = filterPlaces(data.data);
    }
    return data;
  },

  getNearbyPlaces: async (lat, lng, radius = 5, limit = 20) => {
    const response = await apiClient.get('/discovery/nearby', {
      params: { lat, lng, radius, limit },
    });
    const places = response.data?.data || response.data || [];
    return filterPlaces(places);
  },

  getBookmarks: async (page = 1) => {
    const response = await apiClient.get('/discovery/bookmarks', {
      params: { page },
    });
    return response.data;
  },

  toggleBookmark: async (placeId) => {
    const response = await apiClient.post(`/discovery/bookmarks/${placeId}`);
    return response.data;
  },
};

export default discoveryApi;
