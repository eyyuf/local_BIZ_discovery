/**
 * Client-side canvas image cropping utility.
 * Renders selected pixel coordinates from an image source to an HTML5 canvas
 * and returns a standard File object preserving image format, name, and quality.
 */

export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(new Error('Failed to load image for cropping.')));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

/**
 * Generate a cropped File and Object URL from crop coordinates.
 *
 * @param {string} imageSrc - The source URL (object URL or base64)
 * @param {{ x: number, y: number, width: number, height: number }} pixelCrop - Pixel coordinates from react-easy-crop
 * @param {File} [originalFile] - Original File object for name and MIME type preservation
 * @returns {Promise<{ file: File, blobUrl: string }>}
 */
export async function getCroppedImg(imageSrc, pixelCrop, originalFile = null) {
  if (!imageSrc || !pixelCrop || !pixelCrop.width || !pixelCrop.height) {
    throw new Error('Invalid crop coordinates or image source.');
  }

  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Unable to acquire 2D canvas rendering context.');
  }

  // Set canvas dimensions to the exact crop area
  canvas.width = Math.max(1, Math.round(pixelCrop.width));
  canvas.height = Math.max(1, Math.round(pixelCrop.height));

  // Enable high-quality downsampling / interpolation
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Draw the cropped portion onto the canvas
  ctx.drawImage(
    image,
    Math.round(pixelCrop.x),
    Math.round(pixelCrop.y),
    Math.round(pixelCrop.width),
    Math.round(pixelCrop.height),
    0,
    0,
    canvas.width,
    canvas.height
  );

  // Preserve original MIME type and filename if available
  const mimeType = originalFile?.type && ['image/jpeg', 'image/png', 'image/webp'].includes(originalFile.type)
    ? originalFile.type
    : 'image/jpeg';

  const extension = mimeType === 'image/png' ? '.png' : mimeType === 'image/webp' ? '.webp' : '.jpg';
  const baseName = originalFile?.name
    ? originalFile.name.replace(/\.[^/.]+$/, '')
    : 'cropped_image';
  const fileName = `${baseName}_cropped${extension}`;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas image processing produced an empty result.'));
          return;
        }

        const croppedFile = new File([blob], fileName, {
          type: mimeType,
          lastModified: Date.now(),
        });

        const blobUrl = URL.createObjectURL(croppedFile);
        resolve({ file: croppedFile, blobUrl });
      },
      mimeType,
      0.92
    );
  });
}
