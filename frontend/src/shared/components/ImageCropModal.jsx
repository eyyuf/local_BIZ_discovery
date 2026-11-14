import React, { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import { X, ZoomIn, ZoomOut, RotateCw, Check, Loader2, Crop, Eye } from 'lucide-react';
import { getCroppedImg } from '@/shared/utils/cropImage';

/**
 * Reusable dark-themed Image Crop Modal.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {string} props.imageSrc - Temporary URL (blob or base64) of the selected image
 * @param {File} props.originalFile - Original File object for name and MIME preservation
 * @param {Function} props.onClose - Cancel handler
 * @param {Function} props.onConfirm - Confirm handler: (croppedFile: File, previewUrl: string) => void
 * @param {string} [props.title='Adjust Image Crop'] - Modal title
 * @param {number} [props.defaultAspect=16/9] - Initial aspect ratio
 * @param {Array<{ label: string, value: number|undefined }>} [props.aspectPresets] - List of selectable aspect ratios
 */
export function ImageCropModal({
  isOpen,
  imageSrc,
  originalFile,
  onClose,
  onConfirm,
  title = 'Adjust Image Crop',
  defaultAspect = 16 / 9,
  aspectPresets = [
    { label: '16:9', value: 16 / 9 },
    { label: '4:3', value: 4 / 3 },
    { label: '1:1', value: 1 / 1 },
    { label: 'Free', value: undefined },
  ],
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [selectedAspect, setSelectedAspect] = useState(defaultAspect);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState(null);

  // Quick preview state
  const [previewBlobUrl, setPreviewBlobUrl] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Reset state when opening a new image
  useEffect(() => {
    if (isOpen) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setSelectedAspect(defaultAspect);
      setProcessingError(null);
      setIsProcessing(false);
      setIsPreviewMode(false);
      setPreviewBlobUrl(null);
    } else {
      if (previewBlobUrl) {
        URL.revokeObjectURL(previewBlobUrl);
        setPreviewBlobUrl(null);
      }
    }
  }, [isOpen, imageSrc, defaultAspect]);

  const onCropComplete = useCallback((croppedArea, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  // Handle preview generation
  const handleTogglePreview = async () => {
    if (isPreviewMode) {
      setIsPreviewMode(false);
      return;
    }

    if (!imageSrc || !croppedAreaPixels) return;

    setIsProcessing(true);
    setProcessingError(null);
    try {
      const { blobUrl } = await getCroppedImg(imageSrc, croppedAreaPixels, originalFile);
      if (previewBlobUrl) {
        URL.revokeObjectURL(previewBlobUrl);
      }
      setPreviewBlobUrl(blobUrl);
      setIsPreviewMode(true);
    } catch (err) {
      console.error('Failed to preview cropped image', err);
      setProcessingError('Could not render crop preview.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Confirm crop and export File
  const handleConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    setIsProcessing(true);
    setProcessingError(null);
    try {
      const { file, blobUrl } = await getCroppedImg(imageSrc, croppedAreaPixels, originalFile);
      onConfirm(file, blobUrl);
    } catch (err) {
      console.error('Failed to process cropped image', err);
      setProcessingError(err.message || 'Error processing cropped image. Please try again.');
      setIsProcessing(false);
    }
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) {
          onClose();
        }
      }}
    >
      <div
        className="w-full max-w-2xl bg-[#151518] border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between bg-[#1D1C1F]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
              <Crop className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white font-display">
                {title}
              </h3>
              <p className="text-[11px] text-[#AAA69C]">
                Drag to reposition · Scroll or use slider to zoom
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-full text-[#AAA69C] hover:text-white hover:bg-white/10 transition disabled:opacity-50"
            aria-label="Close crop modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cropper / Preview Canvas */}
        <div className="relative w-full h-72 sm:h-96 bg-[#0D0D0C] select-none overflow-hidden">
          {isPreviewMode && previewBlobUrl ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-black/90">
              <img
                src={previewBlobUrl}
                alt="Crop preview"
                className="max-w-full max-h-full object-contain rounded-lg border border-white/20 shadow-xl"
              />
              <span className="mt-2 text-xs font-mono text-[#AAA69C]">
                Preview Mode (Actual Crop Output)
              </span>
            </div>
          ) : (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={selectedAspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              showGrid={true}
              classes={{
                containerClassName: 'relative w-full h-full',
                cropAreaClassName: '!border-emerald-400 !border-2 shadow-2xl',
              }}
            />
          )}

          {isProcessing && (
            <div className="absolute inset-0 z-20 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
              <span className="text-xs font-mono">Generating high-quality crop...</span>
            </div>
          )}
        </div>

        {/* Controls Section */}
        <div className="p-4 sm:p-5 bg-[#151518] border-t border-white/[0.08] space-y-4">
          {/* Aspect Ratio Presets */}
          {aspectPresets && aspectPresets.length > 0 && (
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="text-xs font-mono text-[#AAA69C]">Aspect Ratio:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {aspectPresets.map((preset) => {
                  const isActive = selectedAspect === preset.value;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setSelectedAspect(preset.value);
                        if (isPreviewMode) setIsPreviewMode(false);
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                        isActive
                          ? 'border border-emerald-400 bg-emerald-500/20 text-emerald-300 font-bold shadow-sm'
                          : 'border border-white/10 bg-black/40 text-[#AAA69C] hover:text-white hover:border-white/30'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Zoom Slider */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(1, Number((z - 0.2).toFixed(2))))}
              className="p-1 rounded-md text-[#AAA69C] hover:text-white hover:bg-white/10 transition"
              title="Zoom out"
              disabled={isPreviewMode || isProcessing}
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              disabled={isPreviewMode || isProcessing}
              className="flex-1 h-1.5 bg-black/60 rounded-lg appearance-none cursor-pointer accent-emerald-400 disabled:opacity-40"
              aria-label="Image zoom slider"
            />
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(3, Number((z + 0.2).toFixed(2))))}
              className="p-1 rounded-md text-[#AAA69C] hover:text-white hover:bg-white/10 transition"
              title="Zoom in"
              disabled={isPreviewMode || isProcessing}
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-[#AAA69C] w-10 text-right">
              {zoom.toFixed(1)}x
            </span>
          </div>

          {/* Error Message */}
          {processingError && (
            <div className="px-3.5 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center justify-between">
              <span>{processingError}</span>
              <button
                type="button"
                onClick={() => setProcessingError(null)}
                className="text-red-400 hover:text-red-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-1 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={handleTogglePreview}
              disabled={isProcessing}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition cursor-pointer ${
                isPreviewMode
                  ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                  : 'border-white/15 bg-black/40 text-[#AAA69C] hover:text-white hover:border-white/30'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isPreviewMode ? 'Back to Crop' : 'Preview Output'}</span>
            </button>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2 rounded-full border border-white/15 bg-black/40 text-xs font-semibold text-[#AAA69C] hover:text-white hover:border-white/30 transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-white text-black text-xs font-bold hover:bg-[#F5F2EA] transition active:scale-95 cursor-pointer shadow-lg disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm Crop</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageCropModal;
