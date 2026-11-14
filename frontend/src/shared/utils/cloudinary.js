/**
 * Transform and optimize Cloudinary image URLs on the fly.
 *
 * @param {string} url - Original image URL
 * @param {Object} options - Transformation options
 * @param {number} [options.width] - Desired width in pixels
 * @param {number} [options.height] - Desired height in pixels
 * @param {string} [options.crop='fill'] - Crop mode ('fill', 'thumb', 'scale', 'fit')
 * @param {string} [options.gravity] - Gravity ('auto', 'face', 'center')
 * @returns {string} Optimized image URL with auto WebP/AVIF format and quality
 */
export function getOptimizedImageUrl(url, options = {}) {
  if (!url || typeof url !== 'string') return url;

  // Only apply transformations to Cloudinary URLs
  if (!url.includes('cloudinary.com') || !url.includes('/upload/')) {
    return url;
  }

  // Avoid duplicating transformations if already applied
  if (/\/upload\/[a-z]_[^/]+\//.test(url)) {
    return url;
  }

  const {
    width,
    height,
    crop = 'fill',
    gravity,
    quality = 'auto',
    format = 'auto',
  } = options;

  const transformations = [];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (width || height) transformations.push(`c_${crop}`);
  if (gravity) transformations.push(`g_${gravity}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);

  if (transformations.length === 0) return url;

  const transformString = transformations.join(',');

  return url.replace('/upload/', `/upload/${transformString}/`);
}

/**
 * Convenience helper for round user avatars with smart face cropping.
 */
export function getAvatarUrl(url, size = 150) {
  return getOptimizedImageUrl(url, {
    width: size,
    height: size,
    crop: 'thumb',
    gravity: 'face',
  });
}
