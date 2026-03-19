import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, MagnifyingGlassIcon, UserIcon, Bars3Icon, PlusIcon } from '@heroicons/react/24/outline';

export default function MobileNav() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="sm:hidden" style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: '#cbd5e1', // The mock shows a light grey bottom rect matching background
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      padding: '12px 10px 16px', // extra padding relative to screen bottom
      zIndex: 200, boxShadow: '0 -4px 20px rgba(0,0,0,0.05)'
    }}>
      <Link to="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: path === '/' ? 'var(--primary)' : 'var(--gray-600)', textDecoration: 'none', flex: 1 }}>
        <HomeIcon style={{ width: 22, height: 22 }} />
        <span style={{ fontSize: 9, fontWeight: 800 }}>HOME</span>
      </Link>
      <Link to="/ads" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: path === '/ads' ? 'var(--primary)' : 'var(--gray-600)', textDecoration: 'none', flex: 1 }}>
        <MagnifyingGlassIcon style={{ width: 22, height: 22 }} />
        <span style={{ fontSize: 9, fontWeight: 800 }}>SEARCH</span>
      </Link>
      
      {/* Floating Center Action Button */}
      <Link to="/post-ad" style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textDecoration: 'none', position: 'relative', top: -16, flex: 1
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%', background: 'var(--primary)', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 16px rgba(249, 94, 38, 0.4)', border: '4px solid #f8fafc'
        }}>
          <PlusIcon style={{ width: 26, height: 26 }} strokeWidth={2.5} />
        </div>
        <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--gray-600)' }}>POST AD</span>
      </Link>

      <Link to="/dashboard" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: path.startsWith('/dashboard') ? 'var(--primary)' : 'var(--gray-600)', textDecoration: 'none', flex: 1 }}>
        <UserIcon style={{ width: 22, height: 22 }} />
        <span style={{ fontSize: 9, fontWeight: 800 }}>PROFILE</span>
      </Link>
      <Link to="/ads?sort=oldest" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: 'var(--gray-600)', textDecoration: 'none', flex: 1 }}>
        <Bars3Icon style={{ width: 22, height: 22 }} />
        <span style={{ fontSize: 9, fontWeight: 800 }}>MENU</span>
      </Link>
    </div>
  );
}
