import React, { useState } from 'react';
import axios from 'axios';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';

/**
 * Reusable Image Upload Component with preview and Cloudinary integration.
 *
 * @param {Object} props
 * @param {string} [props.value] - Existing image URL
 * @param {Function} props.onChange - Callback with the uploaded image URL: (url) => void
 * @param {'places'|'menus'|'reviews'|'general'} [props.folder='general'] - Cloudinary subfolder
 * @param {string} [props.className] - Container CSS classes
 * @param {number} [props.maxSizeMB=5] - Maximum file size in MB
 */
export default function ImageUpload({
  value,
  onChange,
  folder = 'general',
  className = '',
  maxSizeMB = 5,
}) {
  const [preview, setPreview] = useState(value || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side file size validation
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }

    // Client-side MIME type validation
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WebP)');
      return;
    }

    setError(null);
    setPreview(URL.createObjectURL(file));
    setLoading(true);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      const response = await axios.post('/api/v1/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const uploadedUrl = response.data.url;
      setPreview(uploadedUrl);
      if (onChange) {
        onChange(uploadedUrl);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload image. Please try again.');
      setPreview(value || null);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPreview(null);
    if (onChange) {
      onChange('');
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {preview ? (
        <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200 group bg-gray-50">
          <img
            src={preview}
            alt="Uploaded preview"
            className="w-full h-full object-cover"
          />
          {loading && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <span className="text-xs font-medium">Uploading to Cloudinary...</span>
            </div>
          )}
          {!loading && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white rounded-full p-1.5 transition opacity-90 hover:opacity-100 shadow-md"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50/20 transition-all">
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
            <div className="w-12 h-12 mb-3 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Upload className="w-6 h-6" />
            </div>
            <p className="mb-1 text-sm font-medium text-gray-700">
              Click to upload or drag & drop
            </p>
            <p className="text-xs text-gray-400">
              PNG, JPG or WebP (max. {maxSizeMB}MB)
            </p>
          </div>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleFileChange}
            disabled={loading}
          />
        </label>
      )}

      {error && (
        <p className="text-xs text-red-600 mt-2 font-medium flex items-center gap-1">
          <span>⚠️</span> {error}
        </p>
      )}
    </div>
  );
}
