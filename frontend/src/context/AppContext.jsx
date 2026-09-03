/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { themes } from '../theme/themes';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const email = localStorage.getItem('email');
    return token ? { token, role, email } : null;
  });

  // 1. Fallback to 'dark' or 'light' if localStorage contains an obsolete key (e.g., 'pearl', 'obsidian')
  const [currentThemeKey, setCurrentThemeKey] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved && themes[saved] ? saved : 'dark';
  });

  const [alertCount, setAlertCount] = useState(0);

  // Safely fallback to dark theme if currentThemeKey is invalid
  const activeTheme = themes[currentThemeKey] || themes.dark;
  const isDarkMode = currentThemeKey === 'dark';

  useEffect(() => {
    const root = document.documentElement;

    // Apply root CSS variables for dynamic styling
    if (activeTheme && activeTheme.vars) {
      Object.entries(activeTheme.vars).forEach(([key, val]) => {
        root.style.setProperty(key, val);
      });
    }

    // Toggle Tailwind CSS 'dark' class on root for standard utility support
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    localStorage.setItem('theme', currentThemeKey);
  }, [currentThemeKey, activeTheme, isDarkMode]);

  const setTheme = (key) => {
    if (themes[key]) {
      setCurrentThemeKey(key);
    }
  };

  const toggleTheme = () => {
    setCurrentThemeKey((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const login = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    localStorage.setItem('email', data.email);
    setUser({ token: data.token, role: data.role, email: data.email });
    setAlertCount(0);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    setUser(null);
    setAlertCount(0);
  };

  const fetchAlertCount = async () => {
    if (!user || user.role !== 'fleet_manager') {
      setAlertCount(0);
      return;
    }

    try {
      const res = await axiosClient.get('/dashboard/alerts');
      setAlertCount(res.data.count || 0);
    } catch (err) {
      console.error('Failed to fetch alerts count', err);
      setAlertCount(0);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const runFetch = async () => {
      if (!user || user.role !== 'fleet_manager') {
        if (isMounted) setAlertCount(0);
        return;
      }

      try {
        const res = await axiosClient.get('/dashboard/alerts');
        if (isMounted) setAlertCount(res.data.count || 0);
      } catch (err) {
        console.error('Failed to fetch alerts count', err);
        if (isMounted) setAlertCount(0);
      }
    };

    void runFetch();

    return () => {
      isMounted = false;
    };
  }, [user]);

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        logout,
        activeTheme,
        currentThemeKey,
        setTheme,
        toggleTheme,
        isDarkMode,
        alertCount,
        refreshAlerts: fetchAlertCount,
        themes,
      }}
    >
      <div className={`min-h-screen ${activeTheme.bg} ${activeTheme.textPrimary} transition-colors duration-300 font-sans antialiased selection:bg-blue-500 selection:text-white`}>
        {children}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);