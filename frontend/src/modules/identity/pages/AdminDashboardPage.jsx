import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  QrCode,
  ExternalLink,
  Search,
  RefreshCw,
  Eye,
  X,
  MapPin,
  Phone,
  Calendar,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  RotateCw,
  ZoomIn,
  ZoomOut,
  ChevronRight,
  User,
  Building,
} from 'lucide-react';
import placesApi from '@/modules/places/api/placesApi';
import { useAuth } from '@/modules/identity';

export function AdminDashboardPage() {
  const { user } = useAuth();

  // State
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'verified' | 'rejected' | 'all'
  const [places, setPlaces] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, verified: 0, rejected: 0, total: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorBanner, setErrorBanner] = useState(null);
  const [toast, setToast] = useState(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Rejection Dialog State
  const [rejectingPlace, setRejectingPlace] = useState(null);
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [rejectionError, setRejectionError] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Approve Dialog State (production custom modal instead of window.confirm)
  const [approvingPlace, setApprovingPlace] = useState(null);

  // Fullscreen Document Lightbox with zoom & rotate
  const [lightbox, setLightbox] = useState(null); // { url, title, type }
  const [lightboxRotation, setLightboxRotation] = useState(0);
  const [lightboxScale, setLightboxScale] = useState(1);

  // Copy TIN feedback
  const [copiedId, setCopiedId] = useState(null);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (lightbox) setLightbox(null);
        if (rejectingPlace) setRejectingPlace(null);
        if (approvingPlace) setApprovingPlace(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightbox, rejectingPlace, approvingPlace]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchVerifications = useCallback(async (status = activeTab, page = 1) => {
    setIsLoading(true);
    setErrorBanner(null);
    try {
      const res = await placesApi.getPendingVerifications(status, page);
      setPlaces(res.data || []);
      if (res.counts) {
        setCounts(res.counts);
      }
      if (res.meta) {
        setCurrentPage(res.meta.current_page || 1);
        setTotalPages(res.meta.last_page || 1);
      }
    } catch (err) {
      console.error('Failed to load pending verifications', err);
      setErrorBanner(err?.response?.data?.message || 'Failed to connect to verification service.');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchVerifications(activeTab, 1);
  }, [activeTab, fetchVerifications]);

  // Handle Approve
  const handleConfirmApprove = async () => {
    if (!approvingPlace) return;

    setIsSubmittingReview(true);
    setErrorBanner(null);
    try {
      await placesApi.reviewVerification(approvingPlace.id, {
        decision: 'approved',
        notes: 'Verified by administrator.',
      });
      showToast(`"${approvingPlace.name}" verified successfully.`);
      setApprovingPlace(null);
      await fetchVerifications(activeTab, currentPage);
    } catch (err) {
      setErrorBanner(err?.response?.data?.message || 'Approval failed. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Submit Rejection
  const handleSubmitReject = async (e) => {
    e.preventDefault();
    if (!rejectingPlace) return;

    if (!rejectionNotes.trim()) {
      setRejectionError('A clear explanation is required so the business owner can resubmit.');
      return;
    }

    setIsSubmittingReview(true);
    setRejectionError('');
    try {
      await placesApi.reviewVerification(rejectingPlace.id, {
        decision: 'rejected',
        notes: rejectionNotes.trim(),
      });
      showToast(`Verification rejected for "${rejectingPlace.name}".`, 'info');
      setRejectingPlace(null);
      await fetchVerifications(activeTab, currentPage);
    } catch (err) {
      setRejectionError(err?.response?.data?.message || 'Failed to submit rejection.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const copyToClipboard = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openLightbox = (url, title, type = 'document') => {
    setLightboxRotation(0);
    setLightboxScale(1);
    setLightbox({ url, title, type });
  };

  // Client-side search filter
  const filteredPlaces = useMemo(() => {
    if (!searchQuery.trim()) return places;
    const q = searchQuery.toLowerCase().trim();
    return places.filter((p) => {
      return (
        p.name?.toLowerCase().includes(q) ||
        p.tax_id?.toLowerCase().includes(q) ||
        p.manager_name?.toLowerCase().includes(q) ||
        p.fayda_fin?.toLowerCase().includes(q) ||
        p.owner?.name?.toLowerCase().includes(q) ||
        p.owner?.email?.toLowerCase().includes(q)
      );
    });
  }, [places, searchQuery]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#EDEAE2] pb-24 font-sans selection:bg-white/20">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#141416]/95 border border-white/15 text-white text-xs font-medium flex items-center gap-2.5 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-white/[0.08] bg-[#0E0E10]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white font-display">
                  Business Verifications
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-white/[0.06] text-white/70 border border-white/10">
                  Moderation
                </span>
              </div>
              <p className="text-xs text-[#9E9B93] mt-0.5">
                Review submitted Trade Licenses (የንግድ ፈቃድ) and Fayda National ID QR credentials.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <a
                href="https://id.gov.et/scanId"
                target="_blank"
                rel="noopener noreferrer"
                title="Open Ethiopia National ID official camera QR scanner"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold transition active:scale-95"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>id.gov.et Scanner</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>

              <button
                type="button"
                onClick={() => fetchVerifications(activeTab, currentPage)}
                disabled={isLoading}
                title="Refresh verification queue"
                className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/80 hover:text-white transition active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* Metrics Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            <button
              type="button"
              onClick={() => setActiveTab('pending')}
              className={`p-3 rounded-xl border text-left transition ${
                activeTab === 'pending'
                  ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
                  : 'bg-[#121215] border-white/[0.06] hover:border-white/15'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] text-[#9E9B93]">
                <span>Pending Review</span>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              </div>
              <p className="text-xl font-bold font-mono text-white mt-1">
                {counts.pending}
              </p>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('verified')}
              className={`p-3 rounded-xl border text-left transition ${
                activeTab === 'verified'
                  ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm'
                  : 'bg-[#121215] border-white/[0.06] hover:border-white/15'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] text-[#9E9B93]">
                <span>Verified</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <p className="text-xl font-bold font-mono text-white mt-1">
                {counts.verified}
              </p>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('rejected')}
              className={`p-3 rounded-xl border text-left transition ${
                activeTab === 'rejected'
                  ? 'bg-rose-500/10 border-rose-500/40 shadow-sm'
                  : 'bg-[#121215] border-white/[0.06] hover:border-white/15'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] text-[#9E9B93]">
                <span>Rejected</span>
                <span className="w-2 h-2 rounded-full bg-rose-400" />
              </div>
              <p className="text-xl font-bold font-mono text-white mt-1">
                {counts.rejected}
              </p>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`p-3 rounded-xl border text-left transition ${
                activeTab === 'all'
                  ? 'bg-white/[0.08] border-white/30 shadow-sm'
                  : 'bg-[#121215] border-white/[0.06] hover:border-white/15'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] text-[#9E9B93]">
                <span>Total Applications</span>
                <span className="w-2 h-2 rounded-full bg-white/40" />
              </div>
              <p className="text-xl font-bold font-mono text-white mt-1">
                {counts.total}
              </p>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Error Alert */}
        {errorBanner && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorBanner(null)}
              className="text-rose-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Toolbar: Search & Tab filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="inline-flex items-center p-1 rounded-xl bg-[#121215] border border-white/[0.06] text-xs">
            {[
              { id: 'pending', label: 'Pending', count: counts.pending },
              { id: 'verified', label: 'Verified', count: counts.verified },
              { id: 'rejected', label: 'Rejected', count: counts.rejected },
              { id: 'all', label: 'All', count: counts.total },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white/10 text-white shadow-sm font-semibold'
                    : 'text-[#9E9B93] hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 text-white/80 font-mono">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-[#9E9B93] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by name, TIN, or manager..."
              className="w-full h-9 pl-9 pr-8 rounded-xl bg-[#121215] border border-white/[0.08] text-xs text-white placeholder:text-[#9E9B93]/60 focus:outline-none focus:border-white/30 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9E9B93] hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        {isLoading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center text-[#9E9B93]">
            <Loader2 className="w-7 h-7 animate-spin text-emerald-400 mb-2.5" />
            <p className="text-xs">Loading verifications...</p>
          </div>
        ) : filteredPlaces.length === 0 ? (
          <div className="py-16 px-4 rounded-2xl bg-[#121215] border border-white/[0.06] text-center max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#9E9B93] mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400/80" />
            </div>
            <h3 className="text-sm font-semibold text-white">Queue is clear</h3>
            <p className="text-xs text-[#9E9B93] mt-1">
              No business records found matching the current &ldquo;{activeTab}&rdquo; filter.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPlaces.map((place) => {
              const isPending = place.verification_status === 'pending';
              const isVerified = place.verification_status === 'verified';
              const isRejected = place.verification_status === 'rejected';

              return (
                <article
                  key={place.id}
                  className="rounded-2xl bg-[#121215] border border-white/[0.08] hover:border-white/20 transition p-5 space-y-4"
                >
                  {/* Top Bar: Place Identity & Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3.5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <Link
                          to={`/places/${place.slug}`}
                          target="_blank"
                          className="text-base font-bold text-white hover:text-emerald-400 transition flex items-center gap-1.5"
                        >
                          <span>{place.name}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-[#9E9B93]" />
                        </Link>

                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            <Clock className="w-3 h-3" />
                            <span>Pending Review</span>
                          </span>
                        )}
                        {isVerified && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Verified</span>
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                            <XCircle className="w-3 h-3" />
                            <span>Rejected</span>
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#9E9B93]">
                        {place.address && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#9E9B93]" />
                            <span>{place.address}</span>
                          </span>
                        )}
                        {place.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-[#9E9B93]" />
                            <span>{place.phone}</span>
                          </span>
                        )}
                        {place.submitted_at && (
                          <span className="flex items-center gap-1 text-[#9E9B93]/70 font-mono">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(place.submitted_at).toLocaleDateString()}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Submitter Info */}
                    {place.owner && (
                      <div className="text-left sm:text-right text-xs">
                        <span className="text-[10px] text-[#9E9B93] block font-mono">Applicant</span>
                        <span className="font-medium text-white">{place.owner.name}</span>
                        <span className="text-[11px] text-[#9E9B93] block font-mono">{place.owner.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Identification Credentials Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* TIN */}
                    <div className="p-3 rounded-xl bg-black/40 border border-white/[0.04]">
                      <div className="flex items-center justify-between text-[10px] text-[#9E9B93] font-mono">
                        <span>10-DIGIT TIN</span>
                        {place.tax_id && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(place.tax_id, `tin-${place.id}`)}
                            title="Copy TIN"
                            className="hover:text-white transition flex items-center gap-1 text-[10px]"
                          >
                            {copiedId === `tin-${place.id}` ? (
                              <span className="text-emerald-400 flex items-center gap-0.5">
                                <Check className="w-3 h-3" /> Copied
                              </span>
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                      <p className="text-sm font-mono font-bold text-white mt-1 tracking-wider">
                        {place.tax_id || <span className="text-white/30 font-sans text-xs">Not provided</span>}
                      </p>
                    </div>

                    {/* General Manager Name */}
                    <div className="p-3 rounded-xl bg-black/40 border border-white/[0.04]">
                      <span className="text-[10px] text-[#9E9B93] font-mono block">GENERAL MANAGER</span>
                      <p className="text-xs font-semibold text-white mt-1 truncate" title={place.manager_name}>
                        {place.manager_name || <span className="text-white/30 text-xs">Not provided</span>}
                      </p>
                    </div>

                    {/* Fayda FIN */}
                    <div className="p-3 rounded-xl bg-black/40 border border-white/[0.04]">
                      <span className="text-[10px] text-[#9E9B93] font-mono block">FAYDA FIN / FAN</span>
                      <p className="text-xs font-mono font-semibold text-white mt-1">
                        {place.fayda_fin || <span className="text-white/30 font-sans text-xs">Embedded in QR</span>}
                      </p>
                    </div>
                  </div>

                  {/* Rejection Notes Banner (if previously rejected) */}
                  {place.verification_notes && isRejected && (
                    <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/20 text-xs text-rose-300">
                      <span className="font-semibold text-rose-200">Rejection note sent to owner: </span>
                      {place.verification_notes}
                    </div>
                  )}

                  {/* Documents Side-by-Side Review */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Document 1: Trade License */}
                    <div className="p-3 rounded-xl bg-black/30 border border-white/[0.06] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-white flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Trade License</span>
                        </span>
                        {place.trade_license_url && (
                          <button
                            type="button"
                            onClick={() => openLightbox(place.trade_license_url, `Trade License — ${place.name}`, 'license')}
                            className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium transition cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Inspect</span>
                          </button>
                        )}
                      </div>

                      {place.trade_license_url ? (
                        <div
                          onClick={() => openLightbox(place.trade_license_url, `Trade License — ${place.name}`, 'license')}
                          className="h-28 rounded-lg bg-black/60 border border-white/[0.06] overflow-hidden cursor-pointer group relative flex items-center justify-center"
                        >
                          <img
                            src={place.trade_license_url}
                            alt="Trade License"
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-90 group-hover:opacity-100"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-xs font-semibold text-white gap-1.5">
                            <Eye className="w-4 h-4 text-emerald-400" />
                            <span>Click to Inspect Fullscreen</span>
                          </div>
                        </div>
                      ) : (
                        <div className="h-28 rounded-lg bg-white/[0.02] border border-dashed border-white/10 flex items-center justify-center text-xs text-[#9E9B93]">
                          No document provided
                        </div>
                      )}
                    </div>

                    {/* Document 2: Fayda ID Card & QR */}
                    <div className="p-3 rounded-xl bg-black/30 border border-white/[0.06] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-white flex items-center gap-1.5">
                          <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Fayda National ID &amp; QR</span>
                        </span>
                        {place.fayda_document_url && (
                          <button
                            type="button"
                            onClick={() => openLightbox(place.fayda_document_url, `Fayda National ID — ${place.name}`, 'fayda')}
                            className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium transition cursor-pointer"
                          >
                            <QrCode className="w-3 h-3" />
                            <span>Inspect QR</span>
                          </button>
                        )}
                      </div>

                      {place.fayda_document_url ? (
                        <div
                          onClick={() => openLightbox(place.fayda_document_url, `Fayda National ID — ${place.name}`, 'fayda')}
                          className="h-28 rounded-lg bg-black/60 border border-white/[0.06] overflow-hidden cursor-pointer group relative flex items-center justify-center"
                        >
                          <img
                            src={place.fayda_document_url}
                            alt="Fayda ID"
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-90 group-hover:opacity-100"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-xs font-semibold text-white gap-1.5">
                            <QrCode className="w-4 h-4 text-emerald-400" />
                            <span>Click to Zoom QR Code</span>
                          </div>
                        </div>
                      ) : (
                        <div className="h-28 rounded-lg bg-white/[0.02] border border-dashed border-white/10 flex items-center justify-center text-xs text-[#9E9B93]">
                          No Fayda ID provided
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Decision Action Bar */}
                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between flex-wrap gap-3">
                    <a
                      href="https://id.gov.et/scanId"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#9E9B93] hover:text-white transition"
                    >
                      <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Scan on id.gov.et</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>

                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setRejectingPlace(place);
                          setRejectionNotes('');
                          setRejectionError('');
                        }}
                        disabled={isSubmittingReview}
                        className="px-3.5 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold transition active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        Reject
                      </button>

                      <button
                        type="button"
                        onClick={() => setApprovingPlace(place)}
                        disabled={isSubmittingReview || isVerified}
                        className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>{isVerified ? 'Verified' : 'Approve'}</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-white/[0.08] text-xs text-[#9E9B93]">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1 || isLoading}
                onClick={() => fetchVerifications(activeTab, currentPage - 1)}
                className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/10 disabled:opacity-30 text-white transition cursor-pointer"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages || isLoading}
                onClick={() => fetchVerifications(activeTab, currentPage + 1)}
                className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/10 disabled:opacity-30 text-white transition cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Approve Confirmation Dialog (Production custom modal) */}
      {approvingPlace && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setApprovingPlace(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-[#141416] border border-white/15 p-5 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Approve Business Verification?</h3>
                <p className="text-xs text-[#9E9B93] mt-0.5">
                  Confirm granting verified badge to <strong className="text-white">{approvingPlace.name}</strong>.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] text-xs space-y-1.5">
              <div className="flex justify-between text-[#9E9B93]">
                <span>TIN:</span>
                <span className="font-mono text-white">{approvingPlace.tax_id || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-[#9E9B93]">
                <span>General Manager:</span>
                <span className="text-white font-medium">{approvingPlace.manager_name || 'N/A'}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setApprovingPlace(null)}
                className="px-3.5 py-2 rounded-lg border border-white/10 text-xs text-[#9E9B93] hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmApprove}
                disabled={isSubmittingReview}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition flex items-center gap-1.5 shadow-md active:scale-95"
              >
                {isSubmittingReview && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Approval</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Dialog */}
      {rejectingPlace && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setRejectingPlace(null)}
        >
          <form
            onSubmit={handleSubmitReject}
            className="w-full max-w-lg rounded-2xl bg-[#141416] border border-white/15 p-5 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>Reject Verification — {rejectingPlace.name}</span>
              </h3>
              <button
                type="button"
                onClick={() => setRejectingPlace(null)}
                className="text-[#9E9B93] hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#9E9B93]">
              Specify the reason for rejection. This feedback is sent directly to the business owner so they can correct their documents.
            </p>

            {/* Quick Reason Chips */}
            <div className="flex flex-wrap gap-1.5">
              {[
                'Trade license photo is blurry or unreadable',
                'Fayda digital QR code cannot be scanned',
                'General Manager name does not match trade license',
                'Invalid or unverified 10-digit TIN',
                'Trade license appears expired',
              ].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setRejectionNotes(preset);
                    setRejectionError('');
                  }}
                  className="px-2.5 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-[11px] text-[#9E9B93] hover:text-white transition"
                >
                  {preset}
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              <textarea
                rows={3}
                required
                value={rejectionNotes}
                onChange={(e) => {
                  setRejectionNotes(e.target.value);
                  if (rejectionError) setRejectionError('');
                }}
                placeholder="Enter detailed feedback for the business owner..."
                className="w-full rounded-xl bg-black/50 border border-white/15 p-3 text-xs text-white placeholder:text-[#9E9B93]/50 focus:border-rose-400 focus:outline-none transition"
              />
              {rejectionError && (
                <p className="text-[11px] text-rose-400 font-medium">{rejectionError}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setRejectingPlace(null)}
                className="px-3.5 py-2 rounded-lg border border-white/10 text-xs text-[#9E9B93] hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingReview || !rejectionNotes.trim()}
                className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-400 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md active:scale-95"
              >
                {isSubmittingReview && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Reject Submission</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Document Inspection Lightbox with Rotate & Zoom */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6 animate-in fade-in"
          onClick={() => setLightbox(null)}
        >
          {/* Lightbox Controls Top Bar */}
          <div
            className="flex items-center justify-between max-w-6xl w-full mx-auto pb-3 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold truncate max-w-md">{lightbox.title}</span>
              <span className="text-[11px] text-[#9E9B93] hidden sm:inline">
                (Press Esc to exit)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Rotate Tool */}
              <button
                type="button"
                onClick={() => setLightboxRotation((prev) => (prev + 90) % 360)}
                title="Rotate 90 degrees"
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs flex items-center gap-1 transition"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Rotate</span>
              </button>

              {/* Zoom In */}
              <button
                type="button"
                onClick={() => setLightboxScale((prev) => Math.min(prev + 0.25, 2.5))}
                title="Zoom in"
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              {/* Zoom Out */}
              <button
                type="button"
                onClick={() => setLightboxScale((prev) => Math.max(prev - 0.25, 0.75))}
                title="Zoom out"
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              {/* Open Scanner / Raw */}
              <a
                href={lightbox.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs flex items-center gap-1 transition"
              >
                <span>Raw</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              {/* Close */}
              <button
                type="button"
                onClick={() => setLightbox(null)}
                className="p-2 rounded-lg bg-white/15 hover:bg-white/25 text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Lightbox Center Image Canvas */}
          <div
            className="flex-1 flex items-center justify-center overflow-hidden my-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="transition-transform duration-200 flex items-center justify-center max-w-5xl max-h-[78vh]"
              style={{
                transform: `rotate(${lightboxRotation}deg) scale(${lightboxScale})`,
              }}
            >
              <img
                src={lightbox.url}
                alt={lightbox.title}
                className="max-h-[76vh] max-w-[90vw] object-contain rounded-lg shadow-2xl border border-white/10"
              />
            </div>
          </div>

          {/* Lightbox Footer Tip */}
          <div
            className="max-w-6xl w-full mx-auto pt-2 flex items-center justify-between text-xs text-[#9E9B93]"
            onClick={(e) => e.stopPropagation()}
          >
            <p>
              Tip: You can scan the Fayda digital QR code directly from this screen using{' '}
              <a
                href="https://id.gov.et/scanId"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline inline-flex items-center gap-0.5 font-medium"
              >
                id.gov.et/scanId
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
              .
            </p>
            <span className="text-[11px] font-mono">
              Rotation: {lightboxRotation}° | Zoom: {Math.round(lightboxScale * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboardPage;
