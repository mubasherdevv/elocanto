import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAds } from '../context/AdContext';
import AdCard from '../components/AdCard';
import api from '../lib/api';
import { FunnelIcon, ArrowsUpDownIcon, XMarkIcon, ShieldCheckIcon, AdjustmentsHorizontalIcon, ChevronDownIcon, EyeIcon, MapPinIcon, MapIcon } from '@heroicons/react/24/outline';
import { generateAdSlug } from '../utils/urlUtils';

export default function AdsListingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { ads, loading, fetchAds, totalPages, totalCount, currentPage, settings } = useAds();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [isLarge, setIsLarge] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setIsLarge(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Parse query params
  const searchParams = new URLSearchParams(location.search);
  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const city = searchParams.get('city') || '';
  const sort = searchParams.get('sort') || '';
  const page = searchParams.get('page') || 1;
  const listingType = searchParams.get('listingType') || 'featured';
  const priceMin = searchParams.get('priceMin') || '';
  const priceMax = searchParams.get('priceMax') || '';
  const subcategory = searchParams.get('subcategory') || '';
  const [showFilters, setShowFilters] = useState(false);
  const [featuredAds, setFeaturedAds] = useState([]);

  // Buffer state for deferring applies
  const [tempFilters, setTempFilters] = useState({
    priceMin: searchParams.get('priceMin') || '',
    priceMax: searchParams.get('priceMax') || '',
    category: searchParams.get('category') || '',
    subcategory: searchParams.get('subcategory') || '',
    city: searchParams.get('city') || '',
  });

  useEffect(() => {
    setTempFilters({
      priceMin: searchParams.get('priceMin') || '',
      priceMax: searchParams.get('priceMax') || '',
      category: searchParams.get('category') || '',
      subcategory: searchParams.get('subcategory') || '',
      city: searchParams.get('city') || '',
    });
  }, [location.search]);

  const handleClearFilters = () => {
    setTempFilters({ priceMin: '', priceMax: '', category: '', subcategory: '', city: '' });
    navigate(window.location.pathname, { replace: true });
    setShowFilters(false);
  };

  const applyFiltersToUrl = (filters) => {
    const params = new URLSearchParams();
    if (filters.priceMin) params.set('priceMin', filters.priceMin);
    if (filters.priceMax) params.set('priceMax', filters.priceMax);
    if (filters.category) params.set('category', filters.category);
    if (filters.subcategory) params.set('subcategory', filters.subcategory);
    if (filters.city) params.set('city', filters.city);
    params.set('page', '1');
    navigate(`${window.location.pathname}?${params.toString()}`, { replace: true });
  };


  useEffect(() => {
    const type = listingType === 'simple' ? 'simple' : 'featured';
    
    fetchAds({ 
      keyword, 
      category, 
      city, 
      sort, 
      page, 
      adType: type, 
      listingType: type,
      priceMin,
      priceMax,
      subcategory,
    });

    const fetchWithRetry = async (url, maxRetries = 3) => {
      for (let i = 0; i < maxRetries; i++) {
        try {
          const res = await api.get(url.startsWith('/api') ? url.substring(4) : url);
          return res;
        } catch (err) {
          if (err.response?.status === 429 && i < maxRetries - 1) {
            const delay = Math.pow(2, i) * 1000;
            await new Promise(r => setTimeout(r, delay));
          } else throw err;
        }
      }
    };

    const loadData = async () => {
      try {
        const galleryLimit = settings?.featuredAdsLimit || 10;
        const [catRes, subRes, cityRes, galleryRes] = await Promise.all([
          api.get('/categories'),
          api.get('/subcategories'),
          api.get('/cities'),
          api.get(`/ads/featured?limit=${galleryLimit}`).catch(() => null),
        ]);
        
        if (catRes) setCategories(catRes.data);
        if (subRes) setSubcategories(subRes.data);
        if (cityRes) setCities(cityRes.data);
        if (galleryRes?.data) setFeaturedAds(galleryRes.data);
      } catch (err) {
        console.error('Failed to load page data:', err);
      }
    };
    loadData();
  }, [fetchAds, location.search, keyword, category, city, sort, page, listingType, settings, priceMin, priceMax, subcategory]);

  const trackedKey = useRef(null);

  useEffect(() => {
    if (ads.length > 0 && trackedKey.current !== location.search) {
      trackedKey.current = location.search;
      const adIds = ads.map(ad => ad._id);
      const viewerId = localStorage.getItem('ad_viewer_id') || `viewer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      if (!localStorage.getItem('ad_viewer_id')) {
        localStorage.setItem('ad_viewer_id', viewerId);
      }
      api.post('/views/track-bulk', { adIds, localStorageId: viewerId }).catch(console.error);
    }
  }, [ads, location.search]);

  const updateFilter = (name, value) => {
    const params = new URLSearchParams(location.search);
    if (value) params.set(name, value);
    else params.delete(name);
    if (name !== 'page') params.set('page', '1');
    navigate(`${window.location.pathname}?${params.toString()}`);
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 64 }}>
      <style>{`
        .filter-sidebar.mobile-active {
          position: fixed !important;
          top: 0; left: 0; right: 0; bottom: 0;
          background: white !important;
          z-index: 2000 !important;
          display: block !important;
          overflow-y: auto !important;
          padding: 20px !important;
          animation: slideUp 0.3s ease-out;
        }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .hide-scroll::-webkit-scrollbar { display: none; }
      `}</style>
      
      {/* Hero Banner Area */}
      <div className="container-custom" style={{ paddingTop: 24, paddingBottom: 24 }}>
        <div style={{ background: 'linear-gradient(90deg, #0f172a 0%, #1e293b 100%)', borderRadius: 24, padding: 'clamp(24px, 6vw, 48px) clamp(24px, 8vw, 64px)', color: 'white', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 600 }}>
            <span style={{ display: 'inline-block', background: 'var(--primary)', color: 'white', fontSize: 10, fontWeight: 800, padding: '4px 12px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20 }}>
              PREMIUM SELECTION
            </span>
            <h1 style={{ fontSize: 'clamp(24px, 6vw, 42px)', fontWeight: 900, lineHeight: 1.2, marginBottom: 16 }}>
              FIND THE PERFECT MATCH &ndash; ADS CURATED JUST FOR YOU
            </h1>
            <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
              Explore thousands of verified listings tailored to your professional needs. From high-end tech to expert services.
            </p>
            <div style={{ display: 'flex', gap: 16 }}>
              <button className="btn-primary" style={{ padding: '12px 24px', borderRadius: 12 }}>Browse Premium</button>
              <button style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '12px 24px', borderRadius: 12, fontWeight: 600, cursor: 'pointer' }}>How It Works</button>
            </div>
          </div>
        </div>
      </div>

      {/* Top Controls Bar */}
      <div className="container-custom" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Ad Type Toggle - Keep for both but style slightly better */}
          <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid #eef2ff', paddingBottom: 12, overflowX: 'auto' }} className="hide-scroll">
            <button
              onClick={() => updateFilter('listingType', 'featured')}
              style={{ 
                color: listingType === 'featured' ? 'white' : '#64748b', 
                background: listingType === 'featured' ? 'var(--primary)' : 'white',
                padding: '10px 20px', borderRadius: 12,
                border: '1px solid ' + (listingType === 'featured' ? 'var(--primary)' : '#e2e8f0'),
                cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap', fontWeight: 800, fontSize: 12,
                boxShadow: listingType === 'featured' ? '0 10px 20px rgba(249, 94, 38, 0.2)' : 'none'
              }}
            >
              ⭐ FEATURED ADS
            </button>
            <button
              onClick={() => updateFilter('listingType', 'simple')}
              style={{ 
                color: listingType === 'simple' ? 'white' : '#64748b', 
                background: listingType === 'simple' ? 'var(--primary)' : 'white',
                padding: '10px 20px', borderRadius: 12,
                border: '1px solid ' + (listingType === 'simple' ? 'var(--primary)' : '#e2e8f0'),
                cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap', fontWeight: 800, fontSize: 12,
                boxShadow: listingType === 'simple' ? '0 10px 20px rgba(249, 94, 38, 0.2)' : 'none'
              }}
            >
              📋 SIMPLE ADS
            </button>
          </div>

          {/* Quick Filter Actions - ONLY on small devices */}
          {!isLarge && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button 
                style={{ 
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, 
                  background: 'white', border: '1px solid #e2e8f0', padding: '12px 16px', 
                  borderRadius: 12, fontSize: 14, fontWeight: 700, color: '#1e293b', 
                  cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' 
                }} 
                onClick={() => setShowFilters(true)}
              >
                <AdjustmentsHorizontalIcon style={{ width: 18, color: '#64748b' }} /> 
                Advanced Filters
              </button>
              
              <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                <select 
                  value={sort} onChange={(e) => updateFilter('sort', e.target.value)}
                  aria-label="Sort by"
                  style={{ 
                    width: '100%', appearance: 'none', background: 'white', border: '1px solid #e2e8f0', 
                    padding: '12px 16px', paddingRight: 40, borderRadius: 12, fontSize: 14, 
                    fontWeight: 700, color: '#1e293b', cursor: 'pointer', outline: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                  }}
                >
                  <option value="">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="oldest">Oldest First</option>
                </select>
                <ChevronDownIcon style={{ width: 16, color: '#64748b', position: 'absolute', right: 16, pointerEvents: 'none' }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Gallery Ads Section */}
      {featuredAds.length > 0 && !category && !keyword && (
        <div className="container-custom" style={{ marginBottom: 40 }}>
          <div style={{ background: '#fdf8e3', padding: 'clamp(20px, 4vw, 32px)', borderRadius: 24, border: '1px solid #fde047', boxShadow: '0 10px 30px rgba(250, 204, 21, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: '#854d0e' }}>Gallery Ads</h3>
                <p style={{ fontSize: 10, color: '#a16207', letterSpacing: 1, textTransform: 'uppercase', fontWeight: 800, marginTop: 4 }}>TOP PICKS • VERIFIED LISTINGS</p>
              </div>
              <Link to="/ads?sort=featured" style={{ background: '#fef9c3', color: '#854d0e', fontSize: 12, fontWeight: 800, textDecoration: 'none', padding: '8px 16px', borderRadius: 12, border: '1px solid #fef08a' }}>View All &rarr;</Link>
            </div>
            
            <div className="hide-scroll no-scrollbar" style={{ 
              display: 'flex', gap: 20, overflowX: 'auto', paddingBottom: 16, paddingTop: 4,
              scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none'
            }}>
              {featuredAds.slice(0, settings?.featuredAdsLimit || 10).map(ad => (
                <Link key={ad._id} to={`/ads/${generateAdSlug(ad)}`} style={{ textDecoration: 'none', textAlign: 'center', flexShrink: 0, width: 130, scrollSnapAlign: 'start' }}>
                  <div style={{ width: 130, height: 130, borderRadius: '50%', background: 'white', border: '4px solid white', boxShadow: '0 10px 20px rgba(0,0,0,0.06)', marginBottom: 12, overflow: 'hidden', transition: 'all 0.3s' }} className="hover:scale-105 hover:shadow-lg group">
                    <img src={ad.images[0] ? (ad.images[0].startsWith('http') ? ad.images[0] : `http://localhost:5000${ad.images[0]}`) : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'} alt={ad.title} width="130" height="130" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} className="transition-transform group-hover:scale-110" />
                  </div>
                  <div style={{ color: '#854d0e', fontSize: 15, fontWeight: 900, marginBottom: 2 }}>{settings?.priceFormat || 'PKR'} {ad.price.toLocaleString()}</div>
                  <div style={{ color: '#a16207', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: '0 4px' }}>{ad.title}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="container-custom flex flex-col lg:grid lg:grid-cols-[260px_1fr] gap-8">
        
        {/* Sidebar Filters */}
        <aside className={`filter-sidebar ${isLarge || showFilters ? 'block' : 'hidden'} ${showFilters && !isLarge ? 'mobile-active' : ''}`} style={{ background: 'transparent', border: 'none', padding: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }} className="sm:hidden">
            <h3 style={{ fontWeight: 800 }}>Filters</h3>
            <button onClick={() => setShowFilters(false)} aria-label="Close filters" className="btn-ghost" style={{ padding: 4 }}><XMarkIcon style={{ width: 24, height: 24 }} /></button>
          </div>

          {!isLarge && (
            <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid var(--gray-200)', marginBottom: 24 }}>
              <h4 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--dark)', marginBottom: 20 }}>Filter by Price</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: 'var(--gray-600)', marginBottom: 12 }}>
                <span>Min Price</span>
                <span>Max Price</span>
              </div>
              {/* Simple slider visual representation (fake slider for styling) */}
              <div style={{ height: 4, background: 'var(--gray-200)', borderRadius: 2, position: 'relative', marginBottom: 20 }}>
                <div style={{ position: 'absolute', left: '20%', right: '40%', height: '100%', background: 'var(--primary)', borderRadius: 2 }}></div>
                <div style={{ position: 'absolute', left: '20%', top: '50%', transform: 'translate(-50%, -50%)', width: 14, height: 14, background: 'var(--primary)', borderRadius: '50%', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}></div>
                <div style={{ position: 'absolute', right: '40%', top: '50%', transform: 'translate(50%, -50%)', width: 14, height: 14, background: 'var(--primary)', borderRadius: '50%', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}></div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <input 
                  type="number" 
                  placeholder="Min" 
                  aria-label="Minimum price"
                  className="input-field" 
                  style={{ padding: '10px 14px', fontSize: 13, borderRadius: 12, border: '2px solid var(--gray-200)' }} 
                  value={tempFilters.priceMin} 
                  onChange={(e) => setTempFilters({...tempFilters, priceMin: e.target.value})}
                  onBlur={(e) => applyFiltersToUrl({...tempFilters, priceMin: e.target.value})}
                  onKeyDown={(e) => e.key === 'Enter' && applyFiltersToUrl({...tempFilters, priceMin: e.target.value})}
                />
                <input 
                  type="number" 
                  placeholder="Max" 
                  aria-label="Maximum price"
                  className="input-field" 
                  style={{ padding: '10px 14px', fontSize: 13, borderRadius: 12, border: '2px solid var(--gray-200)' }} 
                  value={tempFilters.priceMax} 
                  onChange={(e) => setTempFilters({...tempFilters, priceMax: e.target.value})}
                  onBlur={(e) => applyFiltersToUrl({...tempFilters, priceMax: e.target.value})}
                  onKeyDown={(e) => e.key === 'Enter' && applyFiltersToUrl({...tempFilters, priceMax: e.target.value})}
                />
              </div>
            </div>
          )}

          <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid var(--gray-200)' }}>
            <h4 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--dark)', marginBottom: 20 }}>Categories</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <button 
                onClick={() => {
                  const newFilters = { priceMin: '', priceMax: '', category: '', subcategory: '', city: '' };
                  setTempFilters(newFilters);
                  applyFiltersToUrl(newFilters);
                }}
                style={{ textAlign: 'left', background: 'none', border: 'none', padding: 0, fontSize: 14, cursor: 'pointer', color: !tempFilters.category ? 'var(--primary)' : 'var(--dark)', fontWeight: !tempFilters.category ? 700 : 600, display: 'flex', justifyContent: 'space-between' }}
              >
                All Categories
              </button>
              {categories.map(cat => (
                <div key={cat._id}>
                  <button 
                    onClick={() => {
                      const newCat = tempFilters.category === cat.slug ? '' : cat.slug;
                      const newFilters = {...tempFilters, category: newCat, subcategory: ''};
                      setTempFilters(newFilters);
                      applyFiltersToUrl(newFilters);
                    }}
                    style={{ 
                      textAlign: 'left', 
                      background: tempFilters.category === cat.slug ? 'rgba(62, 111, 225, 0.08)' : 'none', 
                      border: 'none', 
                      padding: '8px 12px', 
                      borderRadius: 10,
                      fontSize: 14, 
                      cursor: 'pointer', 
                      color: tempFilters.category === cat.slug ? 'var(--primary)' : 'var(--dark)', 
                      fontWeight: tempFilters.category === cat.slug ? 700 : 600, 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      width: '100%',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                        <img src={cat.image || 'https://via.placeholder.com/20'} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                      </div>
                      <span>{cat.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {tempFilters.category === cat.slug && (
                        <span style={{ fontSize: 12, color: 'var(--primary)' }}>✓</span>
                      )}
                      <ChevronDownIcon style={{ width: 14, color: 'var(--gray-400)', transform: tempFilters.category === cat.slug ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </div>
                  </button>
                  {tempFilters.category === cat.slug && (
                    <div style={{ paddingLeft: 12, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10, borderLeft: '2px solid var(--gray-100)', marginLeft: 6 }}>
                      {subcategories
                        .filter(sub => {
                          const subCatId = sub.category?._id?.toString() || sub.category?.toString();
                          return subCatId === cat._id?.toString();
                        })
                        .map(sub => (
                          <button 
                            key={sub._id}
                            onClick={() => {
                              const newSub = tempFilters.subcategory === sub.slug ? '' : sub.slug;
                              const newFilters = {...tempFilters, subcategory: newSub};
                              setTempFilters(newFilters);
                              applyFiltersToUrl(newFilters);
                            }}
                            style={{ 
                              textAlign: 'left', 
                              background: tempFilters.subcategory === sub.slug ? 'rgba(62, 111, 225, 0.08)' : 'none', 
                              border: 'none', 
                              padding: '6px 10px', 
                              borderRadius: 8,
                              fontSize: 12, 
                              cursor: 'pointer', 
                              color: tempFilters.subcategory === sub.slug ? 'var(--primary)' : 'var(--gray-600)', 
                              fontWeight: tempFilters.subcategory === sub.slug ? 700 : 500,
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              width: '100%',
                              transition: 'all 0.2s'
                            }}
                          >
                            <span>{sub.name}</span>
                            {tempFilters.subcategory === sub.slug && <span style={{ color: 'var(--primary)' }}>✓</span>}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <button className="btn-primary" style={{ width: '100%', marginTop: 24, justifyContent: 'center', padding: 14, background: 'var(--primary)' }} onClick={() => applyFiltersToUrl(tempFilters)}>
              Apply Filter
            </button>
            <button className="btn-ghost" style={{ width: '100%', marginTop: 12, justifyContent: 'center', padding: 12, color: 'var(--gray-500)', fontSize: 13, fontWeight: 700 }} onClick={handleClearFilters}>
              Clear Filters
            </button>
          </div>

          <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid var(--gray-200)', marginTop: 24 }}>
            <h4 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--dark)', marginBottom: 20 }}>Cities</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button 
                onClick={() => {
                  const newFilters = {...tempFilters, city: ''};
                  setTempFilters(newFilters);
                  applyFiltersToUrl(newFilters);
                }}
                style={{ textAlign: 'left', background: !tempFilters.city ? 'rgba(62, 111, 225, 0.08)' : 'none', border: 'none', padding: '6px 10px', borderRadius: 8, fontSize: 13, cursor: 'pointer', color: !tempFilters.city ? 'var(--primary)' : 'var(--dark)', fontWeight: !tempFilters.city ? 700 : 600 }}
              >
                All Cities
              </button>
              {cities.map(c => {
                const isSelected = tempFilters.city?.toLowerCase() === c.name?.toLowerCase();
                return (
                  <button 
                    key={c._id}
                    onClick={() => {
                      const newCity = isSelected ? '' : c.name;
                      const newFilters = {...tempFilters, city: newCity};
                      setTempFilters(newFilters);
                      applyFiltersToUrl(newFilters);
                    }}
                    style={{ textAlign: 'left', background: isSelected ? 'rgba(62, 111, 225, 0.08)' : 'none', border: 'none', padding: '6px 10px', borderRadius: 8, fontSize: 13, cursor: 'pointer', color: isSelected ? 'var(--primary)' : 'var(--dark)', fontWeight: isSelected ? 700 : 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}
                  >
                    <span>{c.name}</span>
                    {isSelected && <span style={{ color: 'var(--primary)' }}>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Ads List Content */}
        <div style={{ minWidth: 0 }}>
          
          {/* Trust Banner */}
          <div style={{ background: '#e0fcf4', border: '1px solid #a7f3d0', borderRadius: 12, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: '1 1 auto' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <ShieldCheckIcon style={{ width: 20 }} />
              </div>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: '#065f46' }}>Professional Seller Protection</h4>
                <p style={{ fontSize: 12, color: '#047857' }}>Every listing in the premium category is manually verified for quality.</p>
              </div>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#059669', cursor: 'pointer' }}>Learn More</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            {listingType === 'featured' ? (
              <>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fef08a', color: '#854d0e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⭐</div>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--dark)', lineHeight: 1 }}>Featured Listings</h2>
                  <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>HAND-PICKED PREMIUM OPPORTUNITIES</p>
                </div>
              </>
            ) : (
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--dark)', lineHeight: 1 }}>Simple Listings</h2>
                <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>RECENTLY POSTED ADS</p>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex-center py-40"><div className="spinner"></div></div>
          ) : ads.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px 0', background: 'white', borderRadius: 16 }}>
              <h3 style={{ fontWeight: 800, marginBottom: 8 }}>No matching ads found</h3>
              <p style={{ color: '#6b7280' }}>Try adjusting your filters or keyword.</p>
            </div>
          ) : (
            <>
              <style>{`
                .ads-grid {
                  display: grid;
                  grid-template-columns: repeat(3, 1fr);
                  gap: 20px;
                }
                @media (min-width: 1440px) {
                  .ads-grid { grid-template-columns: repeat(4, 1fr); }
                }
                @media (max-width: 1024px) {
                  .ads-grid { grid-template-columns: repeat(2, 1fr); }
                }
                @media (max-width: 640px) {
                  .ads-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
                }
              `}</style>

              {listingType === 'featured' ? (
                /* Grid view for featured ads with golden highlight */
                <div className="ads-grid">
                  {ads.map(ad => (
                    <Link key={ad._id} to={`/ads/${generateAdSlug(ad)}`} style={{ textDecoration: 'none', background: 'linear-gradient(to bottom, #fffcf0, #ffffff)', border: '2px solid #fde047', borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 24px rgba(250, 204, 21, 0.15)', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', position: 'relative', height: '100%' }} className="hover:scale-105">
                      <div style={{ height: 160, position: 'relative' }}>
                        <img src={ad.images[0] ? (ad.images[0].startsWith('http') ? ad.images[0] : `http://localhost:5000${ad.images[0]}`) : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'} alt={ad.title} width="300" height="160" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <span style={{ position: 'absolute', top: 12, left: 12, display: 'inline-flex', alignItems: 'center', gap: 4, background: '#facc15', color: '#854d0e', fontSize: 10, fontWeight: 800, padding: '4px 8px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>⭐ Featured</span>
                      </div>
                      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--dark)', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', marginBottom: 6 }}>{ad.title}</h3>
                        <p style={{ fontSize: 18, fontWeight: 900, color: '#854d0e', marginBottom: 10 }}>{settings?.priceFormat || 'PKR'} {ad.price.toLocaleString()}</p>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--gray-500)', marginBottom: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <MapPinIcon style={{ width: 14, height: 14 }} />
                            <span style={{ fontSize: 11, fontWeight: 700 }}>{ad.city}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <EyeIcon style={{ width: 14, height: 14 }} />
                            <span style={{ fontSize: 11, fontWeight: 700 }}>{ad.views || 0}</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12, padding: '8px 0', borderTop: '1px solid #fef08a' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#854d0e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 900 }}>
                              {ad.seller?.name?.substring(0, 1).toUpperCase() || 'U'}
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#854d0e' }}>{ad.seller?.name || 'Seller'}</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                          <span style={{ background: '#fef08a', color: '#854d0e', padding: '4px 12px', borderRadius: 999, fontSize: 10, fontWeight: 800 }}>View Details</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                /* Grid view for simple ads */
                <div className="ads-grid">
                  {ads.map(ad => (
                    <AdCard key={ad._id} ad={ad} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex-center mt-12 gap-3">
                  <button 
                    disabled={currentPage === 1} onClick={() => updateFilter('page', currentPage - 1)}
                    className="btn-ghost" style={{ border: '1px solid var(--gray-200)', background: 'white', opacity: currentPage === 1 ? 0.4 : 1 }}
                  >
                    Previous
                  </button>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[...Array(totalPages)].map((_, i) => (
                      <button 
                        key={i} onClick={() => updateFilter('page', i+1)}
                        style={{
                          width: 36, height: 36, borderRadius: 8,
                          background: currentPage === i + 1 ? 'var(--primary)' : 'white',
                          color: currentPage === i + 1 ? 'white' : 'var(--dark)',
                          fontWeight: 700, cursor: 'pointer', border: currentPage === i + 1 ? 'none' : '1px solid var(--gray-200)'
                        }}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button 
                    disabled={currentPage === totalPages} onClick={() => updateFilter('page', currentPage + 1)}
                    className="btn-ghost" style={{ border: '1px solid var(--gray-200)', background: 'white', opacity: currentPage === totalPages ? 0.4 : 1 }}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
