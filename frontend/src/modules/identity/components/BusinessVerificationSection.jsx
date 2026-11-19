import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Eye,
  X,
  Building2,
  CreditCard,
  UserCheck,
} from 'lucide-react';
import placesApi from '@/modules/places/api/placesApi';
import { VerifiedBadge } from '@/shared/components/VerifiedBadge';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export function BusinessVerificationSection({ place, onPlaceUpdated }) {
  const [method, setMethod] = useState('tin_fayda'); // 'tin_fayda' | 'telebirr'
  const [isLoading, setIsLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [verificationData, setVerificationData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isResubmitting, setIsResubmitting] = useState(false);

  // Form Fields
  const [taxId, setTaxId] = useState(place?.tax_id || '');
  const [managerName, setManagerName] = useState(place?.manager_name || '');
  const [faydaFin, setFaydaFin] = useState(place?.fayda_fin || '');
  const [telebirrMerchantId, setTelebirrMerchantId] = useState(place?.telebirr_merchant_id || '');

  // File Upload States
  const [licenseFile, setLicenseFile] = useState(null);
  const [licensePreview, setLicensePreview] = useState(null);
  const [faydaFile, setFaydaFile] = useState(null);
  const [faydaPreview, setFaydaPreview] = useState(null);

  // Field validation errors
  const [errors, setErrors] = useState({});

  // Fetch current verification status from server
  const fetchStatus = async () => {
    if (!place?.id) return;
    setStatusLoading(true);
    try {
      const data = await placesApi.getVerificationStatus(place.id);
      setVerificationData(data);
      if (data.tax_id) setTaxId(data.tax_id);
      if (data.manager_name) setManagerName(data.manager_name);
      if (data.fayda_fin) setFaydaFin(data.fayda_fin);
      if (data.telebirr_merchant_id) setTelebirrMerchantId(data.telebirr_merchant_id);
    } catch {
      // Fallback to place object
      setVerificationData({
        verification_status: place?.verification_status || 'unverified',
        is_verified: Boolean(place?.is_verified),
        tax_id: place?.tax_id,
        manager_name: place?.manager_name,
        fayda_fin: place?.fayda_fin,
        verification_document: place?.verification_document,
        fayda_document: place?.fayda_document,
        verification_notes: place?.verification_notes,
        verified_at: place?.verified_at,
      });
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [place?.id]);

  const currentStatus = verificationData?.verification_status || place?.verification_status || 'unverified';
  const isVerified = Boolean(verificationData?.is_verified ?? place?.is_verified);
  const isPending = currentStatus === 'pending';
  const isRejected = currentStatus === 'rejected';

  // Handle License file selection
  const handleLicenseSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        license: 'Trade License must be an image (JPEG, PNG, WEBP) or PDF document.',
      }));
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrors((prev) => ({
        ...prev,
        license: 'Trade License file exceeds 10MB limit.',
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, license: null }));
    setLicenseFile(file);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setLicensePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setLicensePreview(null);
    }
  };

  // Handle Fayda file selection
  const handleFaydaSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        fayda: 'Fayda ID must be an image (JPEG, PNG, WEBP) or PDF document.',
      }));
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrors((prev) => ({
        ...prev,
        fayda: 'Fayda ID file exceeds 10MB limit.',
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, fayda: null }));
    setFaydaFile(file);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setFaydaPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setFaydaPreview(null);
    }
  };

  // Validate form before submission
  const validate = () => {
    const newErrors = {};

    if (method === 'telebirr') {
      const cleanMerchant = telebirrMerchantId.trim();
      if (!cleanMerchant) {
        newErrors.telebirr = 'Telebirr Merchant Till ID is required.';
      } else if (!/^\d{5,8}$/.test(cleanMerchant)) {
        newErrors.telebirr = 'Telebirr Merchant ID must be 5 to 8 digits.';
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }

    // TIN + Fayda method
    const cleanTax = taxId.trim();
    if (!cleanTax) {
      newErrors.taxId = '10-digit Taxpayer Identification Number (TIN) is required.';
    } else if (!/^\d{10}$/.test(cleanTax)) {
      newErrors.taxId = 'Ethiopian TIN must be exactly 10 digits (e.g. 0012345678).';
    }

    const cleanManager = managerName.trim();
    if (!cleanManager) {
      newErrors.managerName = 'General Manager legal full name is required.';
    } else if (cleanManager.length < 3) {
      newErrors.managerName = 'Manager name must be at least 3 characters.';
    }

    // If new submission or re-uploading
    if (!licenseFile && !verificationData?.verification_document) {
      newErrors.license = 'Trade License document is required.';
    }

    if (!faydaFile && !verificationData?.fayda_document) {
      newErrors.fayda = 'Fayda National ID document is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (isPending) {
      setErrorMsg('A verification application is already pending review for this business.');
      return;
    }

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();

      if (method === 'telebirr') {
        formData.append('verification_type', 'telebirr');
        formData.append('telebirr_merchant_id', telebirrMerchantId.trim());
      } else {
        formData.append('verification_type', 'tin_fayda');
        formData.append('tax_id', taxId.trim());
        formData.append('manager_name', managerName.trim());
        if (faydaFin.trim()) {
          formData.append('fayda_fin', faydaFin.trim());
        }
        if (licenseFile) {
          formData.append('license_document', licenseFile);
        }
        if (faydaFile) {
          formData.append('fayda_document', faydaFile);
        }
      }

      const res = await placesApi.submitVerification(place.id, formData);
      setSuccessMsg(res.message || 'Verification submitted successfully!');
      setIsResubmitting(false);

      // Refresh data
      await fetchStatus();
      if (onPlaceUpdated) {
        onPlaceUpdated(res.place || res.data || place);
      }
    } catch (err) {
      const responseErrors = err.response?.data?.errors;
      if (responseErrors) {
        const firstKey = Object.keys(responseErrors)[0];
        setErrorMsg(responseErrors[firstKey]?.[0] || 'Validation failed. Please verify your inputs.');
      } else {
        setErrorMsg(err.response?.data?.message || 'Failed to submit verification. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (statusLoading) {
    return (
      <div className="p-8 rounded-2xl bg-[#151518] border border-white/[0.08] flex flex-col items-center justify-center space-y-3">
        <div className="w-7 h-7 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        <span className="text-xs font-mono text-[#AAA69C]">Checking legitimacy status...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Card */}
      <div className="p-6 rounded-2xl bg-[#151518] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-black text-white font-display">Business Verification</h2>
            {isVerified && <VerifiedBadge size="md" showLabel />}
            {isPending && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-semibold">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Pending Review</span>
              </span>
            )}
            {isRejected && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-semibold">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>Requires Correction</span>
              </span>
            )}
          </div>
          <p className="text-xs text-[#AAA69C] mt-1 max-w-2xl">
            Authenticate your business using official Ethiopian Trade License and Fayda National ID credentials to receive the verified checkmark.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchStatus}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 hover:border-white/25 bg-black/40 text-xs font-medium text-[#AAA69C] hover:text-white transition cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Global Alerts */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 2. STATE A: APPROVED / VERIFIED */}
      {isVerified && (
        <div className="p-6 sm:p-8 rounded-2xl bg-[#151518] border border-sky-500/30 shadow-xl space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Verified Business Legitimacy</span>
                <VerifiedBadge size="sm" />
              </h3>
              <p className="text-xs text-[#AAA69C]">
                Your business has been officially verified by Ma'ed. The verified badge is displayed on your public spot page and in search results.
              </p>
            </div>
          </div>

          {/* Credentials Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/[0.08]">
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06]">
              <span className="text-[11px] text-[#AAA69C] block">Registered TIN</span>
              <span className="text-sm font-mono font-bold text-white mt-0.5 block">
                {verificationData?.tax_id || place.tax_id || 'N/A'}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06]">
              <span className="text-[11px] text-[#AAA69C] block">General Manager</span>
              <span className="text-sm font-medium text-white mt-0.5 block truncate">
                {verificationData?.manager_name || place.manager_name || 'N/A'}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06]">
              <span className="text-[11px] text-[#AAA69C] block">Verified On</span>
              <span className="text-sm font-medium text-sky-400 mt-0.5 block">
                {verificationData?.verified_at
                  ? new Date(verificationData.verified_at).toLocaleDateString()
                  : 'Official Verification'}
              </span>
            </div>
          </div>

          {/* Verification Notes */}
          {verificationData?.verification_notes && (
            <div className="p-3.5 rounded-xl bg-black/30 border border-white/[0.06] text-xs text-[#AAA69C]">
              <span className="text-white/60 font-medium mr-1.5">Note:</span>
              <span>{verificationData.verification_notes}</span>
            </div>
          )}
        </div>
      )}

      {/* 3. STATE B: PENDING REVIEW */}
      {!isVerified && isPending && (
        <div className="p-6 sm:p-8 rounded-2xl bg-[#151518] border border-amber-500/30 shadow-xl space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-white">Application Under Administrator Review</h3>
              <p className="text-xs text-[#AAA69C]">
                Your Trade License and Fayda identification documents have been received. Our compliance team is verifying your business legitimacy.
              </p>
            </div>
          </div>

          {/* Submitted details summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/[0.08]">
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06]">
              <span className="text-[11px] text-[#AAA69C] block">Submitted TIN</span>
              <span className="text-sm font-mono font-bold text-white mt-0.5 block">
                {verificationData?.tax_id || place.tax_id || 'Under Review'}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06]">
              <span className="text-[11px] text-[#AAA69C] block">Manager Legal Name</span>
              <span className="text-sm font-medium text-white mt-0.5 block truncate">
                {verificationData?.manager_name || place.manager_name || 'Under Review'}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06]">
              <span className="text-[11px] text-[#AAA69C] block">Status</span>
              <span className="text-sm font-medium text-amber-300 mt-0.5 block">
                Queued for Review
              </span>
            </div>
          </div>

          {/* Submitted Documents Links */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-2">
            <span className="text-xs font-semibold text-white/80 block">Submitted Verification Documents</span>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {verificationData?.verification_document && (
                <a
                  href={verificationData.verification_document}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/30 bg-[#1D1C19] text-xs text-white transition"
                >
                  <FileText className="w-3.5 h-3.5 text-white/70" />
                  <span>Trade License Document</span>
                  <ExternalLink className="w-3 h-3 text-[#AAA69C]" />
                </a>
              )}
              {verificationData?.fayda_document && (
                <a
                  href={verificationData.fayda_document}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/30 bg-[#1D1C19] text-xs text-white transition"
                >
                  <UserCheck className="w-3.5 h-3.5 text-white/70" />
                  <span>Fayda ID Document</span>
                  <ExternalLink className="w-3 h-3 text-[#AAA69C]" />
                </a>
              )}
            </div>
          </div>

          <p className="text-xs text-[#AAA69C]/80 italic">
            To prevent duplicate applications, modifications are locked while review is in progress.
          </p>
        </div>
      )}

      {/* 4. STATE C: REJECTED / REQUIRES RESUBMISSION */}
      {!isVerified && isRejected && !isResubmitting && (
        <div className="p-6 sm:p-8 rounded-2xl bg-[#151518] border border-rose-500/30 shadow-xl space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-white">Verification Requires Correction</h3>
              <p className="text-xs text-[#AAA69C]">
                Your previous verification submission could not be approved. Please review the reason below and resubmit updated documents.
              </p>
            </div>
          </div>

          {/* Rejection Note */}
          <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 space-y-1">
            <span className="text-[11px] font-semibold text-rose-300 uppercase tracking-wider block">
              Administrator Feedback:
            </span>
            <p className="text-xs sm:text-sm text-white">
              {verificationData?.verification_notes || 'Please provide clear, legible copies of your Trade License and Fayda ID matching your business manager name.'}
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsResubmitting(true)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black text-xs font-bold hover:bg-[#F5F2EA] active:scale-95 transition shadow-lg cursor-pointer"
            >
              <span>Resubmit Verification Documents</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. STATE D: VERIFICATION FORM (Unverified OR Resubmitting) */}
      {(!isVerified && !isPending && (!isRejected || isResubmitting)) && (
        <div className="p-6 sm:p-8 rounded-2xl bg-[#151518] border border-white/[0.08] shadow-xl space-y-6">
          {/* Method Selector Tabs */}
          <div className="flex border-b border-white/[0.08] pb-4 gap-3">
            <button
              type="button"
              onClick={() => setMethod('tin_fayda')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                method === 'tin_fayda'
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-[#AAA69C] hover:text-white border border-transparent'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Trade License &amp; Fayda ID (Recommended)</span>
            </button>
            <button
              type="button"
              onClick={() => setMethod('telebirr')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                method === 'telebirr'
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-[#AAA69C] hover:text-white border border-transparent'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Instant Telebirr Till</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {method === 'tin_fayda' ? (
              <>
                {/* TIN & Manager Name Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 10-Digit TIN */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white block">
                      10-Digit Business TIN <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      value={taxId}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setTaxId(val);
                        if (errors.taxId) setErrors((prev) => ({ ...prev, taxId: null }));
                      }}
                      placeholder="e.g. 0012345678"
                      className={`w-full h-11 rounded-xl bg-[#1D1C19] border ${
                        errors.taxId ? 'border-rose-500' : 'border-white/15 focus:border-white'
                      } px-3.5 text-xs font-mono text-white placeholder:text-[#AAA69C]/50 focus:outline-none transition`}
                    />
                    {errors.taxId ? (
                      <p className="text-[11px] text-rose-400">{errors.taxId}</p>
                    ) : (
                      <p className="text-[11px] text-[#AAA69C]">
                        Official Ethiopian Taxpayer Identification Number (10 digits).
                      </p>
                    )}
                  </div>

                  {/* Legal General Manager Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white block">
                      General Manager Full Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={managerName}
                      onChange={(e) => {
                        setManagerName(e.target.value);
                        if (errors.managerName) setErrors((prev) => ({ ...prev, managerName: null }));
                      }}
                      placeholder="e.g. Abebe Bikila Kebede"
                      className={`w-full h-11 rounded-xl bg-[#1D1C19] border ${
                        errors.managerName ? 'border-rose-500' : 'border-white/15 focus:border-white'
                      } px-3.5 text-xs text-white placeholder:text-[#AAA69C]/50 focus:outline-none transition`}
                    />
                    {errors.managerName ? (
                      <p className="text-[11px] text-rose-400">{errors.managerName}</p>
                    ) : (
                      <p className="text-[11px] text-[#AAA69C]">
                        Must match the Manager name stated on the Trade License.
                      </p>
                    )}
                  </div>
                </div>

                {/* Fayda FIN (Optional) */}
                <div className="space-y-1.5 max-w-md">
                  <label className="text-xs font-semibold text-white block">
                    Fayda Identification Number (FIN / FAN)
                  </label>
                  <input
                    type="text"
                    value={faydaFin}
                    onChange={(e) => setFaydaFin(e.target.value)}
                    placeholder="e.g. 1234-5678-9012"
                    className="w-full h-11 rounded-xl bg-[#1D1C19] border border-white/15 focus:border-white px-3.5 text-xs font-mono text-white placeholder:text-[#AAA69C]/50 focus:outline-none transition"
                  />
                  <p className="text-[11px] text-[#AAA69C]">
                    Your unique Ethiopian National Digital ID number (optional).
                  </p>
                </div>

                {/* Documents Upload Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  {/* 1. Trade License Upload */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-white flex items-center justify-between">
                      <span>Trade License (የንግድ ፈቃድ) <span className="text-rose-400">*</span></span>
                      <span className="text-[10px] text-[#AAA69C]">Max 10MB</span>
                    </label>

                    <div className="relative rounded-2xl border border-dashed border-white/20 hover:border-white/40 p-4 transition text-center bg-[#1D1C19]/60">
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,.pdf"
                        onChange={handleLicenseSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      {licenseFile ? (
                        <div className="space-y-2">
                          {licensePreview ? (
                            <img
                              src={licensePreview}
                              alt="License Preview"
                              className="w-full h-32 object-contain rounded-lg mx-auto bg-black/40"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto text-white">
                              <FileText className="w-6 h-6" />
                            </div>
                          )}
                          <div className="flex items-center justify-center gap-1.5 text-xs text-white font-medium">
                            <span className="truncate max-w-[200px]">{licenseFile.name}</span>
                            <span className="text-[#AAA69C]">({(licenseFile.size / 1024 / 1024).toFixed(1)}MB)</span>
                          </div>
                          <span className="text-[11px] text-emerald-400 block font-mono">Ready to upload</span>
                        </div>
                      ) : (
                        <div className="py-4 space-y-2">
                          <Upload className="w-6 h-6 text-[#AAA69C] mx-auto" />
                          <p className="text-xs font-semibold text-white">Click or drag Trade License</p>
                          <p className="text-[11px] text-[#AAA69C]">JPEG, PNG, WEBP, or PDF</p>
                        </div>
                      )}
                    </div>
                    {errors.license && <p className="text-[11px] text-rose-400">{errors.license}</p>}
                  </div>

                  {/* 2. Fayda ID Upload */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-white flex items-center justify-between">
                      <span>Fayda National ID Card <span className="text-rose-400">*</span></span>
                      <span className="text-[10px] text-[#AAA69C]">Max 10MB</span>
                    </label>

                    <div className="relative rounded-2xl border border-dashed border-white/20 hover:border-white/40 p-4 transition text-center bg-[#1D1C19]/60">
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,.pdf"
                        onChange={handleFaydaSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      {faydaFile ? (
                        <div className="space-y-2">
                          {faydaPreview ? (
                            <img
                              src={faydaPreview}
                              alt="Fayda Preview"
                              className="w-full h-32 object-contain rounded-lg mx-auto bg-black/40"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto text-white">
                              <UserCheck className="w-6 h-6" />
                            </div>
                          )}
                          <div className="flex items-center justify-center gap-1.5 text-xs text-white font-medium">
                            <span className="truncate max-w-[200px]">{faydaFile.name}</span>
                            <span className="text-[#AAA69C]">({(faydaFile.size / 1024 / 1024).toFixed(1)}MB)</span>
                          </div>
                          <span className="text-[11px] text-emerald-400 block font-mono">Ready to upload</span>
                        </div>
                      ) : (
                        <div className="py-4 space-y-2">
                          <UserCheck className="w-6 h-6 text-[#AAA69C] mx-auto" />
                          <p className="text-xs font-semibold text-white">Click or drag Fayda National ID</p>
                          <p className="text-[11px] text-[#AAA69C]">Ensure QR code &amp; name are clearly legible</p>
                        </div>
                      )}
                    </div>
                    {errors.fayda && <p className="text-[11px] text-rose-400">{errors.fayda}</p>}
                  </div>
                </div>
              </>
            ) : (
              /* Telebirr Till Verification Form */
              <div className="space-y-4 max-w-md">
                <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-[#AAA69C] space-y-1">
                  <span className="text-white font-semibold block">Instant Automated Verification</span>
                  <p>
                    If your business has a registered Telebirr Merchant Till, you can verify instantly by entering your Till / Merchant Number.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white block">
                    Telebirr Merchant ID / Till Number <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={8}
                    value={telebirrMerchantId}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setTelebirrMerchantId(val);
                      if (errors.telebirr) setErrors((prev) => ({ ...prev, telebirr: null }));
                    }}
                    placeholder="e.g. 567890"
                    className={`w-full h-11 rounded-xl bg-[#1D1C19] border ${
                      errors.telebirr ? 'border-rose-500' : 'border-white/15 focus:border-white'
                    } px-3.5 text-xs font-mono text-white placeholder:text-[#AAA69C]/50 focus:outline-none transition`}
                  />
                  {errors.telebirr && <p className="text-[11px] text-rose-400">{errors.telebirr}</p>}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
              {isResubmitting ? (
                <button
                  type="button"
                  onClick={() => setIsResubmitting(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#AAA69C] hover:text-white transition"
                >
                  Cancel
                </button>
              ) : <div />}

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black text-xs font-bold hover:bg-[#F5F2EA] active:scale-95 transition shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <span>Submit for Verification</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default BusinessVerificationSection;
