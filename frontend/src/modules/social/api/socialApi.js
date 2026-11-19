import apiClient from '@/api/client';

export const socialApi = {
  /**
   * Fetch paginated active deals & announcements
   * @param {Object} params - Query params (page, per_page, deal_type)
   */
  fetchDeals: async (params = {}) => {
    const response = await apiClient.get('/social/deals', { params });
    return response.data;
  },

  /**
   * Fetch active deals published by a specific place
   * @param {number|string} placeId
   */
  fetchPlaceDeals: async (placeId) => {
    const response = await apiClient.get(`/social/places/${placeId}/deals`);
    return response.data?.data || response.data || [];
  },

  /**
   * Publish a new deal or announcement (owner only)
   * @param {number|string} placeId
   * @param {Object} postData
   */
  createPost: async (placeId, postData) => {
    const response = await apiClient.post(`/social/places/${placeId}/posts`, postData);
    return response.data;
  },

  /**
   * Delete a published post (owner only)
   * @param {number|string} postId
   */
  deletePost: async (postId) => {
    const response = await apiClient.delete(`/social/posts/${postId}`);
    return response.data;
  },

  /**
   * Toggle like on a social post
   * @param {number|string} postId
   */
  toggleLike: async (postId) => {
    const response = await apiClient.post(`/social/posts/${postId}/like`);
    return response.data;
  },

  /**
   * Claim a deal voucher code
   * @param {number|string} postId
   */
  claimDeal: async (postId) => {
    const response = await apiClient.post(`/social/posts/${postId}/claim`);
    return response.data;
  },

  /**
   * Fetch user's claimed deals/vouchers
   */
  fetchMyClaims: async (params = {}) => {
    const response = await apiClient.get('/social/my-claims', { params });
    return response.data;
  },

  /**
   * Mark voucher claimed as redeemed
   * @param {number|string} claimId
   */
  redeemClaim: async (claimId) => {
    const response = await apiClient.post(`/social/claims/${claimId}/redeem`);
    return response.data;
  },
};

export default socialApi;
