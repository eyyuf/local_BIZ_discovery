import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Star, Send, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import { useAuth } from '@/modules/identity/hooks/useAuth';
import reviewApi from '../api/reviewApi';

const RATING_LABELS = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Exceptional',
};

export function ReviewForm({ placeId, placeName, onSuccess, onCancel }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const maxChars = 2000;

  if (!user) {
    return (
      <div className="bg-[#151518] border border-white/[0.08] rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-xl">
        <div className="w-12 h-12 rounded-full border border-white/20 bg-black/40 flex items-center justify-center text-white mx-auto">
          <Lock className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white font-display">Sign In to Leave a Review</h3>
          <p className="text-xs text-[#AAA69C] max-w-sm mx-auto">
            Share your authentic local experience, rate service, and help fellow explorers discover {placeName || 'this spot'}.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/login', { state: { from: location.pathname } })}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black font-extrabold text-xs hover:bg-[#F5F2EA] transition active:scale-95 cursor-pointer shadow-lg"
        >
          Sign In / Create Account
        </button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    if (!rating || rating < 1 || rating > 5) {
      setErrorMsg('Please select a star rating from 1 to 5.');
      return;
    }

    const trimmed = comment.trim();
    if (!trimmed) {
      setErrorMsg('Please write a short review sharing your experience.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit written review with rating to the backend reviews API
      const createdReview = await reviewApi.submitReview(placeId, {
        rating: Number(rating),
        comment: trimmed,
      });

      setSuccessMsg('Thank you! Your review has been published.');
      setComment('');
      setRating(0);

      if (onSuccess) {
        onSuccess(createdReview);
      }
    } catch (err) {
      const backendErrors = err.response?.data?.errors;
      const validationMsg =
        backendErrors?.rating?.[0] ||
        backendErrors?.comment?.[0] ||
        backendErrors?.place?.[0];

      const msg =
        validationMsg ||
        err.response?.data?.message ||
        'Unable to submit your review. Please try again.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#151518] border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden"
    >
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
        <div>
          <h3 className="text-lg font-black text-white font-display tracking-tight">
            Write a Review
          </h3>
          <p className="text-xs text-[#AAA69C] mt-0.5">
            Share your experience at <span className="text-white font-medium">{placeName || 'this place'}</span>
          </p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-[#AAA69C] hover:text-white transition cursor-pointer px-3 py-1.5 rounded-full border border-white/10 hover:border-white/20"
          >
            Cancel
          </button>
        )}
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-[#162B1E] border border-[#22C55E]/40 text-white text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-white text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Interactive Star Rating Selector */}
      <div className="space-y-2">
        <label className="block text-[11px] font-bold text-[#AAA69C] uppercase tracking-wider font-mono">
          Your Rating
        </label>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5" onMouseLeave={() => setHoverRating(0)}>
            {[1, 2, 3, 4, 5].map((starValue) => {
              const active = (hoverRating || rating) >= starValue;
              return (
                <button
                  key={starValue}
                  type="button"
                  onClick={() => setRating(starValue)}
                  onMouseEnter={() => setHoverRating(starValue)}
                  className="p-1 rounded-lg hover:scale-110 active:scale-95 transition-transform cursor-pointer focus:outline-none"
                  aria-label={`${starValue} star`}
                >
                  <Star
                    className={`w-6 h-6 transition-colors ${
                      active
                        ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]'
                        : 'text-white/20 hover:text-white/40'
                    }`}
                  />
                </button>
              );
            })}
          </div>
          <span className="text-xs font-semibold text-white/90 font-mono">
            {RATING_LABELS[hoverRating || rating] || (
              <span className="text-[#AAA69C]/60 italic font-normal">Select a star rating</span>
            )}
          </span>
        </div>
      </div>

      {/* Multiline Review Textarea */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="review-comment"
            className="block text-[11px] font-bold text-[#AAA69C] uppercase tracking-wider font-mono"
          >
            Review Details
          </label>
          <span
            className={`text-[10px] font-mono ${
              comment.length > maxChars * 0.9 ? 'text-amber-400' : 'text-[#AAA69C]/60'
            }`}
          >
            {comment.length} / {maxChars}
          </span>
        </div>
        <textarea
          id="review-comment"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, maxChars))}
          placeholder="Tell others what you enjoyed about the food, ambiance, service, coffee ceremonies, or specials..."
          required
          className="w-full px-4 py-3 rounded-2xl border border-white/20 bg-black/45 text-white text-xs sm:text-sm focus:border-white outline-none transition placeholder:text-[#AAA69C]/40 resize-y min-h-[100px] leading-relaxed"
        />
      </div>

      {/* Submit Action */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting || !comment.trim() || !rating}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black font-extrabold text-xs hover:bg-[#F5F2EA] transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-lg active:scale-95"
        >
          {isSubmitting ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              <span>Publishing...</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Submit Review</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default ReviewForm;

