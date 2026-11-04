import { useState } from 'react';

/**
 * Hook for merchant place owners to publish and manage deals
 */
export function useOwnerPosts(placeId) {
  // TODO: Implement createPost, deletePost, submitting state, and error handling
  return {
    createPost: async (data) => {},
    deletePost: async (postId) => {},
    submitting: false,
    error: null,
  };
}

export default useOwnerPosts;

