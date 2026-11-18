import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/modules/identity';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export function AdminRoute({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-[#AAA69C]">
        <span className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-3" />
        <span className="text-xs">Authenticating administrator privileges...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4 shadow-xl">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Administrator Access Required</h2>
        <p className="text-sm text-[#AAA69C] max-w-md mb-6 leading-relaxed">
          Your current account (<span className="text-white font-mono">{user?.email}</span>) does not have administrator privileges to view this management console.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Discovery Feed</span>
        </Link>
      </div>
    );
  }

  return children;
}

export default AdminRoute;
