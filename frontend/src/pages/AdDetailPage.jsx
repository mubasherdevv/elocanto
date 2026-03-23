import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  MapPinIcon, CalendarIcon, EyeIcon, PhoneIcon,
  ChatBubbleLeftRightIcon, HeartIcon, ShareIcon,
  ExclamationCircleIcon, ChevronRightIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import api from '../lib/api';
import ImageCarousel from '../components/ImageCarousel';
import AdCard from '../components/AdCard';
import { useAuth } from '../context/AuthContext';

import { generateAdSlug, extractIdFromSlug } from '../utils/urlUtils';

export default function AdDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorited, setFavorited] = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        setLoading(true);
        const id = extractIdFromSlug(slug);
        const { data } = await api.get(`/ads/${id}`);
        setAd(data);
        
        const viewerId = localStorage.getItem('ad_viewer_id') || `viewer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        if (!localStorage.getItem('ad_viewer_id')) {
          localStorage.setItem('ad_viewer_id', viewerId);
        }
        api.post('/views/track', { adId: id, page: 'detail', localStorageId: viewerId }).catch(console.error);
        
        // Redirect if slug is incorrect/outdated for SEO
        const correctSlug = generateAdSlug(data);
        if (slug !== correctSlug) {
          navigate(`/ads/${correctSlug}`, { replace: true });
        }
        if (user) {
          const { data: favData } = await api.get(`/favorites/check/${data._id}`);
          setFavorited(favData.favorited);
        }
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load ad details');
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchAd();
    window.scrollTo(0, 0);
  }, [slug, user]);

  const toggleFav = async () => {
    if (!user) return navigate('/login');
    try {
      const { data } = await api.post(`/favorites/${ad._id}`);
      setFavorited(data.favorited);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChat = () => {
    if (!user) return navigate('/login');
    if (user._id === ad.seller._id) return navigate('/dashboard?tab=ads');
    navigate(`/messages?sellerId=${ad.seller._id}&adId=${ad._id}`);
  };

  if (loading) return <div className="page-wrapper flex-center"><div className="spinner"></div></div>;
  if (error) return (
    <div className="page-wrapper container-custom flex-center" style={{ flexDirection: 'column' }}>
      <ExclamationCircleIcon style={{ width: 64, height: 64, color: '#dc2626', marginBottom: 16 }} />
      <h2 style={{ fontWeight: 800 }}>{error}</h2>
      <Link to="/ads" className="btn-primary mt-6">Browse other ads</Link>
    </div>
  );

  return (
    <div className="page-wrapper" style={{ background: '#f7f8fa' }}>
      <div className="container-custom">
        {/* Breadcrumbs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
          <ChevronRightIcon style={{ width: 12, height: 12 }} />
          <Link to="/ads" style={{ color: 'inherit', textDecoration: 'none' }}>Ads</Link>
          <ChevronRightIcon style={{ width: 12, height: 12 }} />
          <Link to={`/ads?category=${ad.category.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{ad.category.name}</Link>
          <ChevronRightIcon style={{ width: 12, height: 12 }} />
          <span style={{ color: '#1a1a2e', fontWeight: 600 }}>{ad.title}</span>
        </nav>

        <div className="ad-detail-layout flex flex-col lg:grid lg:grid-cols-[1fr_340px] gap-6">
          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Gallery + Price/Title Wrapper */}
            <div style={{ background: 'white', borderRadius: 16, padding: '2px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              <ImageCarousel images={ad.images} title={ad.title} />
            </div>

            <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1a1a2e' }}>PKR {ad.price?.toLocaleString()}</h1>
                    {ad.isNegotiable && <span style={{ background: '#fef3c7', color: '#92400e', fontSize: 11, fontWeight: 800, padding: '4px 8px', borderRadius: 6, textTransform: 'uppercase' }}>Negotiable</span>}
                  </div>
                  <h2 style={{ fontSize: 18, color: '#4b5563', marginTop: 8, fontWeight: 500 }}>{ad.title}</h2>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={toggleFav} className="btn-ghost" style={{ border: '1.5px solid #e5e7eb', borderRadius: '50%', width: 44, height: 44, padding: 0, justifyContent: 'center' }}>
                    {favorited ? <HeartSolid style={{ width: 22, height: 22, color: '#dc2626' }} /> : <HeartIcon style={{ width: 22, height: 22 }} />}
                  </button>
                  <button className="btn-ghost" style={{ border: '1.5px solid #e5e7eb', borderRadius: '50%', width: 44, height: 44, padding: 0, justifyContent: 'center' }}>
                    <ShareIcon style={{ width: 20, height: 20 }} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 24, flexWrap: 'wrap', borderTop: '1px solid #f3f4f6', paddingTop: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: 14 }}>
                  <MapPinIcon style={{ width: 18, height: 18 }} /> {ad.city}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: 14 }}>
                  <CalendarIcon style={{ width: 18, height: 18 }} /> {new Date(ad.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: 14 }}>
                  <EyeIcon style={{ width: 18, height: 18 }} /> {ad.views} views
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                    <div className="w-5 h-5 rounded-full overflow-hidden bg-white border border-gray-100 flex-shrink-0">
                      <img src={ad.category.image || 'https://via.placeholder.com/50'} alt={ad.category.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider font-bold">{ad.category.name}</span>
                  </div>
                  {ad.subcategory && (
                    <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
                      <div className="w-5 h-5 rounded-full overflow-hidden bg-white border border-orange-100 flex-shrink-0">
                        <img src={ad.subcategory.image || 'https://via.placeholder.com/50'} alt={ad.subcategory.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] font-black uppercase text-orange-600 tracking-wider font-bold">{ad.subcategory.name}</span>
                    </div>
                  )}
                  <span className="badge" style={{ background: ad.condition === 'new' ? '#dcfce7' : '#f3f4f6', color: ad.condition === 'new' ? '#166534' : '#4b5563' }}>{ad.condition}</span>
                </div>
              </div>
            </div>

            {/* Description & Specs */}
            <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 20, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid #f3f4f6' }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5 }}>Brand</span>
                  <p style={{ fontSize: 15, fontWeight: 800, color: '#1a1a2e', marginTop: 4 }}>{ad.brand || 'Unbranded'}</p>
                </div>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5 }}>Condition</span>
                  <p style={{ fontSize: 15, fontWeight: 800, color: '#1a1a2e', marginTop: 4, textTransform: 'capitalize' }}>{ad.condition}</p>
                </div>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5 }}>Category</span>
                  <p style={{ fontSize: 15, fontWeight: 800, color: '#1a1a2e', marginTop: 4 }}>{ad.category.name}</p>
                </div>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>Description</h3>
              <p style={{ color: '#4b5563', fontSize: 15, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                {ad.description}
              </p>
            </div>

            {/* Seller's other ads */}
            {ad.sellerAds?.length > 0 && (
              <div className="mt-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">More from {ad.seller.name}</h3>
                  <Link to={`/profile/${ad.seller._id}`} className="text-sm font-black text-orange-500 hover:text-orange-600 uppercase tracking-widest">View Profile &rarr;</Link>
                </div>
                
                <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-x-auto sm:overflow-visible pb-6 sm:pb-0 hide-scroll snap-x snap-mandatory">
                  {ad.sellerAds.map(otherAd => (
                    <div key={otherAd._id} className="min-w-[240px] sm:min-w-0 snap-start">
                      <AdCard ad={otherAd} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Seller Card */}
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              <div style={{ padding: 20, borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <Link to={`/profile/${ad.seller._id}`}>
                    {ad.seller.profilePhoto ? (
                      <img src={ad.seller.profilePhoto} alt={ad.seller.name} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#3e6fe1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800 }}>
                        {ad.seller.name[0]}
                      </div>
                    )}
                  </Link>
                  <div>
                    <Link to={`/profile/${ad.seller._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <h4 style={{ fontWeight: 800, fontSize: 17 }} className="hover:text-primary transition-colors">{ad.seller.name}</h4>
                    </Link>
                    <p style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>Member since {new Date(ad.seller.createdAt).getFullYear()}</p>
                    {ad.seller.badges && ad.seller.badges.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                        {ad.seller.badges.slice(0, 3).map(badge => (
                          <span key={badge} style={{ background: '#eef2ff', color: '#4f46e5', fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 4, textTransform: 'capitalize', border: '1px solid #e0e7ff', cursor: 'help' }} title={badge.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) + " Seller"}>
                            {badge.replace(/([A-Z])/g, ' $1')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {ad.seller.bio && (
                  <p style={{ fontSize: 13, color: '#4b5563', marginTop: 16, borderTop: '1px solid #f3f4f6', paddingTop: 16 }}>{ad.seller.bio}</p>
                )}
              </div>
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button 
                  onClick={handleChat}
                  className="btn-primary" 
                  style={{ width: '100%', justifyContent: 'center', height: 48, borderRadius: 12 }}
                >
                  <ChatBubbleLeftRightIcon style={{ width: 20, height: 20 }} /> Chat with Seller
                </button>
                <button 
                  onClick={() => setShowPhone(!showPhone)}
                  style={{ 
                    width: '100%', height: 48, borderRadius: 12, display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', gap: 8,
                    background: 'white', color: '#1a1a2e', border: '2px solid #1a1a2e',
                    fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { e.target.style.background = '#f7f8fa'; }}
                  onMouseLeave={e => { e.target.style.background = 'white'; }}
                >
                  <PhoneIcon style={{ width: 20, height: 20 }} />
                  {showPhone ? ad.phone || ad.seller.phone || 'No phone provided' : 'Show Phone Number'}
                </button>
              </div>
            </div>

            {/* Safety Tips */}
            <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #e5e7eb' }}>
              <h4 style={{ fontWeight: 800, fontSize: 16, marginBottom: 16 }}>Safety Tips for Buyers</h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 0, listStyle: 'none' }}>
                {[
                  'Meet in a public place',
                  'Check item before you buy',
                  'Pay only after collecting item',
                  'Avoid remote payments'
                ].map(tip => (
                  <li key={tip} style={{ fontSize: 13, color: '#4b5563', display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#3e6fe1' }}></div>
                    {tip}
                  </li>
                ))}
              </ul>
              <button 
                className="btn-ghost mt-4" 
                style={{ width: '100%', color: '#6b7280', fontSize: 12, textDecoration: 'underline', padding: 0, justifyContent: 'center' }}
              >
                Report this ad
              </button>
            </div>

            {/* Ad ID tag */}
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>AD ID: {ad._id.slice(-8).toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
