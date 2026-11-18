import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  ChevronDown,
  ChevronRight,
  LogOut,
  LayoutGrid,
  Compass,
  Bell,
  Menu,
  Download,
  Filter,
  MoreHorizontal,
  BadgeCheck,
  Building,
  User,
  SlidersHorizontal,
  Maximize2,
} from 'lucide-react';
import placesApi from '@/modules/places/api/placesApi';
import { useAuth } from '@/modules/identity';

export function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Navigation State
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'verified' | 'rejected' | 'all'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [perPage, setPerPage] = useState(15);
  const [dateFilter, setDateFilter] = useState('all'); // 'all' | '7days' | '30days'

  // Data State
  const [places, setPlaces] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, verified: 0, rejected: 0, total: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorBanner, setErrorBanner] = useState(null);
  const [toast, setToast] = useState(null);

  // Search Filter
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);

  // Modals & Inspection Drawers
  const [inspectingPlace, setInspectingPlace] = useState(null);
  const [activeInspectionDocTab, setActiveInspectionDocTab] = useState('license'); // 'license' | 'fayda'
  const [approvingPlace, setApprovingPlace] = useState(null);
  const [rejectingPlace, setRejectingPlace] = useState(null);
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [rejectionError, setRejectionError] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Document Lightbox with Zoom & Rotate
  const [lightbox, setLightbox] = useState(null); // { url, title, type }
  const [lightboxRotation, setLightboxRotation] = useState(0);
  const [lightboxScale, setLightboxScale] = useState(1);

  // Row Action Dropdown Menu State
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Copy TIN feedback
  const [copiedId, setCopiedId] = useState(null);

  // Keyboard Shortcuts: Escape to close modals, "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (lightbox) setLightbox(null);
        if (rejectingPlace) setRejectingPlace(null);
        if (approvingPlace) setApprovingPlace(null);
        if (inspectingPlace) setInspectingPlace(null);
        if (activeMenuId) setActiveMenuId(null);
      }
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        if (!lightbox && !rejectingPlace && !approvingPlace && !inspectingPlace) {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightbox, rejectingPlace, approvingPlace, inspectingPlace, activeMenuId]);

  // Click outside listener for row action menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (activeMenuId && !e.target.closest('.row-action-menu-container')) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeMenuId]);

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
      if (inspectingPlace?.id === approvingPlace.id) {
        setInspectingPlace(null);
      }
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
      setRejectionError('Please provide a reason so the business owner can correct their submission.');
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
      if (inspectingPlace?.id === rejectingPlace.id) {
        setInspectingPlace(null);
      }
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

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Export to CSV Function
  const handleExportCSV = () => {
    if (!places.length) {
      showToast('No records available to export.', 'info');
      return;
    }

    const headers = ['ID', 'Business Name', 'TIN', 'General Manager', 'Fayda FIN', 'Status', 'Submitted Date', 'Owner Name', 'Owner Email'];
    const rows = places.map((p) => [
      p.id,
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${p.tax_id || ''}"`,
      `"${(p.manager_name || '').replace(/"/g, '""')}"`,
      `"${p.fayda_fin || ''}"`,
      p.verification_status,
      p.submitted_at || '',
      `"${(p.owner?.name || '').replace(/"/g, '""')}"`,
      `"${p.owner?.email || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `localspot_verifications_${activeTab}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported CSV file successfully.');
  };

  // Client-side search and date filter
  const filteredPlaces = useMemo(() => {
    let result = places;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        return (
          p.name?.toLowerCase().includes(q) ||
          p.tax_id?.toLowerCase().includes(q) ||
          p.manager_name?.toLowerCase().includes(q) ||
          p.fayda_fin?.toLowerCase().includes(q) ||
          p.owner?.name?.toLowerCase().includes(q) ||
          p.owner?.email?.toLowerCase().includes(q)
        );
      });
    }

    if (dateFilter === '7days') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      result = result.filter((p) => p.submitted_at && new Date(p.submitted_at) >= sevenDaysAgo);
    } else if (dateFilter === '30days') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      result = result.filter((p) => p.submitted_at && new Date(p.submitted_at) >= thirtyDaysAgo);
    }

    return result;
  }, [places, searchQuery, dateFilter]);

  const getTabTitle = () => {
    switch (activeTab) {
      case 'pending':
        return 'Pending Verification';
      case 'verified':
        return 'Approved Businesses';
      case 'rejected':
        return 'Declined Submissions';
      default:
        return 'All Verification Applications';
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0C] text-[#F5F2EA] flex font-sans antialiased selection:bg-white/20 selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#18181C]/95 border border-white/20 text-white text-xs font-semibold flex items-center gap-2.5 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ======================================================== */}
      {/* 1. LEFT SIDEBAR (Matching the KYC Figma layout) */}
      {/* ======================================================== */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-[#111114] border-r border-white/[0.08] flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-white/[0.08]">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-full border border-amber-500/30 bg-amber-500/10 flex items-center justify-center text-amber-400 backdrop-blur-md group-hover:border-amber-400 transition">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-tight text-white font-display block leading-none">
                  Local Spot
                </span>
                <span className="text-[9px] tracking-widest text-[#AAA69C] uppercase font-mono mt-0.5 block">
                  KYC Admin
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-[#AAA69C] hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="px-3 py-5 space-y-6">
            {/* Overview Section */}
            <div>
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#AAA69C]/60 font-mono mb-2">
                Overview
              </p>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('all');
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    activeTab === 'all'
                      ? 'bg-white/10 text-white shadow-sm font-bold'
                      : 'text-[#AAA69C] hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4 text-[#AAA69C]" />
                  <span>Dashboard</span>
                </button>
              </div>
            </div>

            {/* KYC Verifications Group (Matching Figma sub-items) */}
            <div>
              <div className="flex items-center justify-between px-3 mb-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#AAA69C]/60 font-mono">
                  Verification (KYC)
                </p>
                <ChevronDown className="w-3.5 h-3.5 text-[#AAA69C]/60" />
              </div>

              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('pending');
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer relative ${
                    activeTab === 'pending'
                      ? 'bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30'
                      : 'text-[#AAA69C] hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Pending Approval</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      activeTab === 'pending'
                        ? 'bg-amber-400 text-black'
                        : 'bg-white/10 text-[#AAA69C]'
                    }`}
                  >
                    {counts.pending}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('verified');
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    activeTab === 'verified'
                      ? 'bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30'
                      : 'text-[#AAA69C] hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Approved</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      activeTab === 'verified'
                        ? 'bg-emerald-400 text-black'
                        : 'bg-white/10 text-[#AAA69C]'
                    }`}
                  >
                    {counts.verified}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('rejected');
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    activeTab === 'rejected'
                      ? 'bg-rose-500/15 text-rose-300 font-bold border border-rose-500/30'
                      : 'text-[#AAA69C] hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>Declined</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      activeTab === 'rejected'
                        ? 'bg-rose-400 text-black'
                        : 'bg-white/10 text-[#AAA69C]'
                    }`}
                  >
                    {counts.rejected}
                  </span>
                </button>
              </div>
            </div>

            {/* Official Fayda Scanner Quick Tool */}
            <div>
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#AAA69C]/60 font-mono mb-2">
                Ethiopia National ID
              </p>
              <a
                href="https://id.gov.et/scanId"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 border border-emerald-500/20 transition group"
              >
                <div className="flex items-center gap-2.5">
                  <QrCode className="w-4 h-4 text-emerald-400" />
                  <span>id.gov.et Scanner</span>
                </div>
                <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 transition" />
              </a>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/[0.08] space-y-2">
          <Link
            to="/"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#AAA69C] hover:text-white hover:bg-white/[0.04] transition"
          >
            <Compass className="w-4 h-4" />
            <span>Back to Discovery Home</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* 2. MAIN VIEWPORT */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Bar Header (Matching Figma top bar) */}
        <header className="h-16 bg-[#111114]/90 border-b border-white/[0.08] px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-white"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Breadcrumb path */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-[#AAA69C]">
              <span>Admin Console</span>
              <ChevronRight className="w-3 h-3 text-[#AAA69C]/40" />
              <span>Verifications</span>
              <ChevronRight className="w-3 h-3 text-[#AAA69C]/40" />
              <span className="text-white font-semibold capitalize">{activeTab}</span>
            </div>
          </div>

          {/* Top Right User Profile Info (Matching Figma top bar) */}
          <div className="flex items-center gap-3 sm:gap-4">
            <a
              href="https://id.gov.et/scanId"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold transition"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Camera QR Scanner</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </a>

            <button
              type="button"
              onClick={() => fetchVerifications(activeTab, currentPage)}
              disabled={isLoading}
              title="Refresh Queue"
              className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-[#AAA69C] hover:text-white transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>

            {/* Admin Profile Pill */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-white/[0.08]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-black flex items-center justify-center text-xs font-black uppercase font-mono shadow-sm">
                {user?.name?.[0] || 'A'}
              </div>

              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-white leading-tight">
                  {user?.name || 'Administrator'}
                </p>
                <p className="text-[10px] text-[#AAA69C] font-mono leading-tight">
                  System Admin
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Title Row */}
          <div>
            <h2 className="text-2xl font-black text-white font-display tracking-tight">
              {getTabTitle()}
            </h2>
            <p className="text-xs text-[#AAA69C] mt-0.5">
              Review Ethiopian 10-digit TIN, General Manager legal names, Trade Licenses, and Fayda National ID QR codes.
            </p>
          </div>

          {/* Action Error Banner */}
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

          {/* ======================================================== */}
          {/* 3. TOOLBAR BAR (Matching the Figma controls bar) */}
          {/* ======================================================== */}
          <div className="p-4 rounded-2xl bg-[#141418] border border-white/[0.08] flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#AAA69C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by customer name, business, or TIN... (Press '/' to focus)"
                className="w-full h-10 pl-10 pr-8 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-[#AAA69C]/60 focus:outline-none focus:border-amber-400/50 transition font-sans"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AAA69C] hover:text-white p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Right Controls: Entries per page, Date selector, Filter & Export */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Show Entries */}
              <div className="flex items-center gap-2 text-xs text-[#AAA69C] bg-black/40 border border-white/10 rounded-xl px-3 h-10">
                <span>Show</span>
                <select
                  value={perPage}
                  onChange={(e) => setPerPage(Number(e.target.value))}
                  className="bg-transparent text-xs text-white focus:outline-none cursor-pointer font-semibold"
                >
                  <option value={10} className="bg-[#141418]">10</option>
                  <option value={15} className="bg-[#141418]">15</option>
                  <option value={25} className="bg-[#141418]">25</option>
                  <option value={50} className="bg-[#141418]">50</option>
                </select>
                <span className="hidden sm:inline">entries</span>
              </div>

              {/* Date Filter Dropdown */}
              <div className="flex items-center gap-2 text-xs text-[#AAA69C] bg-black/40 border border-white/10 rounded-xl px-3 h-10">
                <Calendar className="w-3.5 h-3.5 text-[#AAA69C]" />
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="all" className="bg-[#141418]">All Time</option>
                  <option value="7days" className="bg-[#141418]">Past 7 Days</option>
                  <option value="30days" className="bg-[#141418]">Past 30 Days</option>
                </select>
              </div>

              {/* Export Report / CSV Button (Matching Figma button) */}
              <button
                type="button"
                onClick={handleExportCSV}
                title="Export filtered records as CSV"
                className="h-10 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#AAA69C]" />
                <span className="hidden sm:inline">Export Report</span>
              </button>

              {/* Primary Action Button: id.gov.et Scan */}
              <a
                href="https://id.gov.et/scanId"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-md shadow-amber-950/20"
              >
                <QrCode className="w-4 h-4" />
                <span>Scan QR</span>
              </a>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 4. THE KYC DATA TABLE (Exact Figma column layout) */}
          {/* ======================================================== */}
          <div className="rounded-2xl bg-[#141418] border border-white/[0.08] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                {/* Table Header Row */}
                <thead>
                  <tr className="border-b border-white/[0.08] bg-black/40 text-[11px] font-mono font-bold uppercase tracking-wider text-[#AAA69C]">
                    <th scope="col" className="py-4 px-4 sm:px-6">Customer / Business</th>
                    <th scope="col" className="py-4 px-4">BVN / TIN</th>
                    <th scope="col" className="py-4 px-4">Identity Card</th>
                    <th scope="col" className="py-4 px-4">Utility Bill / Fayda ID</th>
                    <th scope="col" className="py-4 px-4">Status</th>
                    <th scope="col" className="py-4 px-4">Submission Date</th>
                    <th scope="col" className="py-4 px-4 sm:px-6 text-right">Action</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-white/[0.04]">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-[#AAA69C]">
                        <Loader2 className="w-6 h-6 animate-spin text-emerald-400 mx-auto mb-2" />
                        <span className="text-xs">Loading verification records...</span>
                      </td>
                    </tr>
                  ) : filteredPlaces.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-[#AAA69C]">
                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3 text-white/50">
                          <CheckCircle2 className="w-6 h-6 text-emerald-400/80" />
                        </div>
                        <p className="text-sm font-semibold text-white">No applications found</p>
                        <p className="text-xs text-[#AAA69C] mt-1">
                          No records match the current filter or search criteria.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredPlaces.map((place) => {
                      const isPending = place.verification_status === 'pending';
                      const isVerified = place.verification_status === 'verified';
                      const isRejected = place.verification_status === 'rejected';

                      return (
                        <tr
                          key={place.id}
                          className="hover:bg-white/[0.02] transition-colors group"
                        >
                          {/* Column 1: Business / Customer Name (with Avatar letter badge) */}
                          <td className="py-4 px-4 sm:px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
                                {place.name?.[0]?.toUpperCase() || 'B'}
                              </div>

                              <div className="space-y-0.5 min-w-0">
                                <Link
                                  to={`/places/${place.slug}`}
                                  target="_blank"
                                  className="font-bold text-white hover:text-amber-400 transition inline-flex items-center gap-1.5 truncate max-w-xs"
                                >
                                  <span className="truncate">{place.name}</span>
                                  <ExternalLink className="w-3 h-3 text-[#AAA69C]/60 opacity-0 group-hover:opacity-100 transition shrink-0" />
                                </Link>

                                <p className="text-[11px] text-[#AAA69C] truncate max-w-xs">
                                  {place.manager_name ? (
                                    <span>GM: <strong className="text-white/80">{place.manager_name}</strong></span>
                                  ) : (
                                    place.address || 'Addis Ababa'
                                  )}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Column 2: BVN / TIN */}
                          <td className="py-4 px-4">
                            {place.tax_id ? (
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-white tracking-wider">
                                  {place.tax_id}
                                </span>
                                <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">
                                  Validated
                                </span>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(place.tax_id, `tin-${place.id}`)}
                                  title="Copy TIN"
                                  className="text-[#AAA69C] hover:text-white p-0.5 ml-0.5 transition cursor-pointer"
                                >
                                  {copiedId === `tin-${place.id}` ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            ) : (
                              <span className="text-white/30 text-[11px]">Unset</span>
                            )}
                          </td>

                          {/* Column 3: Identity Card (Trade License view file link matching Figma) */}
                          <td className="py-4 px-4">
                            {place.trade_license_url ? (
                              <button
                                type="button"
                                onClick={() => openLightbox(place.trade_license_url, `Trade License — ${place.name}`, 'license')}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400/90 hover:text-emerald-300 hover:underline transition cursor-pointer"
                              >
                                <span>View file</span>
                                <Eye className="w-3.5 h-3.5 opacity-75" />
                              </button>
                            ) : (
                              <span className="text-[#AAA69C]/50 text-[11px]">No file</span>
                            )}
                          </td>

                          {/* Column 4: Utility Bill / Fayda ID (View file link matching Figma) */}
                          <td className="py-4 px-4">
                            {place.fayda_document_url ? (
                              <button
                                type="button"
                                onClick={() => openLightbox(place.fayda_document_url, `Fayda National ID — ${place.name}`, 'fayda')}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400/90 hover:text-emerald-300 hover:underline transition cursor-pointer"
                              >
                                <span>View file</span>
                                <QrCode className="w-3.5 h-3.5 opacity-75" />
                              </button>
                            ) : (
                              <span className="text-[#AAA69C]/50 text-[11px]">No file</span>
                            )}
                          </td>

                          {/* Column 5: Status Tag (Clean, sharp badge without dots) */}
                          <td className="py-4 px-4">
                            {isPending && (
                              <span className="inline-flex items-center justify-center px-3 py-1 rounded-md text-[11px] font-semibold tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/25">
                                Pending
                              </span>
                            )}
                            {isVerified && (
                              <span className="inline-flex items-center justify-center px-3 py-1 rounded-md text-[11px] font-semibold tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                                Approved
                              </span>
                            )}
                            {isRejected && (
                              <span className="inline-flex items-center justify-center px-3 py-1 rounded-md text-[11px] font-semibold tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/25">
                                Declined
                              </span>
                            )}
                          </td>

                          {/* Column 6: Submission Date (e.g. 11/18/26) */}
                          <td className="py-4 px-4 text-[#AAA69C] font-mono text-[11px]">
                            {place.submitted_at ? new Date(place.submitted_at).toLocaleDateString() : 'N/A'}
                          </td>

                          {/* Column 7: Action (Review Button + Dropdown matching Figma) */}
                          <td className="py-4 px-4 sm:px-6 text-right relative row-action-menu-container">
                            <div className="inline-flex items-center gap-2 justify-end">
                              <button
                                type="button"
                                onClick={() => setInspectingPlace(place)}
                                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition cursor-pointer"
                              >
                                Review
                              </button>

                              {/* Three Dots More Menu */}
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => setActiveMenuId(activeMenuId === place.id ? null : place.id)}
                                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[#AAA69C] hover:text-white transition cursor-pointer"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </button>

                                {/* Action Dropdown Menu */}
                                {activeMenuId === place.id && (
                                  <div className="absolute right-0 top-full mt-1.5 z-30 w-44 rounded-xl bg-[#18181C] border border-white/15 p-1.5 shadow-2xl space-y-0.5 text-left text-xs animate-in fade-in zoom-in-95">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setInspectingPlace(place);
                                        setActiveMenuId(null);
                                      }}
                                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-white hover:bg-white/10 transition"
                                    >
                                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                                      <span>Full Inspection</span>
                                    </button>

                                    {isPending && (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setApprovingPlace(place);
                                            setActiveMenuId(null);
                                          }}
                                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition"
                                        >
                                          <Check className="w-3.5 h-3.5" />
                                          <span>Approve Place</span>
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => {
                                            setRejectingPlace(place);
                                            setRejectionNotes('');
                                            setRejectionError('');
                                            setActiveMenuId(null);
                                          }}
                                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                          <span>Decline Place</span>
                                        </button>
                                      </>
                                    )}

                                    {place.tax_id && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          copyToClipboard(place.tax_id, `tin-${place.id}`);
                                          setActiveMenuId(null);
                                        }}
                                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#AAA69C] hover:text-white hover:bg-white/10 transition"
                                      >
                                        <Copy className="w-3.5 h-3.5" />
                                        <span>Copy TIN</span>
                                      </button>
                                    )}

                                    <Link
                                      to={`/places/${place.slug}`}
                                      target="_blank"
                                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#AAA69C] hover:text-white hover:bg-white/10 transition"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                      <span>Public Page</span>
                                    </Link>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Footer (Matching Figma footer) */}
            <div className="h-16 px-4 sm:px-6 border-t border-white/[0.08] flex items-center justify-between text-xs text-[#AAA69C] bg-black/20">
              <span>
                Showing <strong className="text-white">{filteredPlaces.length ? (currentPage - 1) * perPage + 1 : 0}</strong> to{' '}
                <strong className="text-white">{Math.min(currentPage * perPage, counts.total || filteredPlaces.length)}</strong> of{' '}
                <strong className="text-white">{counts.total || filteredPlaces.length}</strong> entries
              </span>

              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage <= 1 || isLoading}
                    onClick={() => fetchVerifications(activeTab, currentPage - 1)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white transition cursor-pointer font-medium"
                  >
                    Previous
                  </button>

                  <span className="px-2 font-mono text-white">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={currentPage >= totalPages || isLoading}
                    onClick={() => fetchVerifications(activeTab, currentPage + 1)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white transition cursor-pointer font-medium"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ======================================================== */}
      {/* 5. KYC FULL DETAIL DRAWER (When clicking "Review") */}
      {/* ======================================================== */}
      {inspectingPlace && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex justify-end animate-in fade-in"
          onClick={() => setInspectingPlace(null)}
        >
          <div
            className="w-full max-w-2xl bg-[#141418] border-l border-white/10 h-full overflow-y-auto p-6 space-y-6 shadow-2xl flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#AAA69C]">
                    Verification Inspector
                  </span>
                  <h3 className="text-xl font-bold text-white font-display">
                    {inspectingPlace.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectingPlace(null)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#AAA69C] hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status & Submitter */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] space-y-1">
                  <span className="text-[10px] text-[#AAA69C] uppercase font-mono block">Current Status</span>
                  <p className="font-bold uppercase tracking-wider text-white">
                    {inspectingPlace.verification_status}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] space-y-1">
                  <span className="text-[10px] text-[#AAA69C] uppercase font-mono block">Submitted By</span>
                  <p className="font-bold text-white truncate">{inspectingPlace.owner?.name || 'Owner'}</p>
                  <p className="text-[10px] text-[#AAA69C] font-mono truncate">{inspectingPlace.owner?.email}</p>
                </div>
              </div>

              {/* Data Credentials */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Submitted Credentials
                </h4>

                <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-white/[0.04]">
                    <span className="text-[#AAA69C]">10-Digit TIN:</span>
                    <span className="font-mono font-bold text-white">{inspectingPlace.tax_id || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/[0.04]">
                    <span className="text-[#AAA69C]">General Manager:</span>
                    <span className="font-semibold text-white">{inspectingPlace.manager_name || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/[0.04]">
                    <span className="text-[#AAA69C]">Fayda FIN:</span>
                    <span className="font-mono text-white">{inspectingPlace.fayda_fin || 'Embedded in QR'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#AAA69C]">Phone:</span>
                    <span className="text-white">{inspectingPlace.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Document Review Tabs in Drawer */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Document Verification
                  </h4>

                  <div className="inline-flex p-1 rounded-xl bg-black/40 border border-white/10 text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveInspectionDocTab('license')}
                      className={`px-3 py-1 rounded-lg font-semibold transition ${
                        activeInspectionDocTab === 'license' ? 'bg-white/10 text-white' : 'text-[#AAA69C] hover:text-white'
                      }`}
                    >
                      Trade License
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveInspectionDocTab('fayda')}
                      className={`px-3 py-1 rounded-lg font-semibold transition ${
                        activeInspectionDocTab === 'fayda' ? 'bg-white/10 text-white' : 'text-[#AAA69C] hover:text-white'
                      }`}
                    >
                      Fayda National ID
                    </button>
                  </div>
                </div>

                {activeInspectionDocTab === 'license' ? (
                  <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#AAA69C]">Trade License (የንግድ ፈቃድ)</span>
                      {inspectingPlace.trade_license_url && (
                        <button
                          type="button"
                          onClick={() => openLightbox(inspectingPlace.trade_license_url, `Trade License — ${inspectingPlace.name}`, 'license')}
                          className="text-emerald-400 hover:text-emerald-300 font-semibold text-xs flex items-center gap-1"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>Inspect Fullscreen</span>
                        </button>
                      )}
                    </div>

                    {inspectingPlace.trade_license_url ? (
                      <div
                        onClick={() => openLightbox(inspectingPlace.trade_license_url, `Trade License — ${inspectingPlace.name}`, 'license')}
                        className="h-64 rounded-xl bg-black/60 overflow-hidden cursor-pointer relative group border border-white/10 flex items-center justify-center"
                      >
                        <img
                          src={inspectingPlace.trade_license_url}
                          alt="Trade License"
                          className="w-full h-full object-contain group-hover:scale-105 transition"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-xs font-bold text-white gap-1.5">
                          <Eye className="w-4 h-4 text-emerald-400" />
                          <span>Click to Zoom &amp; Rotate</span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-48 rounded-xl bg-white/5 border border-dashed border-white/10 flex items-center justify-center text-xs text-[#AAA69C]">
                        No Trade License document uploaded
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#AAA69C]">Fayda National ID &amp; QR</span>
                      {inspectingPlace.fayda_document_url && (
                        <button
                          type="button"
                          onClick={() => openLightbox(inspectingPlace.fayda_document_url, `Fayda National ID — ${inspectingPlace.name}`, 'fayda')}
                          className="text-emerald-400 hover:text-emerald-300 font-semibold text-xs flex items-center gap-1"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>Inspect QR Fullscreen</span>
                        </button>
                      )}
                    </div>

                    {inspectingPlace.fayda_document_url ? (
                      <div
                        onClick={() => openLightbox(inspectingPlace.fayda_document_url, `Fayda National ID — ${inspectingPlace.name}`, 'fayda')}
                        className="h-64 rounded-xl bg-black/60 overflow-hidden cursor-pointer relative group border border-white/10 flex items-center justify-center"
                      >
                        <img
                          src={inspectingPlace.fayda_document_url}
                          alt="Fayda ID"
                          className="w-full h-full object-contain group-hover:scale-105 transition"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-xs font-bold text-white gap-1.5">
                          <QrCode className="w-4 h-4 text-emerald-400" />
                          <span>Click to Scan Digital QR</span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-48 rounded-xl bg-white/5 border border-dashed border-white/10 flex items-center justify-center text-xs text-[#AAA69C]">
                        No Fayda ID document uploaded
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Footer in Drawer */}
            <div className="pt-4 border-t border-white/[0.08] flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setRejectingPlace(inspectingPlace);
                  setRejectionNotes('');
                  setRejectionError('');
                }}
                className="flex-1 py-3 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold transition cursor-pointer"
              >
                Decline Application
              </button>

              <button
                type="button"
                onClick={() => setApprovingPlace(inspectingPlace)}
                className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Approve Verification</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. APPROVE CONFIRMATION MODAL */}
      {/* ======================================================== */}
      {approvingPlace && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setApprovingPlace(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-[#16161A] border border-white/15 p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Approve Business Verification?</h3>
                <p className="text-xs text-[#AAA69C] mt-0.5">
                  Confirm granting verified badge to <strong className="text-white">{approvingPlace.name}</strong>.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] text-xs space-y-2">
              <div className="flex justify-between text-[#AAA69C]">
                <span>10-Digit TIN:</span>
                <span className="font-mono text-white font-bold">{approvingPlace.tax_id || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-[#AAA69C]">
                <span>General Manager:</span>
                <span className="text-white font-semibold">{approvingPlace.manager_name || 'N/A'}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setApprovingPlace(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs text-[#AAA69C] hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmApprove}
                disabled={isSubmittingReview}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
              >
                {isSubmittingReview && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Approval</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. DECLINE MODAL WITH REASON CHIPS */}
      {/* ======================================================== */}
      {rejectingPlace && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setRejectingPlace(null)}
        >
          <form
            onSubmit={handleSubmitReject}
            className="w-full max-w-lg rounded-2xl bg-[#16161A] border border-white/15 p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-400" />
                <span>Decline Verification — {rejectingPlace.name}</span>
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
              Specify the reason for rejection. This feedback is sent directly to the business owner so they can correct their documents.
            </p>

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
                  className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-[11px] text-[#AAA69C] hover:text-white transition cursor-pointer"
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
                className="w-full rounded-xl bg-black/50 border border-white/15 p-3 text-xs text-white placeholder:text-[#AAA69C]/50 focus:border-rose-400 focus:outline-none transition"
              />
              {rejectionError && (
                <p className="text-[11px] text-rose-400 font-medium">{rejectionError}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setRejectingPlace(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs text-[#AAA69C] hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingReview || !rejectionNotes.trim()}
                className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
              >
                {isSubmittingReview && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Decline</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* 8. DOCUMENT INSPECTION LIGHTBOX (Zoom + Rotate 90°) */}
      {/* ======================================================== */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6 animate-in fade-in"
          onClick={() => setLightbox(null)}
        >
          <div
            className="flex items-center justify-between max-w-6xl w-full mx-auto pb-3 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold truncate max-w-md">{lightbox.title}</span>
              <span className="text-[11px] text-[#AAA69C] hidden sm:inline font-mono">
                (Press Esc to exit)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLightboxRotation((prev) => (prev + 90) % 360)}
                title="Rotate 90 degrees"
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs flex items-center gap-1 transition cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline font-medium">Rotate 90°</span>
              </button>

              <button
                type="button"
                onClick={() => setLightboxScale((prev) => Math.min(prev + 0.25, 2.5))}
                title="Zoom in"
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setLightboxScale((prev) => Math.max(prev - 0.25, 0.75))}
                title="Zoom out"
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              <a
                href={lightbox.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs flex items-center gap-1 transition"
              >
                <span>Raw</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                type="button"
                onClick={() => setLightbox(null)}
                className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

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

          <div
            className="max-w-6xl w-full mx-auto pt-2 flex items-center justify-between text-xs text-[#AAA69C]"
            onClick={(e) => e.stopPropagation()}
          >
            <p>
              Tip: Scan the digital QR code directly from this screen using{' '}
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
