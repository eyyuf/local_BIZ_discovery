import React, { useState, useRef, useEffect, useId } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Mail, Lock, User, Briefcase, Eye, EyeOff, UserPlus, 
  AlertCircle, Compass, Sparkles, Check, CheckCircle2,
  Tag, MapPin, ShieldCheck, ArrowRight
} from 'lucide-react';
import gsap from 'gsap';

export function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [role, setRole] = useState('customer'); // 'customer' | 'owner'
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const containerRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.form-enter',
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out' }
      );
      gsap.fromTo(
        '.showcase-enter',
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out', delay: 0.1 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const getPasswordStrength = () => {
    if (!password) return { level: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    switch (score) {
      case 1:
        return { level: 1, label: 'Weak', color: 'bg-red-500' };
      case 2:
        return { level: 2, label: 'Fair', color: 'bg-amber-500' };
      case 3:
        return { level: 3, label: 'Good', color: 'bg-emerald-500' };
      case 4:
        return { level: 4, label: 'Strong', color: 'bg-emerald-600' };
      default:
        return { level: 1, label: 'Weak', color: 'bg-red-500' };
    }
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirmation) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
        role,
      });
      navigate('/', { replace: true });
    } catch (err) {
      let msg = 'Registration failed. Please check your information.';
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
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Column: Brand & Value Showcase (Desktop) */}
        <div className="showcase-enter hidden lg:flex lg:col-span-5 flex-col justify-between space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Neighborhood First
            </div>
            <h1 className="text-3xl xl:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Join the Local Network That Powers Your City.
            </h1>
            <p className="text-sm text-slate-600 mt-4 leading-relaxed">
              Connect directly with verified independent cafes, eateries, and boutiques. Discover deals and support neighborhood businesses.
            </p>
          </div>

          {/* Social Proof Mini-Cards */}
          <div className="space-y-3.5">
            <div className="production-card rounded-2xl p-4 flex items-center gap-3.5 border-slate-200/80">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Geospatial Nearby Search</p>
                <p className="text-[11px] text-slate-500">Live distance and open-now status on hundreds of local spots</p>
              </div>
            </div>

            <div className="production-card rounded-2xl p-4 flex items-center gap-3.5 border-slate-200/80">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Exclusive Voucher Claims</p>
                <p className="text-[11px] text-slate-500">Claim QR/code vouchers directly from neighborhood merchants</p>
              </div>
            </div>

            <div className="production-card rounded-2xl p-4 flex items-center gap-3.5 border-slate-200/80">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Verified Community Feedback</p>
                <p className="text-[11px] text-slate-500">Real ratings from authentic local consumers with merchant replies</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200/60 flex items-center gap-3 text-xs text-slate-500">
            <div className="flex -space-x-2">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-white">A</div>
              <div className="w-7 h-7 rounded-full bg-slate-800 text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-white">K</div>
              <div className="w-7 h-7 rounded-full bg-emerald-400 text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-white">M</div>
            </div>
            <span>Join <strong>1,400+</strong> local explorers and merchants</span>
          </div>
        </div>

        {/* Right Column: Registration Card */}
        <div className="lg:col-span-7">
          <div className="production-card rounded-3xl p-6 sm:p-9 relative overflow-hidden">
            {/* Top accent light */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-brand-500 to-teal-400" />

            {/* Header */}
            <div className="form-enter mb-7 text-center sm:text-left">
              <div className="inline-flex lg:hidden items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
                <Compass className="w-3.5 h-3.5 text-emerald-600" />
                Join LocalSpot
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Create your account
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Get started in less than a minute. Choose how you want to use the platform.
              </p>
            </div>

            {error && (
              <div className="error-shake mb-6 p-3.5 rounded-xl bg-red-50/90 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
                <span className="font-medium leading-relaxed">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Interactive Role Cards */}
              <div className="form-enter">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Account Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setRole('customer')}
                    className={`cursor-pointer rounded-2xl p-3.5 border transition-all duration-200 relative flex items-start gap-3 ${
                      role === 'customer'
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-600/30'
                        : 'border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      role === 'customer' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <Compass className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">Local Explorer</span>
                        {role === 'customer' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        Discover spots, claim deals & write reviews
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => setRole('owner')}
                    className={`cursor-pointer rounded-2xl p-3.5 border transition-all duration-200 relative flex items-start gap-3 ${
                      role === 'owner'
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-600/30'
                        : 'border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      role === 'owner' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">Business Owner</span>
                        {role === 'owner' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        List businesses, manage menus & publish deals
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div className="form-enter">
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
                    placeholder="e.g. Kidus Yonas"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                  />
                </div>
              </div>

              {/* Email Address */}
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

              {/* Passwords in Two-Column Grid */}
              <div className="form-enter grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
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

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={passwordConfirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value)}
                      placeholder="Re-type password"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Password Strength Indicator */}
              {password && (
                <div className="form-enter pt-1">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-500 font-medium">Password strength</span>
                    <span className="font-bold text-slate-700">{strength.label}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
                    <div className={`rounded-full ${strength.level >= 1 ? strength.color : 'bg-slate-200'}`} />
                    <div className={`rounded-full ${strength.level >= 2 ? strength.color : 'bg-slate-200'}`} />
                    <div className={`rounded-full ${strength.level >= 3 ? strength.color : 'bg-slate-200'}`} />
                    <div className={`rounded-full ${strength.level >= 4 ? strength.color : 'bg-slate-200'}`} />
                  </div>
                </div>
              )}

              {/* Submit Button */}
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
                      <UserPlus className="w-4 h-4" />
                      Create Account
                      <ArrowRight className="w-4 h-4 ml-1 opacity-70" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Footer Sign-in link */}
            <div className="form-enter mt-6 pt-5 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                Already part of LocalSpot?{' '}
                <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-700 transition">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
