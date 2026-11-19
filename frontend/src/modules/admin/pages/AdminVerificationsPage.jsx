import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  FileText,
  ExternalLink,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  Search,
  Building2,
  User,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  CreditCard,
  Copy,
} from 'lucide-react';
import placesApi from '@/modules/places/api/placesApi';
import { VerifiedBadge } from '@/shared/components/VerifiedBadge';

export function AdminVerificationsPage() {
  const [statusFilter, setStatusFilter] = useState('pending'); // 'pending' | 'verified' | 'rejected' | 'all'
  const [applications, setApplications] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, verified: 0, rejected: 0, total: 0 });
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Selected Application for Inspection / Decision Modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [decisionType, setDecisionType] = useState(null); // 'approve' | 'reject' | null
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [decisionError, setDecisionError] = useState('');
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);

  // Document preview zoom state
  const [previewDocUrl, setPreviewDocUrl] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const fetchApplications = useCallback(async (page = 1) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await placesApi.getAdminVerifications({
        page,
        status: statusFilter,
        perPage: 15,
      });

      setApplications(res.data || []);
      if (res.counts) {
        setCounts(res.counts);
      }
      if (res.meta) {
        setPagination({
          current_page: res.meta.current_page || 1,
          last_page: res.meta.last_page || 1,
          total: res.meta.total || 0,
        });
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to load verification applications.');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchApplications(1);
  }, [fetchApplications]);

  // Open Decision Flow
  const openDecision = (app, type) => {
    setSelectedApp(app);
    setDecisionType(type);
    setRejectionNotes('');
    setDecisionError('');
    setIsDecisionModalOpen(true);
  };

  // Submit Decision (Approve or Reject)
  const handleSubmitDecision = async () => {
    if (!selectedApp) return;

    if (decisionType === 'reject' && !rejectionNotes.trim()) {
      setDecisionError('Please enter a specific reason for rejection.');
      return;
    }

    setIsSubmittingDecision(true);
    setDecisionError('');

    try {
      await placesApi.reviewVerification(selectedApp.id, {
        decision: decisionType === 'approve' ? 'approved' : 'rejected',
        notes: rejectionNotes.trim() || undefined,
      });

      showToast(
        decisionType === 'approve'
          ? `Approved verification for "${selectedApp.name}".`
          : `Rejected verification for "${selectedApp.name}".`
      );

      setIsDecisionModalOpen(false);
      setSelectedApp(null);
      setDecisionType(null);

      // Re-fetch list
      await fetchApplications(pagination.current_page);
    } catch (err) {
      setDecisionError(err.response?.data?.message || 'Failed to submit decision.');
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label} to clipboard`);
  };

  return (
    <div className="min-h-screen bg-[#0D0D0C] text-[#F5F2EA] pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 rounded-full bg-[#151518] border border-white/20 text-white text-xs font-medium flex items-center gap-2 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight">
              Business Verifications
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 text-xs font-mono">
              Admin Portal
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#AAA69C]">
            Review submitted Ethiopian Trade Licenses and Fayda National ID credentials to approve or reject verified status.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchApplications(pagination.current_page)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 hover:border-white/25 bg-[#151518] text-xs font-medium text-white transition cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Global Error Banner */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => setStatusFilter('pending')}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
            statusFilter === 'pending'
              ? 'bg-[#1D1C19] border-amber-500/40 ring-1 ring-amber-500/30'
              : 'bg-[#151518] border-white/[0.08] hover:border-white/20'
          }`}
        >
          <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider block">
            Pending Review
          </span>
          <span className="text-2xl font-black text-white mt-1 block font-mono">
            {counts.pending}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('verified')}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
            statusFilter === 'verified'
              ? 'bg-[#1D1C19] border-emerald-500/40 ring-1 ring-emerald-500/30'
              : 'bg-[#151518] border-white/[0.08] hover:border-white/20'
          }`}
        >
          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">
            Approved / Verified
          </span>
          <span className="text-2xl font-black text-white mt-1 block font-mono">
            {counts.verified}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('rejected')}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
            statusFilter === 'rejected'
              ? 'bg-[#1D1C19] border-rose-500/40 ring-1 ring-rose-500/30'
              : 'bg-[#151518] border-white/[0.08] hover:border-white/20'
          }`}
        >
          <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider block">
            Rejected
          </span>
          <span className="text-2xl font-black text-white mt-1 block font-mono">
            {counts.rejected}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-[#1D1C19] border-white/40 ring-1 ring-white/20'
              : 'bg-[#151518] border-white/[0.08] hover:border-white/20'
          }`}
        >
          <span className="text-[11px] font-semibold text-[#AAA69C] uppercase tracking-wider block">
            Total Submissions
          </span>
          <span className="text-2xl font-black text-white mt-1 block font-mono">
            {counts.total}
          </span>
        </button>
      </div>

      {/* Main Table / Applications List */}
      <div className="rounded-2xl bg-[#151518] border border-white/[0.08] overflow-hidden shadow-xl">
        {/* Table Header Filter Tabs */}
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2">
            {[
              { id: 'pending', label: 'Pending Review' },
              { id: 'verified', label: 'Approved' },
              { id: 'rejected', label: 'Rejected' },
              { id: 'all', label: 'All' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'text-[#AAA69C] hover:text-white border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-xs text-[#AAA69C] font-mono shrink-0">
            {pagination.total} application{pagination.total === 1 ? '' : 's'}
          </span>
        </div>

        {/* Content Rows */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <span className="text-xs font-mono text-[#AAA69C]">Loading applications queue...</span>
          </div>
        ) : applications.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <ShieldCheck className="w-8 h-8 text-[#AAA69C]/50 mx-auto" />
            <p className="text-sm font-semibold text-white">No applications found</p>
            <p className="text-xs text-[#AAA69C]">
              {statusFilter === 'pending'
                ? 'All submitted verification requests have been processed.'
                : `No applications with status "${statusFilter}".`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06] overflow-x-auto">
            {applications.map((app) => (
              <div
                key={app.id}
                className="p-5 sm:p-6 hover:bg-white/[0.02] transition space-y-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left: Place & Owner */}
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <Link
                        to={`/places/${app.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base sm:text-lg font-bold text-white hover:text-white/80 transition flex items-center gap-1.5"
                      >
                        <span>{app.name}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-[#AAA69C]" />
                      </Link>

                      {app.verification_status === 'verified' && (
                        <VerifiedBadge size="sm" showLabel />
                      )}
                      {app.verification_status === 'pending' && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 border border-amber-500/30 text-amber-300">
                          Pending
                        </span>
                      )}
                      {app.verification_status === 'rejected' && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/10 border border-rose-500/30 text-rose-400">
                          Rejected
                        </span>
                      )}

                      {app.is_claim && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/15 border border-blue-500/40 text-blue-300">
                          Ownership Claim
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#AAA69C]">{app.address || 'Address not set'}</p>

                    {/* Claimant or Owner Info */}
                    {app.is_claim && app.claimant ? (
                      <div className="space-y-1 text-xs text-[#AAA69C] pt-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <User className="w-3.5 h-3.5 text-blue-400" />
                          <span>
                            Claimant: <strong className="text-white font-medium">{app.claimant.name}</strong> ({app.claimant.email})
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-white/10 text-white text-[10px] uppercase font-mono">
                            {app.claim_role || 'Representative'}
                          </span>
                        </div>
                        {app.claim_contact_phone && (
                          <div className="pl-5 text-[11px] text-[#AAA69C]">
                            Contact Phone: <strong className="text-white font-mono">{app.claim_contact_phone}</strong>
                          </div>
                        )}
                        {app.claim_notes && (
                          <p className="pl-5 text-[11px] text-[#AAA69C]/80 italic">
                            &ldquo;{app.claim_notes}&rdquo;
                          </p>
                        )}
                      </div>
                    ) : app.owner ? (
                      <div className="flex items-center gap-2 text-xs text-[#AAA69C] pt-1">
                        <User className="w-3.5 h-3.5 text-white/50" />
                        <span>Owner: <strong className="text-white font-medium">{app.owner.name}</strong> ({app.owner.email})</span>
                      </div>
                    ) : null}
                  </div>

                  {/* Middle: Credentials Box */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-black/40 p-3.5 rounded-xl border border-white/[0.06] shrink-0 text-xs">
                    <div>
                      <span className="text-[10px] text-[#AAA69C] block">TIN Number</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="font-mono font-bold text-white">{app.tax_id || 'N/A'}</span>
                        {app.tax_id && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(app.tax_id, 'TIN')}
                            className="text-[#AAA69C] hover:text-white transition p-0.5"
                            title="Copy TIN"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#AAA69C] block">General Manager</span>
                      <span className="font-medium text-white truncate block mt-0.5 max-w-[140px]" title={app.manager_name}>
                        {app.manager_name || 'N/A'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#AAA69C] block">Fayda FIN</span>
                      <span className="font-mono text-white/90 truncate block mt-0.5">
                        {app.fayda_fin || 'Not provided'}
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => openDecision(app, 'inspect')}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-white/20 hover:border-white/40 bg-white/5 text-xs font-semibold text-white transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Documents</span>
                    </button>

                    {app.verification_status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openDecision(app, 'approve')}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openDecision(app, 'reject')}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-semibold transition cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Document Previews Links Row */}
                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/[0.04] text-xs">
                  <span className="text-[#AAA69C] font-semibold text-[11px]">Submitted Documents:</span>

                  {app.trade_license_url ? (
                    <a
                      href={app.trade_license_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1D1C19] border border-white/10 hover:border-white/30 text-white text-[11px] transition"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Trade License (የንግድ ፈቃድ)</span>
                      <ExternalLink className="w-3 h-3 text-[#AAA69C]" />
                    </a>
                  ) : (
                    <span className="text-[#AAA69C]/60 text-[11px]">No Trade License uploaded</span>
                  )}

                  {app.fayda_document_url ? (
                    <a
                      href={app.fayda_document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1D1C19] border border-white/10 hover:border-white/30 text-white text-[11px] transition"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Fayda National ID</span>
                      <ExternalLink className="w-3 h-3 text-[#AAA69C]" />
                    </a>
                  ) : (
                    <span className="text-[#AAA69C]/60 text-[11px]">No Fayda document</span>
                  )}

                  <a
                    href="https://fayda.et"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 hover:border-white/20 text-[#AAA69C] hover:text-white text-[11px] transition ml-auto"
                  >
                    <span>Fayda Validator Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Display previous rejection note if rejected */}
                {app.verification_notes && app.verification_status === 'rejected' && (
                  <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 text-xs text-rose-300">
                    <span className="font-semibold text-rose-400 mr-1.5">Rejection Reason:</span>
                    <span>{app.verification_notes}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination Footer */}
        {pagination.last_page > 1 && (
          <div className="p-4 border-t border-white/[0.08] flex items-center justify-between">
            <span className="text-xs text-[#AAA69C]">
              Page {pagination.current_page} of {pagination.last_page}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pagination.current_page <= 1}
                onClick={() => fetchApplications(pagination.current_page - 1)}
                className="p-1.5 rounded-lg border border-white/10 hover:border-white/30 text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={pagination.current_page >= pagination.last_page}
                onClick={() => fetchApplications(pagination.current_page + 1)}
                className="p-1.5 rounded-lg border border-white/10 hover:border-white/30 text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Decision / Inspection Modal */}
      {isDecisionModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-[#151518] border border-white/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-white/[0.08] flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white font-display">
                  {decisionType === 'approve'
                    ? 'Confirm Business Approval'
                    : decisionType === 'reject'
                    ? 'Reject Business Verification'
                    : 'Verification Application Details'}
                </h3>
                <p className="text-xs text-[#AAA69C] mt-0.5">{selectedApp.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsDecisionModalOpen(false)}
                className="p-2 rounded-full border border-white/10 hover:border-white/30 text-[#AAA69C] hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
              {decisionError && (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{decisionError}</span>
                </div>
              )}

              {/* Business & Manager Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-black/40 p-4 rounded-2xl border border-white/[0.06] text-xs">
                <div>
                  <span className="text-[#AAA69C] text-[11px] block">Business Name</span>
                  <span className="font-bold text-white block mt-0.5">{selectedApp.name}</span>
                </div>
                <div>
                  <span className="text-[#AAA69C] text-[11px] block">Address</span>
                  <span className="text-white/90 block mt-0.5">{selectedApp.address || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[#AAA69C] text-[11px] block">Registered TIN</span>
                  <span className="font-mono font-bold text-white block mt-0.5">{selectedApp.tax_id || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[#AAA69C] text-[11px] block">General Manager</span>
                  <span className="font-medium text-white block mt-0.5">{selectedApp.manager_name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[#AAA69C] text-[11px] block">Fayda FIN</span>
                  <span className="font-mono text-white/90 block mt-0.5">{selectedApp.fayda_fin || 'None provided'}</span>
                </div>
                <div>
                  <span className="text-[#AAA69C] text-[11px] block">Owner Contact</span>
                  <span className="text-white/90 block mt-0.5">{selectedApp.owner?.email || 'N/A'}</span>
                </div>
              </div>

              {/* Document Previews */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-white block">Submitted Credentials</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Trade License */}
                  <div className="p-3.5 rounded-xl bg-[#1D1C19] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">Trade License</span>
                      {selectedApp.trade_license_url && (
                        <a
                          href={selectedApp.trade_license_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#AAA69C] hover:text-white transition"
                          title="Open Full Document"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                    {selectedApp.trade_license_url ? (
                      <a
                        href={selectedApp.trade_license_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block aspect-[4/3] rounded-lg overflow-hidden bg-black/60 relative group"
                      >
                        <img
                          src={selectedApp.trade_license_url}
                          alt="Trade License"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement.innerHTML = '<div class="w-full h-full flex flex-col items-center justify-center text-xs text-[#AAA69C] p-4 bg-black/40"><svg class="w-8 h-8 mb-2 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg><span class="font-medium text-white/90">PDF Legal Document</span><span class="text-[10px] text-[#AAA69C]/70 mt-0.5">Click to view in new tab</span></div>';
                          }}
                        />
                      </a>
                    ) : (
                      <p className="text-xs text-[#AAA69C]/60 py-8 text-center">No document</p>
                    )}
                  </div>

                  {/* Fayda ID */}
                  <div className="p-3.5 rounded-xl bg-[#1D1C19] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">Fayda National ID</span>
                      {selectedApp.fayda_document_url && (
                        <a
                          href={selectedApp.fayda_document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#AAA69C] hover:text-white transition"
                          title="Open Full Document"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                    {selectedApp.fayda_document_url ? (
                      <a
                        href={selectedApp.fayda_document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block aspect-[4/3] rounded-lg overflow-hidden bg-black/60 relative group"
                      >
                        <img
                          src={selectedApp.fayda_document_url}
                          alt="Fayda ID"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement.innerHTML = '<div class="w-full h-full flex flex-col items-center justify-center text-xs text-[#AAA69C] p-4 bg-black/40"><svg class="w-8 h-8 mb-2 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg><span class="font-medium text-white/90">PDF Legal Document</span><span class="text-[10px] text-[#AAA69C]/70 mt-0.5">Click to view in new tab</span></div>';
                          }}
                        />
                      </a>
                    ) : (
                      <p className="text-xs text-[#AAA69C]/60 py-8 text-center">No document</p>
                    )}
                  </div>
                </div>
              </div>

              {/* If Rejecting: Reason Input */}
              {decisionType === 'reject' && (
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-rose-300 block">
                    Reason for Rejection <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={rejectionNotes}
                    onChange={(e) => {
                      setRejectionNotes(e.target.value);
                      if (decisionError) setDecisionError('');
                    }}
                    placeholder="e.g. The Trade License document is expired or blurry. The Manager name does not match the submitted Fayda ID."
                    className="w-full rounded-xl bg-[#1D1C19] border border-rose-500/30 focus:border-rose-400 p-3 text-xs text-white placeholder:text-[#AAA69C]/50 focus:outline-none transition"
                  />
                  <p className="text-[11px] text-[#AAA69C]">
                    This feedback will be presented to the business owner to guide their correction and resubmission.
                  </p>
                </div>
              )}

              {/* If Approving: Notice */}
              {decisionType === 'approve' && (
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 space-y-1">
                  <span className="font-bold block">Approval Confirmation</span>
                  {selectedApp.is_claim ? (
                    <p>
                      Approving this legal claim will <strong>transfer ownership of {selectedApp.name}</strong> to{' '}
                      <strong>{selectedApp.claimant?.name || selectedApp.claimant?.email || 'the claimant'}</strong>, promote their account to Business Owner, mark the listing verified, and grant full Owner Dashboard privileges.
                    </p>
                  ) : (
                    <p>
                      Approving this application marks <strong>{selectedApp.name}</strong> as verified and awards the official Verified badge across discovery.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="p-5 sm:p-6 border-t border-white/[0.08] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsDecisionModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#AAA69C] hover:text-white transition"
              >
                Close
              </button>

              <div className="flex items-center gap-2.5">
                {decisionType === 'inspect' && selectedApp.verification_status === 'pending' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setDecisionType('reject')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold transition"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDecisionType('approve')}
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  </>
                )}

                {decisionType === 'approve' && (
                  <button
                    type="button"
                    disabled={isSubmittingDecision}
                    onClick={handleSubmitDecision}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition disabled:opacity-50"
                  >
                    {isSubmittingDecision ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        <span>Confirming Approval...</span>
                      </>
                    ) : (
                      <span>Confirm Approval</span>
                    )}
                  </button>
                )}

                {decisionType === 'reject' && (
                  <button
                    type="button"
                    disabled={isSubmittingDecision}
                    onClick={handleSubmitDecision}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold transition disabled:opacity-50"
                  >
                    {isSubmittingDecision ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Submitting Rejection...</span>
                      </>
                    ) : (
                      <span>Submit Rejection</span>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminVerificationsPage;
