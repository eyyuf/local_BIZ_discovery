// Social module API communication layer

export const socialApi = {
  /**
   * Fetch paginated active deals & announcements
   * @param {Object} params - Query params (page, per_page, deal_type)
   */
  fetchDeals: async (params = {}) => {
    // TODO: GET /api/v1/social/deals
  },

  /**
   * Fetch active deals published by a specific place
   * @param {number|string} placeId
   */
  fetchPlaceDeals: async (placeId) => {
    // TODO: GET /api/v1/social/places/${placeId}/deals
  },

  /**
   * Publish a new deal or announcement (owner only)
   * @param {number|string} placeId
   * @param {Object} postData
   */
  createPost: async (placeId, postData) => {
    // TODO: POST /api/v1/social/places/${placeId}/posts
  },

  /**
   * Delete a published post (owner only)
   * @param {number|string} postId
   */
  deletePost: async (postId) => {
    // TODO: DELETE /api/v1/social/posts/${postId}
  },

  /**
   * Toggle like on a social post
   * @param {number|string} postId
   */
  toggleLike: async (postId) => {
    // TODO: POST /api/v1/social/posts/${postId}/like
  },
};

export default socialApi;

