import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Tag,
  Clock,
  Check,
  Copy,
  ExternalLink,
  Gift,
  Building2,
  Sparkles,
  Ticket,
  Loader2,
  Share2,
} from 'lucide-react';
import { useAuth } from '@/modules/identity';
import { PostLikeButton } from './PostLikeButton';
import socialApi from '../api/socialApi';

/**
 * Modern dark obsidian deal & promotion card
 */
export function DealCard({ post, onUpdate = null }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [isClaiming, setIsClaiming] = useState(false);
  const [claimedCode, setClaimedCode] = useState(
    post.is_claimed_by_user ? post.discount_code : null
  );
  const [isCopied, setIsCopied] = useState(false);
  const [claimError, setClaimError] = useState(null);

  const place = post.place || {};
  const discountText = post.discount_percentage
    ? `${Math.round(post.discount_percentage)}% OFF`
    : post.deal_type === 'event'
    ? 'EVENT'
    : 'SPECIAL DEAL';

  // Format expiration
  const getExpirationLabel = () => {
    if (!post.expires_at) return 'Limited Time';
    const expDate = new Date(post.expires_at);
    const now = new Date();
    const diffHours = Math.round((expDate - now) / (1000 * 60 * 60));

    if (diffHours <= 0) return 'Expired';
    if (diffHours < 24) return `Expires in ${diffHours}h`;
    const diffDays = Math.round(diffHours / 24);
    return `Expires in ${diffDays}d`;
  };

  const handleClaim = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (claimedCode) return;

    setIsClaiming(true);
    setClaimError(null);
    try {
      const res = await socialApi.claimDeal(post.id);
      const claim = res.data?.data || res.data;
      const code = claim.discount_code || post.discount_code || 'CLAIMED';
      setClaimedCode(code);
      if (onUpdate) {
        onUpdate(post.id, {
          is_claimed_by_user: true,
          claims_count: (post.claims_count || 0) + 1,
        });
      }
    } catch (err) {
      console.error('Failed to claim deal', err);
      setClaimError(err.response?.data?.message || 'Could not claim voucher. Try again.');
    } finally {
      setIsClaiming(false);
    }
  };

  const handleCopyCode = (e) => {
    e.stopPropagation();
    if (!claimedCode) return;
    navigator.clipboard.writeText(claimedCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/places/${place.slug || ''}#deals`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: `Check out this deal at ${place.name}: ${post.title}`,
          url: shareUrl,
        });
      } catch {
        // Fallback copy
        navigator.clipboard.writeText(shareUrl);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
    }
  };

  return (
    <div className="group relative rounded-2xl bg-[#141418] border border-white/10 hover:border-white/20 transition-all duration-200 overflow-hidden flex flex-col shadow-xl">
      {/* Top Banner Image or Stylish Gradient Header */}
      {post.image_url ? (
        <div className="relative h-44 w-full overflow-hidden bg-black/40">
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141418] via-transparent to-black/40" />

          {/* Discount Badge */}
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/90 text-black text-xs font-bold tracking-wide shadow-md backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{discountText}</span>
            </span>
          </div>

          {/* Expiration Tag */}
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 border border-white/15 text-white/90 text-[11px] font-mono backdrop-blur-md">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>{getExpirationLabel()}</span>
            </span>
          </div>
        </div>
      ) : (
        <div className="relative p-5 pb-0 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold tracking-wide">
            <Tag className="w-3.5 h-3.5" />
            <span>{discountText}</span>
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[#AAA69C] text-[11px] font-mono">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>{getExpirationLabel()}</span>
          </span>
        </div>
      )}

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Business attribution */}
          {place.name && (
            <Link
              to={`/places/${place.slug || place.id}`}
              className="inline-flex items-center gap-1.5 text-xs text-[#AAA69C] hover:text-white transition group/biz"
            >
              <Building2 className="w-3.5 h-3.5 text-amber-400/80" />
              <span className="font-semibold underline-offset-2 group-hover/biz:underline truncate max-w-[200px]">
                {place.name}
              </span>
              <ExternalLink className="w-2.5 h-2.5 opacity-50" />
            </Link>
          )}

          {/* Title */}
          <h3 className="text-base font-bold text-white font-display line-clamp-1 group-hover:text-amber-300/90 transition-colors">
            {post.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-[#AAA69C] line-clamp-2 leading-relaxed">
            {post.content}
          </p>
        </div>

        {/* Claim status & limits */}
        {post.max_claims && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#AAA69C]">
              <span>Vouchers remaining:</span>
              <span className="font-bold text-white">
                {Math.max(0, post.max_claims - (post.claims_count || 0))} / {post.max_claims}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round(((post.claims_count || 0) / post.max_claims) * 100)
                  )}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Claim Error */}
        {claimError && (
          <p className="text-[11px] text-rose-400 font-medium">{claimError}</p>
        )}

        {/* Actions & Code Claim Bar */}
        <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between gap-2">
          {/* Claim / Code Button */}
          {claimedCode ? (
            <button
              type="button"
              onClick={handleCopyCode}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold transition cursor-pointer active:scale-95"
              title="Click to copy voucher code"
            >
              <Ticket className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isCopied ? 'Copied Code!' : claimedCode}</span>
              {isCopied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3 opacity-60" />
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleClaim}
              disabled={isClaiming || (post.max_claims && post.claims_count >= post.max_claims)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white text-black hover:bg-[#F5F2EA] active:scale-95 disabled:opacity-40 font-bold text-xs transition cursor-pointer shadow-md"
            >
              {isClaiming ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Claiming...</span>
                </>
              ) : post.max_claims && post.claims_count >= post.max_claims ? (
                <span>Sold Out</span>
              ) : (
                <>
                  <Gift className="w-3.5 h-3.5" />
                  <span>Claim Voucher</span>
                </>
              )}
            </button>
          )}

          {/* Social Interactions: Like & Share */}
          <div className="flex items-center gap-1 shrink-0">
            <PostLikeButton
              postId={post.id}
              initialLikes={post.likes_count || 0}
              initialIsLiked={Boolean(post.is_liked_by_user)}
              onStateChange={(state) => {
                if (onUpdate) onUpdate(post.id, state);
              }}
            />

            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-[#AAA69C] hover:text-white transition cursor-pointer active:scale-90"
              title="Share deal"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DealCard;
