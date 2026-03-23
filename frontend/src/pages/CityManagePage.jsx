import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  PhotoIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

export default function CityManagePage() {
  const { token } = useAuth();
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Inline Form state
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    isPopular: false
  });

  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/cities');
      setCities(data);
    } catch (err) {
      console.error('Error fetching cities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (item = null) => {
    setEditingItem(item);
    if (item) {
      setFormData({
        name: item.name,
        image: item.image || '',
        isPopular: item.isPopular || false
      });
    } else {
      setFormData({ name: '', image: '', isPopular: false });
    }
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/cities/${editingItem._id}`, formData);
        setMessage('City updated!');
      } else {
        await api.post('/cities', formData);
        setMessage('City created!');
      }

      setShowForm(false);
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error saving city:', err);
      alert(err.response?.data?.message || 'Failed to save.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this city? This action cannot be undone.')) {
      try {
        await api.delete(`/cities/${id}`);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message || 'Delete failed.');
      }
    }
  };

  const filteredCities = cities.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight italic">City Management</h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">Manage locations for ads and homepage.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search cities..."
              className="pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl w-64 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none font-bold text-sm shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {!showForm && (
            <button
              onClick={() => handleOpenForm()}
              className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-black hover:bg-orange-500 transition-all shadow-xl shadow-gray-200 active:scale-95"
            >
              <PlusIcon className="w-5 h-5" />
              Add City
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className="p-4 bg-green-50 text-green-600 rounded-2xl font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircleIcon className="w-5 h-5" />
          {message}
        </div>
      )}

      {/* Inline Form Section */}
      {showForm && (
        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-orange-100 shadow-xl shadow-orange-50/50 animate-slide-up relative">
          <button
            onClick={() => setShowForm(false)}
            className="absolute top-6 right-6 p-2 hover:bg-gray-50 rounded-xl text-gray-400 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>

          <h2 className="text-2xl font-black text-gray-900 italic mb-8">
            {editingItem ? 'EDIT' : 'ADD'} CITY
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">City Name</label>
                <input
                  type="text"
                  className="w-full px-6 py-4 rounded-[1.5rem] border-2 border-gray-50 focus:border-orange-500 focus:outline-none transition-all font-bold bg-gray-50/50"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Image URL (Optional)</label>
                <input
                  type="text"
                  className="w-full px-6 py-4 rounded-[1.5rem] border-2 border-gray-50 focus:border-orange-500 focus:outline-none transition-all font-bold bg-gray-50/50"
                  placeholder="https://..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-6 flex flex-col justify-between">
              <div className="flex items-center gap-4 mt-8 ml-2">
                <input
                  type="checkbox"
                  id="isPopular"
                  className="w-6 h-6 rounded-lg border-2 border-gray-200 text-orange-500 focus:ring-orange-500 cursor-pointer transition-all"
                  checked={formData.isPopular}
                  onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                />
                <label htmlFor="isPopular" className="font-bold text-gray-700 cursor-pointer">
                  Feature on Homepage (Popular City)
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 py-4 bg-gray-900 text-white rounded-[1.5rem] font-black text-lg hover:bg-orange-500 shadow-lg transition-all active:scale-[0.98]"
                >
                  {editingItem ? 'UPDATE' : 'CREATE'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-8 py-4 border-2 border-gray-100 rounded-[1.5rem] font-black text-gray-400 hover:bg-gray-50 transition-all"
                >
                  CANCEL
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Cities Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        {filteredCities.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Image</th>
                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">City Name</th>
                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCities.map((city) => (
                <tr key={city._id} className="hover:bg-gray-50/30 transition-all group">
                  <td className="px-8 py-6">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden flex items-center justify-center border-2 border-white shadow-md">
                      {city.image ? (
                        <img src={city.image} alt={city.name} className="w-full h-full object-cover" />
                      ) : (
                        <PhotoIcon className="w-6 h-6 text-gray-300" />
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-black text-gray-900 group-hover:text-orange-500 transition-colors uppercase tracking-tight">{city.name}</p>
                  </td>
                  <td className="px-8 py-6">
                    {city.isPopular && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                        Popular
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenForm(city)} className="p-2.5 hover:bg-white border border-transparent hover:border-gray-100 rounded-xl text-gray-400 hover:text-blue-500 shadow-sm transition-all">
                        <PencilSquareIcon className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDelete(city._id)} className="p-2.5 hover:bg-white border border-transparent hover:border-gray-100 rounded-xl text-gray-400 hover:text-red-500 shadow-sm transition-all">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-20 text-center">
            <MagnifyingGlassIcon className="w-12 h-12 text-gray-100 mx-auto mb-4" />
            <p className="text-gray-400 font-black italic">No cities found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
