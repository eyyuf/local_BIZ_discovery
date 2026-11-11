import React, { useState, useEffect, useCallback } from 'react';
import { Star, MessageSquare, PenLine, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/modules/identity/hooks/useAuth';
import reviewApi from '../api/reviewApi';
import ReviewForm from './ReviewForm';

export function PlaceReviewsSection({ place }) {
  const { user } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [ratingSummary, setRatingSummary] = useState({
    average_rating: place?.average_rating || null,
    total_ratings: place?.total_ratings || 0,
  });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const fetchReviewsAndRatings = useCallback(async (pageNum = 1) => {
    if (!place?.id) return;
    setIsLoading(true);
    try {
      const [reviewsRes, ratingRes] = await Promise.all([
        reviewApi.getPlaceReviews(place.id, pageNum),
        reviewApi.getPlaceRating(place.id).catch(() => null),
      ]);

      const reviewData = reviewsRes?.data || [];
      if (pageNum === 1) {
        setReviews(reviewData);
      } else {
        setReviews((prev) => [...prev, ...reviewData]);
      }

      setHasMore(Boolean(reviewsRes?.links?.next));

      if (ratingRes) {
        setRatingSummary({
          average_rating: ratingRes.average_rating ?? place.average_rating ?? null,
          total_ratings: ratingRes.total_ratings ?? reviewData.length,
        });
      }
    } catch {
      // Graceful fallback to existing place rating attributes if review fetching fails
    } finally {
      setIsLoading(false);
    }
  }, [place?.id, place?.average_rating, place?.total_ratings]);

  useEffect(() => {
    fetchReviewsAndRatings(1);
  }, [fetchReviewsAndRatings]);

  const handleReviewCreated = () => {
    setShowReviewForm(false);
    setFeedbackMsg('Your review was successfully posted!');
    setTimeout(() => setFeedbackMsg(null), 4000);
    fetchReviewsAndRatings(1);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;
    try {
      await reviewApi.deleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setFeedbackMsg('Review removed.');
      setTimeout(() => setFeedbackMsg(null), 3000);
      fetchReviewsAndRatings(1);
    } catch {
      alert('Unable to delete review. Please try again.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const getInitials = (n) => {
    if (!n) return 'U';
    return n
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Compute local rating breakdown from loaded reviews
  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Number(r.rating) === star).length;
    const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { star, count, pct };
  });

  const avgDisplay = ratingSummary.average_rating
    ? Number(ratingSummary.average_rating).toFixed(1)
    : reviews.length > 0
    ? (
        reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / reviews.length
      ).toFixed(1)
    : null;

  return (
    <section id="reviews-section" className="space-y-8 scroll-mt-24">
      {/* Header and Summary Card */}
      <div className="bg-[#151518] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight">
                Guest Reviews &amp; Ratings
              </h2>
            </div>
            <p className="text-xs text-[#AAA69C]">
              Authentic verified community recommendations from explorers who visited{' '}
              <span className="text-white font-medium">{place.name}</span>.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowReviewForm((prev) => !prev)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-extrabold text-xs hover:bg-[#F5F2EA] transition active:scale-95 cursor-pointer shadow-lg shrink-0"
          >
            <PenLine className="w-3.5 h-3.5" />
            <span>{showReviewForm ? 'Close Form' : 'Write a Review'}</span>
          </button>
        </div>

        {/* Rating Metrics & Distribution */}
        <div className="mt-6 pt-6 border-t border-white/[0.08] grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Average Rating Score */}
          <div className="md:col-span-4 flex items-center gap-4">
            <div className="text-4xl sm:text-5xl font-black text-white font-display">
              {avgDisplay || '—'}
            </div>
            <div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      avgDisplay && s <= Math.round(Number(avgDisplay))
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-white/20'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-[#AAA69C] mt-1 font-mono">
                {reviews.length}{' '}
                {reviews.length === 1 ? 'written review' : 'written reviews'}
              </p>
            </div>
          </div>

          {/* Rating Distribution Bars */}
          <div className="md:col-span-8 space-y-1.5">
            {distribution.map(({ star, count, pct }) => (
              <div key={star} className="flex items-center gap-3 text-[11px] font-mono text-[#AAA69C]">
                <span className="w-6 text-right shrink-0">{star}★</span>
                <div className="flex-1 h-2 bg-black/60 rounded-full overflow-hidden border border-white/[0.05]">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-6 text-left shrink-0 text-[10px] text-white/50">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-4 rounded-2xl bg-[#162B1E] border border-[#22C55E]/40 text-white text-xs flex items-center gap-2.5 shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
          <span className="font-semibold">{feedbackMsg}</span>
        </div>
      )}

      {/* Review Form Reveal */}
      {showReviewForm && (
        <div className="transition-all duration-300">
          <ReviewForm
            placeId={place.id}
            placeName={place.name}
            onSuccess={handleReviewCreated}
            onCancel={() => setShowReviewForm(false)}
          />
        </div>
      )}

      {/* Reviews Listing */}
      <div className="space-y-4">
        {isLoading && reviews.length === 0 ? (
          <div className="bg-[#151518] border border-white/[0.08] rounded-3xl p-10 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono text-[#AAA69C]">Loading customer reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-[#151518] border border-white/[0.08] rounded-3xl p-10 sm:p-12 text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-full border border-white/10 bg-black/40 flex items-center justify-center text-[#AAA69C] mx-auto">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white font-display">No Reviews Yet</h3>
              <p className="text-xs text-[#AAA69C] max-w-md mx-auto">
                Be the first to share your experience, recommendations, and ratings for{' '}
                <span className="text-white font-semibold">{place.name}</span>.
              </p>
            </div>
            {!showReviewForm && (
              <button
                type="button"
                onClick={() => setShowReviewForm(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black font-extrabold text-xs hover:bg-[#F5F2EA] transition active:scale-95 cursor-pointer shadow-lg"
              >
                <PenLine className="w-3.5 h-3.5" />
                <span>Write the First Review</span>
              </button>
            )}
          </div>
        ) : (
          reviews.map((rev) => {
            const isOwnReview = user && Number(user.id) === Number(rev.author?.id);
            const avatarUrl = rev.author?.avatar;
            const reviewerName = rev.author?.name || 'Explorer';
            const starScore =
              Number(rev.rating) >= 1 && Number(rev.rating) <= 5
                ? Number(rev.rating)
                : 5;

            return (
              <div
                key={rev.id}
                className="bg-[#151518] border border-white/[0.08] rounded-3xl p-6 sm:p-7 space-y-4 shadow-xl hover:border-white/20 transition group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={reviewerName}
                        className="w-11 h-11 rounded-full object-cover border border-white/20 shrink-0 shadow-md"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#22C55E] to-[#16A34A] text-white flex items-center justify-center text-xs font-bold border border-white/20 shrink-0 shadow-md">
                        {getInitials(reviewerName)}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white font-display">
                          {reviewerName}
                        </h4>
                        {isOwnReview && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white font-mono">
                            You
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#AAA69C] font-mono">
                        {formatDate(rev.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Rating Stars */}
                    <div className="flex items-center gap-1 bg-black/40 px-2.5 py-1 rounded-full border border-white/10">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= starScore ? 'fill-amber-400 text-amber-400' : 'text-white/20'
                          }`}
                        />
                      ))}
                    </div>

                    {isOwnReview && (
                      <button
                        type="button"
                        onClick={() => handleDeleteReview(rev.id)}
                        className="p-1.5 rounded-full text-[#AAA69C] hover:text-red-400 hover:bg-red-950/30 transition cursor-pointer"
                        title="Delete your review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#F5F2EA]/90 leading-relaxed pl-1 sm:pl-2">
                  {rev.comment}
                </p>

                {/* Owner responses if present */}
                {rev.messages && rev.messages.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-3 pl-3 sm:pl-6 border-l-2 border-amber-500/30">
                    {rev.messages.map((msg) => (
                      <div key={msg.id} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-amber-400 font-display">
                            {msg.author?.name || 'Place Host'}
                          </span>
                          <span className="text-[10px] text-[#AAA69C] font-mono">
                            {formatDate(msg.created_at)}
                          </span>
                        </div>
                        <p className="text-xs text-[#AAA69C] leading-relaxed">
                          {msg.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}

        {hasMore && (
          <div className="text-center pt-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
                const next = page + 1;
                setPage(next);
                fetchReviewsAndRatings(next);
              }}
              className="px-6 py-2.5 rounded-full border border-white/20 bg-black/40 text-xs font-bold text-white hover:border-white transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Loading More...' : 'Load More Reviews'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default PlaceReviewsSection;

