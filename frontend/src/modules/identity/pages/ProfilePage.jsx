import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import SavedBookmarksList from '../components/SavedBookmarksList';
import { User, Mail, Bookmark, Shield, LogOut, Check, Sparkles, Building2 } from 'lucide-react';
import gsap from 'gsap';

export function ProfilePage() {
  const { user, logout, updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState('bookmarks'); // 'bookmarks' | 'details' | 'security'
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const containerRef = useRef(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.profile-card',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await updateProfile({ name, phone });
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getInitials = (n) => {
    if (!n) return 'U';
    return n
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div ref={containerRef} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header Profile Banner */}
      <div className="profile-card glass-panel rounded-2xl p-6 sm:p-8 shadow-sm mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-brand-500/20 shrink-0">
          {getInitials(user?.name)}
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {user?.name || 'LocalSpot Explorer'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200">
              {user?.role === 'owner' ? 'Business Owner' : 'Explorer'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center justify-center sm:justify-start gap-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            {user?.email}
          </p>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>

      {/* Profile Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-6 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'bookmarks'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          Saved Spots
        </button>

        <button
          onClick={() => setActiveTab('details')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'details'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <User className="w-4 h-4" />
          Account Details
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'security'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Shield className="w-4 h-4" />
          Security & Access
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'bookmarks' && (
        <div>
          <div className="mb-4">
            <h2 className="text-base font-extrabold text-slate-900">Your Bookmarked Places</h2>
            <p className="text-xs text-slate-500">Places you've pinned for quick recommendations and visits.</p>
          </div>
          <SavedBookmarksList />
        </div>
      )}

      {activeTab === 'details' && (
        <div className="max-w-xl bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <h2 className="text-base font-extrabold text-slate-900 mb-1">Personal Information</h2>
          <p className="text-xs text-slate-500 mb-6">Update your public profile display details.</p>

          {successMsg && (
            <div className="mb-5 p-3 rounded-xl bg-brand-50 border border-brand-200 text-brand-800 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-brand-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm cursor-not-allowed outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Email address cannot be changed directly for security reasons.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className="mt-4 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition disabled:opacity-50"
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="max-w-xl bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 mb-1">Session & Authentication</h2>
            <p className="text-xs text-slate-500">Manage your active authentication state and token.</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800">Account Role</p>
              <p className="text-[11px] text-slate-500 capitalize">{user?.role || 'customer'}</p>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-100 text-emerald-800">
              Active
            </span>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2">Danger Zone</h3>
            <p className="text-xs text-slate-500 mb-3">Terminate your current session and wipe access tokens from this browser.</p>
            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out of This Device
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;

