import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useSettings } from '../context/SettingsContext';

export default function Footer() {
  const { settings } = useSettings();

  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    const loadFooterData = async () => {
      try {
        const [catRes, cityRes] = await Promise.all([
          api.get('/categories'),
          api.get('/cities')
        ]);
        setCategories(catRes.data.slice(0, 6)); // Limit 6 in footer 
        setCities(cityRes.data.slice(0, 6)); // Limit 6 in footer
      } catch (err) {
        console.error('Footer data load error:', err);
      }
    };
    loadFooterData();
  }, []);

  return (
    <footer style={{ background: '#1a1a2e', color: 'white', padding: '48px 0 24px' }}>
      <div className="container-custom">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 32 }}>
          {/* Brand */}
          <div>
            {settings?.logo ? (
              <img src={settings.logo} alt={settings?.siteName} style={{ height: 36, objectFit: 'contain', marginBottom: 12 }} />
            ) : (
              <div style={{
                display: 'inline-block', background: 'linear-gradient(135deg, #3e6fe1, #6b93f0)',
                color: 'white', borderRadius: 10, padding: '4px 10px',
                fontWeight: 900, fontSize: 18, marginBottom: 12
              }}>
                {settings?.siteName || 'MarketX'}
              </div>
            )}
            <p style={{ color: '#9ca3af', fontSize: 14, lineHeight: 1.7 }}>
              {settings?.defaultMetaDescription || "Pakistan's #1 classified marketplace. Buy, sell and find anything – from cars, mobiles, property to jobs and services."}
            </p>
          </div>


          {/* Categories */}
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: 14, fontSize: 15 }}>Popular Categories</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {categories.map(cat => (
                <Link key={cat._id} to={`/ads?category=${cat.slug}`} style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 14, transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = '#3e6fe1'}
                  onMouseLeave={e => e.target.style.color = '#9ca3af'}
                >{cat.icon || '📦'} {cat.name}</Link>
              ))}
            </div>
          </div>

          {/* Cities */}
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: 14, fontSize: 15 }}>Top Cities</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {cities.map(city => (
                <Link key={city._id} to={`/ads?city=${encodeURIComponent(city.name)}`} style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 14, transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = '#3e6fe1'}
                  onMouseLeave={e => e.target.style.color = '#9ca3af'}
                >📍 {city.name}</Link>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: 14, fontSize: 15 }}>Company</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Post an Ad', to: '/post-ad' },
                { label: 'Login', to: '/login' },
                { label: 'Register', to: '/register' },
                { label: 'Help & Support', to: '/' },
                { label: 'Safety Tips', to: '/' },
              ].map(l => (
                <Link key={l.label} to={l.to} style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 14, transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = '#3e6fe1'}
                  onMouseLeave={e => e.target.style.color = '#9ca3af'}
                >{l.label}</Link>
              ))}
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #2d2d44', marginTop: 40, paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ color: '#6b7280', fontSize: 13 }}>© {new Date().getFullYear()} {settings?.siteName || 'MarketX'} – All rights reserved.</p>
          <p style={{ color: '#6b7280', fontSize: 13 }}>🔒 Safe & Secure Marketplace</p>
        </div>

      </div>
    </footer>
  );
}
