import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../lib/api';

const AdContext = createContext();

export const AdProvider = ({ children }) => {
  const [ads, setAds] = useState([]);
  const [featuredAds, setFeaturedAds] = useState([]);
  const [latestAds, setLatestAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings');
        setSettings(data);
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const fetchAds = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const pageSize = params.pageSize || settings?.featuredAdsPerPage || 12;
      const { data } = await api.get('/ads', { params: { ...params, pageSize } });
      setAds(data.ads);
      setTotalPages(data.pages);
      setTotalCount(data.total);
      setCurrentPage(data.page);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [settings]);

  const fetchFeaturedAds = useCallback(async () => {
    try {
      const { data } = await api.get('/ads/featured');
      setFeaturedAds(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchLatestAds = useCallback(async () => {
    try {
      const { data } = await api.get('/ads/latest');
      setLatestAds(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  return (
    <AdContext.Provider value={{
      ads, featuredAds, latestAds, loading, error,
      totalPages, totalCount, currentPage,
      fetchAds, fetchFeaturedAds, fetchLatestAds,
      settings,
    }}>
      {children}
    </AdContext.Provider>
  );
};

export const useAds = () => {
  const ctx = useContext(AdContext);
  if (!ctx) throw new Error('useAds must be used within AdProvider');
  return ctx;
};

export default AdContext;
