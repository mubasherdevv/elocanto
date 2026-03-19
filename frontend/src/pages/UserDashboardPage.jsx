import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  UserCircleIcon, ShoppingBagIcon, HeartIcon, 
  ChatBubbleLeftRightIcon, Cog6ToothIcon, PencilIcon,
  TrashIcon, EyeIcon, ChevronRightIcon, ArrowTopRightOnSquareIcon
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
      const { data } = await axios.get('/api/settings');
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
      const { data } = await axios.get('/api/ads/my');
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
      const { data } = await axios.get('/api/favorites');
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
        await axios.delete(`/api/ads/${id}`);
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
      await axios.put(`/api/ads/${ad._id}`, { expiresAt: newExpiresAt, isActive: true });
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
        {/* Sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #e5e7eb', textAlign: 'center', marginBottom: 16 }}>
            {user.profilePhoto ? (
              <img src={user.profilePhoto} style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px' }} />
            ) : (
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#3e6fe1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, margin: '0 auto 12px' }}>
                {user.name[0]}
              </div>
            )}
            <h3 style={{ fontWeight: 800, fontSize: 18 }}>{user.name}</h3>
            <p style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{user.email}</p>
            {user?.badges && user?.badges.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center', marginTop: 8 }}>
                {user.badges.map(badge => (
                  <span key={badge} style={{ background: '#eef2ff', color: '#4f46e5', fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 4, textTransform: 'capitalize', border: '1px solid #e0e7ff' }} title={badge && typeof badge === 'string' ? badge.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) : ''}>
                    {badge && typeof badge === 'string' ? badge.replace(/([A-Z])/g, ' $1') : badge}
                  </span>
                ))}
              </div>
            )}
            {user.createdAt && (
              <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                Joined {new Date(user.createdAt).toLocaleDateString('en-PK', { month: 'short', year: 'numeric' })}
              </p>
            )}
          </div>

          {tabs.map(tab => (
            <Link key={tab.id} to={`/dashboard?tab=${tab.id}`} style={sidebarItemStyle(tab.id)}>
              {tab.icon} {tab.label}
            </Link>
          ))}

          <button 
            onClick={() => { logout(); navigate('/'); }}
            style={{ 
              marginTop: 20, display: 'flex', alignItems: 'center', gap: 12, 
              padding: '12px 16px', borderRadius: 12, border: 'none', background: 'none',
              cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#dc2626'
            }}
          >
            🚪 Logout
          </button>
        </aside>

        {/* Content Area */}
        <div style={{ minWidth: 0 }}>
          {activeTab === 'ads' && (
            <div className="fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontWeight: 800, fontSize: 22 }}>My Advertisements</h2>
                <Link to="/post-ad" className="btn-primary" style={{ fontSize: 13, padding: '8px 16px' }}>+ Post New Ad</Link>
              </div>

              {/* User Analytics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 16, marginBottom: 32 }}>
                {[
                  { label: 'Total Ads', value: myAds.length },
                  { label: 'Approved', value: myAds.filter(a => a.isApproved).length },
                  { label: 'Pending', value: myAds.filter(a => !a.isApproved).length },
                  { label: 'Featured', value: myAds.filter(a => a.isFeatured).length },
                  { label: 'Simple', value: myAds.filter(a => !a.isFeatured).length }
                ].map(stat => (
                  <div key={stat.label} style={{ background: 'white', padding: 16, borderRadius: 16, border: '1px solid #e5e7eb', textAlign: 'center' }}>
                    <p style={{ fontSize: 10, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>{stat.label}</p>
                    <p style={{ fontSize: 24, fontWeight: 900, color: 'var(--dark)', marginTop: 4 }}>{stat.value}</p>
                  </div>
                ))}
              </div>
              {loading ? <div className="spinner" style={{ margin: '40px auto' }}></div> : (
                myAds.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 0', background: 'white', borderRadius: 16, border: '1px solid #e5e7eb' }}>
                    <ShoppingBagIcon style={{ width: 48, height: 48, color: '#e5e7eb', margin: '0 auto 16px' }} />
                    <p style={{ color: '#6b7280' }}>You haven't posted any ads yet.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {myAds.map(ad => (
                      <div key={ad._id} style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
                        <img 
                          src={ad.images?.[0] ? (ad.images[0].startsWith('http') ? ad.images[0] : `http://localhost:5000${ad.images[0]}`) : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'} 
                          style={{ width: 100, height: 80, borderRadius: 12, objectFit: 'cover' }} 
                        />
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
                            {ad.title}
                            {user?.badges?.slice(0, 1).map(badge => (
                              <span key={badge} style={{ background: '#eef2ff', color: '#4f46e5', fontSize: 9, fontWeight: 800, padding: '1px 4px', borderRadius: 4, textTransform: 'capitalize' }}>
                                {badge}
                              </span>
                            ))}
                          </h4>
                          <p style={{ fontWeight: 800, color: '#3e6fe1', marginTop: 4 }}>PKR {ad.price.toLocaleString()}</p>
                          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                            <span style={{ fontSize: 11, color: '#9ca3af' }}>Views: {ad.views}</span>
                            <span style={{ fontSize: 11, color: '#9ca3af' }}>{new Date(ad.createdAt).toLocaleDateString()}</span>
                            <span className="badge badge-success" style={{ fontSize: 9 }}>{ad.isApproved ? 'Active' : 'Pending'}</span>
                            {ad.expiresAt && (
                              <span style={{ fontSize: 11, color: new Date(ad.expiresAt) < new Date() ? '#dc2626' : '#059669' }}>
                                {new Date(ad.expiresAt) < new Date() ? 'Expired' : `Expires: ${new Date(ad.expiresAt).toLocaleDateString()}`}
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <Link to={`/ads/${generateAdSlug(ad)}`} className="btn-ghost" title="View"><EyeIcon style={{ width: 20, height: 20 }} /></Link>
                          {ad.expiresAt && new Date(ad.expiresAt) < new Date() && (
                            <button onClick={() => handleRenewAd(ad)} className="btn-ghost" style={{ color: '#eab308' }} title={`Renew (${ad.isFeatured ? (settings?.featuredAdsDuration || 7) : (settings?.simpleAdsDuration || 30)} days)`}>
                              <ArrowTopRightOnSquareIcon style={{ width: 20, height: 20 }} />
                            </button>
                          )}
                          <button onClick={() => handleDeleteAd(ad._id)} className="btn-ghost" style={{ color: '#dc2626' }} title="Delete"><TrashIcon style={{ width: 20, height: 20 }} /></button>
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
              <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 24 }}>Saved Items</h2>
              {loading ? <div className="spinner" style={{ margin: '40px auto' }}></div> : (
                favorites.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 0', background: 'white', borderRadius: 16, border: '1px solid #e5e7eb' }}>
                    <HeartIcon style={{ width: 48, height: 48, color: '#e5e7eb', margin: '0 auto 16px' }} />
                    <p style={{ color: '#6b7280' }}>No favorite ads yet.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
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
              <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 24 }}>Your Chats</h2>
              <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <p style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
                  Click "View All Messages" to open the messaging portal.
                  <br />
                  <Link to="/messages" className="btn-primary mt-4">View All Messages</Link>
                </p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="fade-in" style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: 32 }}>
              <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 24 }}>Profile Settings</h2>
              <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div>
                    <label className="filter-label">Full Name</label>
                    <input type="text" className="input-field" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="filter-label">Phone Number</label>
                    <input type="text" className="input-field" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div>
                    <label className="filter-label">Email Address</label>
                    <input type="email" className="input-field" value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} />
                  </div>
                  <div>
                    <label className="filter-label">New Password (leave blank to keep current)</label>
                    <input type="password" className="input-field" value={profileData.password} onChange={e => setProfileData({...profileData, password: e.target.value})} placeholder="••••••••" />
                  </div>
                </div>
                <div>
                  <label className="filter-label">City</label>
                  <select className="input-field" value={profileData.city} onChange={e => setProfileData({...profileData, city: e.target.value})}>
                    <option value="">Select City</option>
                    {['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Peshawar', 'Quetta', 'Multan', 'Faisalabad'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="filter-label">Bio (Optional)</label>
                  <textarea className="input-field" style={{ minHeight: 80 }} value={profileData.bio} onChange={e => setProfileData({...profileData, bio: e.target.value})}></textarea>
                </div>
                <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', padding: '12px 32px' }}>Save Changes</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
