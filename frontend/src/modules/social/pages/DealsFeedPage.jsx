import React, { useState } from 'react';
import { Tag, Sparkles, Flame, Search, Gift, ShieldCheck } from 'lucide-react';
import { useDealFeed } from '../hooks/useDealFeed';
import { DealFeedList } from '../components/DealFeedList';

/**
 * Public Deals Discovery Feed Page (`/deals`)
 */
export function DealsFeedPage() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const {
    deals,
    updateDeal,
    loading,
    error,
    page,
    totalPages,
    dealType,
    setDealType,
    goToPage,
  } = useDealFeed();

  // Filter deals by keyword if typed
  const filteredDeals = deals.filter((d) => {
    if (!searchKeyword.trim()) return true;
    const q = searchKeyword.toLowerCase();
    const titleMatch = d.title?.toLowerCase().includes(q);
    const contentMatch = d.content?.toLowerCase().includes(q);
    const placeMatch = d.place?.name?.toLowerCase().includes(q);
    return titleMatch || contentMatch || placeMatch;
  });

  return (
    <div className="min-h-screen bg-[#0D0D0C] text-[#F5F2EA] pb-24">
      {/* Hero Header */}
      <div className="relative border-b border-white/[0.08] bg-[#121215] overflow-hidden py-12 sm:py-16">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
            <Flame className="w-3.5 h-3.5" />
            <span>Limited-Time Local Offers</span>
          </div>

          <div className="max-w-2xl space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
              Exclusive Deals &amp; Vouchers
            </h1>
            <p className="text-sm sm:text-base text-[#AAA69C] leading-relaxed">
              Claim limited-time promotions, happy hour discounts, and special coupons directly from authentic Ethiopian businesses.
            </p>
          </div>

          {/* Quick Search Input */}
          <div className="max-w-md relative">
            <Search className="w-4 h-4 text-[#AAA69C] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Search deals, dishes, or venues..."
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-black/60 border border-white/10 text-white text-xs placeholder:text-[#AAA69C]/50 focus:border-white/30 focus:outline-none transition shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <DealFeedList
          deals={filteredDeals}
          loading={loading}
          error={error}
          activeType={dealType}
          onTypeChange={setDealType}
          page={page}
          totalPages={totalPages}
          onPageChange={goToPage}
          onUpdateDeal={updateDeal}
        />
      </div>
    </div>
  );
}

export default DealsFeedPage;
