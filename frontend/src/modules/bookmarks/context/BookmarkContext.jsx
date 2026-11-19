import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { discoveryApi } from '@/modules/discovery/api/discoveryApi';
import { useAuth } from '@/modules/identity';

const BookmarkContext = createContext(null);

export function BookmarkProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [bookmarkedPlaceIds, setBookmarkedPlaceIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all bookmarked place IDs for the authenticated user
  const fetchBookmarks = useCallback(async () => {
    if (!isAuthenticated) {
      setBookmarkedPlaceIds(new Set());
      return;
    }

    setIsLoading(true);
    try {
      const res = await discoveryApi.getBookmarks(1);
      const items = res?.data || [];
      const ids = items.map((b) => b.place?.id || b.place_id).filter(Boolean);

      // Handle pagination if user has more than 10 bookmarks
      const lastPage = res?.meta?.last_page || 1;
      if (lastPage > 1) {
        const pagePromises = [];
        for (let p = 2; p <= lastPage; p++) {
          pagePromises.push(discoveryApi.getBookmarks(p));
        }
        const extraPages = await Promise.all(pagePromises);
        extraPages.forEach((pageData) => {
          const moreItems = pageData?.data || [];
          moreItems.forEach((b) => {
            const pid = b.place?.id || b.place_id;
            if (pid) ids.push(pid);
          });
        });
      }

      setBookmarkedPlaceIds(new Set(ids.map(Number)));
    } catch (err) {
      console.error('Failed to load user bookmarks into context:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  // Check if a specific place is bookmarked
  const isBookmarked = useCallback(
    (placeId) => {
      if (!placeId) return false;
      return bookmarkedPlaceIds.has(Number(placeId));
    },
    [bookmarkedPlaceIds]
  );

  // Toggle bookmark with optimistic update
  const toggleBookmark = useCallback(async (placeId) => {
    if (!placeId) return false;
    const numId = Number(placeId);

    // Optimistically toggle ID in the Set
    setBookmarkedPlaceIds((prev) => {
      const next = new Set(prev);
      if (next.has(numId)) {
        next.delete(numId);
      } else {
        next.add(numId);
      }
      return next;
    });

    try {
      const res = await discoveryApi.toggleBookmark(numId);
      if (typeof res?.bookmarked === 'boolean') {
        setBookmarkedPlaceIds((prev) => {
          const next = new Set(prev);
          if (res.bookmarked) {
            next.add(numId);
          } else {
            next.delete(numId);
          }
          return next;
        });
        return res.bookmarked;
      }
      return true;
    } catch (err) {
      // Revert optimistic update on failure
      setBookmarkedPlaceIds((prev) => {
        const next = new Set(prev);
        if (next.has(numId)) {
          next.delete(numId);
        } else {
          next.add(numId);
        }
        return next;
      });
      throw err;
    }
  }, []);

  const value = {
    bookmarkedPlaceIds,
    isBookmarked,
    toggleBookmark,
    refetchBookmarks: fetchBookmarks,
    isLoading,
  };

  return <BookmarkContext.Provider value={value}>{children}</BookmarkContext.Provider>;
}

export function useBookmarks() {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
}

export default BookmarkContext;
