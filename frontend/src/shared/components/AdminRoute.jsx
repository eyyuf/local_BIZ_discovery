import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '@/modules/identity';

export function AdminRoute({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isAdmin = user?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-[#151518] border border-rose-500/30 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black text-white font-display">Administrator Access Required</h1>
          <p className="text-xs text-[#AAA69C] leading-relaxed">
            Your account ({user?.email}) does not have administrative privileges to access the business verification review dashboard.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black text-xs font-bold hover:bg-[#F5F2EA] transition"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Go to Home</span>
            </Link>
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/15 bg-black/40 text-xs font-medium text-white hover:border-white/30 transition"
            >
              <span>My Profile</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

export default AdminRoute;
