import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function ImageCarousel({ images = [], title = '' }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const safeImages = images.length > 0 ? images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'];
  const getUrl = (src) => src?.startsWith('http') ? src : `http://localhost:5000${src}`;

  const prev = () => setCurrentIndex(i => (i - 1 + safeImages.length) % safeImages.length);
  const next = () => setCurrentIndex(i => (i + 1) % safeImages.length);

  return (
    <div>
      {/* Main Image */}
      <div style={{
        position: 'relative', borderRadius: 16, overflow: 'hidden',
        background: '#f3f4f6', cursor: 'zoom-in'
      }}
        onClick={() => setLightbox(true)}
      >
        <img
          src={getUrl(safeImages[currentIndex])}
          alt={`${title} - ${currentIndex + 1}`}
          style={{ 
            width: '100%', 
            aspectRatio: '4/3', 
            objectFit: 'contain', 
            display: 'block',
            maxHeight: '480px',
            background: 'white'
          }}
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'; }}
        />
        {safeImages.length > 1 && (
          <>
            <button onClick={e => { e.stopPropagation(); prev(); }} style={{
              position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
              width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', backdropFilter: 'blur(4px)'
            }}>
              <ChevronLeftIcon style={{ width: 18, height: 18 }} />
            </button>
            <button onClick={e => { e.stopPropagation(); next(); }} style={{
              position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
              width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', backdropFilter: 'blur(4px)'
            }}>
              <ChevronRightIcon style={{ width: 18, height: 18 }} />
            </button>
          </>
        )}
        <div style={{
          position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.5)',
          color: 'white', padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600
        }}>
          {currentIndex + 1}/{safeImages.length}
        </div>
      </div>

      {/* Thumbnails */}
      {safeImages.length > 1 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 10, overflowX: 'auto', paddingBottom: 4 }}>
          {safeImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              style={{
                flexShrink: 0, width: 70, height: 52, borderRadius: 8, overflow: 'hidden',
                border: i === currentIndex ? '2.5px solid #3e6fe1' : '2.5px solid transparent',
                padding: 0, cursor: 'pointer', transition: 'border-color 0.2s'
              }}
            >
              <img src={getUrl(img)} alt={`thumb-${i}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'; }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div onClick={() => setLightbox(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <button onClick={() => setLightbox(false)} style={{
            position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.15)',
            border: 'none', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <XMarkIcon style={{ width: 20, height: 20, color: 'white' }} />
          </button>
          <img
            src={getUrl(safeImages[currentIndex])}
            alt={title}
            style={{ maxHeight: '90vh', maxWidth: '92vw', objectFit: 'contain', borderRadius: 8 }}
            onClick={e => e.stopPropagation()}
          />
          {safeImages.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); prev(); }} style={{
                position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
                width: 44, height: 44, display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer'
              }}>
                <ChevronLeftIcon style={{ width: 22, height: 22, color: 'white' }} />
              </button>
              <button onClick={e => { e.stopPropagation(); next(); }} style={{
                position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
                width: 44, height: 44, display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer'
              }}>
                <ChevronRightIcon style={{ width: 22, height: 22, color: 'white' }} />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
