import { getOptimizedImageUrl } from './cloudinary';

/**
 * Standard neutral placeholder for places without user-uploaded photography.
 * Uses a clean, obsidian-themed UI vector rather than misleading stock photos.
 */
export const PLACE_PLACEHOLDER = '/assets/place-placeholder.svg';

/**
 * Retrieve verified photos for a place from database records / Cloudinary.
 * If no authentic images have been uploaded, returns a neutral placeholder.
 *
 * @param {string|Object} placeOrSlug - Place object or image URL/slug
 * @returns {string[]} Array of real image URLs
 */
export function getPlacePhotos(placeOrSlug) {
  if (!placeOrSlug) return [PLACE_PLACEHOLDER];

  let uploadedImages = [];
  let coverImage = null;

  if (typeof placeOrSlug === 'object') {
    coverImage = placeOrSlug.cover_image || null;
    uploadedImages = placeOrSlug.images || [];
  } else if (typeof placeOrSlug === 'string') {
    // If a direct URL string was passed
    if (
      placeOrSlug.startsWith('http://') ||
      placeOrSlug.startsWith('https://') ||
      placeOrSlug.startsWith('/') ||
      placeOrSlug.startsWith('data:')
    ) {
      return [getOptimizedImageUrl(placeOrSlug, { width: 1200, quality: 'auto', format: 'auto' })];
    }
    // If a slug was passed without an object, there is no mock fallback anymore
    return [PLACE_PLACEHOLDER];
  }

  // 1. If real uploaded images exist in place.images (from Cloudinary or DB)
  if (Array.isArray(uploadedImages) && uploadedImages.length > 0) {
    const sorted = [...uploadedImages].sort((a, b) => {
      if (a.is_cover && !b.is_cover) return -1;
      if (!a.is_cover && b.is_cover) return 1;
      return (a.display_order ?? 0) - (b.display_order ?? 0);
    });

    const urls = sorted
      .map((img) => {
        const rawUrl = typeof img === 'string' ? img : (img.image_url || img.url || img.image_path || '');
        if (!rawUrl) return null;
        if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://') && !rawUrl.startsWith('/') && !rawUrl.startsWith('data:')) {
          return `https://res.cloudinary.com/dyz25jsiq/image/upload/${rawUrl}`;
        }
        return getOptimizedImageUrl(rawUrl, { width: 1200, quality: 'auto', format: 'auto' });
      })
      .filter(Boolean);

    if (urls.length > 0) {
      return urls;
    }
  }

  // 2. If a single cover_image was provided on the place
  if (coverImage && typeof coverImage === 'string') {
    const optimized = getOptimizedImageUrl(coverImage, { width: 1200, quality: 'auto', format: 'auto' });
    if (optimized) {
      return [optimized];
    }
  }

  // 3. Authentic fallback: Return neutral UI placeholder, never fake stock photography
  return [PLACE_PLACEHOLDER];
}

/**
 * Convenience helper to get the primary photo for a place.
 */
export function getPlacePrimaryPhoto(placeOrSlug) {
  const photos = getPlacePhotos(placeOrSlug);
  return photos[0] || PLACE_PLACEHOLDER;
}
