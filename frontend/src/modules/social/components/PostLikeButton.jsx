import React from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '@/modules/identity';
import { useNavigate } from 'react-router-dom';
import { usePostLike } from '../hooks/usePostLike';

/**
 * Interactive like button for deals & social posts
 */
export function PostLikeButton({
  postId,
  initialLikes = 0,
  initialIsLiked = false,
  className = '',
  onStateChange = null,
}) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { likesCount, isLiked, loading, toggleLike } = usePostLike(
    postId,
    initialLikes,
    initialIsLiked,
    onStateChange
  );

  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    toggleLike();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-label={isLiked ? 'Unlike deal' : 'Like deal'}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition active:scale-90 cursor-pointer ${
        isLiked
          ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
          : 'bg-white/5 border-white/10 text-[#AAA69C] hover:text-white hover:bg-white/10'
      } ${className}`}
    >
      <Heart
        className={`w-3.5 h-3.5 transition-transform duration-200 ${
          isLiked ? 'fill-rose-500 text-rose-500 scale-110' : ''
        }`}
      />
      <span className="font-mono text-[11px]">{likesCount}</span>
    </button>
  );
}

export default PostLikeButton;
