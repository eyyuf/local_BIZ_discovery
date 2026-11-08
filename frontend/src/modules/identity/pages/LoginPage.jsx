import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, Compass, Sparkles, ArrowRight } from 'lucide-react';
import gsap from 'gsap';

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const containerRef = useRef(null);
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.form-enter',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out' }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password, remember });
      navigate(from, { replace: true });
    } catch (err) {
      let msg = 'Invalid email or password. Please try again.';
      if (err.response?.data?.errors) {
        msg = Object.values(err.response.data.errors).flat().join(' ');
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
      gsap.fromTo(
        '.error-shake',
        { x: -8 },
        { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)' }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div ref={containerRef} className="min-h-[calc(100vh-4rem)] auth-bg-canvas flex items-center justify-center p-4 sm:p-6 lg:p-10">
      <div className="w-full max-w-md">
        <div className="production-card rounded-3xl p-6 sm:p-9 relative overflow-hidden">
          {/* Top accent light */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-brand-500 to-teal-400" />

          {/* Header */}
          <div className="form-enter text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Welcome Back
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Sign in to LocalSpot
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
              Access your bookmarked spots, claimed deals, and merchant tools.
            </p>
          </div>

          {/* Social OAuth Button */}
          <div className="form-enter mb-5">
            <a
              href="/api/v1/auth/google/redirect"
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-bold text-xs sm:text-sm shadow-xs transition flex items-center justify-center gap-3 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </a>
          </div>

          {/* Divider */}
          <div className="form-enter relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200/80" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
              <span className="bg-white px-2.5 text-slate-400 font-bold">Or sign in with email</span>
            </div>
          </div>

          {error && (
            <div className="error-shake mb-6 p-3.5 rounded-xl bg-red-50/90 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
              <span className="font-medium leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-enter">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                />
              </div>
            </div>

            <div className="form-enter">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <Link to="/forgot-password" className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 transition">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="form-enter flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <span className="text-xs text-slate-600 select-none">Remember on this device</span>
              </label>
            </div>

            <div className="form-enter pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Sign In
                    <ArrowRight className="w-4 h-4 ml-1 opacity-70" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="form-enter mt-7 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              New to LocalSpot?{' '}
              <Link to="/register" className="font-bold text-emerald-600 hover:text-emerald-700 transition">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
