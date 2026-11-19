import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  Building2,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  UserCheck,
  Phone,
  CreditCard,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { placesApi } from '../api/placesApi';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export function ClaimBusinessModal({ place, isOpen, onClose, onClaimSubmitted, currentUser }) {
  const navigate = useNavigate();

  // Form State
  const [taxId, setTaxId] = useState('');
  const [managerName, setManagerName] = useState(currentUser?.name || '');
  const [claimRole, setClaimRole] = useState('owner');
  const [contactPhone, setContactPhone] = useState(currentUser?.phone || place?.phone || '');
  const [faydaFin, setFaydaFin] = useState('');
  const [claimNotes, setClaimNotes] = useState('');
  const [declarationConfirmed, setDeclarationConfirmed] = useState(false);

  // Files
  const [licenseFile, setLicenseFile] = useState(null);
  const [licensePreview, setLicensePreview] = useState(null);
  const [faydaFile, setFaydaFile] = useState(null);
  const [faydaPreview, setFaydaPreview] = useState(null);

  // Status
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  // File Handlers
  const handleLicenseSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setFieldErrors((prev) => ({
        ...prev,
        license: 'Trade License must be an image (JPEG, PNG, WEBP) or PDF document.',
      }));
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFieldErrors((prev) => ({
        ...prev,
        license: 'File size must not exceed 10MB.',
      }));
      return;
    }

    setLicenseFile(file);
    setFieldErrors((prev) => {
      const copy = { ...prev };
      delete copy.license;
      return copy;
    });

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setLicensePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setLicensePreview(null);
    }
  };

  const handleFaydaSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setFieldErrors((prev) => ({
        ...prev,
        fayda: 'Fayda ID must be an image (JPEG, PNG, WEBP) or PDF.',
      }));
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFieldErrors((prev) => ({
        ...prev,
        fayda: 'File size must not exceed 10MB.',
      }));
      return;
    }

    setFaydaFile(file);
    setFieldErrors((prev) => {
      const copy = { ...prev };
      delete copy.fayda;
      return copy;
    });

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setFaydaPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setFaydaPreview(null);
    }
  };

  const validateForm = () => {
    const errors = {};

    const cleanTax = taxId.replace(/\s|-/g, '');
    if (!cleanTax) {
      errors.taxId = 'TIN (የግብር ከፋይ መለያ ቁጥር) is required.';
    } else if (!/^\d{9,12}$/.test(cleanTax)) {
      errors.taxId = 'TIN must be a 10-digit Ethiopian tax number.';
    }

    if (!managerName.trim()) {
      errors.managerName = 'Legal General Manager name is required.';
    }

    if (!contactPhone.trim()) {
      errors.contactPhone = 'Direct contact telephone is required.';
    }

    if (!licenseFile) {
      errors.license = 'Trade License (የንግድ ፈቃድ) document or photo is required.';
    }

    if (!declarationConfirmed) {
      errors.declaration = 'You must certify legal authorization under penalty of law.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('tax_id', taxId.replace(/\s|-/g, ''));
      formData.append('manager_name', managerName.trim());
      formData.append('claim_role', claimRole);
      formData.append('claim_contact_phone', contactPhone.trim());
      formData.append('declaration_confirmed', '1');

      if (claimNotes.trim()) {
        formData.append('claim_notes', claimNotes.trim());
      }
      if (faydaFin.trim()) {
        formData.append('fayda_fin', faydaFin.trim());
      }
      if (licenseFile) {
        formData.append('license_document', licenseFile);
      }
      if (faydaFile) {
        formData.append('fayda_document', faydaFile);
      }

      const response = await placesApi.claimPlace(place.id || place.slug, formData);
      setIsSuccess(true);
      if (onClaimSubmitted) {
        onClaimSubmitted(response?.place);
      }
    } catch (err) {
      const resData = err.response?.data;
      if (resData?.errors) {
        const flatErrors = {};
        Object.entries(resData.errors).forEach(([k, msgs]) => {
          flatErrors[k] = Array.isArray(msgs) ? msgs[0] : msgs;
        });
        setFieldErrors(flatErrors);
      } else {
        setServerError(resData?.message || 'Failed to submit claim. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#141416] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-display">Claim Business Ownership</h2>
              <p className="text-xs text-[#AAA69C] truncate max-w-sm sm:max-w-md">
                Official verification for <span className="text-white font-medium">{place?.name}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-[#AAA69C] hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Unauthenticated Gate */}
          {!currentUser ? (
            <div className="text-center py-8 px-4 space-y-5">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-xl font-bold text-white font-display">Sign In to Claim This Spot</h3>
                <p className="text-xs text-[#AAA69C] leading-relaxed">
                  To prevent unauthorized takeovers and ensure business management permissions are linked to your profile, please sign in or register before claiming.
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)}
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-white text-black text-xs font-bold hover:bg-[#F5F2EA] transition active:scale-95 shadow-lg"
                >
                  Sign In / Create Account
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 rounded-full border border-white/10 text-xs font-semibold text-[#AAA69C] hover:text-white transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : isSuccess ? (
            /* Success Celebration Screen */
            <div className="text-center py-8 px-4 space-y-5 animate-fadeIn">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-xl font-bold text-white font-display">Claim Submitted Successfully!</h3>
                <p className="text-xs text-[#AAA69C] leading-relaxed">
                  Your legal ownership claim for <span className="text-white font-semibold">{place?.name}</span> has been securely logged. Our compliance department will cross-check your Trade License and TIN with the official Ministry records.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-left text-xs space-y-2 max-w-md mx-auto">
                <div className="flex items-center justify-between text-[#AAA69C]">
                  <span>Review Timeline</span>
                  <span className="text-white font-semibold">24 - 48 Hours</span>
                </div>
                <div className="flex items-center justify-between text-[#AAA69C]">
                  <span>Status</span>
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Pending Verification
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#AAA69C]">
                  <span>Outcome on Approval</span>
                  <span className="text-emerald-400 font-semibold">Full Owner Dashboard + Verified Badge</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-3 rounded-full bg-white text-black text-xs font-bold hover:bg-[#F5F2EA] transition active:scale-95 shadow-lg"
                >
                  Return to Venue Page
                </button>
              </div>
            </div>
          ) : (
            /* Claim Submission Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Security Shield Notice */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-300">Strict Anti-Hijacking Policy: </span>
                  To safeguard genuine Ethiopian business owners, claims are granted only after reviewing your valid Ethiopian Trade License (የንግድ ፈቃድ) and TIN. Fraudulent claims will be rejected and reported.
                </div>
              </div>

              {serverError && (
                <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{serverError}</span>
                </div>
              )}

              {/* Grid Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 10-Digit TIN */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white flex items-center justify-between">
                    <span>Ethiopian TIN (የግብር ከፋይ መለያ ቁጥር) *</span>
                    <span className="text-[10px] font-mono text-[#AAA69C]">10 Digits</span>
                  </label>
                  <input
                    type="text"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    placeholder="e.g. 0012345678"
                    maxLength={14}
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-black/40 border text-xs text-white placeholder-white/20 focus:outline-none focus:ring-1 transition font-mono ${
                      fieldErrors.taxId || fieldErrors.tax_id
                        ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                        : 'border-white/10 focus:border-amber-400 focus:ring-amber-400'
                    }`}
                  />
                  {(fieldErrors.taxId || fieldErrors.tax_id) && (
                    <p className="text-[11px] text-rose-400">{fieldErrors.taxId || fieldErrors.tax_id}</p>
                  )}
                </div>

                {/* Manager Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white">
                    General Manager / Owner Legal Name *
                  </label>
                  <input
                    type="text"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    placeholder="Full name matching license"
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-black/40 border text-xs text-white placeholder-white/20 focus:outline-none focus:ring-1 transition ${
                      fieldErrors.managerName || fieldErrors.manager_name
                        ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                        : 'border-white/10 focus:border-amber-400 focus:ring-amber-400'
                    }`}
                  />
                  {(fieldErrors.managerName || fieldErrors.manager_name) && (
                    <p className="text-[11px] text-rose-400">{fieldErrors.managerName || fieldErrors.manager_name}</p>
                  )}
                </div>

                {/* Role */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white">
                    Your Capacity / Role *
                  </label>
                  <select
                    value={claimRole}
                    onChange={(e) => setClaimRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1D1D20] border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:border-amber-400 focus:ring-amber-400 transition"
                  >
                    <option value="owner">Owner / Founder (ባለቤት)</option>
                    <option value="general_manager">General Manager (ዋና ሥራ አስኪያጅ)</option>
                    <option value="managing_partner">Managing Partner (አጋር)</option>
                    <option value="authorized_agent">Authorized Legal Representative (ህጋዊ ወኪል)</option>
                  </select>
                </div>

                {/* Direct Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white">
                    Claimant Direct Phone *
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+251 91 123 4567"
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-black/40 border text-xs text-white placeholder-white/20 focus:outline-none focus:ring-1 transition font-mono ${
                      fieldErrors.contactPhone || fieldErrors.claim_contact_phone
                        ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                        : 'border-white/10 focus:border-amber-400 focus:ring-amber-400'
                    }`}
                  />
                  {(fieldErrors.contactPhone || fieldErrors.claim_contact_phone) && (
                    <p className="text-[11px] text-rose-400">{fieldErrors.contactPhone || fieldErrors.claim_contact_phone}</p>
                  )}
                </div>
              </div>

              {/* Trade License Document Upload */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-white flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>Official Ethiopian Trade License (የንግድ ፈቃድ) *</span>
                  </span>
                  <span className="text-[10px] text-[#AAA69C]">Photo or PDF (max 10MB)</span>
                </label>

                {!licenseFile ? (
                  <label className={`block border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition ${
                    fieldErrors.license || fieldErrors.license_document
                      ? 'border-rose-500 bg-rose-500/5'
                      : 'border-white/15 bg-white/[0.02] hover:border-amber-400/50 hover:bg-amber-400/5'
                  }`}>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.pdf"
                      onChange={handleLicenseSelect}
                      className="hidden"
                    />
                    <Upload className="w-6 h-6 mx-auto mb-2 text-[#AAA69C]" />
                    <p className="text-xs font-medium text-white">Click or drag to upload Trade License</p>
                    <p className="text-[10px] text-[#AAA69C] mt-1">Accepts clear scans or photos of official license</p>
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.04] border border-white/15">
                    <div className="flex items-center gap-3 truncate">
                      {licensePreview ? (
                        <img src={licensePreview} alt="License Preview" className="w-10 h-10 object-cover rounded-xl border border-white/20" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
                          <FileText className="w-5 h-5" />
                        </div>
                      )}
                      <div className="truncate text-left">
                        <p className="text-xs font-semibold text-white truncate">{licenseFile.name}</p>
                        <p className="text-[10px] text-[#AAA69C]">{(licenseFile.size / 1024 / 1024).toFixed(2)} MB • Ready</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setLicenseFile(null);
                        setLicensePreview(null);
                      }}
                      className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {(fieldErrors.license || fieldErrors.license_document) && (
                  <p className="text-[11px] text-rose-400">{fieldErrors.license || fieldErrors.license_document}</p>
                )}
              </div>

              {/* Fayda National ID (Optional Fast Track) */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>Ethiopian Fayda National ID (ፋይዳ)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 font-mono">Fast-Track</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={faydaFin}
                    onChange={(e) => setFaydaFin(e.target.value)}
                    placeholder="Fayda FIN / FAN (e.g. 1234-5678-9012)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-white/20 focus:outline-none focus:border-blue-400 transition font-mono"
                  />
                  {!faydaFile ? (
                    <label className="border border-dashed border-white/15 rounded-xl px-3.5 py-2.5 text-center cursor-pointer hover:border-blue-400/50 flex items-center justify-center gap-2 text-xs text-[#AAA69C] hover:text-white transition">
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,.pdf"
                        onChange={handleFaydaSelect}
                        className="hidden"
                      />
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Fayda Scan</span>
                    </label>
                  ) : (
                    <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white">
                      <span className="truncate max-w-[140px]">{faydaFile.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setFaydaFile(null);
                          setFaydaPreview(null);
                        }}
                        className="text-rose-400 hover:text-rose-300 ml-2 text-[10px]"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes / Context */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-semibold text-white">
                  Additional Proof / Verification Notes <span className="text-[#AAA69C] font-normal">(Optional)</span>
                </label>
                <textarea
                  value={claimNotes}
                  onChange={(e) => setClaimNotes(e.target.value)}
                  placeholder="Provide any additional details or background to expedite approval..."
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-white/20 focus:outline-none focus:border-amber-400 transition resize-none"
                />
              </div>

              {/* Legal Attestation Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 cursor-pointer hover:border-white/20 transition">
                  <input
                    type="checkbox"
                    checked={declarationConfirmed}
                    onChange={(e) => setDeclarationConfirmed(e.target.checked)}
                    className="mt-0.5 rounded border-white/30 text-amber-500 focus:ring-amber-500 focus:ring-offset-0 bg-black/40"
                  />
                  <div className="text-[11px] text-[#AAA69C] leading-relaxed">
                    <span className="font-semibold text-white">Legal Declaration: </span>
                    I hereby certify under penalty of Ethiopian commercial law that I am the genuine owner or authorized legal manager of <strong className="text-white">{place?.name}</strong>. I acknowledge that fraudulent business takeovers are punishable under civil and criminal law and will result in permanent ban and notification to legal authorities.
                  </div>
                </label>
                {(fieldErrors.declaration || fieldErrors.declaration_confirmed) && (
                  <p className="text-[11px] text-rose-400 mt-1 pl-1">
                    {fieldErrors.declaration || fieldErrors.declaration_confirmed}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-full border border-white/10 text-xs font-semibold text-[#AAA69C] hover:text-white transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition active:scale-95 shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                      <span>Submitting Claim...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Submit Legal Ownership Claim</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ClaimBusinessModal;
