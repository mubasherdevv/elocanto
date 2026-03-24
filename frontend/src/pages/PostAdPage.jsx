import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhotoIcon, XMarkIcon, MapPinIcon, ChevronRightIcon, ChevronLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import imageCompression from 'browser-image-compression';

export default function PostAdPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cities, setCities] = useState([]);
  const [settings, setSettings] = useState(null);
  const maxImages = settings?.maxImagesPerAd || 5;
  
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings');
        setSettings(data);
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };
    const fetchCities = async () => {
      try {
        const { data } = await api.get('/cities');
        setCities(data);
      } catch (err) {
        console.error('Error fetching cities:', err);
      }
    };
    fetchSettings();
    fetchCities();
  }, []);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    subcategory: '',
    description: '',
    brand: '',
    price: '',
    isNegotiable: false,
    city: '',
    condition: 'used',
    phone: user?.phone || '',
    images: [] // URLs
  });

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    const fetchSubs = async () => {
      if (formData.category) {
        try {
          const { data } = await api.get(`/subcategories?categoryId=${formData.category}`);
          setSubcategories(data);
        } catch (err) {
          console.error('Error fetching subcategories:', err);
        }
      }
    };
    fetchSubs();
  }, [formData.category]);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    if (formData.images.length + files.length > maxImages) {
      return setError(`Maximum ${maxImages} images allowed`);
    }

    try {
      setLoading(true);
      setError(null);

      const compressionOptions = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/webp'
      };

      const compressedFiles = await Promise.all(
        files.map(file => imageCompression(file, compressionOptions))
      );

      const uploadData = new FormData();
      compressedFiles.forEach(file => {
        const renamedFile = new File([file], file.name.replace(/\.[^/.]+$/, '.webp'), { type: 'image/webp' });
        uploadData.append('images', renamedFile);
      });

      const { data } = await api.post('/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, images: [...prev.images, ...data.urls] }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload images');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.category || !formData.subcategory || !formData.price || !formData.city || !formData.description) {
      return setError('Please fill all required fields including subcategory');
    }

    try {
      setLoading(true);
      setError(null);
      const { data } = await api.post('/ads', formData);
      navigate(`/admin/ads`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post ad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ background: '#f7f8fa' }}>
      <div className="container-custom" style={{ maxWidth: 720 }}>
        {/* Progress Header */}
        <div style={{ background: 'white', borderRadius: 16, padding: '24px 32px', border: '1px solid #e5e7eb', marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, textAlign: 'center', marginBottom: 24 }}>Post Your Ad</h1>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{ flex: s === 3 ? 0 : 1, display: 'flex', alignItems: 'center' }}>
                <div className={`step-dot ${step === s ? 'active' : step > s ? 'done' : 'pending'}`}>
                  {step > s ? '✓' : s}
                </div>
                {s < 3 && <div className={`step-line ${step > s ? 'done' : ''}`}></div>}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 12, fontWeight: 700, color: '#6b7280' }}>
            <span>Category</span>
            <span style={{ marginLeft: -10 }}>Details</span>
            <span>Finish</span>
          </div>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#dc2626', padding: 16, borderRadius: 12, marginBottom: 24, fontSize: 14 }}>
            {error}
          </div>
        )}

        <div style={{ background: 'white', borderRadius: 16, padding: 32, border: '1px solid #e5e7eb', boxShadow: 'var(--shadow-sm)' }}>
          {/* Step 1: Category & Subcategory */}
          {step === 1 && (
            <div className="fade-in">
              {!formData.category ? (
                <>
                  <h3 style={{ fontWeight: 800, marginBottom: 20 }}>Select a category</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
                    {categories.map(cat => (
                      <button
                        key={cat._id}
                        onClick={() => { setFormData({ ...formData, category: cat._id }); }}
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                          padding: '20px 10px', borderRadius: 12, border: formData.category === cat._id ? '2px solid #3e6fe1' : '1.5px solid #e5e7eb',
                          background: formData.category === cat._id ? 'rgba(62,111,225,0.05)' : 'white',
                          cursor: 'pointer', transition: 'all 0.2s', outline: 'none'
                        }}
                      >
                        <span style={{ fontSize: 24 }}>{cat.icon}</span>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                    <button onClick={() => setFormData({ ...formData, category: '', subcategory: '' })} className="btn-ghost" style={{ padding: '4px 8px' }}>
                      <ChevronLeftIcon style={{ width: 16 }} /> Back to Categories
                    </button>
                    <span style={{ fontWeight: 800, color: '#3e6fe1' }}>{categories.find(c => c._id === formData.category)?.name}</span>
                  </div>
                  <h3 style={{ fontWeight: 800, marginBottom: 20 }}>Select a subcategory</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
                    {subcategories.map(sub => (
                      <button
                        key={sub._id}
                        onClick={() => { setFormData({ ...formData, subcategory: sub._id }); setStep(2); }}
                        style={{
                          padding: '16px', borderRadius: 12, border: formData.subcategory === sub._id ? '2px solid #3e6fe1' : '1.5px solid #e5e7eb',
                          background: formData.subcategory === sub._id ? 'rgba(62,111,225,0.05)' : 'white',
                          cursor: 'pointer', transition: 'all 0.2s', outline: 'none', textAlign: 'left', fontWeight: 600, fontSize: 13
                        }}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 2: Main Details */}
          {step === 2 && (
            <div className="fade-in">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label className="filter-label">Ad Title *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. iPhone 14 Pro Max for sale"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                  <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Mention the key features of your item</p>
                </div>

                <div>
                  <label className="filter-label">Description *</label>
                  <textarea
                    className="input-field"
                    style={{ height: 120 }}
                    placeholder="Include condition, features and reason for selling"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="filter-label">Brand (Optional)</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Apple, Toyota"
                      value={formData.brand}
                      onChange={e => setFormData({ ...formData, brand: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="filter-label">Condition *</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {['new', 'used'].map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setFormData({ ...formData, condition: c })}
                          style={{
                            flex: 1, padding: '10px', borderRadius: 8,
                            border: formData.condition === c ? '2px solid #3e6fe1' : '1.5px solid #e5e7eb',
                            background: formData.condition === c ? 'rgba(62,111,225,0.05)' : 'white',
                            fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5
                          }}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="filter-label">Price *</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontWeight: 700, fontSize: 13, color: '#6b7280' }}>PKR</span>
                      <input
                        type="number"
                        className="input-field"
                        style={{ paddingLeft: 44 }}
                        placeholder="0"
                        value={formData.price}
                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                      />
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#4b5563' }}>
                      <input 
                        type="checkbox" 
                        checked={formData.isNegotiable}
                        onChange={e => setFormData({ ...formData, isNegotiable: e.target.checked })}
                        style={{ width: 18, height: 18, cursor: 'pointer' }}
                      />
                      Negotiable
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
                  <button onClick={() => setStep(1)} className="btn-ghost" style={{ border: '1.5px solid #e5e7eb' }}>
                    <ChevronLeftIcon style={{ width: 16, height: 16 }} /> Back
                  </button>
                  <button 
                    onClick={() => {
                      if (formData.title && formData.description && formData.price) setStep(3);
                      else setError('Title, Description and Price are required');
                    }}
                    className="btn-primary"
                  >
                    Next Step <ChevronRightIcon style={{ width: 16, height: 16 }} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Images & Preview */}
          {step === 3 && (
            <div className="fade-in">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div>
                  <label className="filter-label">Upload Images (5–10) *</label>
                  <div 
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const files = Array.from(e.dataTransfer.files);
                      handleImageUpload({ target: { files } });
                    }}
                    style={{ 
                      marginTop: 12, border: '2px dashed #e5e7eb', borderRadius: 16, padding: 32, textAlign: 'center',
                      background: '#f9fafb', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    onClick={() => document.getElementById('fileInput').click()}
                  >
                    <PhotoIcon style={{ width: 48, height: 48, color: '#d1d5db', margin: '0 auto mb-4' }} />
                    <p style={{ fontWeight: 700, color: '#4b5563' }}>Drag & drop or <span style={{ color: '#3e6fe1' }}>click to upload</span></p>
                    <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Upload up to 10 photos of your item</p>
                    <input id="fileInput" type="file" multiple onChange={handleImageUpload} hidden accept="image/*" />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 12, marginTop: 20 }}>
                    {formData.images.map((img, i) => (
                      <div key={i} style={{ position: 'relative', paddingTop: '100%', background: '#f3f4f6', borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <img 
                          src={img.startsWith('http') ? img : `http://localhost:5000${img}`} 
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                        <button 
                          onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                          style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        >
                          <XMarkIcon style={{ width: 14, height: 14 }} />
                        </button>
                        {i === 0 && <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(62,111,225,0.85)', color: 'white', fontSize: 9, fontWeight: 900, textAlign: 'center', padding: '2px 0', textTransform: 'uppercase' }}>Cover</span>}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="filter-label">City *</label>
                    <select 
                      className="input-field"
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                    >
                      <option value="">Select City</option>
                      {cities.map(c => (
                        <option key={c._id || c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="filter-label">Your Name *</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. John Doe"
                      value={user?.name || ''}
                      readOnly
                      style={{ background: '#f9fafb', cursor: 'not-allowed' }}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="filter-label">Phone Number *</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. 03001234567"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(22,163,74,0.06)', padding: 16, borderRadius: 12, border: '1px solid rgba(22,163,74,0.1)' }}>
                    <CheckCircleIcon style={{ width: 24, height: 24, color: '#16a34a', flexShrink: 0 }} />
                    <p style={{ fontSize: 13, color: '#166534', lineHeight: 1.5, fontWeight: 500 }}>
                      Everything looks good! Your ad will be published instantly after review.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button onClick={() => setStep(2)} className="btn-ghost" style={{ border: '1.5px solid #e5e7eb' }}>
                    <ChevronLeftIcon style={{ width: 16, height: 16 }} /> Back
                  </button>
                  <button 
                    onClick={handleSubmit}
                    disabled={loading}
                    className="btn-primary"
                    style={{ background: '#16a34a', borderColor: '#16a34a', padding: '12px 32px' }}
                  >
                    {loading ? 'Posting...' : 'Post Ad Now'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
