import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PublicLayout from './components/PublicLayout';
import AdminLayout from './components/AdminLayout';
import HomePage from './pages/HomePage';
import AdsListingPage from './pages/AdsListingPage';
import AdDetailPage from './pages/AdDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import PostAdPage from './pages/PostAdPage';
import MessagesPage from './pages/MessagesPage';
import UserProfile from './pages/UserProfile';
import UserDashboardPage from './pages/UserDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminAdsPage from './pages/AdminAdsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import CategoryManagePage from './pages/CategoryManagePage';
import AdminReportsPage from './pages/AdminReportsPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import SubcategoryAdsPage from './pages/SubcategoryAdsPage';
import CityManagePage from './pages/CityManagePage';
import AdminSeoPage from './pages/AdminSeoPage';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

import { AdProvider } from './context/AdContext';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import './index.css';

function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <AdProvider>

        <Router>
          <Routes>
            {/* Marketplace Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/ads" element={<AdsListingPage />} />
              <Route path="/ads/:slug" element={<AdDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              
              {/* Protected Marketplace Routes */}
              <Route element={<PrivateRoute />}>
                <Route path="/post-ad" element={<PostAdPage />} />
                <Route path="/dashboard" element={<UserDashboardPage />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/profile/:userId" element={<UserProfile />} />
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
        </Router>
      </AdProvider>
    </AuthProvider>
    </SettingsProvider>
  );
}


export default App;
