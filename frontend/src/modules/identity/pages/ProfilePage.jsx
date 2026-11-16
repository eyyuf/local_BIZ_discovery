import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import SavedBookmarksList from '../components/SavedBookmarksList';
import { User, Mail, Bookmark, Shield, LogOut, Check, Sparkles, Phone, Compass, Briefcase, Calendar } from 'lucide-react';
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
        '.profile-enter',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
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
    <div ref={containerRef} className="min-h-[calc(100vh-4rem)] auth-bg-canvas py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Profile Hero Banner */}
        <div className="profile-enter production-card rounded-3xl p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 relative overflow-hidden">
          {/* Top accent light */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-brand-500 to-teal-400" />

          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-5 text-center sm:text-left">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-emerald-600/25 shrink-0 ring-4 ring-emerald-50">
              {getInitials(user?.name)}
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {user?.name || 'LocalSpot Explorer'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {user?.role === 'owner' ? 'Business Owner' : 'Local Explorer'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center justify-center sm:justify-start gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {user?.email}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1.5 transition shrink-0 cursor-pointer shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="profile-enter flex items-center gap-2 border-b border-slate-200 mb-6 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'bookmarks'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            <Bookmark className="w-4 h-4 text-emerald-400" />
            Saved Spots
          </button>

          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'details'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4 text-emerald-400" />
            Account Details
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'security'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4 text-emerald-400" />
            Security & Session
          </button>
        </div>

        {/* Tab 1: Saved Bookmarks */}
        {activeTab === 'bookmarks' && (
          <div className="profile-enter">
            <div className="mb-5">
              <h2 className="text-lg font-extrabold text-slate-900">Your Bookmarked Places</h2>
              <p className="text-xs text-slate-500">Places you've pinned for recommendations, visits, and quick directions.</p>
            </div>
            <SavedBookmarksList />
          </div>
        )}

        {/* Tab 2: Account Details Form */}
        {activeTab === 'details' && (
          <div className="profile-enter max-w-xl production-card rounded-3xl p-6 sm:p-8">
            <h2 className="text-lg font-extrabold text-slate-900 mb-1">Personal Profile</h2>
            <p className="text-xs text-slate-500 mb-6">Manage your contact details and public account identity.</p>

            {successMsg && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                <span className="font-semibold">{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-xs sm:text-sm cursor-not-allowed outline-none"
                  />
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Primary email is verified and locked to protect your account.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition disabled:opacity-50 cursor-pointer"
                >
                  {isUpdating ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Security & Session */}
        {activeTab === 'security' && (
          <div className="profile-enter max-w-xl production-card rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 mb-1">Session & Credentials</h2>
              <p className="text-xs text-slate-500">Manage your active authentication token and device permissions.</p>
            </div>

            <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800">Account Authorization</p>
                <p className="text-[11px] text-slate-500 capitalize">{user?.role || 'Explorer'} Account</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Connected
              </span>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1.5">Sign Out</h3>
              <p className="text-xs text-slate-500 mb-4">
                Clears your Sanctum Bearer token and wipes cached credentials from this browser session.
              </p>
              <button
                onClick={logout}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out of This Device
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
