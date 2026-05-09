import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('velora_token'));

  useEffect(() => {
    if (token) {
      try {
        // Decode JWT to extract user info (name, email, expiry)
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (error) {
        console.error("Invalid token", error);
        logout();
      }
    }
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem('velora_token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('velora_token');
    setToken(null);
    setUser(null);
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/google`, {
          access_token: tokenResponse.access_token
        });
        login(res.data.data.token);
      } catch (err) {
        console.error("Backend Auth Failed", err);
      }
    },
    onError: error => console.log('Login Failed:', error)
  });

  return (
    <AuthContext.Provider value={{ user, token, login, logout, googleLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);