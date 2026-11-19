import React from 'react';
import { ShieldCheck, ShieldAlert, Clock, Building2, CheckCircle2, ChevronRight } from 'lucide-react';

export function ClaimBusinessCard({ place, onOpenClaimModal }) {
  const isVerified = Boolean(place?.is_verified);
  const isPending = place?.is_claim_pending || place?.verification_status === 'pending';
  const isClaimedByMe = Boolean(place?.is_claimed_by_me);

  // 1. Officially Verified Business
  if (isVerified) {
    return (
      <div className="rounded-3xl p-6 sm:p-7 border border-emerald-500/20 bg-emerald-500/[0.04] backdrop-blur-md space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-display">Verified Business Listing</h3>
            <p className="text-[11px] text-emerald-300/80">Government Registry Confirmed</p>
          </div>
        </div>
        <p className="text-xs text-[#AAA69C] leading-relaxed">
          This venue has been verified through official Ethiopian Trade License records and is managed directly by its authorized leadership.
        </p>
      </div>
    );
  }

  // 2. Pending Verification / Claim Review
  if (isPending) {
    return (
      <div className="rounded-3xl p-6 sm:p-7 border border-amber-500/25 bg-amber-500/[0.04] backdrop-blur-md space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-display">Claim Under Review</h3>
            <p className="text-[11px] text-amber-400/90 font-medium">Compliance Verification in Progress</p>
          </div>
        </div>
        <p className="text-xs text-[#AAA69C] leading-relaxed">
          {isClaimedByMe ? (
            <span className="text-amber-200">
              Your legal ownership application has been received and is currently being cross-referenced with Ministry records.
            </span>
          ) : (
            'An ownership claim for this spot has been submitted and is currently being audited by our verification team to prevent duplicate or unauthorized changes.'
          )}
        </p>
      </div>
    );
  }

  // 3. Unclaimed Spot — Call to Action
  return (
    <div className="rounded-3xl p-6 sm:p-7 border border-white/10 bg-gradient-to-b from-[#18181B] to-[#121214] backdrop-blur-md space-y-4 shadow-xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white font-display">Own or manage this spot?</h3>
          <p className="text-[11px] text-[#AAA69C]">Claim ownership &amp; get verified</p>
        </div>
      </div>

      <p className="text-xs text-[#AAA69C] leading-relaxed">
        Claim <strong className="text-white">{place?.name}</strong> to update operating hours, upload menus, respond to customer reviews, and receive your official Ma'ed verified badge.
      </p>

      <button
        type="button"
        onClick={onOpenClaimModal}
        className="w-full py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 group cursor-pointer"
      >
        <ShieldCheck className="w-4 h-4" />
        <span>Claim This Business</span>
        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
      </button>

      <p className="text-[10px] text-[#AAA69C]/70 text-center flex items-center justify-center gap-1">
        <ShieldAlert className="w-3 h-3 text-amber-400/80 shrink-0" />
        <span>Trade License or TIN verification required</span>
      </p>
    </div>
  );
}

export default ClaimBusinessCard;
