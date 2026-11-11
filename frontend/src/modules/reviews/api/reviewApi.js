import apiClient from '@/api/client';

export const reviewApi = {
  /**
   * Fetch paginated reviews for a place (by ID or slug)
   */
  getPlaceReviews: async (placeIdOrSlug, page = 1, perPage = 10) => {
    const response = await apiClient.get(`/places/${placeIdOrSlug}/reviews`, {
      params: { page, per_page: perPage },
    });
    return response.data;
  },

  /**
   * Fetch aggregated rating summary for a place
   */
  getPlaceRating: async (placeIdOrSlug) => {
    const response = await apiClient.get(`/places/${placeIdOrSlug}/rating`);
    return response.data?.data || response.data;
  },

  /**
   * Submit or update a 1-5 star rating for a place
   */
  submitRating: async (placeIdOrSlug, rating) => {
    const response = await apiClient.post(`/places/${placeIdOrSlug}/rating`, {
      rating: Number(rating),
    });
    return response.data?.data || response.data;
  },

  /**
   * Create a written review for a place
   * Accepts either:
   *   submitReview(placeIdOrSlug, { rating, comment })
   * or
   *   submitReview(placeIdOrSlug, rating, comment)
   */
  submitReview: async (placeIdOrSlug, payloadOrRating, maybeComment) => {
    let payload;
    if (typeof payloadOrRating === 'object' && payloadOrRating !== null) {
      payload = {
        rating: Number(payloadOrRating.rating),
        comment: payloadOrRating.comment,
      };
    } else {
      payload = {
        rating: Number(payloadOrRating),
        comment: maybeComment,
      };
    }

    const response = await apiClient.post(`/places/${placeIdOrSlug}/reviews`, payload);
    return response.data?.data || response.data;
  },

  /**
   * Fetch reviews written by the currently authenticated user
   */
  getUserReviews: async (page = 1, perPage = 10) => {
    const response = await apiClient.get('/user/reviews', {
      params: { page, per_page: perPage },
    });
    return response.data;
  },

  /**
   * Delete an existing review by its ID
   */
  deleteReview: async (reviewId) => {
    const response = await apiClient.delete(`/reviews/${reviewId}`);
    return response.data;
  },

  /**
   * Update an existing review by its ID
   */
  updateReview: async (reviewId, comment) => {
    const response = await apiClient.put(`/reviews/${reviewId}`, { comment });
    return response.data?.data || response.data;
  },
};

export default reviewApi;

