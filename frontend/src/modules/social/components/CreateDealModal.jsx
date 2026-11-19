import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Tag,
  Calendar,
  Percent,
  Ticket,
  Image as ImageIcon,
  Users,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import socialApi from '../api/socialApi';

/**
 * Modal dialog for business owners to publish a new deal or announcement
 */
export function CreateDealModal({ isOpen, onClose, placeId, onCreated = () => {} }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    deal_type: 'deal',
    discount_percentage: '',
    discount_code: '',
    image_url: '',
    max_claims: '',
    expires_at: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      setErrorMsg('Title and description are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        deal_type: formData.deal_type,
      };

      if (formData.discount_percentage) {
        payload.discount_percentage = parseFloat(formData.discount_percentage);
      }
      if (formData.discount_code.trim()) {
        payload.discount_code = formData.discount_code.trim().toUpperCase();
      }
      if (formData.image_url.trim()) {
        payload.image_url = formData.image_url.trim();
      }
      if (formData.max_claims) {
        payload.max_claims = parseInt(formData.max_claims, 10);
      }
      if (formData.expires_at) {
        payload.expires_at = new Date(formData.expires_at).toISOString();
      }

      const res = await socialApi.createPost(placeId, payload);
      const created = res.data?.data || res.data;
      onCreated(created);
      onClose();
    } catch (err) {
      console.error('Failed to create deal post', err);
      setErrorMsg(err.response?.data?.message || 'Failed to publish deal. Please verify all fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={() => !isSubmitting && onClose()}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-[#141418] border border-white/10 p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">Create Special Deal</h3>
              <p className="text-[11px] text-[#AAA69C]">Publish an exclusive offer or voucher code</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#AAA69C] hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Post Type Selector */}
          <div className="space-y-1.5">
            <label className="text-[#AAA69C] font-semibold block">Deal Type</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'deal', label: 'Discount', icon: Tag },
                { id: 'announcement', label: 'Announcement', icon: Sparkles },
                { id: 'event', label: 'Special Event', icon: Calendar },
              ].map((t) => {
                const Icon = t.icon;
                const isSelected = formData.deal_type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, deal_type: t.id }))}
                    className={`py-2 px-3 rounded-xl border text-center font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-white text-black border-white shadow-md'
                        : 'bg-black/30 border-white/10 text-[#AAA69C] hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <label className="text-[#AAA69C] font-semibold block">
              Deal Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. 20% Off All Traditional Dishes Every Wednesday"
              className="w-full h-10 px-3.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-[#AAA69C]/40 focus:border-amber-400 focus:outline-none transition"
            />
          </div>

          {/* Content / Details */}
          <div className="space-y-1">
            <label className="text-[#AAA69C] font-semibold block">
              Offer Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              name="content"
              rows={3}
              required
              value={formData.content}
              onChange={handleChange}
              placeholder="Explain how guests can redeem the deal, valid hours, or terms..."
              className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-[#AAA69C]/40 focus:border-amber-400 focus:outline-none transition"
            />
          </div>

          {/* Discount Percentage & Voucher Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[#AAA69C] font-semibold flex items-center gap-1">
                <Percent className="w-3 h-3 text-emerald-400" />
                <span>Discount Percentage (Optional)</span>
              </label>
              <input
                type="number"
                name="discount_percentage"
                min="0"
                max="100"
                step="1"
                value={formData.discount_percentage}
                onChange={handleChange}
                placeholder="e.g. 25"
                className="w-full h-10 px-3.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-[#AAA69C]/40 focus:border-amber-400 focus:outline-none transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[#AAA69C] font-semibold flex items-center gap-1">
                <Ticket className="w-3 h-3 text-amber-400" />
                <span>Promo Code (Optional)</span>
              </label>
              <input
                type="text"
                name="discount_code"
                value={formData.discount_code}
                onChange={handleChange}
                placeholder="e.g. SPOT20"
                className="w-full h-10 px-3.5 rounded-xl bg-black/40 border border-white/10 text-white font-mono uppercase placeholder:text-[#AAA69C]/40 focus:border-amber-400 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Max Claims & Expiry Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[#AAA69C] font-semibold flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>Max Claims Limit (Optional)</span>
              </label>
              <input
                type="number"
                name="max_claims"
                min="1"
                value={formData.max_claims}
                onChange={handleChange}
                placeholder="e.g. 50 vouchers"
                className="w-full h-10 px-3.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-[#AAA69C]/40 focus:border-amber-400 focus:outline-none transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[#AAA69C] font-semibold flex items-center gap-1">
                <Calendar className="w-3 h-3 text-amber-400" />
                <span>Expiration Date (Optional)</span>
              </label>
              <input
                type="datetime-local"
                name="expires_at"
                value={formData.expires_at}
                onChange={handleChange}
                className="w-full h-10 px-3 rounded-xl bg-black/40 border border-white/10 text-white focus:border-amber-400 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Image URL */}
          <div className="space-y-1">
            <label className="text-[#AAA69C] font-semibold flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              <span>Cover / Banner Image URL (Optional)</span>
            </label>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/..."
              className="w-full h-10 px-3.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-[#AAA69C]/40 focus:border-amber-400 focus:outline-none transition"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 text-[#AAA69C] hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
              className="px-5 py-2 rounded-xl bg-white text-black hover:bg-[#F5F2EA] active:scale-95 disabled:opacity-40 font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Publish Deal</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateDealModal;
