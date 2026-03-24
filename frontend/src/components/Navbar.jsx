import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  MagnifyingGlassIcon, UserCircleIcon, BellIcon,
  HeartIcon, ChatBubbleLeftRightIcon, Bars3Icon, XMarkIcon,
  BuildingStorefrontIcon, PlusCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { settings } = useSettings();

  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/ads?keyword=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header style={{ background: 'white', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid #f8fafc', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
      <div className="container-custom" style={{ display: 'flex', alignItems: 'center', height: 72, gap: 12 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', flexShrink: 0 }}>
          {settings?.logo ? (
            <img src={settings.logo} alt={settings?.siteName || 'Logo'} width="120" height="40" fetchpriority="high" loading="eager" style={{ height: 40, objectFit: 'contain' }} />
          ) : (
            <>
              <BuildingStorefrontIcon style={{ width: 28, height: 28, color: 'var(--primary)' }} />
              <div style={{
                color: 'var(--dark)',
                fontWeight: 900, fontSize: 22, letterSpacing: '-0.5px'
              }}>
                {settings?.siteName || 'MarketX'}
              </div>
            </>
          )}
        </Link>


        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginLeft: 'auto' }}>
          {/* User menu */}
          {user ? (
            <div ref={userMenuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, background: 'none',
                  border: 'none', padding: '5px 10px',
                  cursor: 'pointer', fontFamily: 'inherit'
                }}
              >
                {user.profilePhoto
                  ? <img src={user.profilePhoto} alt={user.name} width="32" height="32" loading="lazy" decoding="async" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                  : <UserCircleIcon style={{ width: 24, height: 24, color: 'var(--gray-600)' }} />
                }
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-800)' }} className="hidden sm:block">
                  {(user.name || '').split(' ')[0]}
                </span>
              </button>

              {userMenuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: '110%',
                  background: 'white', border: '1px solid var(--gray-200)',
                  borderRadius: 16, boxShadow: 'var(--shadow-lg)',
                  minWidth: 220, overflow: 'hidden', zIndex: 200
                }}>
                  <div style={{ padding: '16px', borderBottom: '1px solid var(--gray-100)' }}>
                    <p style={{ fontWeight: 800, fontSize: 15, color: 'var(--dark)' }}>{user.name || 'User'}</p>
                    <p style={{ fontSize: 12, color: 'var(--gray-600)', marginTop: 2 }}>{user.email}</p>
                  </div>
                  {[
                    { label: '📋 My Dashboard', to: '/dashboard' },
                    { label: '👤 My Public Profile', to: '/profile' },
                    { label: '📦 My Ads', to: '/dashboard?tab=ads' },
                    { label: '💬 Messages', to: '/messages' },
                    { label: '❤️ Favorites', to: '/dashboard?tab=favorites' },
                    ...(user.isAdmin ? [{ label: '⚙️ Admin Panel', to: '/admin' }] : []),
                  ].map(item => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: 'block', padding: '12px 16px', textDecoration: 'none',
                        color: 'var(--gray-800)', fontSize: 14, fontWeight: 500, transition: 'background 0.15s'
                      }}
                      onMouseEnter={e => e.target.style.background = 'var(--gray-100)'}
                      onMouseLeave={e => e.target.style.background = 'transparent'}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div style={{ borderTop: '1px solid var(--gray-100)' }}>
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); navigate('/'); }}
                      style={{
                        width: '100%', padding: '14px 16px', textAlign: 'left',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--danger)', fontSize: 14, fontWeight: 600, fontFamily: 'inherit'
                      }}
                    >
                      🚪 Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn-ghost" style={{ fontSize: 14, padding: '8px 12px', color: 'var(--gray-600)', fontWeight: 600 }}>
              <UserCircleIcon style={{ width: 20, height: 20 }} /> Login
            </Link>
          )}

          {/* Post Ad CTA */}
          <Link to="/post-ad" className="btn-primary" style={{ padding: '10px 20px', borderRadius: 999, fontSize: 14, fontWeight: 700 }}>
            <PlusCircleIcon style={{ width: 20, height: 20 }} /> Post Ad
          </Link>
        </div>
      </div>

    </header>
  );
}
