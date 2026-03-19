import { Link, useNavigate } from 'react-router-dom';
import { HeartIcon, MapPinIcon, EyeIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid, CheckBadgeIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { generateAdSlug } from '../utils/urlUtils';

const formatPrice = (price) => {
  if (price >= 10000000) return `PKR ${(price / 10000000).toFixed(1)} Cr`;
  if (price >= 100000) return `PKR ${(price / 100000).toFixed(1)} Lac`;
  if (price >= 1000) return `PKR ${(price / 1000).toFixed(0)}K`;
  return `PKR ${price.toLocaleString()}`;
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
};

export default function AdCard({ ad, initialFav = false, onFavToggle }) {
  const { user } = useAuth();
  const [favorited, setFavorited] = useState(initialFav);
  const [favLoading, setFavLoading] = useState(false);

  const image = ad.images?.[0]
    ? (ad.images[0].startsWith('http') ? ad.images[0] : `http://localhost:5000${ad.images[0]}`)
    : `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop`;

  const handleFav = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { window.location.href = '/login'; return; }
    try {
      setFavLoading(true);
      const { data } = await axios.post(`/api/favorites/${ad._id}`);
      setFavorited(data.favorited);
      onFavToggle && onFavToggle(ad._id, data.favorited);
    } catch (err) {
      console.error(err);
    } finally {
      setFavLoading(false);
    }
  };

  return (
    <Link 
      to={`/ads/${generateAdSlug(ad)}`} 
      className={`card block group ${ad.isFeatured ? 'featured-card' : ''}`}
      style={{ textDecoration: 'none' }}
    >
      {/* Image */}
      <div style={{ position: 'relative', paddingTop: '65%', overflow: 'hidden', background: '#f3f4f6' }}>
        <img
          src={image}
          alt={ad.title}
          style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            objectFit: 'cover', transition: 'transform 0.35s ease'
          }}
          className="group-hover:scale-105"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'; }}
        />
        {ad.isFeatured && <div className="ribbon">⭐ Featured</div>}
        {ad.condition === 'new' && (
          <span style={{ position: 'absolute', top: 10, right: 10 }} className="badge badge-success">New</span>
        )}
        {/* Favorite btn */}
        <button
          onClick={handleFav}
          disabled={favLoading}
          style={{
            position: 'absolute', bottom: 8, right: 8,
            background: 'rgba(255,255,255,0.92)', border: 'none',
            borderRadius: '50%', width: 32, height: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', backdropFilter: 'blur(4px)',
            transition: 'transform 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
        >
          {favorited
            ? <HeartSolid style={{ width: 16, height: 16, color: '#dc2626' }} />
            : <HeartIcon style={{ width: 16, height: 16, color: '#6b7280' }} />
          }
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: '16px' }}>
        <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--dark)', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', marginBottom: 4 }}>
          {ad.title}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <p style={{ fontSize: 20, fontWeight: 900, color: 'var(--primary)', margin: 0 }}>{formatPrice(ad.price)}</p>
          {ad.isNegotiable && <span style={{ background: '#fef3c7', color: '#92400e', fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' }}>Negotiable</span>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12, padding: '8px 0', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 900 }}>
              {ad.seller?.name?.substring(0, 1).toUpperCase() || 'U'}
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-700)', display: 'flex', alignItems: 'center', gap: 4 }}>
              {ad.seller?.name || 'Seller'}
              {ad.seller?.badges?.slice(0, 2).map(badge => (
                <CheckBadgeIcon key={badge} style={{ width: 13, height: 13, color: '#6366f1' }} title={badge.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) + " Seller"} />
              ))}
            </span>
          </div>
          {ad.seller?.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--success)', fontSize: 11, fontWeight: 800 }}>
              <span style={{ fontSize: 12 }}>📞</span> {ad.seller.phone}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--gray-400)', fontSize: 11, fontWeight: 600, letterSpacing: 0.5 }}>
            <MapPinIcon style={{ width: 14, height: 14 }} /> {ad.city}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--gray-500)', fontSize: 11, fontWeight: 600 }}>
            <EyeIcon style={{ width: 14, height: 14 }} /> {ad.views || 0}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          {ad.category && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#f8fafc', padding: '2px 8px', borderRadius: 99, border: '1px solid #e2e8f0' }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', overflow: 'hidden' }}>
                <img src={ad.category.image || 'https://via.placeholder.com/20'} alt={ad.category.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>{ad.category.name}</span>
            </div>
          )}
        </div>

      </div>
    </Link>
  );
}
