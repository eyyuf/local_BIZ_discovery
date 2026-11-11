import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import SavedBookmarksList from '../components/SavedBookmarksList';
import { User, Mail, Bookmark, Shield, LogOut, Check, Phone, Compass } from 'lucide-react';
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
    <div ref={containerRef} className="min-h-screen bg-[#0D0D0C] text-[#F5F2EA] pt-24 sm:pt-28 pb-20 selection:bg-white/20 selection:text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Profile Hero Banner */}
        <div className="profile-enter bg-[#151518] border border-white/[0.08] rounded-3xl p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 relative overflow-hidden shadow-2xl">
          {/* Top accent light */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-white/40 via-white/20 to-transparent" />

          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-5 text-center sm:text-left">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#22C55E] to-[#16A34A] text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-black/40 shrink-0 ring-4 ring-white/10">
              {getInitials(user?.name)}
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight">
                  {user?.name || 'LocalSpot Explorer'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/[0.08] text-white/90 border border-white/10 font-mono">
                  {user?.role === 'owner' ? 'Business Owner' : 'Local Explorer'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#AAA69C] mt-1 flex items-center justify-center sm:justify-start gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#AAA69C]/80" />
                <span>{user?.email}</span>
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="px-4 py-2.5 rounded-full border border-red-500/30 bg-red-950/30 hover:bg-red-900/50 text-red-300 text-xs font-bold flex items-center gap-1.5 transition shrink-0 cursor-pointer shadow-sm active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="profile-enter flex items-center gap-2 border-b border-white/[0.08] mb-6 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer backdrop-blur-md ${
              activeTab === 'bookmarks'
                ? 'border border-white bg-white/15 text-white shadow-sm'
                : 'border border-white/10 bg-black/40 text-[#AAA69C] hover:text-white hover:border-white/30'
            }`}
          >
            <Bookmark className="w-4 h-4 text-white" />
            <span>Saved Spots</span>
          </button>

          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer backdrop-blur-md ${
              activeTab === 'details'
                ? 'border border-white bg-white/15 text-white shadow-sm'
                : 'border border-white/10 bg-black/40 text-[#AAA69C] hover:text-white hover:border-white/30'
            }`}
          >
            <User className="w-4 h-4 text-white" />
            <span>Account Details</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer backdrop-blur-md ${
              activeTab === 'security'
                ? 'border border-white bg-white/15 text-white shadow-sm'
                : 'border border-white/10 bg-black/40 text-[#AAA69C] hover:text-white hover:border-white/30'
            }`}
          >
            <Shield className="w-4 h-4 text-white" />
            <span>Security &amp; Session</span>
          </button>
        </div>

        {/* Tab 1: Saved Bookmarks */}
        {activeTab === 'bookmarks' && (
          <div className="profile-enter">
            <div className="mb-5">
              <h2 className="text-lg font-black text-white font-display">Your Bookmarked Places</h2>
              <p className="text-xs text-[#AAA69C] mt-0.5">Places you've pinned for recommendations, visits, and quick directions.</p>
            </div>
            <SavedBookmarksList />
          </div>
        )}

        {/* Tab 2: Account Details Form */}
        {activeTab === 'details' && (
          <div className="profile-enter max-w-xl bg-[#151518] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl">
            <h2 className="text-lg font-black text-white font-display mb-1">Personal Profile</h2>
            <p className="text-xs text-[#AAA69C] mb-6">Manage your contact details and public account identity.</p>

            {successMsg && (
              <div className="mb-5 p-3.5 rounded-2xl bg-[#162B1E] border border-[#22C55E]/40 text-white text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0 text-[#22C55E]" />
                <span className="font-semibold">{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="mb-5 p-3.5 rounded-2xl bg-red-950/40 border border-red-500/30 text-white text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#AAA69C] uppercase tracking-wider mb-1.5 font-mono">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#AAA69C]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/20 bg-black/45 text-white text-xs sm:text-sm focus:border-white outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#AAA69C] uppercase tracking-wider mb-1.5 font-mono">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#AAA69C]/60">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-[#AAA69C]/60 text-xs sm:text-sm cursor-not-allowed outline-none"
                  />
                </div>
                <span className="text-[11px] text-[#AAA69C]/60 mt-1 block">
                  Primary email is verified and locked to protect your account.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#AAA69C] uppercase tracking-wider mb-1.5 font-mono">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#AAA69C]">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+251 91 123 4567"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/20 bg-black/45 text-white text-xs sm:text-sm focus:border-white outline-none transition"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-6 py-2.5 rounded-full bg-white text-black font-extrabold text-xs shadow-lg hover:bg-[#F5F2EA] transition disabled:opacity-50 cursor-pointer active:scale-95"
                >
                  {isUpdating ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Security & Session */}
        {activeTab === 'security' && (
          <div className="profile-enter max-w-xl bg-[#151518] border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div>
              <h2 className="text-lg font-black text-white font-display mb-1">Session &amp; Credentials</h2>
              <p className="text-xs text-[#AAA69C]">Manage your active authentication token and device permissions.</p>
            </div>

            <div className="p-4 rounded-2xl border border-white/[0.08] bg-black/40 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Account Authorization</p>
                <p className="text-[11px] text-[#AAA69C] capitalize">{user?.role || 'Explorer'} Account</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#162B1E] text-[#22C55E] border border-[#22C55E]/30 font-mono">
                Connected
              </span>
            </div>

            <div className="pt-4 border-t border-white/[0.08]">
              <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1.5 font-mono">Sign Out</h3>
              <p className="text-xs text-[#AAA69C] mb-4">
                Clears your Sanctum Bearer token and wipes cached credentials from this browser session.
              </p>
              <button
                onClick={logout}
                className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out of This Device</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;