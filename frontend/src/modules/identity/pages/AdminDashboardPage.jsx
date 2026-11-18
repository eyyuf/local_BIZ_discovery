import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  QrCode,
  ExternalLink,
  Search,
  RefreshCw,
  Eye,
  X,
  Building,
  User,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';
import placesApi from '@/modules/places/api/placesApi';
import { useAuth } from '@/modules/identity';

export function AdminDashboardPage() {
  const { user } = useAuth();

  // State
  const [activeStatusFilter, setActiveStatusFilter] = useState('pending');
  const [places, setPlaces] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, verified: 0, rejected: 0, total: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [actionError, setActionError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Search filter inside list
  const [searchQuery, setSearchQuery] = useState('');

  // Rejection Dialog State
  const [rejectingPlace, setRejectingPlace] = useState(null);
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Fullscreen Document Lightbox
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const [lightboxTitle, setLightboxTitle] = useState('');

  // Copy TIN helper
  const [copiedTinId, setCopiedTinId] = useState(null);

  const fetchVerifications = useCallback(async (status = activeStatusFilter, page = 1) => {
    setIsLoading(true);
    setActionError(null);
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
      setActionError(err?.response?.data?.message || 'Failed to load verification queue.');
    } finally {
      setIsLoading(false);
    }
  }, [activeStatusFilter]);

  useEffect(() => {
    fetchVerifications(activeStatusFilter, 1);
  }, [activeStatusFilter, fetchVerifications]);

  // Handle Approve
  const handleApprove = async (place) => {
    if (!window.confirm(`Are you sure you want to approve "${place.name}" as an officially verified Ethiopian business?`)) {
      return;
    }

    setIsSubmittingReview(true);
    setActionError(null);
    try {
      await placesApi.reviewVerification(place.id, {
        decision: 'approved',
        notes: 'Approved by administrator after verifying Trade License and Fayda ID.',
      });
      setToastMessage(`✓ "${place.name}" approved and verified!`);
      setTimeout(() => setToastMessage(null), 4000);
      await fetchVerifications(activeStatusFilter, currentPage);
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Failed to approve verification.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Open Reject Modal
  const handleOpenReject = (place) => {
    setRejectingPlace(place);
    setRejectionNotes('');
  };

  // Submit Rejection
  const handleSubmitReject = async (e) => {
    e.preventDefault();
    if (!rejectingPlace) return;

    if (!rejectionNotes.trim()) {
      alert('Please provide a reason for rejection so the owner can correct their submission.');
      return;
    }

    setIsSubmittingReview(true);
    setActionError(null);
    try {
      await placesApi.reviewVerification(rejectingPlace.id, {
        decision: 'rejected',
        notes: rejectionNotes.trim(),
      });
      setToastMessage(`Verification for "${rejectingPlace.name}" was rejected.`);
      setTimeout(() => setToastMessage(null), 4000);
      setRejectingPlace(null);
      await fetchVerifications(activeStatusFilter, currentPage);
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Failed to reject verification.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedTinId(id);
    setTimeout(() => setCopiedTinId(null), 2000);
  };

  // Client-side search filter
  const filteredPlaces = places.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.tax_id?.toLowerCase().includes(q) ||
      p.manager_name?.toLowerCase().includes(q) ||
      p.owner?.name?.toLowerCase().includes(q) ||
      p.owner?.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#0D0D0C] text-[#F5F2EA] pb-24">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-5 py-3 rounded-full bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-[#121215] border-b border-white/[0.08] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Control Console</span>
                </span>
                <span className="text-xs text-[#AAA69C]">
                  Logged in as <strong className="text-white">{user?.name || user?.email}</strong>
                </span>
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight font-display">
                Business Legitimacy Verification Queue
              </h1>
              <p className="text-sm text-[#AAA69C] mt-1 max-w-2xl">
                Review submitted Trade Licenses (የንግድ ፈቃድ) and Fayda Digital IDs (ፋይዳ QR) to approve or reject verified local business badges.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fetchVerifications(activeStatusFilter, currentPage)}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-semibold transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
                <span>Refresh Queue</span>
              </button>

              <a
                href="https://fayda.et"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Fayda.et Validator</span>
              </a>
            </div>
          </div>

          {/* Quick Metrics & Filter Tabs Bar */}
          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-white/[0.08] pt-6">
            <button
              type="button"
              onClick={() => setActiveStatusFilter('pending')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeStatusFilter === 'pending'
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-950/40'
                  : 'bg-white/5 border border-white/10 text-[#AAA69C] hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pending Review</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] ${
                activeStatusFilter === 'pending' ? 'bg-black/20 text-black' : 'bg-white/10 text-white'
              }`}>
                {counts.pending}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStatusFilter('verified')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeStatusFilter === 'verified'
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-950/40'
                  : 'bg-white/5 border border-white/10 text-[#AAA69C] hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified Places</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] ${
                activeStatusFilter === 'verified' ? 'bg-black/20 text-black' : 'bg-white/10 text-white'
              }`}>
                {counts.verified}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStatusFilter('rejected')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeStatusFilter === 'rejected'
                  ? 'bg-red-500 text-white shadow-lg shadow-red-950/40'
                  : 'bg-white/5 border border-white/10 text-[#AAA69C] hover:text-white'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Rejected Submissions</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] ${
                activeStatusFilter === 'rejected' ? 'bg-black/20 text-white' : 'bg-white/10 text-white'
              }`}>
                {counts.rejected}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStatusFilter('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeStatusFilter === 'all'
                  ? 'bg-white text-black shadow-lg'
                  : 'bg-white/5 border border-white/10 text-[#AAA69C] hover:text-white'
              }`}
            >
              <span>All ({counts.total})</span>
            </button>

            {/* In-page search */}
            <div className="ml-auto relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-[#AAA69C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search business, TIN, manager..."
                className="w-full h-9 rounded-full bg-black/60 border border-white/15 pl-9 pr-4 text-xs text-white placeholder:text-[#AAA69C]/60 focus:border-white focus:outline-none transition"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        {/* Verification Checklist Guidance Card */}
        <div className="p-5 rounded-2xl bg-[#141417] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">How to Verify Legitimacy (Ethiopian Anti-Fraud Protocol)</h3>
              <p className="text-xs text-[#AAA69C] mt-0.5 leading-relaxed">
                1. Match the <strong>10-digit TIN</strong> with the trade license registration.
                <br />
                2. Cross-check the <strong>General Manager Name</strong> on both the Trade License and Fayda card.
                <br />
                3. Scan the cryptographic <strong>Fayda QR Code</strong> using your mobile phone or the Fayda Validator to confirm the photo and name.
              </p>
            </div>
          </div>

          <a
            href="https://fayda.et"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold inline-flex items-center gap-1.5 shrink-0 transition"
          >
            <span>Scan QR on fayda.et</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Action Error Banner */}
        {actionError && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#AAA69C]">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mb-3" />
            <p className="text-sm">Fetching verification queue...</p>
          </div>
        ) : filteredPlaces.length === 0 ? (
          /* Empty State */
          <div className="p-16 rounded-2xl bg-[#141417] border border-white/5 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Verification Queue Clear</h3>
            <p className="text-xs text-[#AAA69C] max-w-md">
              There are currently no businesses matching the &ldquo;{activeStatusFilter}&rdquo; status filter. New submissions will appear here automatically.
            </p>
          </div>
        ) : (
          /* Submissions List */
          <div className="space-y-4">
            {filteredPlaces.map((place) => {
              const isPending = place.verification_status === 'pending';
              const isVerified = place.verification_status === 'verified';
              const isRejected = place.verification_status === 'rejected';

              return (
                <div
                  key={place.id}
                  className="p-6 rounded-2xl bg-[#141417] border border-white/10 hover:border-white/20 transition-all space-y-5"
                >
                  {/* Row 1: Header & Place Identity */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-white hover:text-emerald-400 transition">
                          <Link to={`/places/${place.slug}`} target="_blank" className="flex items-center gap-1.5">
                            <span>{place.name}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-[#AAA69C]" />
                          </Link>
                        </h2>

                        {isPending && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider">
                            Pending Review ⏳
                          </span>
                        )}
                        {isVerified && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-black text-[10px] font-black uppercase tracking-wider">
                            Verified ✓
                          </span>
                        )}
                        {isRejected && (
                          <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold uppercase tracking-wider">
                            Rejected ✕
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#AAA69C] mt-1">
                        {place.address && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400/80" />
                            <span>{place.address}</span>
                          </span>
                        )}
                        {place.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-emerald-400/80" />
                            <span>{place.phone}</span>
                          </span>
                        )}
                        {place.submitted_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-[#AAA69C]" />
                            <span>Submitted: {new Date(place.submitted_at).toLocaleDateString()}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Owner Details */}
                    {place.owner && (
                      <div className="text-left sm:text-right bg-black/40 sm:bg-transparent p-2.5 sm:p-0 rounded-xl border border-white/5 sm:border-none">
                        <span className="text-[10px] text-[#AAA69C] uppercase tracking-wider block">Submitted By Owner</span>
                        <p className="text-xs font-semibold text-white">{place.owner.name}</p>
                        <p className="text-[11px] text-[#AAA69C] font-mono">{place.owner.email}</p>
                      </div>
                    )}
                  </div>

                  {/* Row 2: Verification Data Matrix */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* TIN */}
                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <span className="text-[11px] text-[#AAA69C] flex items-center justify-between">
                        <span>10-Digit TIN</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(place.tax_id, place.id)}
                          className="hover:text-white transition p-0.5"
                          title="Copy TIN"
                        >
                          {copiedTinId === place.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </span>
                      <p className="text-base font-mono font-bold text-white tracking-wider">
                        {place.tax_id || <span className="text-white/30 font-sans text-xs">Not provided</span>}
                      </p>
                    </div>

                    {/* Legal General Manager */}
                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <span className="text-[11px] text-[#AAA69C]">General Manager Name</span>
                      <p className="text-sm font-semibold text-white truncate" title={place.manager_name}>
                        {place.manager_name || <span className="text-white/30 text-xs">Not provided</span>}
                      </p>
                    </div>

                    {/* Fayda FIN */}
                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <span className="text-[11px] text-[#AAA69C]">Fayda FIN / FAN</span>
                      <p className="text-sm font-mono font-semibold text-white">
                        {place.fayda_fin || <span className="text-white/30 font-sans text-xs">Optional / In QR</span>}
                      </p>
                    </div>
                  </div>

                  {/* Rejection Notes if already rejected */}
                  {place.verification_notes && isRejected && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
                      <strong>Rejection reason:</strong> {place.verification_notes}
                    </div>
                  )}

                  {/* Row 3: Documents Preview Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {/* Document 1: Trade License */}
                    <div className="p-3.5 rounded-xl bg-black/30 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Trade License (የንግድ ፈቃድ)</span>
                        </span>
                        {place.trade_license_url && (
                          <button
                            type="button"
                            onClick={() => {
                              setLightboxUrl(place.trade_license_url);
                              setLightboxTitle(`Trade License - ${place.name}`);
                            }}
                            className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Zoom Full Size</span>
                          </button>
                        )}
                      </div>

                      {place.trade_license_url ? (
                        <div
                          onClick={() => {
                            setLightboxUrl(place.trade_license_url);
                            setLightboxTitle(`Trade License - ${place.name}`);
                          }}
                          className="h-32 rounded-lg bg-black/50 border border-white/10 overflow-hidden cursor-pointer group relative flex items-center justify-center"
                        >
                          <img
                            src={place.trade_license_url}
                            alt="Trade License"
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-xs font-bold text-white gap-1.5">
                            <Eye className="w-4 h-4 text-emerald-400" />
                            <span>Click to Inspect</span>
                          </div>
                        </div>
                      ) : (
                        <div className="h-32 rounded-lg bg-white/5 border border-dashed border-white/10 flex items-center justify-center text-xs text-[#AAA69C]">
                          No Trade License uploaded
                        </div>
                      )}
                    </div>

                    {/* Document 2: Fayda ID Card with QR */}
                    <div className="p-3.5 rounded-xl bg-black/30 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Fayda ID Card (ዲጂታል ፋይዳ QR)</span>
                        </span>
                        {place.fayda_document_url && (
                          <button
                            type="button"
                            onClick={() => {
                              setLightboxUrl(place.fayda_document_url);
                              setLightboxTitle(`Fayda National ID - ${place.name}`);
                            }}
                            className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Zoom Full Size</span>
                          </button>
                        )}
                      </div>

                      {place.fayda_document_url ? (
                        <div
                          onClick={() => {
                            setLightboxUrl(place.fayda_document_url);
                            setLightboxTitle(`Fayda National ID - ${place.name}`);
                          }}
                          className="h-32 rounded-lg bg-black/50 border border-white/10 overflow-hidden cursor-pointer group relative flex items-center justify-center"
                        >
                          <img
                            src={place.fayda_document_url}
                            alt="Fayda ID with QR code"
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-xs font-bold text-white gap-1.5">
                            <QrCode className="w-4 h-4 text-emerald-400" />
                            <span>Inspect Digital QR</span>
                          </div>
                        </div>
                      ) : (
                        <div className="h-32 rounded-lg bg-white/5 border border-dashed border-white/10 flex items-center justify-center text-xs text-[#AAA69C]">
                          No Fayda ID uploaded
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Row 4: Review Decision Bar */}
                  <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <a
                        href={place.fayda_validator_url || 'https://fayda.et'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#AAA69C] hover:text-white transition flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Validate on Fayda.et</span>
                      </a>
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        type="button"
                        onClick={() => handleOpenReject(place)}
                        disabled={isSubmittingReview}
                        className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject Submission</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApprove(place)}
                        disabled={isSubmittingReview || isVerified}
                        className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black text-xs font-black transition flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isVerified ? 'Already Verified ✓' : 'Approve Legitimacy ✓'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-6 border-t border-white/10 text-xs text-[#AAA69C]">
            <span>Page {currentPage} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1 || isLoading}
                onClick={() => fetchVerifications(activeStatusFilter, currentPage - 1)}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white transition"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages || isLoading}
                onClick={() => fetchVerifications(activeStatusFilter, currentPage + 1)}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reject Reason Modal Dialog */}
      {rejectingPlace && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmitReject}
            className="w-full max-w-lg rounded-2xl bg-[#16161A] border border-white/15 p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-400" />
                <span>Reject Legitimacy Verification</span>
              </h3>
              <button
                type="button"
                onClick={() => setRejectingPlace(null)}
                className="text-[#AAA69C] hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#AAA69C]">
              Specify the reason why &ldquo;{rejectingPlace.name}&rdquo; could not be approved. This feedback will be displayed to the business owner so they can fix and re-submit.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white">Reason / Feedback Notes *</label>
              <textarea
                rows={4}
                required
                value={rejectionNotes}
                onChange={(e) => setRejectionNotes(e.target.value)}
                placeholder="e.g. The Fayda ID digital QR code is blurry and cannot be scanned, or the General Manager name does not match the trade license..."
                className="w-full rounded-xl bg-black/50 border border-white/15 p-3 text-xs text-white placeholder:text-[#AAA69C]/50 focus:border-red-400 focus:outline-none transition"
              />
            </div>

            {/* Quick Suggestions Buttons */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                'Trade license photo is blurry or expired',
                'Fayda digital QR code unreadable',
                'Manager name does not match license',
                'Invalid 10-digit TIN number',
              ].map((template) => (
                <button
                  key={template}
                  type="button"
                  onClick={() => setRejectionNotes(template)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-[#AAA69C] hover:text-white transition"
                >
                  {template}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setRejectingPlace(null)}
                className="px-4 py-2 rounded-xl border border-white/20 text-xs font-semibold text-[#AAA69C] hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingReview || !rejectionNotes.trim()}
                className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-red-950/40 cursor-pointer"
              >
                {isSubmittingReview && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Rejection</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Fullscreen Lightbox Zoom Modal */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <div className="w-full max-w-5xl flex items-center justify-between pb-3 text-white">
            <span className="text-sm font-bold flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>{lightboxTitle}</span>
            </span>
            <div className="flex items-center gap-3">
              <a
                href={lightboxUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Open Raw Image</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={() => setLightboxUrl(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div
            className="relative max-w-5xl max-h-[85vh] rounded-2xl overflow-hidden border border-white/20 bg-black flex items-center justify-center p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxUrl}
              alt={lightboxTitle}
              className="max-h-[82vh] w-auto object-contain rounded-lg"
            />
          </div>
          <p className="text-[11px] text-[#AAA69C] mt-2">
            Tip: You can scan the digital QR code with your phone camera directly from the screen to validate on fayda.et.
          </p>
        </div>
      )}
    </div>
  );
}

export default AdminDashboardPage;
