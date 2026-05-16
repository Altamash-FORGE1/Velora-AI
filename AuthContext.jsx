import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useGoogleLogin } from '@react-oauth/google';
import api from './api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('velora_token');
    return (savedToken && savedToken !== "undefined" && savedToken !== "null" && savedToken !== "") ? savedToken : null;
  });

  const [user, setUser] = useState(() => {
    const savedToken = localStorage.getItem('velora_token');
    if (savedToken && savedToken !== "undefined" && savedToken !== "null") {
      try {
        return jwtDecode(savedToken);
      } catch (error) {
        console.error("Token recovery failed:", error);
        localStorage.removeItem('velora_token');
        return null;
      }
    }
    return null;
  });

  const [theme, setTheme] = useState(localStorage.getItem('velora_theme') || 'dark');

  useEffect(() => {
    // Validate session on mount
    if (token && !user) {
      logout();
    }
    // Signal that initialization is complete
    setIsLoading(false);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('velora_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const login = (newToken) => {
    try {
      const decoded = jwtDecode(newToken);
      localStorage.setItem('velora_token', newToken);
      // Update both states together to avoid a render cycle where token exists but user doesn't
      setUser(decoded);
      setToken(newToken);
    } catch (error) {
      console.error("Login failed: invalid token", error);
    }
  };

  const logout = () => {
    localStorage.removeItem('velora_token');
    setToken(null);
    setUser(null);
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setAuthError(null);
      console.log("Google Auth Success, syncing with backend...");
      try {
        const res = await api.post('/auth/google', {
          access_token: tokenResponse.access_token
        });
        login(res.data.data.token);
      } catch (err) {
        const errMsg = err.response?.data?.message || "Failed to sync with Velora servers. Please check your connection.";
        setAuthError(errMsg);
        console.error("Backend Auth Failed:", err);
      }
    },
    onError: error => {
      console.error('Google Login Failed:', error);
      setAuthError("Google Sign-In was cancelled or failed. Please try again.");
    }
  });

  // Log a warning if Client ID is missing to help with debugging
  useEffect(() => {
    if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      console.warn("VITE_GOOGLE_CLIENT_ID is not defined in environment variables. Google Login will not function.");
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, googleLogin, theme, toggleTheme, isLoading, authError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);