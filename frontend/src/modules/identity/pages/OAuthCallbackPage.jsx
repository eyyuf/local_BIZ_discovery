import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { CheckCircle2, AlertCircle, ArrowRight, Compass } from 'lucide-react';

export function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [status, setStatus] = useState('processing');
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const handleAuth = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error') || searchParams.get('message');

      if (error) {
        setStatus('error');
        setErrorMessage(error);
        return;
      }

      if (!token) {
        setStatus('error');
        setErrorMessage('Authentication token was not provided by Google.');
        return;
      }

      try {
        const user = await loginWithToken(token);
        if (user) {
          setStatus('success');
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 600);
        } else {
          setStatus('error');
          setErrorMessage('Could not load user profile with the provided credentials.');
        }
      } catch (err) {
        setStatus('error');
        setErrorMessage(err.message || 'OAuth authentication failed.');
      }
    };

    handleAuth();
  }, [searchParams, loginWithToken, navigate]);

  return (
    <div className="min-h-screen bg-[#0D0D0C] text-[#F5F2EA] flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden selection:bg-white/20 selection:text-white">
      {/* Background glow */}
      <div className="absolute inset-0 bg-radial-at-c from-white/[0.04] via-transparent to-transparent pointer-events-none" />

      {/* Top minimal bar */}
      <header className="relative z-20 max-w-7xl w-full mx-auto pt-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full border border-white/20 bg-black/45 flex items-center justify-center text-white backdrop-blur-md group-hover:border-white transition">
            <Compass className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-white font-display">
            Local Spot
          </span>
        </Link>
      </header>

      {/* Main card */}
      <main className="relative z-20 flex-1 flex items-center justify-center">
        <div className="w-full max-w-md glass-container rounded-3xl p-8 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-white/40 via-white/20 to-transparent" />

          {status === 'processing' && (
            <div className="py-8 space-y-4">
              <div className="w-14 h-14 rounded-2xl border border-white/20 bg-black/40 text-white flex items-center justify-center mx-auto shadow-lg">
                <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
              <h2 className="text-xl font-black text-white font-display">Completing Sign-In</h2>
              <p className="text-xs sm:text-sm text-[#AAA69C] max-w-xs mx-auto leading-relaxed">
                Verifying your Google credentials and preparing your discovery session...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="py-8 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#162B1E] border border-[#22C55E]/40 text-[#22C55E] flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-black text-white font-display">Authentication Verified!</h2>
              <p className="text-xs sm:text-sm text-[#AAA69C]">
                Welcome to Local Spot. Redirecting you to discovery...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="py-8 space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto shadow-lg">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white font-display">Sign-In Failed</h2>
                <p className="text-xs text-red-400 font-medium mt-1.5">{errorMessage}</p>
              </div>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black text-xs font-extrabold shadow-md hover:bg-[#F5F2EA] transition"
              >
                <span>Return to Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </main>

      <footer className="relative z-20 text-center py-4 text-[11px] text-[#AAA69C]/60 font-mono">
        Local Spot Ethiopia &bull; 2026
      </footer>
    </div>
  );
}

export default OAuthCallbackPage;