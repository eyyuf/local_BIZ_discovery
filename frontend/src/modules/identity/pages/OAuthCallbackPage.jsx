import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

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
    <div className="min-h-[calc(100vh-4rem)] auth-bg-canvas flex items-center justify-center p-4">
      <div className="w-full max-w-md production-card rounded-3xl p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-brand-500 to-teal-400" />

        {status === 'processing' && (
          <div className="py-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <span className="w-6 h-6 border-3 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">Completing Sign-In</h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Verifying your Google credentials and preparing your session...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">Authentication Verified!</h2>
            <p className="text-xs text-slate-500">
              Welcome to LocalSpot. Redirecting you to your account...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="py-8 space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Sign-In Failed</h2>
              <p className="text-xs text-red-600 font-medium mt-1.5">{errorMessage}</p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition"
            >
              Return to Sign In
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default OAuthCallbackPage;
