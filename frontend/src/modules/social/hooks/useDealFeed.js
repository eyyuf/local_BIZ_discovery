import { useState, useEffect, useCallback } from 'react';
import socialApi from '../api/socialApi';

/**
 * Hook to fetch and manage paginated deals feed
 */
export function useDealFeed(initialParams = {}) {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dealType, setDealType] = useState(initialParams.deal_type || 'all');

  const fetchDeals = useCallback(async (targetPage = 1, currentType = dealType) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: targetPage,
        per_page: 12,
      };
      if (currentType && currentType !== 'all') {
        params.deal_type = currentType;
      }

      const res = await socialApi.fetchDeals(params);
      const items = res.data?.data || res.data || [];
      setDeals(items);
      setPage(res.data?.current_page || targetPage);
      setTotalPages(res.data?.last_page || 1);
    } catch (err) {
      console.error('Failed to load deals feed:', err);
      setError(err.response?.data?.message || 'Could not load deals feed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [dealType]);

  useEffect(() => {
    fetchDeals(1, dealType);
  }, [fetchDeals, dealType]);

  const updateDeal = useCallback((dealId, updater) => {
    setDeals((prev) =>
      prev.map((deal) => {
        if (deal.id === dealId) {
          return typeof updater === 'function' ? updater(deal) : { ...deal, ...updater };
        }
        return deal;
      })
    );
  }, []);

  return {
    deals,
    setDeals,
    updateDeal,
    loading,
    error,
    page,
    totalPages,
    dealType,
    setDealType,
    refetch: () => fetchDeals(page, dealType),
    goToPage: (p) => fetchDeals(p, dealType),
  };
}

export default useDealFeed;
