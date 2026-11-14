import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import SavedBookmarksList from '../components/SavedBookmarksList';
import reviewApi from '@/modules/reviews/api/reviewApi';
import placesApi from '@/modules/places/api/placesApi';
import {
  User,
  Mail,
  Bookmark,
  Shield,
  LogOut,
  Check,
  Compass,
  Camera,
  Star,
  Trash2,
  Calendar,
  MessageSquare,
  AlertCircle,
  ExternalLink,
  Loader2,
  X,
  Upload,
  Building2,
  Plus,
  Phone,
  MapPin,
  Globe,
  Navigation,
  Image as ImageIcon,
  Settings,
  Edit,
} from 'lucide-react';
import gsap from 'gsap';
import { getPlacePrimaryPhoto, PLACE_PLACEHOLDER } from '@/shared/utils/placeImages';

export function ProfilePage() {
  const { user, logout, updateProfile } = useAuth();
  const location = useLocation();

  const queryTab = new URLSearchParams(location.search).get('tab');
  const [activeTab, setActiveTab] = useState(
    queryTab && ['bookmarks', 'reviews', 'businesses', 'details', 'security'].includes(queryTab)
      ? queryTab
      : 'bookmarks'
  ); // 'bookmarks' | 'reviews' | 'businesses' | 'details' | 'security'

  useEffect(() => {
    if (queryTab && ['bookmarks', 'reviews', 'businesses', 'details', 'security'].includes(queryTab)) {
      setActiveTab(queryTab);
    }
  }, [queryTab]);

  const [name, setName] = useState(user?.name || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Avatar upload state
  const fileInputRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarFeedback, setAvatarFeedback] = useState(null);

  // User reviews state
  const [userReviews, setUserReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [hasMoreReviews, setHasMoreReviews] = useState(false);
  const [reviewActionMsg, setReviewActionMsg] = useState(null);

  // Business listings state
  const [ownerPlaces, setOwnerPlaces] = useState([]);
  const [isLoadingOwnerPlaces, setIsLoadingOwnerPlaces] = useState(false);
  const [ownerPlacesError, setOwnerPlacesError] = useState(null);
  const [businessActionMsg, setBusinessActionMsg] = useState(null);

  const containerRef = useRef(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
    }
  }, [user]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.profile-enter',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // Fetch reviews written by user
  const fetchUserReviews = useCallback(async (page = 1) => {
    setIsLoadingReviews(true);
    try {
      const res = await reviewApi.getUserReviews(page);
      const items = res.data || [];
      if (page === 1) {
        setUserReviews(items);
      } else {
        setUserReviews((prev) => [...prev, ...items]);
      }
      setHasMoreReviews(Boolean(res.links?.next));
    } catch {
      setUserReviews([]);
    } finally {
      setIsLoadingReviews(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'reviews') {
      fetchUserReviews(1);
    }
  }, [activeTab, fetchUserReviews]);

  // Fetch businesses registered by user
  const fetchOwnerPlaces = useCallback(async () => {
    setIsLoadingOwnerPlaces(true);
    setOwnerPlacesError(null);
    try {
      const res = await placesApi.getOwnerPlaces();
      const rawData = res.data?.data || res.data || [];
      setOwnerPlaces(Array.isArray(rawData) ? rawData : []);
    } catch (err) {
      console.error('Failed to load owner places', err);
      setOwnerPlacesError('Could not load your registered business spots. Please try again.');
      setOwnerPlaces([]);
    } finally {
      setIsLoadingOwnerPlaces(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'businesses') {
      fetchOwnerPlaces();
    }
  }, [activeTab, fetchOwnerPlaces]);

  // Delete business spot
  const handleDeleteBusiness = async (placeId) => {
    if (!window.confirm('Are you sure you want to delete this business listing?')) return;
    try {
      await placesApi.deleteOwnerPlace(placeId);
      setOwnerPlaces((prev) => prev.filter((p) => p.id !== placeId));
      setBusinessActionMsg('Business listing deleted successfully.');
      setTimeout(() => setBusinessActionMsg(null), 4000);
    } catch (err) {
      console.error('Failed to delete place', err);
      alert('Could not delete business. Please try again.');
    }
  };

  // Handle avatar file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarFeedback({ type: 'error', text: 'Please select an image file (PNG, JPG, or WebP).' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setAvatarFeedback({ type: 'error', text: 'Image size must be under 2MB.' });
      return;
    }

    setSelectedFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarFeedback(null);
  };

  const cancelAvatarPreview = () => {
    setSelectedFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadAvatarToCloudinary = async () => {
    if (!selectedFile) return;
    setIsUploadingAvatar(true);
    setAvatarFeedback(null);

    const formData = new FormData();
    formData.append('avatar', selectedFile);

    try {
      await updateProfile(formData);
      setAvatarFeedback({ type: 'success', text: 'Profile picture updated successfully via Cloudinary!' });
      cancelAvatarPreview();
      setTimeout(() => setAvatarFeedback(null), 4000);
    } catch (err) {
      const msg =
        err.response?.data?.errors?.avatar?.[0] ||
        err.response?.data?.message ||
        'Failed to upload profile picture. Please try again.';
      setAvatarFeedback({ type: 'error', text: msg });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Update name
  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await updateProfile({ name });
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete own review
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await reviewApi.deleteReview(reviewId);
      setUserReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setReviewActionMsg('Review deleted.');
      setTimeout(() => setReviewActionMsg(null), 3000);
    } catch {
      alert('Unable to delete review. Please try again.');
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

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const reviewsCount = user?.reviews_count ?? userReviews.length;
  const bookmarksCount = user?.bookmarks_count ?? 0;

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#0D0D0C] text-[#F5F2EA] pt-24 sm:pt-28 pb-20 selection:bg-white/20 selection:text-white"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Profile Header Hero Card */}
        <div className="profile-enter bg-[#151518] border border-white/[0.08] rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-white/40 via-white/20 to-transparent" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              {/* Profile Picture with Cloudinary Upload Overlay */}
              <div className="relative group shrink-0">
                <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-white/20 bg-[#1e1e24] shadow-2xl relative flex items-center justify-center">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                    />
                  ) : user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user?.name || 'User avatar'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-[#22C55E] to-[#16A34A] text-white flex items-center justify-center text-3xl font-black">
                      {getInitials(user?.name)}
                    </div>
                  )}

                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white backdrop-blur-xs">
                      <Loader2 className="w-6 h-6 animate-spin mb-1 text-white" />
                      <span className="text-[10px] font-mono">Uploading...</span>
                    </div>
                  )}
                </div>

                {/* Upload / Change Photo Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute -bottom-2 -right-2 p-2.5 rounded-full bg-white text-black hover:bg-[#F5F2EA] shadow-xl border border-black/20 transition-transform active:scale-90 cursor-pointer"
                  title="Upload profile picture to Cloudinary"
                >
                  <Camera className="w-4 h-4" />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* User Bio and Meta */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight">
                    {user?.name || 'LocalSpot Explorer'}
                  </h1>
                  <span className="px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/[0.08] text-white/90 border border-white/10 font-mono">
                    {user?.role === 'owner' ? 'Business Owner' : 'Verified Explorer'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#AAA69C] flex items-center justify-center sm:justify-start gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#AAA69C]/80" />
                  <span>{user?.email}</span>
                </p>
                {user?.created_at && (
                  <p className="text-[11px] text-[#AAA69C]/60 flex items-center justify-center sm:justify-start gap-1.5 font-mono">
                    <Calendar className="w-3 h-3" />
                    <span>Member since {formatDate(user.created_at)}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className="px-4 py-2.5 rounded-full border border-white/20 bg-black/40 hover:border-white text-white text-xs font-bold transition cursor-pointer active:scale-95"
              >
                Edit Profile
              </button>
              <button
                type="button"
                onClick={logout}
                className="px-4 py-2.5 rounded-full border border-red-500/30 bg-red-950/30 hover:bg-red-900/50 text-red-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm active:scale-95"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Avatar Preview Confirmation Dialog */}
          {avatarPreview && !isUploadingAvatar && (
            <div className="mt-6 p-4 rounded-2xl bg-black/60 border border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Upload className="w-5 h-5 text-white/80" />
                <div>
                  <p className="text-xs font-bold text-white">Save New Profile Picture?</p>
                  <p className="text-[11px] text-[#AAA69C]">
                    Image will be uploaded to Cloudinary and displayed across your reviews.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={cancelAvatarPreview}
                  className="px-4 py-1.5 rounded-full border border-white/10 text-xs text-[#AAA69C] hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={uploadAvatarToCloudinary}
                  className="px-4 py-1.5 rounded-full bg-white text-black text-xs font-bold hover:bg-[#F5F2EA] transition cursor-pointer shadow-md"
                >
                  Save Photo
                </button>
              </div>
            </div>
          )}

          {/* Avatar Upload Feedback */}
          {avatarFeedback && (
            <div
              className={`mt-4 p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
                avatarFeedback.type === 'success'
                  ? 'bg-[#162B1E] border border-[#22C55E]/40 text-white'
                  : 'bg-red-950/40 border border-red-500/30 text-white'
              }`}
            >
              {avatarFeedback.type === 'success' ? (
                <Check className="w-4 h-4 text-[#22C55E] shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span className="font-semibold">{avatarFeedback.text}</span>
            </div>
          )}
        </div>

        {/* Activity Overview (Backend Supported Statistics) */}
        <div className="profile-enter grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#151518] border border-white/[0.08] rounded-2xl p-4 sm:p-5 shadow-lg space-y-1">
            <span className="text-[10px] font-bold text-[#AAA69C] uppercase tracking-wider font-mono">
              Reviews Written
            </span>
            <div className="flex items-center justify-between">
              <span className="text-2xl sm:text-3xl font-black text-white font-display">
                {reviewsCount}
              </span>
              <MessageSquare className="w-5 h-5 text-amber-400/80" />
            </div>
          </div>

          <div className="bg-[#151518] border border-white/[0.08] rounded-2xl p-4 sm:p-5 shadow-lg space-y-1">
            <span className="text-[10px] font-bold text-[#AAA69C] uppercase tracking-wider font-mono">
              Saved Spots
            </span>
            <div className="flex items-center justify-between">
              <span className="text-2xl sm:text-3xl font-black text-white font-display">
                {bookmarksCount}
              </span>
              <Bookmark className="w-5 h-5 text-[#22C55E]/80" />
            </div>
          </div>

          <div className="bg-[#151518] border border-white/[0.08] rounded-2xl p-4 sm:p-5 shadow-lg space-y-1">
            <span className="text-[10px] font-bold text-[#AAA69C] uppercase tracking-wider font-mono">
              Account Status
            </span>
            <div className="flex items-center justify-between">
              <span className="text-sm sm:text-base font-bold text-white font-display">
                {user?.email_verified_at ? 'Verified' : 'Active'}
              </span>
              <Shield className="w-5 h-5 text-emerald-400/80" />
            </div>
          </div>

          <div className="bg-[#151518] border border-white/[0.08] rounded-2xl p-4 sm:p-5 shadow-lg space-y-1">
            <span className="text-[10px] font-bold text-[#AAA69C] uppercase tracking-wider font-mono">
              Account Role
            </span>
            <div className="flex items-center justify-between">
              <span className="text-sm sm:text-base font-bold text-white font-display capitalize">
                {user?.role || 'Explorer'}
              </span>
              <Compass className="w-5 h-5 text-sky-400/80" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="profile-enter flex items-center gap-2 border-b border-white/[0.08] pb-3 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('bookmarks')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer backdrop-blur-md whitespace-nowrap ${
              activeTab === 'bookmarks'
                ? 'border border-white bg-white/15 text-white shadow-sm'
                : 'border border-white/10 bg-black/40 text-[#AAA69C] hover:text-white hover:border-white/30'
            }`}
          >
            <Bookmark className="w-4 h-4 text-white" />
            <span>Saved Spots</span>
            {bookmarksCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono">
                {bookmarksCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer backdrop-blur-md whitespace-nowrap ${
              activeTab === 'reviews'
                ? 'border border-white bg-white/15 text-white shadow-sm'
                : 'border border-white/10 bg-black/40 text-[#AAA69C] hover:text-white hover:border-white/30'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-white" />
            <span>My Reviews</span>
            {reviewsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono">
                {reviewsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('businesses')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer backdrop-blur-md whitespace-nowrap ${
              activeTab === 'businesses'
                ? 'border border-white bg-white/15 text-white shadow-sm'
                : 'border border-white/10 bg-black/40 text-[#AAA69C] hover:text-white hover:border-white/30'
            }`}
          >
            <Building2 className="w-4 h-4 text-white" />
            <span>Businesses</span>
            {ownerPlaces.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono">
                {ownerPlaces.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer backdrop-blur-md whitespace-nowrap ${
              activeTab === 'details'
                ? 'border border-white bg-white/15 text-white shadow-sm'
                : 'border border-white/10 bg-black/40 text-[#AAA69C] hover:text-white hover:border-white/30'
            }`}
          >
            <User className="w-4 h-4 text-white" />
            <span>Account Details</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer backdrop-blur-md whitespace-nowrap ${
              activeTab === 'security'
                ? 'border border-white bg-white/15 text-white shadow-sm'
                : 'border border-white/10 bg-black/40 text-[#AAA69C] hover:text-white hover:border-white/30'
            }`}
          >
            <Shield className="w-4 h-4 text-white" />
            <span>Security</span>
          </button>
        </div>

        {/* Tab 1: Saved Bookmarks */}
        {activeTab === 'bookmarks' && (
          <div className="profile-enter space-y-4">
            <div>
              <h2 className="text-lg font-black text-white font-display">Your Saved Places</h2>
              <p className="text-xs text-[#AAA69C] mt-0.5">
                Places you've pinned for recommendations, visits, and quick directions.
              </p>
            </div>
            <SavedBookmarksList />
          </div>
        )}

        {/* Tab 2: My Reviews */}
        {activeTab === 'reviews' && (
          <div className="profile-enter space-y-5">
            <div>
              <h2 className="text-lg font-black text-white font-display">Reviews Written by You</h2>
              <p className="text-xs text-[#AAA69C] mt-0.5">
                Manage your authentic opinions and ratings for local Ethiopian spots.
              </p>
            </div>

            {reviewActionMsg && (
              <div className="p-3.5 rounded-2xl bg-[#162B1E] border border-[#22C55E]/40 text-white text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-[#22C55E]" />
                <span className="font-semibold">{reviewActionMsg}</span>
              </div>
            )}

            {isLoadingReviews && userReviews.length === 0 ? (
              <div className="bg-[#151518] border border-white/[0.08] rounded-3xl p-10 text-center space-y-3">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
                <p className="text-xs font-mono text-[#AAA69C]">Loading your reviews...</p>
              </div>
            ) : userReviews.length === 0 ? (
              <div className="bg-[#151518] border border-white/[0.08] rounded-3xl p-10 sm:p-12 text-center space-y-4 shadow-xl">
                <div className="w-12 h-12 rounded-full border border-white/10 bg-black/40 flex items-center justify-center text-[#AAA69C] mx-auto">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white font-display">No Reviews Written Yet</h3>
                  <p className="text-xs text-[#AAA69C] max-w-md mx-auto">
                    Visit place detail pages to rate local businesses and share your feedback with Addis explorers.
                  </p>
                </div>
                <Link
                  to="/places"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black font-extrabold text-xs hover:bg-[#F5F2EA] transition active:scale-95 cursor-pointer shadow-lg"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Explore Places to Review</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {userReviews.map((rev) => {
                  const placeName = rev.place?.name || 'Local Spot';
                  const placeSlug = rev.place?.slug || rev.place_id;
                  const starScore = Number(rev.rating) || 5;

                  return (
                    <div
                      key={rev.id}
                      className="bg-[#151518] border border-white/[0.08] rounded-3xl p-6 sm:p-7 space-y-3 shadow-xl hover:border-white/20 transition group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Link
                            to={`/places/${placeSlug}`}
                            className="inline-flex items-center gap-1.5 text-base font-black text-white hover:text-amber-400 transition font-display"
                          >
                            <span>{placeName}</span>
                            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                          </Link>
                          {rev.place?.address && (
                            <p className="text-[11px] text-[#AAA69C] mt-0.5">
                              {rev.place.address}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
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

                          <button
                            type="button"
                            onClick={() => handleDeleteReview(rev.id)}
                            className="p-1.5 rounded-full text-[#AAA69C] hover:text-red-400 hover:bg-red-950/30 transition cursor-pointer"
                            title="Delete this review"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-[#F5F2EA]/90 leading-relaxed pl-1">
                        {rev.comment}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-[#AAA69C] font-mono pt-2 border-t border-white/[0.04]">
                        <span>Written on {formatDate(rev.created_at)}</span>
                        <Link
                          to={`/places/${placeSlug}`}
                          className="text-white/70 hover:text-white transition underline underline-offset-2"
                        >
                          View on place page
                        </Link>
                      </div>
                    </div>
                  );
                })}

                {hasMoreReviews && (
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      disabled={isLoadingReviews}
                      onClick={() => {
                        const next = reviewsPage + 1;
                        setReviewsPage(next);
                        fetchUserReviews(next);
                      }}
                      className="px-6 py-2 rounded-full border border-white/20 bg-black/40 text-xs font-bold text-white hover:border-white transition active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      {isLoadingReviews ? 'Loading More...' : 'Load More Reviews'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab: Business Listings */}
        {activeTab === 'businesses' && (
          <div className="profile-enter space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-white font-display">Your Business Listings</h2>
                <p className="text-xs text-[#AAA69C] mt-0.5">
                  Manage your verified venues, update contact details, or register a new Ethiopian spot.
                </p>
              </div>

              <Link
                to="/profile/businesses/create"
                className="px-4 py-2 rounded-full bg-white text-black text-xs font-bold hover:bg-[#F5F2EA] transition active:scale-95 flex items-center gap-2 self-start sm:self-auto cursor-pointer shadow-md"
              >
                <Plus className="w-3.5 h-3.5 text-black" />
                <span>Register Business</span>
              </Link>
            </div>

            {businessActionMsg && (
              <div className="p-3.5 rounded-2xl bg-[#162B1E] border border-[#22C55E]/40 text-white text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-[#22C55E] shrink-0" />
                <span className="font-semibold">{businessActionMsg}</span>
              </div>
            )}

            {isLoadingOwnerPlaces ? (
              <div className="bg-[#151518] border border-white/[0.08] rounded-3xl p-10 text-center space-y-3">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
                <p className="text-xs font-mono text-[#AAA69C]">Loading your listings...</p>
              </div>
            ) : ownerPlacesError ? (
              <div className="p-8 text-center rounded-3xl border border-red-500/20 bg-red-950/20 space-y-3">
                <p className="text-xs text-red-300">{ownerPlacesError}</p>
                <button
                  type="button"
                  onClick={fetchOwnerPlaces}
                  className="px-4 py-1.5 rounded-full border border-white/20 bg-white/10 text-xs font-semibold text-white hover:bg-white/20 transition cursor-pointer"
                >
                  Retry
                </button>
              </div>
            ) : ownerPlaces.length === 0 ? (
              <div className="bg-[#151518] border border-white/[0.08] rounded-3xl p-10 sm:p-12 text-center space-y-4 shadow-xl">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-white">
                  <Building2 className="w-7 h-7 text-white/80" />
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="text-base font-bold text-white font-display">No Businesses Registered Yet</h3>
                  <p className="text-xs text-[#AAA69C] leading-relaxed">
                    Own or manage a local cafe, cultural restaurant, bakery, or boutique stay in Ethiopia? Register your spot to reach thousands of neighborhood explorers.
                  </p>
                </div>
                <Link
                  to="/profile/businesses/create"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black font-extrabold text-xs hover:bg-[#F5F2EA] transition active:scale-95 cursor-pointer shadow-lg"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register Your First Business</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ownerPlaces.map((place) => {
                  const photosCount = (place.images && place.images.length) || (place.primary_photo_url ? 1 : 0);
                  const dishesCount = place.menu_sections
                    ? place.menu_sections.reduce((acc, s) => acc + (s.items?.length || 0), 0)
                    : 0;

                  return (
                    <div
                      key={place.id}
                      className="p-5 sm:p-6 rounded-2xl bg-[#151518] border border-white/[0.08] hover:border-white/20 transition shadow-xl flex flex-col justify-between space-y-4"
                    >
                      <div>
                        {/* Place Photo Header */}
                        <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-[#18181B] mb-3 border border-white/[0.06]">
                          <img
                            src={getPlacePrimaryPhoto(place)}
                            alt={place.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = PLACE_PLACEHOLDER;
                            }}
                          />
                          <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono border border-white/10 bg-black/75 backdrop-blur-md text-[#AAA69C]">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                place.is_active ? 'bg-emerald-400' : 'bg-zinc-500'
                              }`}
                            />
                            <span>{place.is_active ? 'Live' : 'Draft'}</span>
                          </span>
                        </div>

                        <div className="flex items-start justify-between gap-3">
                          <Link
                            to={`/places/${place.slug}`}
                            className="text-base font-bold text-white hover:text-white/80 transition truncate leading-snug font-display"
                          >
                            {place.name}
                          </Link>
                        </div>

                        {place.description && (
                          <p className="text-xs text-[#AAA69C] mt-2 line-clamp-2 leading-relaxed">
                            {place.description}
                          </p>
                        )}

                        <div className="space-y-1.5 mt-3 pt-3 border-t border-white/[0.06] text-xs text-[#AAA69C]">
                          {place.address && (
                            <div className="flex items-center gap-2 truncate">
                              <MapPin className="w-3.5 h-3.5 text-[#AAA69C]/80 shrink-0" />
                              <span className="truncate">{place.address}</span>
                            </div>
                          )}
                          {place.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5 text-[#AAA69C]/80 shrink-0" />
                              <span>{place.phone}</span>
                            </div>
                          )}
                          {place.website && (
                            <div className="flex items-center gap-2 truncate">
                              <Globe className="w-3.5 h-3.5 text-[#AAA69C]/80 shrink-0" />
                              <a
                                href={place.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#AAA69C] hover:text-white transition underline underline-offset-2 truncate"
                              >
                                {place.website}
                              </a>
                            </div>
                          )}
                          {place.latitude !== null && place.longitude !== null && (
                            <div className="flex items-center gap-2 text-[11px] font-mono text-[#AAA69C]/80">
                              <Navigation className="w-3 h-3 text-[#AAA69C]/60 shrink-0" />
                              <span>
                                GPS: {Number(place.latitude).toFixed(4)}, {Number(place.longitude).toFixed(4)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Quick Stats */}
                        <div className="flex items-center gap-2 pt-3 mt-3 border-t border-white/[0.06]">
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[#AAA69C]">
                            {photosCount} {photosCount === 1 ? 'Photo' : 'Photos'}
                          </span>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[#AAA69C]">
                            {dishesCount} {dishesCount === 1 ? 'Dish' : 'Dishes'}
                          </span>
                        </div>
                      </div>

                      {/* Direct Card Actions */}
                      <div className="pt-3 border-t border-white/[0.06] space-y-2.5">
                        <div className="grid grid-cols-2 gap-2">
                          <Link
                            to={`/profile/businesses/${place.id}`}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-[#F5F2EA] transition active:scale-95 shadow-md"
                          >
                            <Settings className="w-3.5 h-3.5" />
                            <span>Manage</span>
                          </Link>
                          <Link
                            to={`/profile/businesses/${place.id}/edit`}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition active:scale-95"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit Info</span>
                          </Link>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-0.5">
                          <Link
                            to={`/places/${place.slug}`}
                            className="inline-flex items-center gap-1 text-[#AAA69C] hover:text-white transition font-medium text-[11px]"
                          >
                            <span>View Public Listing</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDeleteBusiness(place.id)}
                            className="inline-flex items-center gap-1 text-[#AAA69C] hover:text-red-400 transition cursor-pointer text-[11px]"
                            title="Delete business"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Account Details Form */}
        {activeTab === 'details' && (
          <div className="profile-enter max-w-xl bg-[#151518] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div>
              <h2 className="text-lg font-black text-white font-display mb-1">Personal Profile</h2>
              <p className="text-xs text-[#AAA69C]">
                Manage your public account identity and display name.
              </p>
            </div>

            {successMsg && (
              <div className="p-3.5 rounded-2xl bg-[#162B1E] border border-[#22C55E]/40 text-white text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0 text-[#22C55E]" />
                <span className="font-semibold">{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/30 text-white text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label
                  htmlFor="profile-name"
                  className="block text-[11px] font-bold text-[#AAA69C] uppercase tracking-wider mb-1.5 font-mono"
                >
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#AAA69C]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="profile-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/20 bg-black/45 text-white text-xs sm:text-sm focus:border-white outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="profile-email"
                  className="block text-[11px] font-bold text-[#AAA69C] uppercase tracking-wider mb-1.5 font-mono"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#AAA69C]/60">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="profile-email"
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-[#AAA69C]/60 text-xs sm:text-sm cursor-not-allowed outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#22C55E] font-mono">
                    <Check className="w-3 h-3" />
                    <span>Primary account email verified</span>
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-6 py-2.5 rounded-full bg-white text-black font-extrabold text-xs shadow-lg hover:bg-[#F5F2EA] transition disabled:opacity-50 cursor-pointer active:scale-95"
                >
                  {isUpdating ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 4: Security & Session */}
        {activeTab === 'security' && (
          <div className="profile-enter max-w-xl bg-[#151518] border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div>
              <h2 className="text-lg font-black text-white font-display mb-1">Session &amp; Credentials</h2>
              <p className="text-xs text-[#AAA69C]">
                Manage your active authentication token and device permissions.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-white/[0.08] bg-black/40 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Account Authorization</p>
                <p className="text-[11px] text-[#AAA69C] capitalize">{user?.role || 'Explorer'} Account</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#162B1E] text-[#22C55E] border border-[#22C55E]/30 font-mono">
                Connected
              </span>
            </div>

            <div className="p-4 rounded-2xl border border-white/[0.08] bg-black/40 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Password Recovery</p>
                <p className="text-[11px] text-[#AAA69C]">Change or reset account password</p>
              </div>
              <Link
                to="/forgot-password"
                className="px-3 py-1.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition"
              >
                Reset Password
              </Link>
            </div>

            <div className="pt-4 border-t border-white/[0.08]">
              <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1.5 font-mono">
                Sign Out
              </h3>
              <p className="text-xs text-[#AAA69C] mb-4">
                Clears your Sanctum Bearer token and wipes cached credentials from this browser session.
              </p>
              <button
                type="button"
                onClick={logout}
                className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out of This Device</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
