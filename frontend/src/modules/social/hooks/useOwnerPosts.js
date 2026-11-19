import { useState, useCallback, useEffect } from 'react';
import socialApi from '../api/socialApi';

/**
 * Hook for merchant place owners to publish and manage deals
 */
export function useOwnerPosts(placeId) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchPosts = useCallback(async () => {
    if (!placeId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await socialApi.fetchPlaceDeals(placeId);
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load owner posts', err);
      setError(err.response?.data?.message || 'Could not load place deals.');
    } finally {
      setLoading(false);
    }
  }, [placeId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const createPost = useCallback(
    async (postData) => {
      if (!placeId) return null;
      setSubmitting(true);
      setError(null);
      try {
        const res = await socialApi.createPost(placeId, postData);
        const newPost = res.data?.data || res.data;
        if (newPost) {
          setPosts((prev) => [newPost, ...prev]);
        }
        return newPost;
      } catch (err) {
        console.error('Failed to create post', err);
        const msg = err.response?.data?.message || 'Could not publish deal. Please check required fields.';
        setError(msg);
        throw new Error(msg);
      } finally {
        setSubmitting(false);
      }
    },
    [placeId]
  );

  const deletePost = useCallback(
    async (postId) => {
      setSubmitting(true);
      setError(null);
      try {
        await socialApi.deletePost(postId);
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        return true;
      } catch (err) {
        console.error('Failed to delete post', err);
        const msg = err.response?.data?.message || 'Could not delete deal.';
        setError(msg);
        throw new Error(msg);
      } finally {
        setSubmitting(false);
      }
    },
    []
  );

  return {
    posts,
    setPosts,
    loading,
    submitting,
    error,
    fetchPosts,
    createPost,
    deletePost,
  };
}

export default useOwnerPosts;
