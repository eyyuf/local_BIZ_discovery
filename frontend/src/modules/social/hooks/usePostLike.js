import { useState, useCallback } from 'react';
import socialApi from '../api/socialApi';

/**
 * Hook for optimistic like/unlike handling on a social post
 */
export function usePostLike(postId, initialLikes = 0, initialIsLiked = false, onStateChange = null) {
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [loading, setLoading] = useState(false);

  const toggleLike = useCallback(async () => {
    if (loading || !postId) return;

    // Optimistic calculation
    const prevLiked = isLiked;
    const prevCount = likesCount;
    const nextLiked = !prevLiked;
    const nextCount = nextLiked ? prevCount + 1 : Math.max(0, prevCount - 1);

    setIsLiked(nextLiked);
    setLikesCount(nextCount);
    if (onStateChange) {
      onStateChange({ is_liked_by_user: nextLiked, likes_count: nextCount });
    }

    setLoading(true);
    try {
      const res = await socialApi.toggleLike(postId);
      // Synchronize with server response
      if (typeof res.liked === 'boolean') {
        setIsLiked(res.liked);
      }
      if (typeof res.likes_count === 'number') {
        setLikesCount(res.likes_count);
        if (onStateChange) {
          onStateChange({ is_liked_by_user: res.liked, likes_count: res.likes_count });
        }
      }
    } catch (err) {
      console.error('Failed to toggle like on post', err);
      // Rollback to previous state
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
      if (onStateChange) {
        onStateChange({ is_liked_by_user: prevLiked, likes_count: prevCount });
      }
    } finally {
      setLoading(false);
    }
  }, [postId, isLiked, likesCount, loading, onStateChange]);

  return {
    likesCount,
    isLiked,
    loading,
    toggleLike,
  };
}

export default usePostLike;
