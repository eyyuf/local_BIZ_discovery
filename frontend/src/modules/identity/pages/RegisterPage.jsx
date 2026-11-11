import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, User, Eye, EyeOff, Compass, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';

export function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0D0D0C] text-[#F5F2EA] flex flex-col justify-between overflow-x-hidden selection:bg-white/20 selection:text-white">
      {/* Background Photography with Deep Obsidian Contrast Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-45 transform scale-105 pointer-events-none transition-transform duration-1000"
        style={{
          backgroundImage: `url('/assets/bozena-shiro.jpg')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/60 pointer-events-none" />
      <div className="absolute inset-0 bg-radial-at-c from-transparent via-black/40 to-black pointer-events-none" />

      {/* Top Bar Navigation */}
      <header className="relative z-20 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-xs font-semibold text-white/90 hover:border-white hover:text-white hover:bg-black/60 transition active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Discovery Home</span>
        </Link>

        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="text-right">
            <span className="font-extrabold text-base tracking-tight text-white font-display block leading-none">
              Local Spot
            </span>
            <span className="text-[9px] tracking-widest text-[#AAA69C] uppercase font-mono mt-1 block">
              Addis Ababa &amp; Beyond
            </span>
          </div>
          <div className="w-8 h-8 rounded-full border border-white/20 bg-[#151513] flex items-center justify-center text-white group-hover:border-white transition">
            <Compass className="w-4 h-4" />
          </div>
        </Link>
      </header>

      {/* Main Content: Split Composition */}
      <main className="relative z-20 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left Column: Glass Form Container */}
          <div className="lg:col-span-6 max-w-md w-full mx-auto lg:mx-0">
            <div className="glass-container rounded-3xl p-6 sm:p-9 relative">
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display">
                  Create Account
                </h1>
                <p className="text-xs sm:text-sm text-[#AAA69C] mt-1.5 leading-relaxed">
                  Join Local Spot to bookmark places, rate experiences, and list businesses.
                </p>
              </div>

              {/* Social Google OAuth Button */}
              <div className="mb-5">
                <a
                  href="/api/v1/auth/google/redirect"
                  className="w-full h-11 px-4 rounded-full border border-white/20 bg-black/40 hover:bg-black/70 hover:border-white text-white font-semibold text-xs tracking-wide shadow-sm transition flex items-center justify-center gap-3 backdrop-blur-md active:scale-[0.98]"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Sign up with Google</span>
                </a>
              </div>

              {/* Minimal Divider */}
              <div className="relative my-5 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <span className="relative px-3 bg-[#131311] text-[10px] uppercase font-mono tracking-widest text-[#AAA69C]/80">
                  Or Register with Email
                </span>
              </div>

              {/* Error Notice */}
              {error && (
                <div className="mb-5 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
                  <span className="font-medium leading-relaxed">{error}</span>
                </div>
              )}

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label htmlFor="reg-name" className="sr-only">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#AAA69C]">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="reg-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full h-11 pl-11 pr-4 rounded-xl bg-black/40 border border-white/15 text-[#F5F2EA] text-xs placeholder:text-[#AAA69C]/60 backdrop-blur-md focus:outline-none focus:border-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-email" className="sr-only">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#AAA69C]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="reg-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email Address"
                      className="w-full h-11 pl-11 pr-4 rounded-xl bg-black/40 border border-white/15 text-[#F5F2EA] text-xs placeholder:text-[#AAA69C]/60 backdrop-blur-md focus:outline-none focus:border-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-password" className="sr-only">
                    Password (min 8 characters)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#AAA69C]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password (min 8 characters)"
                      className="w-full h-11 pl-11 pr-11 rounded-xl bg-black/40 border border-white/15 text-[#F5F2EA] text-xs placeholder:text-[#AAA69C]/60 backdrop-blur-md focus:outline-none focus:border-white transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#AAA69C] hover:text-white transition"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-confirm" className="sr-only">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#AAA69C]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="reg-confirm"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={passwordConfirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value)}
                      placeholder="Confirm Password"
                      className="w-full h-11 pl-11 pr-4 rounded-xl bg-black/40 border border-white/15 text-[#F5F2EA] text-xs placeholder:text-[#AAA69C]/60 backdrop-blur-md focus:outline-none focus:border-white transition"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 rounded-full border border-white/30 bg-white/10 hover:bg-white hover:text-black text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-[0.98]"
                  >
                    {isSubmitting ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Complete Registration</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Bottom Login Link */}
              <div className="mt-6 pt-4 border-t border-white/10 text-center">
                <p className="text-xs text-[#AAA69C]">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-bold text-white hover:underline transition"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Cultural Message */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-4 pl-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-black/40 text-[10px] font-mono uppercase tracking-widest text-white/90 w-fit backdrop-blur-md">
              Culinary &amp; Local Escapes
            </div>
            <h2 className="text-4xl xl:text-5xl font-black text-white tracking-tight leading-tight font-display">
              Ethiopia's finest culinary spots &amp; boutique stays.
            </h2>
            <p className="text-sm xl:text-base text-[#AAA69C] leading-relaxed max-w-lg">
              Discover verified dining, artisanal coffee roasters, and scenic highland getaways.
            </p>
          </div>
        </div>
      </main>

      {/* Bottom Sub-footer */}
      <footer className="relative z-20 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#AAA69C]/80 font-mono">
        <div>Bole &bull; Kazanchis &bull; Bishoftu &bull; Piassa</div>
        <div>Local Spot Ethiopia &copy; 2026</div>
      </footer>
    </div>
  );
}

export default RegisterPage;
