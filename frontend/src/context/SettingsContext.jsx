import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../lib/api';

const SettingsContext = createContext();
const SETTINGS_CACHE_KEY = 'app_settings_cache';
const SETTINGS_CACHE_TIME = 5 * 60 * 1000; // 5 minutes

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const cached = localStorage.getItem(SETTINGS_CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < SETTINGS_CACHE_TIME) {
          return data;
        }
      }
    } catch (e) {}
    return null;
  });
  const [loading, setLoading] = useState(!settings);
  const [error, setError] = useState(null);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/settings');
      setSettings(data);
      localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
      setError(null);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load site settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!settings) {
      fetchSettings();
    }
  }, []);

  // Update document title and favicon dynamically
  useEffect(() => {
    if (settings) {
      if (settings.siteName) {
        document.title = settings.siteName;
      }
      if (settings.favicon) {
        const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        link.href = settings.favicon;
        document.getElementsByTagName('head')[0].appendChild(link);
      }
    }
  }, [settings]);


  // Function to manually refresh settings (e.g., after admin save)
  const refreshSettings = () => {
    fetchSettings();
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, error, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
