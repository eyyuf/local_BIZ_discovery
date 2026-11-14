import React, { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { useAuth } from '@/modules/identity';
import { useBookmarks } from '../context/BookmarkContext';
import { useNavigate } from 'react-router-dom';

export function BookmarkButton({
  placeId,
  initialBookmarked = false,
  className = '',
  size = 'md',
}) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { isBookmarked: checkBookmarked, toggleBookmark } = useBookmarks();
  const [isLoading, setIsLoading] = useState(false);

  // Synchronized bookmark status from context, fallback to initial prop if placeId is not yet available
  const isBookmarked = placeId ? checkBookmarked(placeId) : Boolean(initialBookmarked);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login', { state: { message: 'Sign in to save this spot' } });
      return;
    }

    if (!placeId || isLoading) return;

    setIsLoading(true);
    try {
      await toggleBookmark(placeId);
    } catch (err) {
      console.error('Failed to toggle bookmark', err);
    } finally {
      setIsLoading(false);
    }
  };

  const dimension = size === 'sm' ? 'w-8 h-8 min-w-[36px] min-h-[36px]' : 'w-10 h-10 min-w-[44px] min-h-[44px]';

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this place'}
      aria-pressed={isBookmarked}
      className={`rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md flex items-center justify-center hover:border-white hover:bg-black/80 transition-all active:scale-90 ${dimension} ${className}`}
    >
      <Bookmark
        className={`w-4 h-4 transition-colors ${
          isBookmarked ? 'fill-white text-white' : 'text-white/90'
        }`}
      />
    </button>
  );
}

export default BookmarkButton;
