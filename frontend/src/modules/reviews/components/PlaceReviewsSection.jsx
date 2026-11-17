import React, { useState, useEffect, useCallback } from 'react';
import { Star, MessageSquare, PenLine, Trash2, CheckCircle2 } from 'lucide-react';
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
  const [editingReview, setEditingReview] = useState(null);
  const [existingUserReview, setExistingUserReview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  useEffect(() => {
    if (place) {
      setRatingSummary((prev) => ({
        average_rating: prev.average_rating ?? place.average_rating ?? null,
        total_ratings: prev.total_ratings || place.total_ratings || 0,
      }));
    }
  }, [place?.average_rating, place?.total_ratings]);

  const fetchReviewsAndRatings = useCallback(
    async (pageNum = 1, forceRefreshRating = false) => {
      if (!place?.id) return;
      setIsLoading(true);
      try {
        // Only fetch place rating if explicitly requested (e.g. after review save or deletion)
        // On initial page load (pageNum === 1 && !forceRefreshRating), we use place.average_rating and place.total_ratings
        const promises = [reviewApi.getPlaceReviews(place.id, pageNum)];
        if (forceRefreshRating) {
          promises.push(reviewApi.getPlaceRating(place.id).catch(() => null));
        }

        const [reviewsRes, ratingRes] = await Promise.all(promises);

        const reviewData = reviewsRes?.data || [];
        if (pageNum === 1) {
          setReviews(reviewData);
        } else {
          setReviews((prev) => [...prev, ...reviewData]);
        }

        const hasNextPage = Boolean(reviewsRes?.links?.next);
        setHasMore(hasNextPage);

        if (ratingRes) {
          setRatingSummary({
            average_rating: ratingRes.average_rating ?? place.average_rating ?? null,
            total_ratings: ratingRes.total_ratings ?? reviewData.length,
          });
        }

        // Check if user's review is present in fetched reviews
        if (user) {
          const foundInPage = reviewData.find(
            (r) =>
              Number(r.author?.id) === Number(user.id) ||
              Number(r.user_id) === Number(user.id)
          );
          if (foundInPage) {
            setExistingUserReview(foundInPage);
          } else if (pageNum === 1) {
            // Only query user's reviews if place has more review pages (buried on later page)
            // If there is no next page, ALL reviews for this place are on page 1, so the user definitely has not reviewed this place.
            if (hasNextPage) {
              try {
                const userRes = await reviewApi.getUserReviews(1, 15);
                const found = userRes?.data?.find(
                  (r) => Number(r.place_id || r.place?.id) === Number(place.id)
                );
                if (found) {
                  setExistingUserReview(found);
                } else {
                  setExistingUserReview(null);
                }
              } catch {
                // Ignore unauthenticated or query error
              }
            } else {
              setExistingUserReview(null);
            }
          }
        } else {
          setExistingUserReview(null);
        }
      } catch {
        // Graceful fallback to existing place rating attributes if review fetching fails
      } finally {
        setIsLoading(false);
      }
    },
    [place?.id, place?.average_rating, place?.total_ratings, user]
  );

  useEffect(() => {
    fetchReviewsAndRatings(1);
  }, [fetchReviewsAndRatings]);

  // Determine if current user already has a review for this place
  const userReviewFromList = user
    ? reviews.find(
        (r) =>
          Number(r.author?.id) === Number(user.id) ||
          Number(r.user_id) === Number(user.id)
      )
    : null;
  const existingReview = userReviewFromList || existingUserReview;

  const handleToggleForm = async () => {
    if (showReviewForm) {
      setShowReviewForm(false);
      setEditingReview(null);
    } else {
      let targetReview = existingReview;
      // If user review wasn't in page 1 and there are multiple pages, verify before opening form
      if (!targetReview && user && hasMore && !existingUserReview) {
        try {
          const userRes = await reviewApi.getUserReviews(1, 25);
          const found = userRes?.data?.find(
            (r) => Number(r.place_id || r.place?.id) === Number(place.id)
          );
          if (found) {
            setExistingUserReview(found);
            targetReview = found;
          }
        } catch {
          // Ignore
        }
      }

      if (targetReview) {
        setEditingReview(targetReview);
      } else {
        setEditingReview(null);
      }
      setShowReviewForm(true);
    }
  };

  const handleStartEdit = (rev) => {
    setEditingReview(rev);
    setShowReviewForm(true);
    const section = document.getElementById('reviews-section');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  };

  const handleReviewSaved = () => {
    setShowReviewForm(false);
    setFeedbackMsg(
      editingReview
        ? 'Your review was successfully updated!'
        : 'Your review was successfully posted!'
    );
    setEditingReview(null);
    setTimeout(() => setFeedbackMsg(null), 4000);
    fetchReviewsAndRatings(1, true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;
    try {
      await reviewApi.deleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setExistingUserReview(null);
      setEditingReview(null);
      setShowReviewForm(false);
      setFeedbackMsg('Review removed.');
      setTimeout(() => setFeedbackMsg(null), 3000);
      fetchReviewsAndRatings(1, true);
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

  // Only consider valid ratings between 1 and 5 when calculating fallback average
  const validRatedReviews = reviews.filter((r) => {
    const val = Number(r.rating);
    return Number.isInteger(val) && val >= 1 && val <= 5;
  });

  const avgDisplay = ratingSummary.average_rating
    ? Number(ratingSummary.average_rating).toFixed(1)
    : validRatedReviews.length > 0
    ? (
        validRatedReviews.reduce((acc, r) => acc + Number(r.rating), 0) /
        validRatedReviews.length
      ).toFixed(1)
    : null;

  const totalCount = ratingSummary.total_ratings || reviews.length;

  return (
    <section id="reviews-section" className="scroll-mt-24">
      {/* Unified Comment Section Container */}
      <div className="bg-[#121215] border border-white/[0.08] rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
        
        {/* Compact Comment Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg sm:text-xl font-black text-white font-display tracking-tight">
                Reviews
              </h2>
            </div>

            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-white/10 text-white/90">
              {totalCount}
            </span>

            {avgDisplay && (
              <div className="flex items-center gap-1.5 pl-3 border-l border-white/10 text-xs font-mono">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-bold text-white text-sm">{avgDisplay}</span>
                <span className="text-[#AAA69C]">/ 5</span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleToggleForm}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black font-extrabold text-xs hover:bg-[#F5F2EA] transition active:scale-95 cursor-pointer shadow-md shrink-0 self-start sm:self-auto"
          >
            <PenLine className="w-3.5 h-3.5" />
            <span>
              {showReviewForm
                ? 'Cancel'
                : existingReview
                ? 'Edit Your Review'
                : 'Write a Review'}
            </span>
          </button>
        </div>

        {/* Feedback Alert Banner */}
        {feedbackMsg && (
          <div className="p-3.5 rounded-2xl bg-[#162B1E] border border-[#22C55E]/40 text-white text-xs flex items-center gap-2.5 shadow-md">
            <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
            <span className="font-semibold">{feedbackMsg}</span>
          </div>
        )}

        {/* Inline Review Form (Create or Edit Mode) */}
        {showReviewForm && (
          <div className="pb-6 border-b border-white/[0.08] transition-all">
            <ReviewForm
              placeId={place.id}
              placeName={place.name}
              initialReview={editingReview}
              onSuccess={handleReviewSaved}
              onCancel={() => {
                setShowReviewForm(false);
                setEditingReview(null);
              }}
            />
          </div>
        )}

        {/* Comment Stream */}
        {isLoading && reviews.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-7 h-7 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono text-[#AAA69C]">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          /* Clean Empty State */
          <div className="py-12 text-center space-y-3">
            <div className="w-11 h-11 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center text-[#AAA69C] mx-auto">
              <MessageSquare className="w-5 h-5 text-amber-400/80" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white font-display">No reviews yet</h3>
              <p className="text-xs text-[#AAA69C] max-w-sm mx-auto">
                Be the first to share your thoughts and recommendations for{' '}
                <span className="text-white font-medium">{place.name}</span>.
              </p>
            </div>
            {!showReviewForm && (
              <button
                type="button"
                onClick={() => {
                  setEditingReview(null);
                  setShowReviewForm(true);
                }}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/20 hover:border-white text-white text-xs font-bold transition active:scale-95 cursor-pointer bg-white/[0.04]"
              >
                <PenLine className="w-3.5 h-3.5 text-amber-400" />
                <span>Leave the First Review</span>
              </button>
            )}
          </div>
        ) : (
          /* Stream of Comments with Subtle Dividers */
          <div className="divide-y divide-white/[0.06]">
            {reviews.map((rev) => {
              const isOwnReview = user && Number(user.id) === Number(rev.author?.id);
              const avatarUrl = rev.author?.avatar;
              const reviewerName = rev.author?.name || 'Explorer';
              const rawRating = Number(rev.rating);
              const hasValidRating =
                Number.isInteger(rawRating) && rawRating >= 1 && rawRating <= 5;

              return (
                <div key={rev.id} className="py-5 first:pt-0 last:pb-0 space-y-2.5 group">
                  {/* Comment Header: Avatar, Name, Rating, Date, and Actions */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar */}
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={reviewerName}
                          className="w-9 h-9 rounded-full object-cover border border-white/15 shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#22C55E] to-[#16A34A] text-white flex items-center justify-center text-xs font-bold border border-white/15 shrink-0">
                          {getInitials(reviewerName)}
                        </div>
                      )}

                      {/* Name, Badges, Star Rating & Date on Same Line */}
                      <div className="min-w-0 flex items-center gap-2 flex-wrap text-xs">
                        <span className="font-bold text-white font-display truncate">
                          {reviewerName}
                        </span>

                        {isOwnReview && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-white/10 text-white/90">
                            You
                          </span>
                        )}

                        {/* Star Rating (only rendered if valid rating exists) */}
                        {hasValidRating && (
                          <div
                            className="flex items-center gap-0.5"
                            aria-label={`${rawRating} out of 5 stars`}
                          >
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= rawRating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-white/20'
                                }`}
                              />
                            ))}
                          </div>
                        )}

                        <span className="text-[#AAA69C]/40">·</span>

                        <span className="text-[11px] text-[#AAA69C] font-mono whitespace-nowrap">
                          {formatDate(rev.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Edit & Delete Actions for Authenticated Review Author */}
                    {isOwnReview && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(rev)}
                          className="p-1 rounded-full text-[#AAA69C] hover:text-white hover:bg-white/10 transition cursor-pointer opacity-70 group-hover:opacity-100"
                          title="Edit your review"
                        >
                          <PenLine className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteReview(rev.id)}
                          className="p-1 rounded-full text-[#AAA69C] hover:text-red-400 hover:bg-red-950/30 transition cursor-pointer opacity-70 group-hover:opacity-100"
                          title="Delete your review"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Comment Body */}
                  <p className="text-xs sm:text-sm text-[#F5F2EA]/90 leading-relaxed pl-12 pr-2 whitespace-pre-line">
                    {rev.comment}
                  </p>

                  {/* Existing Responses (Indented Sub-Thread) */}
                  {rev.messages && rev.messages.length > 0 && (
                    <div className="ml-12 mt-3 space-y-2">
                      {rev.messages.map((msg) => {
                        // Strictly verify if author is place owner from available place data
                        const isVerifiedOwner = Boolean(
                          (place?.user_id && Number(msg.author?.id) === Number(place.user_id)) ||
                          (place?.owner_id && Number(msg.author?.id) === Number(place.owner_id)) ||
                          (place?.owner?.id && Number(msg.author?.id) === Number(place.owner?.id))
                        );

                        const isReviewAuthor = Number(msg.author?.id) === Number(rev.author?.id);

                        const label = isVerifiedOwner
                          ? 'Owner Response'
                          : isReviewAuthor
                          ? `${msg.author?.name || 'Reviewer'} (Author)`
                          : msg.author?.name || 'Response';

                        return (
                          <div
                            key={msg.id}
                            className={`p-3.5 rounded-2xl bg-white/[0.02] border-l-2 space-y-1.5 ${
                              isVerifiedOwner ? 'border-amber-400/60' : 'border-white/20'
                            }`}
                          >
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-[11px] font-bold font-display ${
                                  isVerifiedOwner ? 'text-amber-400' : 'text-white/80'
                                }`}
                              >
                                {label}
                              </span>
                              <span className="text-[#AAA69C]/40">·</span>
                              <span className="text-[10px] text-[#AAA69C] font-mono">
                                {formatDate(msg.created_at)}
                              </span>
                            </div>
                            <p className="text-xs text-[#AAA69C] leading-relaxed">
                              {msg.message}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination / Load More */}
        {hasMore && (
          <div className="text-center pt-4 border-t border-white/[0.06]">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
                const next = page + 1;
                setPage(next);
                fetchReviewsAndRatings(next);
              }}
              className="px-5 py-2 rounded-full border border-white/20 bg-black/40 text-xs font-bold text-white hover:border-white transition active:scale-95 cursor-pointer disabled:opacity-50"
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
