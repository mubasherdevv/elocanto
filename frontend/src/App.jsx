import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import PublicLayout from './components/PublicLayout';
import AdminLayout from './components/AdminLayout';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

import { AdProvider } from './context/AdContext';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import './index.css';

// Lazy loading pages for Code Splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const AdsListingPage = lazy(() => import('./pages/AdsListingPage'));
const AdDetailPage = lazy(() => import('./pages/AdDetailPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const PostAdPage = lazy(() => import('./pages/PostAdPage'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const UserDashboardPage = lazy(() => import('./pages/UserDashboardPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const AdminAdsPage = lazy(() => import('./pages/AdminAdsPage'));
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage'));
const CategoryManagePage = lazy(() => import('./pages/CategoryManagePage'));
const AdminReportsPage = lazy(() => import('./pages/AdminReportsPage'));
const AdminSettingsPage = lazy(() => import('./pages/AdminSettingsPage'));
const SubcategoryAdsPage = lazy(() => import('./pages/SubcategoryAdsPage'));
const CityManagePage = lazy(() => import('./pages/CityManagePage'));
const AdminSeoPage = lazy(() => import('./pages/AdminSeoPage'));

function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <AdProvider>

        <Router>
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>}>
            <Routes>
              {/* Marketplace Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/ads" element={<AdsListingPage />} />
                <Route path="/profile/:userId" element={<UserProfile />} />
                <Route path="/ads/:slug" element={<AdDetailPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                
                {/* Protected Marketplace Routes */}
                <Route element={<PrivateRoute />}>
                  <Route path="/post-ad" element={<PostAdPage />} />
                  <Route path="/dashboard" element={<UserDashboardPage />} />
                  <Route path="/profile" element={<UserProfile />} />
                  <Route path="/messages" element={<MessagesPage />} />
                  <Route path="/messages/:conversationId" element={<MessagesPage />} />
                </Route>
              </Route>

              {/* Admin Panel Routes */}
              <Route element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<AdminDashboardPage />} />
                  <Route path="/admin/ads" element={<AdminAdsPage />} />
                  <Route path="/admin/users" element={<AdminUsersPage />} />
                  <Route path="/admin/categories" element={<CategoryManagePage />} />
                  <Route path="/admin/cities" element={<CityManagePage />} />
                  <Route path="/admin/subcategories/:id/ads" element={<SubcategoryAdsPage />} />
                  <Route path="/admin/reports" element={<AdminReportsPage />} />
                  <Route path="/admin/settings" element={<AdminSettingsPage />} />
                  <Route path="/admin/seo" element={<AdminSeoPage />} />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </Router>
      </AdProvider>
    </AuthProvider>
    </SettingsProvider>
  );
}


export default App;
