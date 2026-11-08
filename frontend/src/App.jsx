import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from '@/modules/identity';
import { LoginPage, RegisterPage, ProfilePage } from '@/modules/identity';
import { Navbar } from '@/shared/components/Navbar';
import { Footer } from '@/shared/components/Footer';
import { ProtectedRoute } from '@/shared/components/ProtectedRoute';
import { Compass, Sparkles, Store, Tag } from 'lucide-react';

function HomePagePlaceholder() {
  return (
    <div className="min-h-[calc(100vh-8rem)] gradient-mesh flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
        <Sparkles className="w-4 h-4 text-brand-600" />
        Explore Your City
      </div>
      <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight max-w-2xl">
        Discover Local Gems in Real-Time
      </h1>
      <p className="text-base sm:text-lg text-slate-600 max-w-xl mt-4 mb-8">
        Find top-rated nearby restaurants, shops, and services. Claim exclusive vouchers and support local business owners.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/register"
          className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-600/25 transition-all flex items-center gap-2"
        >
          <Store className="w-4 h-4" />
          Join LocalSpot
        </Link>
        <Link
          to="/deals"
          className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-sm shadow-sm transition-all flex items-center gap-2"
        >
          <Tag className="w-4 h-4 text-brand-600" />
          View Active Deals
        </Link>
      </div>
    </div>
  );
}

function DealsPagePlaceholder() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-center">
      <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-3">
        <Tag className="w-6 h-6" />
      </div>
      <h2 className="text-2xl font-black text-slate-900">Neighborhood Deals Feed</h2>
      <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
        Exclusive vouchers and time-limited deals published by local merchants in your area.
      </p>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePagePlaceholder />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route path="/deals" element={<DealsPagePlaceholder />} />
              <Route
                path="/my-claims"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<HomePagePlaceholder />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
