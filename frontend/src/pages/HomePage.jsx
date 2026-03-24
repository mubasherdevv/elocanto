import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useAds } from '../context/AdContext';
import AdCard from '../components/AdCard';
import api from '../lib/api';

export default function HomePage() {
  const { featuredAds, latestAds, fetchFeaturedAds, fetchLatestAds, loading } = useAds();
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    fetchFeaturedAds();
    fetchLatestAds();
    
    const loadData = async () => {
      try {
        const [catRes, cityRes] = await Promise.all([
          api.get('/categories'),
          api.get('/cities')
        ]);
        setCategories(catRes.data);
        setCities(cityRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, [fetchFeaturedAds, fetchLatestAds]);

  const trackedHomepageKey = useRef(null);

  useEffect(() => {
    if (featuredAds.length > 0 && trackedHomepageKey.current !== 'tracked') {
      trackedHomepageKey.current = 'tracked';
      const adIds = featuredAds.map(ad => ad._id);
      const viewerId = localStorage.getItem('ad_viewer_id') || `viewer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      if (!localStorage.getItem('ad_viewer_id')) {
        localStorage.setItem('ad_viewer_id', viewerId);
      }
      api.post('/views/track-bulk', { adIds, localStorageId: viewerId, page: 'homepage' }).catch(console.error);
    }
  }, [featuredAds]);

  return (
    <div style={{ background: 'var(--white)', paddingBottom: 64 }}>
      <style>{`
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        
        .scroll-container {
          display: flex;
          gap: 24px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          padding: 10px 4px 24px;
          justify-content: flex-start;
        }

        .scroll-item-5 {
          scroll-snap-align: start;
          flex-shrink: 0;
          width: calc(20% - 20px);
          display: flex;
          align-items: stretch;
        }

        @media (max-width: 1200px) {
          .scroll-item-5 { width: calc(25% - 18px); }
        }
        @media (max-width: 992px) {
          .scroll-item-5 { width: calc(33.333% - 16px); }
        }
        @media (max-width: 768px) {
          .scroll-item-5 { width: calc(50% - 12px); }
        }
        @media (max-width: 480px) {
          .scroll-item-5 { width: calc(75% - 10px); }
          .scroll-container { gap: 16px; }
        }

        .category-item {
          flex-shrink: 0 !important;
          width: 120px !important;
        }

        @media (max-width: 1200px) {
          .category-item { width: calc(25% - 18px); }
        }
        @media (max-width: 992px) {
          .category-item { width: calc(33.333% - 16px); }
        }
        @media (max-width: 768px) {
          .category-item { width: calc(25% - 12px); } /* 4 on tablet */
        }
        @media (max-width: 480px) {
          .category-item { width: calc(33.333% - 11px); } /* 3 on mobile */
        }

        .category-card {
          text-decoration: none;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: center;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .category-card:hover { transform: translateY(-8px); }
        .category-card:hover .category-blob { 
          box-shadow: 15px 15px 30px #d1d9e6, -15px -15px 30px #ffffff;
          border-color: var(--primary);
        }

        .category-blob {
          width: clamp(100px, 12vw, 120px);
          height: clamp(100px, 12vw, 120px);
          background: linear-gradient(145deg, #ffffff, #f1f5f9);
          border-radius: 28px;
          box-shadow: 10px 10px 20px #e2e8f0, -10px -10px 20px #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          transition: all 0.3s ease;
          overflow: hidden;
          border: 2px solid transparent;
        }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee {
          display: flex;
          gap: 24px;
          width: max-content;
          animation: marquee 25s linear infinite;
        }
        .marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Hero Section */}
      <section style={{ padding: '80px 20px 40px', textAlign: 'center' }}>
        <div className="container-custom" style={{ maxWidth: 800 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(249, 94, 38, 0.08)', color: 'var(--primary)', padding: '6px 16px', borderRadius: 999, fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 24 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)' }}></div>
            Trusted Global Marketplace
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, color: 'var(--dark)', lineHeight: 1.1, marginBottom: 20 }}>
            Discover <span style={{ color: 'var(--primary)' }}>Marketplace X</span>
          </h1>
          <p style={{ fontSize: 'clamp(16px, 2vw, 18px)', color: 'var(--gray-600)', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
            The most secure destination to buy, sell, and discover premium items from around the world.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="container-custom" style={{ marginBottom: 40, overflow: 'hidden' }}>
        <div className="marquee">
          {[...categories, ...categories].map((cat, index) => (
            <div key={`${cat._id}-${index}`} className="category-item">
              <Link to={`/ads?category=${cat.slug}`} className="category-card">
                <div className="category-blob">
                  {cat.image ? (
                    <img 
                      src={cat.image.startsWith('/uploads/') ? `/api/images/${cat.image.split('/').pop()}?w=120` : cat.image} 
                      srcSet={cat.image.startsWith('/uploads/') ? `
                        /api/images/${cat.image.split('/').pop()}?w=120 120w,
                        /api/images/${cat.image.split('/').pop()}?w=240 240w
                      ` : undefined}
                      sizes="120px"
                      alt={cat.name} 
                      width="120" height="120" 
                      loading={index < 3 ? "eager" : "lazy"} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : <span style={{ fontSize: '2.5rem' }}>{cat.icon || '📦'}</span>}
                </div>
                <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--gray-800)' }}>{cat.name}</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Browse by City */}
      {cities.length > 0 && (
        <section className="container-custom" style={{ marginBottom: 64 }}>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--dark)', marginBottom: 20, paddingLeft: 12 }}>Browse by City</h2>
          <div className="hide-scroll scroll-container" style={{ paddingTop: 0 }}>
            {cities.map(city => (
              <div key={city._id} style={{ scrollSnapAlign: 'start', flexShrink: 0, width: 120 }}>
                <Link to={`/ads?city=${encodeURIComponent(city.name)}`} style={{ textDecoration: 'none', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(145deg, #ffffff, #f1f5f9)', boxShadow: '6px 6px 12px #e2e8f0, -6px -6px 12px #ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: city.isPopular ? '2px solid var(--primary)' : '2px solid transparent', transition: 'transform 0.2s' }} className="hover:scale-105">
                    {city.image ? (
                      <img 
                        src={city.image.startsWith('/uploads/') ? `/api/images/${city.image.split('/').pop()}?w=80` : city.image} 
                        srcSet={city.image.startsWith('/uploads/') ? `
                          /api/images/${city.image.split('/').pop()}?w=80 80w,
                          /api/images/${city.image.split('/').pop()}?w=160 160w
                        ` : undefined}
                        sizes="80px"
                        alt={city.name} 
                        width="80" height="80" 
                        loading="lazy" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    ) : <span style={{ fontSize: '1.5rem' }}>{city.isPopular ? '🌟' : '📍'}</span>}
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--gray-800)' }}>{city.name}</span>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured Ads */}
      {featuredAds.length > 0 && (
        <section className="container-custom" style={{ marginBottom: 64 }}>
          <div style={{ background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 32, padding: 'clamp(24px, 5vw, 32px) clamp(20px, 4vw, 40px)', boxShadow: '0 10px 40px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
              <h2 style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 900, color: 'var(--dark)' }}>Featured Ads</h2>
              <Link to="/ads?listingType=featured&page=1" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 13, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: 0.5 }}>VIEW ALL &rarr;</Link>
            </div>
            
            <div className="hide-scroll scroll-container">
              {featuredAds.slice(0, 10).map(ad => (
                <div key={ad._id} className="scroll-item-5">
                  <AdCard ad={ad} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Ads */}
      <section className="container-custom" style={{ marginBottom: 64 }}>
        <div style={{ background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 32, padding: 'clamp(24px, 5vw, 32px) clamp(20px, 4vw, 40px)', boxShadow: '0 10px 40px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
            <h2 style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 900, color: 'var(--dark)' }}>Latest Recommendations</h2>
            <Link to="/ads?listingType=simple&page=1" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 13, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: 0.5 }}>VIEW ALL &rarr;</Link>
          </div>
          
          {loading ? (
            <div className="flex-center py-20"><div className="spinner"></div></div>
          ) : (
            <div className="hide-scroll scroll-container">
              {latestAds.slice(0, 10).map(ad => (
                <div key={ad._id} className="scroll-item-5">
                  <AdCard ad={ad} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container-custom">
        <div style={{ background: 'var(--dark)', borderRadius: 32, padding: 'clamp(32px, 6vw, 48px) clamp(24px, 6vw, 56px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 32, position: 'relative', overflow: 'hidden' }}>
          <div style={{ flex: '1 1 400px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#facc15', fontSize: 12, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 20 }}>
              <span style={{ fontSize: 16 }}>⭐</span> PREMIUM OPPORTUNITY
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 900, color: 'white', marginBottom: 16 }}>Earn with MarketX</h2>
            <p style={{ color: 'var(--gray-400)', fontSize: 16, lineHeight: 1.6, maxWidth: 440 }}>
              Are you a seller or an agency? Post your ad for free on the world's #1 network and start getting quality leads today.
            </p>
          </div>
          <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
            <Link to="/post-ad" style={{ background: 'var(--success)', color: 'white', padding: '16px 32px', borderRadius: 16, fontSize: 16, fontWeight: 800, textDecoration: 'none', display: 'inline-block', boxShadow: '0 8px 25px rgba(34, 197, 94, 0.4)' }}>
              Post Free Ad Now
            </Link>
            <div style={{ display: 'flex', gap: 24, color: 'var(--gray-400)', fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ color: '#facc15' }}>⚡</span> INSTANT LIVE</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>📈 HIGH TRAFFIC</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
