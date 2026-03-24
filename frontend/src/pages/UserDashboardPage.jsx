import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { 
  UserCircleIcon, ShoppingBagIcon, HeartIcon, 
  ChatBubbleLeftRightIcon, Cog6ToothIcon, PencilIcon,
  TrashIcon, EyeIcon, ChevronRightIcon, ArrowTopRightOnSquareIcon, CalendarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import AdCard from '../components/AdCard';
import { generateAdSlug } from '../utils/urlUtils';

export default function UserDashboardPage() {
  const { user, updateProfile, logout, fetchUserProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'ads';

  const [myAds, setMyAds] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);
  
  // Profile state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    city: user?.city || '',
    bio: user?.bio || '',
    profilePhoto: user?.profilePhoto || '',
    email: user?.email || '',
    password: ''
  });

  useEffect(() => {
    if (fetchUserProfile) fetchUserProfile(false);
    fetchSettings();
    fetchMyAds();

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchSettings();
        if (activeTab === 'ads') fetchMyAds();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/settings');
      setSettings(data);
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'ads') fetchMyAds();
    if (activeTab === 'favorites') fetchFavorites();
  }, [activeTab]);

  const fetchMyAds = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/ads/my');
      setMyAds(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/favorites');
      setFavorites(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const success = await updateProfile(profileData);
    if (success) alert('Profile updated!');
  };

  const handleDeleteAd = async (id) => {
    if (window.confirm('Are you sure you want to delete this ad?')) {
      try {
        await api.delete(`/ads/${id}`);
        setMyAds(myAds.filter(ad => ad._id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Delete failed');
      }
    }
  };

  const handleRenewAd = async (ad) => {
    if (!window.confirm('Renew this ad for the default duration?')) return;
    try {
      const duration = ad.isFeatured ? (settings?.featuredAdsDuration || 7) : (settings?.simpleAdsDuration || 30);
      const newExpiresAt = new Date();
      newExpiresAt.setDate(newExpiresAt.getDate() + duration);
      await api.put(`/ads/${ad._id}`, { expiresAt: newExpiresAt, isActive: true });
      alert(`Ad renewed for ${duration} days!`);
      fetchMyAds();
    } catch (err) {
      alert('Failed to renew ad');
    }
  };

  const tabs = [
    { id: 'ads', label: 'My Ads', icon: <ShoppingBagIcon style={{ width: 20, height: 20 }} /> },
    { id: 'favorites', label: 'Favorites', icon: <HeartIcon style={{ width: 20, height: 20 }} /> },
    { id: 'messages', label: 'Messages', icon: <ChatBubbleLeftRightIcon style={{ width: 20, height: 20 }} /> },
    { id: 'settings', label: 'Settings', icon: <Cog6ToothIcon style={{ width: 20, height: 20 }} /> },
  ];

  const sidebarItemStyle = (id) => ({
    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
    borderRadius: 12, textDecoration: 'none', fontSize: 14, fontWeight: 700,
    transition: 'all 0.2s', color: activeTab === id ? '#3e6fe1' : '#6b7280',
    background: activeTab === id ? 'rgba(62,111,225,0.08)' : 'transparent'
  });

  if (!user) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}><div className="spinner"></div></div>;

  return (
    <div className="page-wrapper container-custom" style={{ background: '#f7f8fa' }}>
      <div className="dashboard-layout flex flex-col lg:grid lg:grid-cols-[260px_1fr] gap-8">
        {/* Sidebar / Mobile Tabs */}
        <aside className="flex flex-col gap-4">
          {/* Profile Card - Hidden on mobile to save space, or simplified */}
          <div className="hidden lg:block bg-white rounded-2xl p-6 border border-gray-100 text-center mb-4">
            {user.profilePhoto ? (
              <img src={user.profilePhoto} width="80" height="80" loading="lazy" className="w-20 h-20 rounded-full object-cover mx-auto mb-3 shadow-sm" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-orange-500 text-white flex items-center justify-center text-3xl font-black mx-auto mb-3">
                {user.name[0]}
              </div>
            )}
            <h3 className="font-black text-lg text-gray-900">{user.name}</h3>
            <p className="text-xs text-gray-500 mt-1">{user.email}</p>
            {user.createdAt && (
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-3">
                Since {new Date(user.createdAt).getFullYear()}
              </p>
            )}
          </div>

          {/* Desktop/Mobile Navigation */}
          <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 gap-2 hide-scroll no-scrollbar">
            {tabs.map(tab => (
              <Link 
                key={tab.id} 
                to={`/dashboard?tab=${tab.id}`} 
                className={`flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-black transition-all whitespace-nowrap lg:w-full ${
                  activeTab === tab.id 
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' 
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                {tab.icon} {tab.label}
              </Link>
            ))}
            
            <button 
              onClick={() => { logout(); navigate('/'); }}
              className="flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-black text-red-500 bg-white hover:bg-red-50 transition-all whitespace-nowrap lg:w-full lg:mt-4"
            >
              🚪 Logout
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <div className="min-w-0">
          {activeTab === 'ads' && (
            <div className="fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Account Overview</h1>
                <Link to="/post-ad" className="btn-primary w-full sm:w-auto justify-center rounded-xl py-3 px-6 font-black tracking-tight">+ Post New Ad</Link>
              </div>

              {/* User Analytics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
                {[
                  { label: 'Total Ads', value: myAds.length, bg: 'bg-blue-50', text: 'text-blue-600' },
                  { label: 'Approved', value: myAds.filter(a => a.isApproved).length, bg: 'bg-green-50', text: 'text-green-600' },
                  { label: 'Pending', value: myAds.filter(a => !a.isApproved).length, bg: 'bg-orange-50', text: 'text-orange-600' },
                  { label: 'Featured', value: myAds.filter(a => a.isFeatured).length, bg: 'bg-purple-50', text: 'text-purple-600' },
                  { label: 'Expired', value: myAds.filter(a => a.expiresAt && new Date(a.expiresAt) < new Date()).length, bg: 'bg-red-50', text: 'text-red-600' }
                ].map(stat => (
                  <div key={stat.label} className={`${stat.bg} p-5 rounded-2xl border border-white shadow-sm text-center`}>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className={`text-2xl font-black ${stat.text}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {loading ? <div className="py-20 flex-center"><div className="spinner"></div></div> : (
                myAds.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <ShoppingBagIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-500 font-bold">You haven't posted any ads yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myAds.map(ad => (
                      <div key={ad._id} className="bg-white rounded-3xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-6 hover:shadow-xl transition-all duration-300 group overflow-hidden relative">
                        {/* Status Badge Over Image */}
                        <div className="absolute top-6 left-6 z-10">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                            ad.isApproved ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
                          }`}>
                            {ad.isApproved ? 'Active' : 'Pending'}
                          </span>
                        </div>

                        <div className="sm:w-48 h-40 sm:h-32 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-50 relative">
                          <img 
                            src={ad.images?.[0] ? (ad.images[0].startsWith('http') ? ad.images[0] : `http://localhost:5000${ad.images[0]}`) : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'} 
                            width="192" height="128" loading="lazy"
                            className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" 
                          />
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <h4 className="font-black text-lg text-gray-900 group-hover:text-orange-500 transition-colors truncate">
                            {ad.title}
                          </h4>
                          <p className="text-xl font-black text-orange-500 mt-1">PKR {ad.price.toLocaleString()}</p>
                          
                          <div className="flex flex-wrap items-center gap-4 mt-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                            <span className="flex items-center gap-1.5"><EyeIcon className="w-3.5 h-3.5" /> {ad.views} Views</span>
                            <span className="flex items-center gap-1.5"><CalendarIcon className="w-3.5 h-3.5" /> {new Date(ad.createdAt).toLocaleDateString()}</span>
                            {ad.expiresAt && (
                              <span className={`flex items-center gap-1.5 ${new Date(ad.expiresAt) < new Date() ? 'text-red-500' : 'text-green-600'}`}>
                                <ShoppingBagIcon className="w-3.5 h-3.5" />
                                {new Date(ad.expiresAt) < new Date() ? 'Expired' : `Expires: ${new Date(ad.expiresAt).toLocaleDateString()}`}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-row sm:flex-col justify-end gap-2 border-t sm:border-t-0 sm:border-l border-gray-50 pt-4 sm:pt-0 sm:pl-6">
                          <Link to={`/ads/${generateAdSlug(ad)}`} className="flex-1 sm:flex-initial p-3 bg-gray-50 hover:bg-blue-50 text-blue-600 rounded-xl transition-colors flex items-center justify-center" title="View" aria-label="View ad">
                             <EyeIcon className="w-5 h-5" />
                          </Link>
                          {ad.expiresAt && new Date(ad.expiresAt) < new Date() && (
                            <button onClick={() => handleRenewAd(ad)} className="flex-1 sm:flex-initial p-3 bg-yellow-50 hover:bg-yellow-100 text-yellow-600 rounded-xl transition-colors flex items-center justify-center" title="Renew" aria-label="Renew ad">
                              <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                            </button>
                          )}
                          <button onClick={() => handleDeleteAd(ad._id)} className="flex-1 sm:flex-initial p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors flex items-center justify-center" title="Delete" aria-label="Delete ad">
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="fade-in">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-8">Saved Items</h2>
              {loading ? <div className="py-20 flex-center"><div className="spinner"></div></div> : (
                favorites.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <HeartIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-500 font-bold">No favorite ads yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {favorites.map(ad => (
                      <AdCard key={ad._id} ad={ad} initialFav={true} onFavToggle={(id, fav) => !fav && setFavorites(favorites.filter(f => f._id !== id))} />
                    ))}
                  </div>
                )
              )}
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="fade-in">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-8">Your Chats</h2>
              <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden text-center py-20 px-6">
                <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                <h3 className="text-xl font-black text-gray-900 mb-2">Message Center</h3>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">Click the button below to open the professional messaging portal and check your inquiries.</p>
                <Link to="/messages" className="btn-primary inline-flex py-4 px-8 rounded-2xl font-black">View All Messages</Link>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="fade-in bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-sm">
              <div className="mb-10">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Profile Settings</h2>
                <p className="text-gray-500 mt-1 font-medium">Update your account information and preferences.</p>
              </div>
              
              <form onSubmit={handleUpdate} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label htmlFor="dash-name" className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Full Name</label>
                    <input id="dash-name" type="text" className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 font-bold text-gray-900 focus:border-orange-500 transition-colors outline-none" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} />
                  </div>
                  <div>
                    <label htmlFor="dash-phone" className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Phone Number</label>
                    <input id="dash-phone" type="text" className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 font-bold text-gray-900 focus:border-orange-500 transition-colors outline-none" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label htmlFor="dash-email" className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Email Address</label>
                    <input id="dash-email" type="email" className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 font-bold text-gray-400 focus:border-orange-500 transition-colors outline-none opacity-60 cursor-not-allowed" value={profileData.email} disabled />
                  </div>
                  <div>
                    <label htmlFor="dash-password" className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">New Password</label>
                    <input id="dash-password" type="password" className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 font-bold text-gray-900 focus:border-orange-500 transition-colors outline-none" value={profileData.password} onChange={e => setProfileData({...profileData, password: e.target.value})} placeholder="••••••••" />
                  </div>
                </div>

                <div>
                  <label htmlFor="dash-city" className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">City</label>
                  <select id="dash-city" className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 font-bold text-gray-900 focus:border-orange-500 transition-colors outline-none cursor-pointer" value={profileData.city} onChange={e => setProfileData({...profileData, city: e.target.value})}>
                    <option value="">Select City</option>
                    {['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Peshawar', 'Quetta', 'Multan', 'Faisalabad'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label htmlFor="dash-bio" className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Bio (Optional)</label>
                  <textarea id="dash-bio" className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 font-bold text-gray-900 focus:border-orange-500 transition-colors outline-none min-h-[120px]" value={profileData.bio} onChange={e => setProfileData({...profileData, bio: e.target.value})} placeholder="Tell us something about yourself..."></textarea>
                </div>

                <button type="submit" className="btn-primary w-full sm:w-auto py-4 px-12 rounded-2xl font-black text-lg shadow-xl shadow-orange-200">Save Profile</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
