import React from 'react';
import { Tag, Sparkles, Megaphone, Calendar, Flame, AlertCircle } from 'lucide-react';
import { DealCard } from './DealCard';

const DEAL_FILTERS = [
  { id: 'all', label: 'All Deals', icon: Sparkles },
  { id: 'deal', label: 'Discounts', icon: Flame },
  { id: 'announcement', label: 'Announcements', icon: Megaphone },
  { id: 'event', label: 'Events & Specials', icon: Calendar },
];

/**
 * Responsive Deals Feed List with category filter pills and loading skeletons
 */
export function DealFeedList({
  deals = [],
  loading = false,
  error = null,
  activeType = 'all',
  onTypeChange = () => {},
  page = 1,
  totalPages = 1,
  onPageChange = () => {},
  onUpdateDeal = null,
}) {
  return (
    <div className="space-y-6">
      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {DEAL_FILTERS.map((f) => {
          const Icon = f.icon;
          const isActive = activeType === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onTypeChange(f.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer active:scale-95 ${
                isActive
                  ? 'bg-white text-black shadow-lg shadow-white/10'
                  : 'bg-[#141418] border border-white/10 text-[#AAA69C] hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{f.label}</span>
            </button>
          );
        })}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-2xl bg-[#141418] border border-white/5 p-5 space-y-4 animate-pulse"
            >
              <div className="h-40 rounded-xl bg-white/5" />
              <div className="space-y-2">
                <div className="h-4 w-1/3 rounded bg-white/5" />
                <div className="h-5 w-3/4 rounded bg-white/5" />
                <div className="h-3 w-full rounded bg-white/5" />
              </div>
              <div className="pt-2 flex justify-between">
                <div className="h-8 w-24 rounded-xl bg-white/5" />
                <div className="h-8 w-16 rounded-full bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && deals.length === 0 && !error && (
        <div className="py-16 text-center space-y-4 rounded-2xl bg-[#141418]/50 border border-white/5 p-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-400 flex items-center justify-center mx-auto">
            <Tag className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white font-display">No Active Deals Right Now</h3>
            <p className="text-xs text-[#AAA69C] max-w-sm mx-auto">
              Check back soon or explore other local places to find new exclusive discounts and special offers.
            </p>
          </div>
        </div>
      )}

      {/* Grid of Deal Cards */}
      {!loading && deals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((deal) => (
            <DealCard key={deal.id} post={deal} onUpdate={onUpdateDeal} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6 border-t border-white/[0.08]">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => onPageChange(page - 1)}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white text-xs font-semibold transition cursor-pointer"
          >
            Previous
          </button>
          <span className="text-xs font-mono text-[#AAA69C]">
            Page <strong className="text-white">{page}</strong> of{' '}
            <strong className="text-white">{totalPages}</strong>
          </span>
          <button
            type="button"
            disabled={page >= totalPages || loading}
            onClick={() => onPageChange(page + 1)}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white text-xs font-semibold transition cursor-pointer"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default DealFeedList;
