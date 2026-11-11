import { getOptimizedImageUrl } from './cloudinary';

// Authentic Ethiopian food, cafe, restaurant, bakery, and hospitality photography mapping
export const PLACE_IMAGES = {
  'crater-lake-traditional-kitchen': [
    '/assets/bozena-shiro.jpg',
    'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop',
  ],
  'cmc-sunshine-family-bistro': [
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop',
  ],
  'bishoftu-lakeview-fresh-fish-house': [
    'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=1000&auto=format&fit=crop',
  ],
  'kuriftu-resort-lakeside-spa-bishoftu': [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000&auto=format&fit=crop',
  ],
  'sarbet-organic-garden-cafe': [
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1000&auto=format&fit=crop',
  ],
  'taitu-historic-heritage-inn': [
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1000&auto=format&fit=crop',
  ],
  'babogaya-waterside-coffee-terrace': [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1000&auto=format&fit=crop',
  ],
  'abyssinian-crust-artisan-bakery': [
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=1000&auto=format&fit=crop',
  ],
  'tomoca-heritage-roastery-bole': [
    'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1000&auto=format&fit=crop',
  ],
  'kaffa-origin-coffee-bar': [
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=1000&auto=format&fit=crop',
  ],
  'bole-habesha-cultural-kitchen': [
    '/assets/bozena-shiro.jpg',
    'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1000&auto=format&fit=crop',
  ],
  'enrico-heritage-pastry-cakes': [
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1000&auto=format&fit=crop',
  ],
  'highland-oven-french-pastries-cmc': [
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1000&auto=format&fit=crop',
  ],
  'skyline-view-boutique-suites': [
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000&auto=format&fit=crop',
  ],
  'diplomat-executive-hotel': [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop',
  ],
  'kazanchis-jazz-traditional-bistro': [
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop',
  ],
  'red-sea-catch-fish-grill': [
    'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=1000&auto=format&fit=crop',
  ],
  'arada-vintage-coffee-roasters': [
    'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=1000&auto=format&fit=crop',
  ],
};

const DEFAULT_FALLBACKS = [
  '/assets/bozena-shiro.jpg',
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop',
];

/**
 * Retrieve an array of photos for a place, seamlessly prioritizing real uploaded
 * Cloudinary gallery & cover images before falling back to representative photography.
 *
 * @param {string|Object} placeOrSlug - Place object or slug string
 * @returns {string[]} Array of image URLs (with Cloudinary auto-optimization applied)
 */
export function getPlacePhotos(placeOrSlug) {
  if (!placeOrSlug) return DEFAULT_FALLBACKS;

  let slug = '';
  let uploadedImages = [];
  let coverImage = null;

  if (typeof placeOrSlug === 'object') {
    slug = placeOrSlug.slug || '';
    coverImage = placeOrSlug.cover_image || null;
    uploadedImages = placeOrSlug.images || [];
  } else {
    slug = String(placeOrSlug);
  }

  // 1. If real uploaded images exist in place.images (from Cloudinary)
  if (Array.isArray(uploadedImages) && uploadedImages.length > 0) {
    // Sort so is_cover is first, followed by display_order
    const sorted = [...uploadedImages].sort((a, b) => {
      if (a.is_cover && !b.is_cover) return -1;
      if (!a.is_cover && b.is_cover) return 1;
      return (a.display_order ?? 0) - (b.display_order ?? 0);
    });

    return sorted.map((img) => {
      const rawUrl = typeof img === 'string' ? img : (img.image_url || img.url || '');
      return getOptimizedImageUrl(rawUrl, { width: 1200, quality: 'auto', format: 'auto' });
    }).filter(Boolean);
  }

  // 2. If a single cover_image was provided
  if (coverImage) {
    const optimizedCover = getOptimizedImageUrl(coverImage, { width: 1200, quality: 'auto', format: 'auto' });
    const remaining = (slug && PLACE_IMAGES[slug]) ? PLACE_IMAGES[slug].slice(1) : DEFAULT_FALLBACKS.slice(1);
    return [optimizedCover, ...remaining];
  }

  // 3. Fallback to curated high-resolution photography
  if (slug && PLACE_IMAGES[slug]) {
    return PLACE_IMAGES[slug];
  }

  return DEFAULT_FALLBACKS;
}

/**
 * Convenience helper to get the primary/cover photo for a place.
 */
export function getPlacePrimaryPhoto(placeOrSlug) {
  const photos = getPlacePhotos(placeOrSlug);
  return photos[0] || DEFAULT_FALLBACKS[0];
}
