import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Compass } from 'lucide-react';
import identityApi from '../api/identityApi';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      await identityApi.forgotPassword(email);
      setSuccessMessage(
        'If an account exists with this email, a password reset link has been sent. Please check your inbox.'
      );
    } catch (err) {
      // Mitigate user enumeration: never disclose whether an email address is registered
      if (
        err.response?.status === 422 &&
        err.response?.data?.errors?.email?.[0]?.toLowerCase().includes("can't find")
      ) {
        setSuccessMessage(
          'If an account exists with this email, a password reset link has been sent. Please check your inbox.'
        );
        return;
      }

      const msg =
        err.response?.data?.errors?.email?.[0] ||
        err.response?.data?.message ||
        'Unable to send password reset link. Please check your connection and try again.';
      setErrorMessage(msg);
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
          to="/login"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-xs font-semibold text-white/90 hover:border-white hover:text-white hover:bg-black/60 transition active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>

        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="text-right">
            <span className="font-extrabold text-base tracking-tight text-white font-display block leading-none">
              Local Spot
            </span>
            <span className="text-[9px] tracking-widest text-[#AAA69C] uppercase font-mono mt-1 block">
              Addis Ababa &bull; Discovery
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
          {/* Glass Form Container */}
          <div className="lg:col-span-6 max-w-md w-full mx-auto lg:mx-0">
            <div className="glass-container rounded-3xl p-6 sm:p-9 relative">
              <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display">
                  Reset Password
                </h1>
                <p className="text-xs sm:text-sm text-[#AAA69C] mt-1.5 leading-relaxed">
                  Enter your registered account email and we'll send you instructions to reset your password.
                </p>
              </div>

              {/* Success Notification */}
              {successMessage && (
                <div className="mb-5 p-4 rounded-2xl bg-[#162B1E] border border-[#22C55E]/40 text-white text-xs flex items-start gap-3 shadow-lg">
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{successMessage}</p>
                </div>
              )}

              {/* Error Notification */}
              {errorMessage && (
                <div className="mb-5 p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-white text-xs flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{errorMessage}</p>
                </div>
              )}

              {!successMessage ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#AAA69C] uppercase tracking-wider mb-2 font-mono">
                      Account Email
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="w-4 h-4 text-[#AAA69C] absolute left-4 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@domain.com"
                        className="w-full h-11 pl-11 pr-4 rounded-full border border-white/20 bg-black/45 text-white text-xs placeholder:text-[#AAA69C]/50 backdrop-blur-md focus:border-white focus:outline-none transition font-sans"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 rounded-full bg-white text-black font-extrabold text-xs tracking-wider shadow-lg hover:bg-[#F5F2EA] active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                  >
                    {isSubmitting ? (
                      <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Send Reset Link</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="pt-2 text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-white text-black font-extrabold text-xs hover:bg-[#F5F2EA] transition"
                  >
                    <span>Return to Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {/* Return to Sign In link */}
              <div className="mt-6 pt-4 border-t border-white/10 text-center">
                <p className="text-xs text-[#AAA69C]">
                  Remember your password?{' '}
                  <Link to="/login" className="font-bold text-white hover:underline transition">
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Cultural Message */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-4 pl-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-black/40 text-[10px] font-mono uppercase tracking-widest text-white/90 w-fit backdrop-blur-md">
              Secure Account Access
            </div>
            <h2 className="text-4xl xl:text-5xl font-black text-white tracking-tight leading-tight font-display">
              Protecting your spots and business listings.
            </h2>
            <p className="text-sm xl:text-base text-[#AAA69C] leading-relaxed max-w-lg">
              Safely recover your credentials with verified email reset links.
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

export default ForgotPasswordPage;
