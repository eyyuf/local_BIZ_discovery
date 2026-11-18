import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from '@/modules/identity';
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  ProfilePage,
  OAuthCallbackPage,
  BusinessCreatePage,
  BusinessDashboardPage,
  AdminDashboardPage,
} from '@/modules/identity';
import { HomePage } from '@/modules/discovery/pages/HomePage';
import { SearchPage } from '@/modules/discovery/pages/SearchPage';
import { NearbyPage } from '@/modules/discovery/pages/NearbyPage';
import { PlaceDetailPage } from '@/modules/places/pages/PlaceDetailPage';
import { SavedPlacesPage, BookmarkProvider } from '@/modules/bookmarks';
import { NotFoundPage } from '@/shared/pages/NotFoundPage';
import { Navbar } from '@/shared/components/Navbar';
import { Footer } from '@/shared/components/Footer';
import { MobileBottomNav } from '@/shared/components/MobileBottomNav';
import { ProtectedRoute } from '@/shared/components/ProtectedRoute';
import { AdminRoute } from '@/shared/components/AdminRoute';
import { ScrollToTop } from '@/shared/components/ScrollToTop';

/**
 * Public Layout Wrapper
 * Encapsulates consumer headers, bottom navigation, footers, and bookmarks context.
 * Excludes admin portals so back-office tools have 100% full-screen isolation.
 */
function PublicLayout() {
  return (
    <BookmarkProvider>
      <div className="min-h-screen flex flex-col bg-[#0D0D0C] text-[#F5F2EA] font-sans antialiased selection:bg-white/20 selection:text-white">
        <Navbar />
        <main className="flex-1 pb-16 md:pb-0">
          <Outlet />
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    </BookmarkProvider>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <Routes>
          {/* ======================================================== */}
          {/* 1. PUBLIC CONSUMER & MERCHANT ROUTES (Public Layout)     */}
          {/* ======================================================== */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/places" element={<SearchPage />} />
            <Route path="/places/:slug" element={<PlaceDetailPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/nearby" element={<NearbyPage />} />
            <Route
              path="/saved"
              element={
                <ProtectedRoute>
                  <SavedPlacesPage />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/signup" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/businesses/create"
              element={
                <ProtectedRoute>
                  <BusinessCreatePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/businesses/:id"
              element={
                <ProtectedRoute>
                  <BusinessDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/businesses/:id/edit"
              element={
                <ProtectedRoute>
                  <BusinessDashboardPage defaultTab="info" />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* ======================================================== */}
          {/* 2. DEDICATED ADMIN BACK-OFFICE (100% Isolated Layout)    */}
          {/* ======================================================== */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/verifications"
            element={
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
