import { Link, useNavigate } from 'react-router-dom';
import { HeartIcon, MapPinIcon, EyeIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid, CheckBadgeIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import api from '../lib/api';
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
      const { data } = await api.post(`/favorites/${ad._id}`);
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
      className="block group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden"
      style={{ textDecoration: 'none' }}
    >
      {/* Square Image Container */}
      <div className="relative aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
        <img
          src={image}
          alt={ad.title}
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'; }}
        />
        
        {/* Favorite btn overlay */}
        <button
          onClick={handleFav}
          disabled={favLoading}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors z-10"
        >
          {favorited
            ? <HeartSolid className="w-4 h-4 text-red-500" />
            : <HeartIcon className="w-4 h-4 text-gray-400" />
          }
        </button>

        {ad.isFeatured && (
          <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-1 rounded-md shadow-sm z-10 flex items-center gap-1">
            ⭐ FEATURED
          </div>
        )}
      </div>

      {/* Body Content */}
      <div className="p-4">
        <div className="mb-2">
          <p className="text-xl font-black text-gray-900 leading-tight">
            {formatPrice(ad.price)}
          </p>
          {ad.isNegotiable && (
            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded uppercase tracking-wider">
              Negotiable
            </span>
          )}
        </div>

        <h3 className="text-gray-500 text-sm font-medium leading-relaxed line-clamp-2 mb-4 h-10">
          {ad.title}
        </h3>

        <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-auto">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] font-black flex-shrink-0">
              {ad.seller?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="text-xs font-bold text-gray-400 truncate max-w-[80px]">
              {ad.seller?.name || 'Seller'}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-400">
            <MapPinIcon className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold truncate max-w-[60px]">{ad.city}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
