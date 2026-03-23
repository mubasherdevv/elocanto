import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { 
  CloudArrowUpIcon, 
  CheckCircleIcon,
  GlobeAltIcon,
  HomeIcon,
  MegaphoneIcon,
  UserIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

const TABS = [
  { id: 'general', name: 'General', icon: GlobeAltIcon },
  { id: 'homepage', name: 'Homepage', icon: HomeIcon },
  { id: 'ads', name: 'Ads Listings', icon: MegaphoneIcon },
  { id: 'users', name: 'User Controls', icon: UserIcon },
  { id: 'seo', name: 'SEO Settings', icon: MagnifyingGlassIcon },
  { id: 'security', name: 'Security', icon: ShieldCheckIcon },
  { id: 'email', name: 'Email Settings', icon: EnvelopeIcon },
];

export default function AdminSettingsPage() {
  const { token } = useAuth();
  const { refreshSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);

  // File Upload states
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [token]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!token) return;
      const { data } = await api.get('/admin/settings');
      setSettings(data);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('images', file); // uploadRoutes expects 'images'
    
    if (type === 'logo') setUploadingLogo(true);
    else setUploadingFavicon(true);

    try {
      const { data } = await api.post('/upload', formData);
      const url = data.urls[0];
      setSettings({ ...settings, [type]: url });
    } catch (err) {
      console.error('Upload Error:', err);
      alert('Failed to upload image');
    } finally {
      if (type === 'logo') setUploadingLogo(false);
      else setUploadingFavicon(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (!token) {
        alert('Session expired. Please login again.');
        return;
      }
      await api.put('/admin/settings', settings);

      if (activeTab === 'ads') {
        await api.post('/admin/update-ads-duration', {});
        setMessage('Settings updated & all ads durations auto-synced!');
      } else {
        setMessage('Settings updated successfully!');
      }
      
      refreshSettings(); // Sync global state
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      console.error('Error updating settings:', err);
      alert(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border-2 border-red-100 p-8 rounded-3xl text-center flex flex-col items-center">
      <h2 className="text-xl font-black text-red-900 mb-2">Sync Issue</h2>
      <p className="text-red-700 font-bold mb-6">{error}</p>
      <button onClick={fetchSettings} className="px-8 py-3 bg-red-600 text-white rounded-2xl font-black">Retry</button>
    </div>
  );

  // Helper for nested field updates
  const setNestedField = (path, value) => {
    const keys = path.split('.');
    setSettings(prev => {
      const updated = { ...prev };
      let current = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const renderTabContent = () => {
    switch(activeTab) {
      case 'general': return renderGeneral();
      case 'homepage': return renderHomepage();
      case 'ads': return renderAds();
      case 'users': return renderUsers();
      case 'seo': return renderSeo();
      case 'security': return renderSecurity();
      case 'email': return renderEmail();
      default: return null;
    }
  };

  const renderGeneral = () => (
    <div className="space-y-6">
      <h2 className="text-lg font-black text-gray-900 mb-4">General Identity</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Site Name</label>
          <input type="text" className="w-full px-5 py-3 rounded-2xl border-2 border-gray-50 focus:border-orange-500 focus:outline-none transition-colors bg-gray-50/50"
            value={settings.siteName || ''} onChange={(e) => setSettings({...settings, siteName: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Contact Email</label>
          <input type="email" className="w-full px-5 py-3 rounded-2xl border-2 border-gray-50 focus:border-orange-500 focus:outline-none transition-colors bg-gray-50/50"
            value={settings.contactEmail || ''} onChange={(e) => setSettings({...settings, contactEmail: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Support Phone Number</label>
          <input type="text" className="w-full px-5 py-3 rounded-2xl border-2 border-gray-50 focus:border-orange-500 focus:outline-none transition-colors bg-gray-50/50"
            value={settings.supportPhone || ''} onChange={(e) => setSettings({...settings, supportPhone: e.target.value})} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Logo Upload */}
        <div className="border border-gray-100 p-6 rounded-3xl bg-gray-50/20">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 ml-1">Website Logo</label>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-3xl bg-white border-2 border-dashed border-gray-100 flex items-center justify-center overflow-hidden">
              {settings.logo ? (
                <img src={settings.logo} alt="Logo" className="w-full h-full object-contain p-2" />
              ) : (
                <span className="text-xs font-bold text-gray-300">No Logo</span>
              )}
            </div>
            <div>
              <input type="file" id="logo-upload" className="hidden" onChange={(e) => handleFileUpload(e, 'logo')} />
              <label htmlFor="logo-upload" className="cursor-pointer px-5 py-3 bg-white border border-gray-100 rounded-2xl text-xs font-black shadow-sm flex items-center gap-2">
                <CloudArrowUpIcon className="w-4 h-4" />
                {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
              </label>
            </div>
          </div>
        </div>

        {/* Favicon Upload */}
        <div className="border border-gray-100 p-6 rounded-3xl bg-gray-50/20">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 ml-1">Favicon (.ico, .png)</label>
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-2xl bg-white border-2 border-dashed border-gray-100 flex items-center justify-center overflow-hidden">
              {settings.favicon ? (
                <img src={settings.favicon} alt="Favicon" className="w-full h-full object-contain p-2" />
              ) : (
                <span className="text-[10px] font-bold text-gray-300">No Fav</span>
              )}
            </div>
            <div>
              <input type="file" id="favicon-upload" className="hidden" onChange={(e) => handleFileUpload(e, 'favicon')} />
              <label htmlFor="favicon-upload" className="cursor-pointer px-5 py-3 bg-white border border-gray-100 rounded-2xl text-xs font-black shadow-sm flex items-center gap-2">
                <CloudArrowUpIcon className="w-4 h-4" />
                {uploadingFavicon ? 'Uploading...' : 'Upload Favicon'}
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHomepage = () => (
    <div className="space-y-6">
      <h2 className="text-lg font-black text-gray-900 mb-4">Homepage Display Options</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Featured Ads Limit</label>
          <input type="number" className="w-full px-5 py-3 rounded-2xl border-2 border-gray-50 focus:border-orange-500 focus:outline-none bg-gray-50/50"
            value={settings.featuredAdsLimit || 0} onChange={(e) => setSettings({...settings, featuredAdsLimit: Number(e.target.value)})} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Latest Ads Limit</label>
          <input type="number" className="w-full px-5 py-3 rounded-2xl border-2 border-gray-50 focus:border-orange-500 focus:outline-none bg-gray-50/50"
            value={settings.latestAdsLimit || 0} onChange={(e) => setSettings({...settings, latestAdsLimit: Number(e.target.value)})} />
        </div>
      </div>
      <div className="space-y-3 pt-2">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={settings.enableFeaturedAdsSection || false} className="w-5 h-5 accent-orange-500 rounded" 
            onChange={(e) => setSettings({...settings, enableFeaturedAdsSection: e.target.checked})} />
          <span className="text-sm font-bold text-gray-700">Enable Featured Ads Section</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={settings.enableSeoContentSection || false} className="w-5 h-5 accent-orange-500 rounded" 
            onChange={(e) => setSettings({...settings, enableSeoContentSection: e.target.checked})} />
          <span className="text-sm font-bold text-gray-700">Enable SEO Content Section</span>
        </label>
      </div>
    </div>
  );

  const renderAds = () => (
    <div className="space-y-6">
      <h2 className="text-lg font-black text-gray-900 mb-4">Ads Management Policies</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Simple Ads Duration (days)</label>
          <input type="number" className="w-full px-5 py-3 rounded-2xl border-2 border-gray-50 focus:border-orange-500 focus:outline-none bg-gray-50/50"
            value={settings.simpleAdsDuration || 30} onChange={(e) => setSettings({...settings, simpleAdsDuration: Number(e.target.value)})} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Featured Ads Duration (days)</label>
          <input type="number" className="w-full px-5 py-3 rounded-2xl border-2 border-gray-50 focus:border-orange-500 focus:outline-none bg-gray-50/50"
            value={settings.featuredAdsDuration || 7} onChange={(e) => setSettings({...settings, featuredAdsDuration: Number(e.target.value)})} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Max Images Per Ad</label>
          <input type="number" className="w-full px-5 py-3 rounded-2xl border-2 border-gray-50 focus:border-orange-500 focus:outline-none bg-gray-50/50"
            value={settings.maxImagesPerAd || 5} onChange={(e) => setSettings({...settings, maxImagesPerAd: Number(e.target.value)})} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Price Format (Currency Symbol)</label>
          <input type="text" className="w-full px-5 py-3 rounded-2xl border-2 border-gray-50 focus:border-orange-500 focus:outline-none bg-gray-50/50"
            value={settings.priceFormat || 'Rs'} onChange={(e) => setSettings({...settings, priceFormat: e.target.value})} />
        </div>
      </div>
      <label className="flex items-center gap-3 cursor-pointer pt-2">
        <input type="checkbox" checked={settings.enableAutoExpiry || false} className="w-5 h-5 accent-orange-500 rounded" 
          onChange={(e) => setSettings({...settings, enableAutoExpiry: e.target.checked})} />
        <span className="text-sm font-bold text-gray-700">Enable Auto-Expiry for Ads</span>
      </label>

      <hr className="border-gray-100 my-6" />
      <h3 className="text-sm font-black text-gray-900 mb-4">Featured Ads Rotation</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Featured Ads Per Page</label>
          <input type="number" className="w-full px-5 py-3 rounded-2xl border-2 border-gray-50 focus:border-orange-500 focus:outline-none bg-gray-50/50"
            value={settings.featuredAdsPerPage || 10} onChange={(e) => setSettings({...settings, featuredAdsPerPage: Number(e.target.value)})} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Rotation Logic</label>
          <select className="w-full px-5 py-3 rounded-2xl border-2 border-gray-50 focus:border-orange-500 focus:outline-none bg-gray-50/50"
            value={settings.rotationLogic || 'random'} onChange={(e) => setSettings({...settings, rotationLogic: e.target.value})}>
            <option value="random">Random</option>
            <option value="round-robin">Round Robin</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <h2 className="text-lg font-black text-gray-900 mb-4">User Registration & Access</h2>
      <div className="space-y-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={settings.enableUserRegistration || false} className="w-5 h-5 accent-orange-500 rounded" 
            onChange={(e) => setSettings({...settings, enableUserRegistration: e.target.checked})} />
          <span className="text-sm font-bold text-gray-700">Enable New User Registration</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={settings.enableEmailVerification || false} className="w-5 h-5 accent-orange-500 rounded" 
            onChange={(e) => setSettings({...settings, enableEmailVerification: e.target.checked})} />
          <span className="text-sm font-bold text-gray-700">Enable Email Verification</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={settings.allowTemporaryEmails || false} className="w-5 h-5 accent-orange-500 rounded" 
            onChange={(e) => setSettings({...settings, allowTemporaryEmails: e.target.checked})} />
          <span className="text-sm font-bold text-gray-700">Allow Temporary Emails (Disposable)</span>
        </label>
      </div>

      <div className="w-64 mt-6">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Default User Role</label>
        <select className="w-full px-5 py-3 rounded-2xl border-2 border-gray-50 focus:border-orange-500 focus:outline-none bg-gray-50/50"
          value={settings.defaultUserRole || 'user'} onChange={(e) => setSettings({...settings, defaultUserRole: e.target.value})}>
          <option value="user">User</option>
          <option value="seller">Seller</option>
        </select>
      </div>
    </div>
  );

  const renderSeo = () => (
    <div className="space-y-6">
      <h2 className="text-lg font-black text-gray-900 mb-4">Default SEO Configuration</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Default Meta Title</label>
          <input type="text" className="w-full px-5 py-3 rounded-2xl border-2 border-gray-50 focus:border-orange-500 focus:outline-none bg-gray-50/50"
            value={settings.defaultMetaTitle || ''} onChange={(e) => setSettings({...settings, defaultMetaTitle: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Default Meta Description</label>
          <textarea rows="3" className="w-full px-5 py-3 rounded-2xl border-2 border-gray-50 focus:border-orange-500 focus:outline-none bg-gray-50/50"
            value={settings.defaultMetaDescription || ''} onChange={(e) => setSettings({...settings, defaultMetaDescription: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Default Keywords</label>
          <input type="text" className="w-full px-5 py-3 rounded-2xl border-2 border-gray-50 focus:border-orange-500 focus:outline-none bg-gray-50/50"
            value={settings.defaultKeywords || ''} onChange={(e) => setSettings({...settings, defaultKeywords: e.target.value})} 
            placeholder="marketplace, buy, sell, local" />
        </div>
      </div>
      <label className="flex items-center gap-3 cursor-pointer pt-2">
        <input type="checkbox" checked={settings.enableDynamicSeoContent || false} className="w-5 h-5 accent-orange-500 rounded" 
          onChange={(e) => setSettings({...settings, enableDynamicSeoContent: e.target.checked})} />
        <span className="text-sm font-bold text-gray-700">Enable Dynamic SEO content from SEO Manage</span>
      </label>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <h2 className="text-lg font-black text-gray-900 mb-4">Security Parameters</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">JWT Expiry (e.g. 1d, 30d)</label>
          <input type="text" className="w-full px-5 py-3 rounded-2xl border-2 border-gray-50 focus:border-orange-500 focus:outline-none bg-gray-50/50"
            value={settings.jwtExpiryTime || '30d'} onChange={(e) => setSettings({...settings, jwtExpiryTime: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Login Attempt Limit</label>
          <input type="number" className="w-full px-5 py-3 rounded-2xl border-2 border-gray-50 focus:border-orange-500 focus:outline-none bg-gray-50/50"
            value={settings.loginAttemptLimit || 5} onChange={(e) => setSettings({...settings, loginAttemptLimit: Number(e.target.value)})} />
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Min Password Length</label>
          <input type="number" className="w-40 px-5 py-3 rounded-2xl border-2 border-gray-50 focus:border-orange-500 focus:outline-none bg-gray-50/50"
            value={settings.passwordRules?.minLength || 6} onChange={(e) => setNestedField('passwordRules.minLength', Number(e.target.value))} />
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={settings.passwordRules?.requireStrongPassword || false} className="w-5 h-5 accent-orange-500 rounded" 
            onChange={(e) => setNestedField('passwordRules.requireStrongPassword', e.target.checked)} />
          <span className="text-sm font-bold text-gray-700">Require Strong Password (Numbers, Caps, Symbols)</span>
        </label>
      </div>
    </div>
  );

  const renderEmail = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-black text-gray-900 mb-4">SMTP Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">From Name</label>
            <input type="text" className="w-full px-5 py-3 rounded-2xl border-2 border-gray-50 focus:border-orange-500 focus:outline-none bg-gray-50/50"
              value={settings.emailSettings?.fromName || ''} onChange={(e) => setNestedField('emailSettings.fromName', e.target.value)} 
              placeholder="OLX Marketplace" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">From Email</label>
            <input type="email" className="w-full px-5 py-3 rounded-2xl border-2 border-gray-50 focus:border-orange-500 focus:outline-none bg-gray-50/50"
              value={settings.emailSettings?.fromEmail || ''} onChange={(e) => setNestedField('emailSettings.fromEmail', e.target.value)} 
              placeholder="noreply@yourdomain.com" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">SMTP Host</label>
            <input type="text" className="w-full px-5 py-3 rounded-2xl border-2 border-gray-50 focus:border-orange-500 focus:outline-none bg-gray-50/50"
              value={settings.emailSettings?.smtpHost || 'smtp.gmail.com'} onChange={(e) => setNestedField('emailSettings.smtpHost', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">SMTP Port</label>
            <input type="number" className="w-full px-5 py-3 rounded-2xl border-2 border-gray-50 focus:border-orange-500 focus:outline-none bg-gray-50/50"
              value={settings.emailSettings?.smtpPort || 587} onChange={(e) => setNestedField('emailSettings.smtpPort', Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">SMTP Username</label>
            <input type="text" className="w-full px-5 py-3 rounded-2xl border-2 border-gray-50 focus:border-orange-500 focus:outline-none bg-gray-50/50"
              value={settings.emailSettings?.smtpUser || ''} onChange={(e) => setNestedField('emailSettings.smtpUser', e.target.value)} 
              placeholder="your-email@gmail.com" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">SMTP Password (App Password)</label>
            <input type="password" className="w-full px-5 py-3 rounded-2xl border-2 border-gray-50 focus:border-orange-500 focus:outline-none bg-gray-50/50"
              value={settings.emailSettings?.smtpPass || ''} onChange={(e) => setNestedField('emailSettings.smtpPass', e.target.value)} 
              placeholder="16-char app password" />
          </div>
        </div>
        
        <div className="flex items-center gap-3 mt-6">
          <input type="checkbox" checked={settings.emailSettings?.enableEmailVerification ?? true} className="w-5 h-5 accent-orange-500 rounded" 
            onChange={(e) => setNestedField('emailSettings.enableEmailVerification', e.target.checked)} />
          <span className="text-sm font-bold text-gray-700">Enable Email Verification</span>
        </div>

        <div className="mt-4">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Code Expiry (minutes)</label>
          <input type="number" className="w-32 px-5 py-3 rounded-2xl border-2 border-gray-50 focus:border-orange-500 focus:outline-none bg-gray-50/50"
            value={settings.emailSettings?.codeExpiryMinutes || 5} onChange={(e) => setNestedField('emailSettings.codeExpiryMinutes', Number(e.target.value))} />
        </div>
      </div>

      <hr className="border-gray-100" />

      <div>
        <h2 className="text-lg font-black text-gray-900 mb-4">Email Templates</h2>
        
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-3xl">
            <h3 className="text-sm font-black text-gray-900 mb-4">Verification Email</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Subject</label>
                <input type="text" className="w-full px-5 py-3 rounded-2xl border-2 border-gray-50 focus:border-orange-500 focus:outline-none bg-white"
                  value={settings.emailTemplates?.verification?.subject || ''} onChange={(e) => setNestedField('emailTemplates.verification.subject', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Body (HTML)</label>
                <p className="text-xs text-gray-400 mb-2">Use {'{CODE}'} for verification code and {'{EXPIRY}'} for expiry minutes</p>
                <textarea rows="6" className="w-full px-5 py-3 rounded-2xl border-2 border-gray-50 focus:border-orange-500 focus:outline-none bg-white font-mono text-sm"
                  value={settings.emailTemplates?.verification?.body || ''} onChange={(e) => setNestedField('emailTemplates.verification.body', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-3xl">
            <h3 className="text-sm font-black text-gray-900 mb-4">Password Reset Email</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Subject</label>
                <input type="text" className="w-full px-5 py-3 rounded-2xl border-2 border-gray-50 focus:border-orange-500 focus:outline-none bg-white"
                  value={settings.emailTemplates?.passwordReset?.subject || ''} onChange={(e) => setNestedField('emailTemplates.passwordReset.subject', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Body (HTML)</label>
                <p className="text-xs text-gray-400 mb-2">Use {'{CODE}'} for reset code and {'{EXPIRY}'} for expiry minutes</p>
                <textarea rows="6" className="w-full px-5 py-3 rounded-2xl border-2 border-gray-50 focus:border-orange-500 focus:outline-none bg-white font-mono text-sm"
                  value={settings.emailTemplates?.passwordReset?.body || ''} onChange={(e) => setNestedField('emailTemplates.passwordReset.body', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-3xl">
            <h3 className="text-sm font-black text-gray-900 mb-4">Password Changed Notification</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Subject</label>
                <input type="text" className="w-full px-5 py-3 rounded-2xl border-2 border-gray-50 focus:border-orange-500 focus:outline-none bg-white"
                  value={settings.emailTemplates?.passwordChanged?.subject || ''} onChange={(e) => setNestedField('emailTemplates.passwordChanged.subject', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Body (HTML)</label>
                <textarea rows="4" className="w-full px-5 py-3 rounded-2xl border-2 border-gray-50 focus:border-orange-500 focus:outline-none bg-white font-mono text-sm"
                  value={settings.emailTemplates?.passwordChanged?.body || ''} onChange={(e) => setNestedField('emailTemplates.passwordChanged.body', e.target.value)} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl space-y-8 animate-fade-in pb-20">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Marketplace Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Configure site-wide parameters, business rules, and identities.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="md:w-64 space-y-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-left text-sm font-black transition-all ${
                activeTab === tab.id 
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-gray-400'}`} />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Content Panel */}
        <div className="flex-1 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <form onSubmit={handleSubmit}>
            {renderTabContent()}

            <div className="flex items-center justify-between pt-6 mt-8 border-t border-gray-100">
              <div className="flex items-center gap-2 text-green-500 font-bold text-sm">
                {message && (
                  <>
                    <CheckCircleIcon className="w-5 h-5" />
                    {message}
                  </>
                )}
              </div>
              <button 
                type="submit" 
                disabled={saving}
                className={`
                  px-12 py-4 bg-orange-500 text-white font-black rounded-2xl shadow-xl shadow-orange-100 transition-all active:scale-95
                  ${saving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-orange-600'}
                `}
              >
                {saving ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
